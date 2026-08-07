import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletAccountSync, WalletScopedRemount } from "@/components/WalletAccountSync";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { EarlyBootstrap } from "@/components/EarlyBootstrap";
import { Toaster } from "@/components/ui/toaster";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { DashboardLayout } from "@/components/layout";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Shelby AI DataVault",
  title: "Shelby AI DataVault — Decentralized Dataset Marketplace",
  description: "The open, decentralized marketplace for AI training datasets. Buy, sell, and discover high-quality datasets powered by Shelby Protocol and Aptos blockchain.",
  manifest: "/manifest.json",
};

/** Inline: unregister SW before React hydrates (fixes stale PWA after Vercel deploy). */
const UNREGISTER_SW = `
(function(){
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(rs){
        rs.forEach(function(r){ r.unregister(); });
      });
    }
    if (window.caches) {
      caches.keys().then(function(keys){
        keys.forEach(function(k){ caches.delete(k); });
      });
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script id="unregister-sw" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: UNREGISTER_SW }} />
      </head>
      <body>
        <EarlyBootstrap />
        <WalletProvider>
          <ReactQueryProvider>
            <WalletAccountSync />
            <DashboardLayout>
              <ClientErrorBoundary>
                <WalletScopedRemount>
                  <div id="root">{children}</div>
                </WalletScopedRemount>
              </ClientErrorBoundary>
            </DashboardLayout>
            <WrongNetworkAlert />
            <Toaster />
          </ReactQueryProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
