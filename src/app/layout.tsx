import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletAccountSync } from "@/components/WalletAccountSync";
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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <WalletProvider>
          <ReactQueryProvider>
            <WalletAccountSync />
            <DashboardLayout>
              <div id="root">{children}</div>
            </DashboardLayout>
            <WrongNetworkAlert />
            <Toaster />
          </ReactQueryProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
