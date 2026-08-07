"use client";

// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";
import { WalletScopedRemount } from "@/components/WalletAccountSync";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  return (
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
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      <WalletScopedRemount>{children}</WalletScopedRemount>
    </AptosWalletAdapterProvider>
  );
}
