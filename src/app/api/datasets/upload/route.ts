/**
 * POST /api/datasets/upload
 *
 * Accepts a dataset file and registers it on the Shelby network (Shelbynet)
 * using the app's publisher key. Returns the Shelby blob name and commitment
 * bytes so the client can submit the marketplace registration transaction.
 *
 * Architecture note:
 *   Shelbynet (chain ID 110) and Aptos testnet (chain ID 2) are different
 *   chains. The user's wallet can only be on one chain at a time, so:
 *     - Shelby blob registration → server signs on Shelbynet (this route)
 *     - Marketplace dataset registration → user's wallet signs on Aptos testnet
 *
 * Request (preferred — avoids FormData DataCloneError from wallet extensions):
 *   Content-Type: application/octet-stream
 *   Body: raw file bytes
 *   Headers:
 *     x-seller-address — seller's Aptos testnet address
 *     x-filename       — URI-encoded original filename
 *
 * Legacy: multipart/form-data with `file` + `sellerAddress` fields.
 *
 * Response JSON:
 *   shelbyBlobName  — full blob identifier: "<publisherAddr>/<blobPath>"
 *   commitmentBytes — hex merkle root bytes (number[]) for the marketplace tx
 *   blobSize        — byte length of the uploaded file
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMarketplaceSigner,
  buildBlobPath,
  merkleRootToBytes,
  uploadBlobToShelby,
} from "@/lib/shelby";
import { describeLocationError } from "@shelby-protocol/sdk/node";

async function parseUploadRequest(req: NextRequest): Promise<
  | { ok: true; blobData: Uint8Array; sellerAddress: string; filename: string }
  | { ok: false; error: string; status: number }
> {
  const contentType = req.headers.get("content-type") ?? "";

  // Preferred: raw binary body (clone-safe for wallet extension fetch patches)
  if (contentType.includes("application/octet-stream")) {
    const sellerAddress = req.headers.get("x-seller-address");
    const rawFilename = req.headers.get("x-filename");
    if (!sellerAddress) {
      return { ok: false, error: "Missing x-seller-address header", status: 400 };
    }
    if (!rawFilename) {
      return { ok: false, error: "Missing x-filename header", status: 400 };
    }
    let filename: string;
    try {
      filename = decodeURIComponent(rawFilename);
    } catch {
      filename = rawFilename;
    }
    const blobData = new Uint8Array(await req.arrayBuffer());
    if (blobData.length === 0) {
      return { ok: false, error: "Empty file body", status: 400 };
    }
    return { ok: true, blobData, sellerAddress, filename };
  }

  // Legacy multipart/form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return { ok: false, error: "Invalid form data", status: 400 };
  }

  const fileField = formData.get("file");
  const sellerAddress = formData.get("sellerAddress");

  if (!(fileField instanceof File)) {
    return { ok: false, error: "Missing file field", status: 400 };
  }
  if (typeof sellerAddress !== "string" || !sellerAddress) {
    return { ok: false, error: "Missing sellerAddress field", status: 400 };
  }

  return {
    ok: true,
    blobData: new Uint8Array(await fileField.arrayBuffer()),
    sellerAddress,
    filename: fileField.name,
  };
}

export async function POST(req: NextRequest) {
  // ── 1. Parse request ───────────────────────────────────────────────────────
  const parsed = await parseUploadRequest(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const { blobData, sellerAddress, filename } = parsed;
  const blobPath = buildBlobPath(sellerAddress, filename);

  // ── 2. Publisher signer ────────────────────────────────────────────────────
  let signer: ReturnType<typeof getMarketplaceSigner>;
  try {
    signer = getMarketplaceSigner();
  } catch (err) {
    console.error("[upload] signer init failed:", err);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // ── 3. Register → chunkset upload → commit (chain-anchored tx expiry) ─────
  let commitments: Awaited<ReturnType<typeof uploadBlobToShelby>>["commitments"];
  try {
    ({ commitments } = await uploadBlobToShelby({
      blobData,
      blobName: blobPath,
      signer,
    }));
  } catch (err) {
    console.error("[upload] Shelby upload failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    const locationHint = describeLocationError(message);
    const insufficient =
      message.includes("INSUFFICIENT_BALANCE") ||
      message.includes("insufficient balance");
    const clockSkew =
      message.includes("TRANSACTION_EXPIRATION_TOO_FAR_IN_FUTURE") ||
      message.includes("TRANSACTION_EXPIRED");
    return NextResponse.json(
      {
        error: locationHint
          ? `Shelby location error: ${locationHint}. Set SHELBY_LOCATION_HINT to an activated location (currently: shelbynet-1).`
          : insufficient
            ? "Publisher account has no APT on Shelbynet for gas. Fund it via the Shelbynet faucet, then retry."
            : clockSkew
              ? "Shelby rejected the transaction due to clock skew. Retry — uploads now use Shelbynet ledger time."
              : "Failed to upload dataset to Shelby storage",
        detail: message.slice(0, 300),
      },
      { status: 502 }
    );
  }

  // ── 4. Build response for client ───────────────────────────────────────────
  const publisherAddress = signer.accountAddress.toString();
  const shelbyBlobName = `${publisherAddress}/${blobPath}`;
  const commitmentBytes = merkleRootToBytes(commitments.blob_merkle_root);

  return NextResponse.json({
    shelbyBlobName,
    commitmentBytes,
    blobSize: blobData.length,
  });
}
