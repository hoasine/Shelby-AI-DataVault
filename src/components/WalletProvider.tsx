"use client";

// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, APTOS_NODE_URL, NETWORK } from "@/constants";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import type { PropsWithChildren } from "react";

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: NETWORK,
        // Only pass a real Aptos testnet key. A Shelbynet key or placeholder
        // makes getChainId() return plain-text "Permission denied..." and crash.
        ...(APTOS_API_KEY
          ? { aptosApiKeys: { [NETWORK]: APTOS_API_KEY } as Record<string, string> }
          : {}),
        ...(APTOS_NODE_URL ? { aptosNodeUrl: APTOS_NODE_URL } : {}),
      }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
