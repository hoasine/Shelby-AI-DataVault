import type { Network } from "@aptos-labs/wallet-adapter-react";

function publicEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Treat common placeholders as unset so they don't break Aptos API calls.
  if (/(\.\.\.|YOUR_|CHANGE_ME|xxx)/i.test(value)) return undefined;
  return value;
}

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "testnet";
export const MODULE_ADDRESS = publicEnv(process.env.NEXT_PUBLIC_MODULE_ADDRESS);
export const APTOS_API_KEY = publicEnv(process.env.NEXT_PUBLIC_APTOS_API_KEY);
/** Custom fullnode URL — overrides the SDK default for the selected network. */
export const APTOS_NODE_URL = publicEnv(process.env.NEXT_PUBLIC_APTOS_NODE_URL);
