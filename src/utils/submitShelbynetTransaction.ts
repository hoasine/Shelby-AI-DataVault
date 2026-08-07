import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";
import { aptosClient } from "@/utils/aptosClient";

type WalletSignTransaction = (args: {
  transactionOrPayload: unknown;
  asFeePayer?: boolean;
}) => Promise<{ authenticator: { bcsToBytes: () => Uint8Array } }>;

/**
 * Build with our Shelbynet client, sign raw tx in wallet (no JSON simulate),
 * submit via our fullnode. Avoids wallet-adapter getAptosConfig("custom") errors
 * and Petra signAndSubmit v1.1 simulate timeouts.
 */
export async function signAndSubmitShelbynetTransaction(
  sender: string,
  data: InputGenerateTransactionPayloadData,
  signTransaction: WalletSignTransaction,
) {
  const aptos = aptosClient();
  const transaction = await aptos.transaction.build.simple({ sender, data });
  const { authenticator } = await signTransaction({
    transactionOrPayload: transaction as never,
  });
  const pending = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: authenticator as never,
  });
  await aptos.waitForTransaction({ transactionHash: pending.hash });
  return pending;
}
