import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";
import type { Network as WalletNetwork } from "@aptos-labs/wallet-adapter-react";

function publicEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Strip CRLF / quotes accidentally introduced by PowerShell `vercel env add`.
  const cleaned = value.replace(/^\uFEFF/, "").replace(/[\r\n]+/g, "").trim().replace(/^["']|["']$/g, "");
  if (!cleaned) return undefined;
  // Treat common placeholders as unset so they don't break Aptos API calls.
  if (/(\.\.\.|YOUR_|CHANGE_ME|xxx)/i.test(cleaned)) return undefined;
  return cleaned;
}

/** Shelbynet coordination-layer fullnode (Aptos-compatible). Marketplace + blobs live here. */
export const SHELBYNET_FULLNODE = "https://api.shelbynet.shelby.xyz/v1";

/** Shelby RPC base (blob reads/writes). */
export const SHELBYNET_RPC = "https://shelby.shelbynet.shelby.xyz/shelby";

export const SHELBYNET_CHAIN_ID = 118;

/** Legacy / wallet-reported chain IDs still treated as Shelbynet. */
export const SHELBYNET_CHAIN_IDS = [110, 118] as const;

export const NETWORK: WalletNetwork =
  (process.env.NEXT_PUBLIC_APP_NETWORK as WalletNetwork) ?? AptosNetwork.SHELBYNET;

export const MODULE_ADDRESS = publicEnv(process.env.NEXT_PUBLIC_MODULE_ADDRESS);

/** Geomi / Aptos API key for Shelbynet fullnode (optional). Not the Shelby blob key. */
export const APTOS_API_KEY = publicEnv(process.env.NEXT_PUBLIC_APTOS_API_KEY);

/** Fullnode for marketplace view/tx calls — defaults to Shelbynet. */
export const APTOS_NODE_URL =
  publicEnv(process.env.NEXT_PUBLIC_APTOS_NODE_URL) ?? SHELBYNET_FULLNODE;

/** Origin header required by Shelbynet API from server-side fetches. */
export function appOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return process.env.NEXT_PUBLIC_APP_URL ?? vercelUrl ?? "http://localhost:3000";
}

/** Human-readable network label for UI. */
export const NETWORK_LABEL = "Shelbynet";
