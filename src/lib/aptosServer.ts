/**
 * Server-side Aptos client for view function calls (has_access, get_blob_name, etc.).
 * Marketplace Move modules live on Shelbynet (same chain as Shelby blob coordination).
 * Blob storage RPC is in src/lib/shelby.ts.
 */
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { APTOS_API_KEY, APTOS_NODE_URL, appOrigin } from "@/constants";

let _aptos: Aptos | null = null;

export function getAptosServerClient(): Aptos {
  if (!_aptos) {
    _aptos = new Aptos(
      new AptosConfig({
        network: Network.SHELBYNET,
        fullnode: APTOS_NODE_URL,
        clientConfig: {
          HEADERS: { Origin: appOrigin() },
          ...(APTOS_API_KEY ? { API_KEY: APTOS_API_KEY } : {}),
        },
      })
    );
  }
  return _aptos;
}

const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS ?? "";

/**
 * Calls the `marketplace::has_access` view function on-chain.
 * Returns true if the buyer holds a PurchaseReceipt for the given dataset.
 */
export async function checkOnChainAccess(
  buyerAddress: string,
  datasetAddr: string
): Promise<boolean> {
  const aptos = getAptosServerClient();
  try {
    const [result] = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::marketplace::has_access`,
        typeArguments: [],
        functionArguments: [buyerAddress, datasetAddr],
      },
    });
    return result as boolean;
  } catch {
    // If the call fails (e.g. account doesn't exist yet), treat as no access.
    return false;
  }
}

/**
 * Calls the `dataset_registry::get_blob_name` view function on-chain.
 * Returns the full canonical Shelby blob name stored for a dataset.
 */
export async function getOnChainBlobName(
  datasetAddr: string
): Promise<string> {
  const aptos = getAptosServerClient();
  const [result] = await aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::dataset_registry::get_blob_name`,
      typeArguments: [],
      functionArguments: [datasetAddr],
    },
  });
  return result as string;
}
