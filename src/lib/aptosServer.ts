/**
 * Server-side Aptos client for view function calls (has_access, get_blob_name, etc.).
 * Points at Aptos testnet — the marketplace Move modules live here.
 * Blob storage itself is on Shelbynet (see src/lib/shelby.ts).
 */
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { APTOS_API_KEY, APTOS_NODE_URL } from "@/constants";

const STAGING_NODE = "https://api.testnet.aptoslabs.com/v1";

let _aptos: Aptos | null = null;

export function getAptosServerClient(): Aptos {
  if (!_aptos) {
    const nodeUrl = APTOS_NODE_URL ?? STAGING_NODE;
    _aptos = new Aptos(
      new AptosConfig({
        network: Network.TESTNET,
        fullnode: nodeUrl,
        ...(APTOS_API_KEY
          ? { clientConfig: { API_KEY: APTOS_API_KEY } }
          : {}),
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
