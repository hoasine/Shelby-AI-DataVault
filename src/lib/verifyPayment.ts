import {
  AccountAddress,
  isUserTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { getAptosServerClient } from "@/lib/aptosServer";
import { isFreePrice } from "@/lib/pricing";

const MODULE_ADDRESS = (process.env.NEXT_PUBLIC_MODULE_ADDRESS ?? "")
  .replace(/[\r\n]+/g, "")
  .trim();

/** Returns marketplace escrow address from chain. */
export async function getMarketplaceAddress(): Promise<string> {
  const aptos = getAptosServerClient();
  const [addr] = await aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::marketplace::get_marketplace_address`,
      typeArguments: [],
      functionArguments: [],
    },
  });
  return AccountAddress.fromString(addr as string).toString();
}

/**
 * Shelbynet workaround: verify a successful APT transfer to marketplace escrow
 * instead of purchase_dataset (whose simulate call times out in Petra).
 */
export async function verifyMarketplacePaymentTx(
  buyerAddress: string,
  datasetAddr: string,
  paymentTxHash: string,
): Promise<string | null> {
  const aptos = getAptosServerClient();
  let priceOctas = 0;
  try {
    const [, , , , priceRaw] = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`,
        typeArguments: [],
        functionArguments: [datasetAddr],
      },
    });
    priceOctas = Number(priceRaw);
  } catch {
    return "Could not read dataset price.";
  }

  if (isFreePrice(priceOctas)) return null;

  let marketplaceNorm: string;
  try {
    marketplaceNorm = AccountAddress.fromString(await getMarketplaceAddress()).toString();
  } catch {
    return "Could not resolve marketplace address.";
  }

  let tx;
  try {
    tx = await aptos.waitForTransaction({ transactionHash: paymentTxHash });
  } catch {
    return "Payment transaction not found or not confirmed.";
  }

  if (!isUserTransactionResponse(tx) || !tx.success) {
    return "Payment transaction failed on-chain.";
  }

  const buyerNorm = AccountAddress.fromString(buyerAddress).toString();
  const senderNorm = AccountAddress.fromString(tx.sender).toString();
  if (senderNorm !== buyerNorm) {
    return "Payment transaction sender does not match buyer.";
  }

  const rawPayload = tx.payload as {
    type: string;
    function?: string;
    arguments?: unknown[];
  };
  if (rawPayload.type !== "entry_function_payload" || !rawPayload.function) {
    return "Invalid payment transaction type.";
  }

  const fn = rawPayload.function;
  const isTransfer =
    fn === "0x1::aptos_account::transfer" ||
    fn === "0x1::coin::transfer" ||
    fn.endsWith("::transfer");

  if (!isTransfer) {
    return "Payment must be an APT transfer to the marketplace.";
  }

  const args = rawPayload.arguments ?? [];
  if (args.length < 2) {
    return "Invalid transfer arguments.";
  }

  let recipientNorm: string;
  let amount = 0;
  try {
    recipientNorm = AccountAddress.fromString(String(args[0])).toString();
    amount = Number(args[1]);
  } catch {
    return "Could not parse transfer recipient or amount.";
  }

  if (recipientNorm !== marketplaceNorm) {
    return "Payment must be sent to the marketplace escrow address.";
  }

  if (amount < priceOctas) {
    return `Insufficient payment: expected at least ${priceOctas} octas.`;
  }

  return null;
}
