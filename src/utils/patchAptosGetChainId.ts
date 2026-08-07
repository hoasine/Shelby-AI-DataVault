/**
 * Aptos Connect wallets are constructed by the wallet adapter even when filtered
 * out via optInWallets. Their constructor calls aptos.getChainId() with no
 * .catch(). On Shelbynet the fullnode sometimes returns plain text
 * ("Per anonym...") instead of JSON → SyntaxError crashes the Next.js page
 * while the marketplace is loading (looks like a list error, but isn't).
 *
 * Import this module before AptosWalletAdapterProvider mounts.
 */
import { Aptos } from "@aptos-labs/ts-sdk";
import { SHELBYNET_CHAIN_ID } from "@/constants";

const FLAG = "__shelbyPatchedGetChainId";

export function patchAptosGetChainId(): void {
  if (typeof window === "undefined") return;
  const g = window as unknown as Record<string, boolean>;
  if (g[FLAG]) return;
  g[FLAG] = true;

  const proto = Aptos.prototype as Aptos & {
    getChainId: (this: Aptos) => Promise<number>;
  };
  const original = proto.getChainId;

  proto.getChainId = async function patchedGetChainId(this: Aptos): Promise<number> {
    try {
      return await original.call(this);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /Unexpected token|is not valid JSON|Per anonym|Gateway Timeout|504|jsonRequest/i.test(
          msg,
        )
      ) {
        console.warn(
          "[Shelby] getChainId failed; using Shelbynet chain id",
          SHELBYNET_CHAIN_ID,
        );
        return SHELBYNET_CHAIN_ID;
      }
      throw err;
    }
  };
}

patchAptosGetChainId();
