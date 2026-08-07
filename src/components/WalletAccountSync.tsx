"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { resetAptosClient } from "@/utils/aptosClient";

function walletAddressKey(account: { address?: { toString?: () => string } } | null): string | null {
  try {
    const s = account?.address?.toString?.();
    return s && s.length > 0 ? s : null;
  } catch {
    return null;
  }
}

/**
 * Suppress unhandled Aptos Connect getChainId() rejections on Shelbynet.
 * Aptos Connect wallets are constructed even when filtered by optInWallets,
 * and their constructor awaits getChainId() with no .catch — a non-JSON
 * fullnode response crashes the whole production page.
 */
export function AptosClientErrorGuard({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const msg = String(
        (event.reason && typeof event.reason === "object" && "message" in event.reason
          ? (event.reason as Error).message
          : event.reason) ?? "",
      );
      if (
        /Unexpected token|is not valid JSON|getChainId|Per anonym|jsonRequest|Gateway Timeout|504/i.test(
          msg,
        )
      ) {
        event.preventDefault();
        console.warn("[Shelby] ignored Aptos network error:", msg.slice(0, 160));
      }
    };
    const onError = (event: ErrorEvent) => {
      const msg = String(event.message ?? "");
      if (/Unexpected token|is not valid JSON|getChainId|Per anonym/i.test(msg)) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return <>{children}</>;
}

/**
 * When the connected wallet address changes, clear client caches so
 * hasAccess / purchase / error state from the previous wallet does not leak.
 * Does NOT remount React Query / toast providers (that crashed production).
 */
export function WalletAccountSync() {
  const { account, connected } = useWallet();
  const router = useRouter();
  const queryClient = useQueryClient();
  const prevAddr = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const addr = connected ? walletAddressKey(account) : null;

    if (prevAddr.current !== undefined && prevAddr.current !== addr) {
      try {
        queryClient.clear();
      } catch {
        /* ignore */
      }
      resetAptosClient();
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    }

    prevAddr.current = addr;
  }, [account, connected, queryClient, router]);

  return null;
}

/**
 * Remount only page UI when wallet changes — keep providers stable.
 */
export function WalletScopedRemount({ children }: { children: ReactNode }) {
  const { account, connected } = useWallet();
  const walletKey = connected
    ? walletAddressKey(account) ?? "connected"
    : "disconnected";

  return <div key={walletKey}>{children}</div>;
}
