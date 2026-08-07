"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { resetAptosClient } from "@/utils/aptosClient";

/**
 * When the connected wallet address changes, clear client caches and remount UI
 * so hasAccess / purchase / error state from the previous wallet does not leak.
 */
export function WalletAccountSync() {
  const { account, connected } = useWallet();
  const router = useRouter();
  const queryClient = useQueryClient();
  const prevAddr = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const addr = connected && account ? account.address.toString() : null;

    if (prevAddr.current !== undefined && prevAddr.current !== addr) {
      queryClient.clear();
      resetAptosClient();
      router.refresh();
    }

    prevAddr.current = addr;
  }, [account, connected, queryClient, router]);

  return null;
}

/** Forces a full client remount when wallet address changes. */
export function WalletScopedRemount({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account, connected } = useWallet();
  const walletKey = connected
    ? account?.address.toString() ?? "connected"
    : "disconnected";

  return <div key={walletKey}>{children}</div>;
}
