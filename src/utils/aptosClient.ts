import {
  APTOS_API_KEY,
  APTOS_NODE_URL,
  appOrigin,
  NETWORK,
} from "@/constants";
import { Aptos, AptosConfig, Network as AptosNetwork } from "@aptos-labs/ts-sdk";

let cachedOrigin: string | undefined;
let aptos: Aptos | undefined;

function buildAptos(origin: string): Aptos {
  return new Aptos(
    new AptosConfig({
      network: NETWORK as AptosNetwork,
      fullnode: APTOS_NODE_URL,
      clientConfig: {
        HEADERS: { Origin: origin },
        ...(APTOS_API_KEY ? { API_KEY: APTOS_API_KEY } : {}),
      },
    }),
  );
}

/** Drop cached client after wallet switch / disconnect. */
export function resetAptosClient() {
  aptos = undefined;
  cachedOrigin = undefined;
}

/** Shelbynet client; re-inits when browser origin changes (dev port / deploy URL). */
export function aptosClient() {
  const origin = appOrigin();
  if (!aptos || cachedOrigin !== origin) {
    cachedOrigin = origin;
    aptos = buildAptos(origin);
  }
  return aptos;
}
