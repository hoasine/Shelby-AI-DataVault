import {
  APTOS_API_KEY,
  APTOS_NODE_URL,
  appOrigin,
  NETWORK,
} from "@/constants";
import { Aptos, AptosConfig, Network as AptosNetwork } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(
  new AptosConfig({
    network: NETWORK as AptosNetwork,
    fullnode: APTOS_NODE_URL,
    clientConfig: {
      HEADERS: { Origin: appOrigin() },
      ...(APTOS_API_KEY ? { API_KEY: APTOS_API_KEY } : {}),
    },
  }),
);

export function aptosClient() {
  return aptos;
}
