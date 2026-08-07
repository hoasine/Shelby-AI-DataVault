import { Network } from "@aptos-labs/ts-sdk";
import { NetworkInfo, isAptosNetwork } from "@aptos-labs/wallet-adapter-react";
import { NETWORK, SHELBYNET_CHAIN_ID } from "@/constants";

export const isValidNetworkName = (network: NetworkInfo | null) => {
  if (isAptosNetwork(network)) {
    return Object.values<string | undefined>(Network).includes(network?.name);
  }
  // If the configured network is not an Aptos network, i.e is a custom network
  // we resolve it as a valid network name
  return true;
};

/** True when Petra/wallet is on Shelbynet (case-insensitive name or chain ID 110). */
export function isExpectedWalletNetwork(network: NetworkInfo | null | undefined): boolean {
  if (!network) return false;
  if (network.chainId === SHELBYNET_CHAIN_ID) return true;
  if (network.name?.toLowerCase() === NETWORK.toLowerCase()) return true;
  if (network.url?.toLowerCase().includes("shelbynet")) return true;
  return false;
}
