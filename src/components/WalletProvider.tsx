"use client";

// Must run before wallet adapter constructs Aptos Connect (calls getChainId).
import "@/utils/patchAptosGetChainId";

// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";
import { AptosClientErrorGuard } from "@/components/WalletAccountSync";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  return (
    <AptosClientErrorGuard>
      <AptosWalletAdapterProvider
        autoConnect={true}
        optInWallets={["Petra"]}
        dappConfig={{
          network: NETWORK,
          // Only pass a real Shelbynet/Geomi key. Placeholders break getChainId().
          ...(APTOS_API_KEY
            ? { aptosApiKeys: { [NETWORK]: APTOS_API_KEY } as Record<string, string> }
            : {}),
        }}
        onError={(error) => {
          const msg = String(error ?? "");
          // Don't toast noisy Shelbynet simulate / JSON parse failures on load.
          if (/Unexpected token|is not valid JSON|getChainId|Per anonym|504|timeout/i.test(msg)) {
            console.warn("[Shelby] wallet adapter:", msg.slice(0, 160));
            return;
          }
          toast({
            variant: "destructive",
            title: "Error",
            description: error || "Unknown wallet error",
          });
        }}
      >
        {children}
      </AptosWalletAdapterProvider>
    </AptosClientErrorGuard>
  );
}
