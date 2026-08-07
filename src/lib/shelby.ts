/**
 * Shelby client and signer utilities for server-side use only.
 *
 * Required env vars:
 *   SHELBY_API_KEY                          — Geomi API key for bandwidth (optional but recommended)
 *   NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS   — App account address on Shelbynet (blob owner)
 *   NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY — Ed25519 private key for signing Shelby txs
 *
 * Optional:
 *   SHELBY_LOCATION_HINT — Write location (defaults to "shelbynet-1").
 *
 * Architecture note:
 *   Marketplace and blob coordination both run on Shelbynet (chain ID 110).
 *   The user's wallet signs marketplace txs; the app publisher key signs blob registration.
 *
 * SDK note (@shelby-protocol/sdk >= 0.6):
 *   Network.TESTNET is no longer a valid Shelby network. Use Network.SHELBYNET.
 *   Upload flow is register → UID → putBlobChunksets → commitObject.
 *   Tx expireTimestamp must track Shelbynet ledger time — local clock skew
 *   causes TRANSACTION_EXPIRATION_TOO_FAR_IN_FUTURE.
 */
import { Network, Ed25519PrivateKey, Account } from "@aptos-labs/ts-sdk";
import {
  ShelbyNodeClient,
  ShelbyBlobClient,
  createBlobKey,
  createDefaultErasureCodingProvider,
  generateCommitments,
  requiredAckCount,
  type BlobCommitments,
  type ErasureCodingConfig,
} from "@shelby-protocol/sdk/node";
import { appOrigin, SHELBYNET_FULLNODE, SHELBYNET_RPC } from "@/constants";

// Shelbynet rejects txns whose expireTimestamp is too far past ledger time.
const TX_EXPIRE_SKEW_SECS = 25;

// ── Shelby client singleton ────────────────────────────────────────────────

let _shelbyClient: ShelbyNodeClient | null = null;

// Shelbynet requires an Origin header on every request (both Aptos node and RPC).
// Node.js server-side fetches don't include one automatically.
let _fetchPatched = false;
function patchFetchForShelby(origin: string) {
  if (_fetchPatched) return;
  _fetchPatched = true;
  const _originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    if (url.includes("shelby.xyz") || url.includes("shelby.shelbynet")) {
      const existing = new Headers(init?.headers ?? {});
      if (!existing.has("Origin")) existing.set("Origin", origin);
      init = { ...init, headers: existing };
    }
    return _originalFetch(input, init);
  };
}

export function getShelbyClient(): ShelbyNodeClient {
  if (!_shelbyClient) {
    const shelbyApiKey = process.env.SHELBY_API_KEY;
    const origin = appOrigin();
    // Shelbynet currently has one activated write location. Default it so
    // production (Vercel) works even when SHELBY_LOCATION_HINT is unset.
    const locationHint = process.env.SHELBY_LOCATION_HINT || "shelbynet-1";

    patchFetchForShelby(origin);

    _shelbyClient = new ShelbyNodeClient({
      network: Network.SHELBYNET,
      ...(shelbyApiKey ? { apiKey: shelbyApiKey } : {}),
      locationHint,
      aptos: {
        network: Network.SHELBYNET,
        fullnode: SHELBYNET_FULLNODE,
        clientConfig: {
          HEADERS: { Origin: origin },
        },
      },
      rpc: {
        baseUrl: SHELBYNET_RPC,
        ...(shelbyApiKey ? { apiKey: shelbyApiKey } : {}),
      },
    });
  }
  return _shelbyClient;
}

// ── Publisher signer ────────────────────────────────────────────────────────

/**
 * Returns an Ed25519 Account for the marketplace publisher, used to sign
 * Shelby blob registration transactions on Shelbynet.
 */
export function getMarketplaceSigner(): Account {
  const rawKey = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
  if (!rawKey) throw new Error("NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY is not set");
  // Strip the "ed25519-priv-" AIP-80 prefix if present.
  const hexKey = rawKey.replace(/^ed25519-priv-/, "");
  const privateKey = new Ed25519PrivateKey(hexKey);
  return Account.fromPrivateKey({ privateKey });
}

// ── Chain-clock helpers ─────────────────────────────────────────────────────

/** Shelbynet ledger time in unix seconds (not local wall clock). */
export async function getShelbyChainTimeSecs(
  shelby: ShelbyNodeClient = getShelbyClient()
): Promise<number> {
  const info = await shelby.aptos.getLedgerInfo();
  return Math.floor(Number(info.ledger_timestamp) / 1_000_000);
}

/** Tx build options anchored to Shelbynet ledger time (avoids local clock skew). */
async function chainAnchoredTxOptions(
  shelby: ShelbyNodeClient,
  withOrderlessNonce = false
) {
  const chainSec = await getShelbyChainTimeSecs(shelby);
  return {
    build: {
      options: {
        expireTimestamp: chainSec + TX_EXPIRE_SKEW_SECS,
        ...(withOrderlessNonce
          ? { replayProtectionNonce: crypto.getRandomValues(new Uint32Array(1))[0] }
          : {}),
      },
    },
  };
}

/**
 * Full blob upload using chain-anchored tx expiration.
 * Avoids `shelby.upload()` which sets commit expireTimestamp from local Date.now().
 */
