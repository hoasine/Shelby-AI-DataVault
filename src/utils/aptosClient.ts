import { APTOS_API_KEY, APTOS_NODE_URL, NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: NETWORK,
    ...(APTOS_NODE_URL ? { fullnode: APTOS_NODE_URL } : {}),
    ...(APTOS_API_KEY ? { clientConfig: { API_KEY: APTOS_API_KEY } } : {}),
  }),
);

export function aptosClient() {
  return aptos;
}