export async function uploadBlobToShelby(params: {
  blobData: Uint8Array;
  blobName: string;
  signer?: Account;
  expirationMicros?: number;
}): Promise<{ commitments: BlobCommitments }> {
  const shelby = getShelbyClient();
  const signer = params.signer ?? getMarketplaceSigner();
  const expirationMicros = params.expirationMicros ?? defaultExpirationMicros();

  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, params.blobData);

  const { transaction: pendingRegister } = await shelby.coordination.registerBlob({
    account: signer,
    blobName: params.blobName,
    blobMerkleRoot: commitments.blob_merkle_root,
    size: params.blobData.length,
    expirationMicros,
    config: provider.config,
    options: await chainAnchoredTxOptions(shelby),
  });

  const registerTx = await shelby.aptos.waitForTransaction({
    transactionHash: pendingRegister.hash,
  });
  if (!registerTx.success) {
    throw new Error(`register_blob failed: ${registerTx.vm_status}`);
  }

  const objectName = createBlobKey({
    account: signer.accountAddress,
    blobName: params.blobName,
  });
  const events = "events" in registerTx ? registerTx.events : [];
  const match = ShelbyBlobClient.registeredBlobUids(
    events,
    shelby.coordination.deployer
  ).find((r) => r.objectName === objectName);
  if (!match) {
    throw new Error(`No BlobRegisteredEvent for '${params.blobName}' in ${pendingRegister.hash}`);
  }

  const { spAcks } = await shelby.rpc.putBlobChunksets({
    account: signer,
    uid: match.uid,
    blobData: params.blobData,
    commitments,
    totalBytes: params.blobData.length,
  });

  const need = requiredAckCount(provider.config.erasure_n);
  if (spAcks.length < need) {
    throw new Error(
      `Insufficient SP acks for '${params.blobName}': got ${spAcks.length}, need ${need}`
    );
  }

  const { transaction: pendingCommit } = await shelby.coordination.commitObject({
    account: signer,
    uid: match.uid,
    blobName: params.blobName,
    overwrite: true,
    storageProviderAcks: spAcks,
    options: await chainAnchoredTxOptions(shelby, true),
  });

  const commitTx = await shelby.aptos.waitForTransaction({
    transactionHash: pendingCommit.hash,
  });
  if (!commitTx.success) {
    const rejected = ShelbyBlobClient.findObjectCommitRejection(
      "events" in commitTx ? commitTx.events : [],
      shelby.coordination.deployer,
      match.uid
    );
    throw new Error(
      rejected
        ? `commit_object rejected for '${params.blobName}': ${rejected}`
        : `commit_object failed for '${params.blobName}': ${commitTx.vm_status}`
    );
  }

  return { commitments };
}

// ── Blob path helpers ───────────────────────────────────────────────────────

/**
 * Builds the blob path (the part after the account prefix) stored under the
 * publisher account on Shelbynet. Uses the last 8 hex chars of the seller
 * address for namespacing so blobs from different sellers don't collide.
 *
 * Path budget: the Move contract enforces MAX_BLOB_NAME_LENGTH = 200.
 * shelbyBlobName = publisherAddr(66) + "/" + blobPath.
 * To stay under 200 we need blobPath ≤ 133 chars.
 *   "datasets/" (9) + addrSuffix (8) + "/" (1) + timestamp (13) + "-" (1) + safe (≤40)
 *   = 72 chars max → shelbyBlobName ≤ 139 chars. ✓
 *
 * Using the full seller address in the path pushed shelbyBlobName to 237 chars
 * (over the 200-char limit) for files with names longer than ~43 characters,
 * causing register_dataset to abort with E_STRING_TOO_LONG.
 */
export function buildBlobPath(sellerAddress: string, filename: string): string {
  const addrSuffix = sellerAddress.replace(/^0x/, "").slice(-8);
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40);
  return `datasets/${addrSuffix}/${Date.now()}-${safe}`;
}

/** 5-year expiration timestamp in Shelby microseconds (absolute). */
export function defaultExpirationMicros(): number {
  return Date.now() * 1000 + 5 * 365 * 24 * 60 * 60 * 1_000_000;
}

// ── Download helpers ───────────────────────────────────────────────────────

/**
 * Parses the on-chain `shelby_blob_name` (full canonical key) into
 * { account, blobPath } for use with the Shelby SDK.
 *
 * On-chain format: "<accountAddress>/<blobPath>"
 */
export function parseBlobName(fullBlobName: string): {
  account: string;
  blobPath: string;
} {
  const idx = fullBlobName.indexOf("/");
  if (idx === -1) {
    throw new Error(`Invalid blob name (no "/" found): ${fullBlobName}`);
  }
  return {
    account: fullBlobName.slice(0, idx),
    blobPath: fullBlobName.slice(idx + 1),
  };
}

// ── Commitment helpers ─────────────────────────────────────────────────────

/**
 * Converts the hex `blob_merkle_root` string from the Shelby SDK to a
 * `number[]` suitable for passing to the Move `register_dataset` entry function.
 */
export function merkleRootToBytes(hexMerkleRoot: string): number[] {
  const hex = hexMerkleRoot.startsWith("0x")
    ? hexMerkleRoot.slice(2)
    : hexMerkleRoot;
  return Array.from(Buffer.from(hex, "hex"));
}

// Re-export types used by the upload route.
export type { BlobCommitments, ErasureCodingConfig };
