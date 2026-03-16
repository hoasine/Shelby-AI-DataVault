"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";
import { AccountAddress } from "@aptos-labs/ts-sdk";

function normalizeAddr(addr: string): string {
  try { return AccountAddress.fromString(addr).toString(); } catch { return addr.toLowerCase(); }
}

type Listing = {
  id: string;
  name: string;
  price: number;
  downloads: number;
  earnings: number;
  size: string;
  isActive: boolean;
  datasetAddr: string;
  listedAt: string;
};

type Purchase = {
  id: string;
  name: string;
  price: number;
  size: string;
  datasetAddr: string;
};

async function fetchListings(ownerAddress: string): Promise<Listing[]> {
  const aptos = aptosClient();
  console.log("[dashboard] MODULE_ADDRESS:", MODULE_ADDRESS);
  console.log("[dashboard] ownerAddress:", ownerAddress);
  const [countRaw] = await aptos.view({
    payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_count`, typeArguments: [], functionArguments: [] },
  });
  const count = Number(countRaw);
  console.log("[dashboard] dataset count:", count);
  const listings: Listing[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const [addr] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_address`, typeArguments: [], functionArguments: [i] },
      });
      const datasetAddr = addr as string;
      const [id, owner, name, , sizeBytesRaw, priceRaw, downloadsRaw, isActive] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`, typeArguments: [], functionArguments: [datasetAddr] },
      }) as [number, string, string, string, number, number, number, boolean];

      console.log(`[dashboard] dataset ${i}: addr=${datasetAddr} owner=${owner} name=${name}`);
      if (normalizeAddr(owner as string) !== normalizeAddr(ownerAddress)) continue;

      const sizeBytes = Number(sizeBytesRaw);
      const price     = Number(priceRaw);
      const downloads = Number(downloadsRaw);
      const [earningsRaw] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::marketplace::get_seller_earnings`, typeArguments: [], functionArguments: [ownerAddress] },
      });

      const fmt = (b: number) =>
        b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` :
        b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(1)} GB`;

      listings.push({
        id: String(id),
        name: name as string,
        price,
        downloads,
        earnings: Number(earningsRaw),
        size: fmt(sizeBytes),
        isActive: isActive as boolean,
        datasetAddr,
        listedAt: new Date().toISOString().slice(0, 10),
      });
    } catch {
      // skip datasets that can't be read
    }
  }
  return listings;
}

async function fetchPurchases(buyerAddress: string): Promise<Purchase[]> {
  const aptos = aptosClient();
  const [countRaw] = await aptos.view({
    payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_count`, typeArguments: [], functionArguments: [] },
  });
  const count = Number(countRaw);
  const purchases: Purchase[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const [addr] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_address`, typeArguments: [], functionArguments: [i] },
      });
      const datasetAddr = addr as string;
      const [hasAccess] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::marketplace::has_access`, typeArguments: [], functionArguments: [buyerAddress, datasetAddr] },
      });
      if (!hasAccess) continue;

      const [id, owner, name, , sizeBytesRaw, priceRaw] = await aptos.view({
        payload: { function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`, typeArguments: [], functionArguments: [datasetAddr] },
      }) as [number, string, string, string, number, number, number, boolean];

      if (normalizeAddr(owner as string) === normalizeAddr(buyerAddress)) continue;

      const fmt = (b: number) =>
        b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` :
        b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(1)} GB`;

      purchases.push({
        id: String(id),
        name: name as string,
        price: Number(priceRaw),
        size: fmt(Number(sizeBytesRaw)),
        datasetAddr,
      });
    } catch {
      // skip
    }
  }
  return purchases;
}

type Tab = "listings" | "purchases";

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div className="stat-label">{label}</div>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { account } = useWallet();
  const [tab,         setTab]        = useState<Tab>("listings");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dlError,     setDlError]    = useState<string | null>(null);
  const [listings,    setListings]   = useState<Listing[]>([]);
  const [purchases,   setPurchases]  = useState<Purchase[]>([]);
  const [loading,     setLoading]    = useState(false);
  const [fetchError,  setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    setFetchError(null);
    const addr = account.address.toString();
    Promise.all([fetchListings(addr), fetchPurchases(addr)])
      .then(([l, p]) => { setListings(l); setPurchases(p); })
      .catch((e) => setFetchError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [account]);

  const totalEarnings  = listings.reduce((s, d) => s + d.earnings, 0);
  const totalDownloads = listings.reduce((s, d) => s + d.downloads, 0);

  const handleDownload = async (datasetAddr: string, name: string) => {
    if (!account) return;
    setDlError(null); setDownloading(datasetAddr);
    try {
      const res = await fetch(`/api/datasets/${datasetAddr}/download`, {
        headers: { "x-buyer-address": account.address.toString() },
      });
      if (!res.ok) { const { error: msg } = await res.json(); throw new Error(msg ?? "Download failed"); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = name.replace(/[^a-zA-Z0-9]/g, "_"); a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setDlError(e instanceof Error ? e.message : "Download failed");
    } finally { setDownloading(null); }
  };

  if (!account) {
    return (
      <div>
        <div style={{ maxWidth: "480px", margin: "6rem auto", padding: "0 var(--container-padding)", textAlign: "center" }}>
          {/* Lock icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.75rem",
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Connect Your Wallet
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Connect an Aptos wallet to view your listed datasets, purchases, and earnings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0" }}>

        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.5rem",
                }}
              >
                Portfolio
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    color: "var(--accent-primary)",
                  }}
                >
                  {account.address.toString().slice(0, 8)}...{account.address.toString().slice(-6)}
                </span>
              </div>
            </div>
            <Link href="/upload" className="btn-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              List Dataset
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard
            label="Total Earnings"
            value={`${(totalEarnings / 1e8).toFixed(2)} APT`}
            sub="from dataset sales"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <StatCard
            label="Total Downloads"
            value={totalDownloads.toLocaleString("en-US")}
            sub="across all datasets"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          />
          <StatCard
            label="Active Listings"
            value={String(listings.filter((d) => d.isActive).length)}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            }
          />
          <StatCard
            label="Purchased"
            value={String(purchases.length)}
            sub="datasets in collection"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            }
          />
        </div>

        {/* Fetch error */}
        {fetchError && (
          <div
            style={{
              padding: "0.875rem 1rem",
              marginBottom: "1.5rem",
              background: "var(--error-dim)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "8px",
              color: "var(--error)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              wordBreak: "break-all",
            }}
          >
            {fetchError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8125rem",
              color: "var(--text-tertiary)",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "2px solid var(--border-default)",
                borderTopColor: "var(--accent-primary)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Loading portfolio data...
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            padding: "4px",
            width: "fit-content",
            marginBottom: "1.5rem",
          }}
        >
          {(["listings", "purchases"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px",
                background: tab === t ? "var(--bg-elevated)" : "transparent",
                border: "none",
                borderRadius: "6px",
                color: tab === t ? "var(--text-primary)" : "var(--text-tertiary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t === "listings" ? `Listed (${listings.length})` : `Purchased (${purchases.length})`}
            </button>
          ))}
        </div>

        {/* Download error */}
        {dlError && (
          <div
            style={{
              padding: "0.875rem 1rem",
              marginBottom: "1rem",
              background: "var(--error-dim)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "8px",
              color: "var(--error)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
            }}
          >
            {dlError}
          </div>
        )}

        {/* ── Listings tab ── */}
        {tab === "listings" && (
          <div className="data-table">
            {/* Table header */}
            <div className="data-table-header" style={{ gridTemplateColumns: "1fr 100px 100px 100px 80px" }}>
              <span>Dataset</span>
              <span>Downloads</span>
              <span>Earnings</span>
              <span>Price</span>
              <span></span>
            </div>

            {listings.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  No datasets listed yet
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
                  Start earning by listing your first dataset.
                </p>
                <Link href="/upload" className="btn-primary">
                  List Your First Dataset
                </Link>
              </div>
            ) : (
              listings.map((d) => (
                <div key={d.id} className="data-table-row" style={{ gridTemplateColumns: "1fr 100px 100px 100px 80px" }}>
                  {/* Name + status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: d.isActive ? "var(--success)" : "var(--text-muted)",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/datasets/${d.datasetAddr}`}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.name}
                      </Link>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {d.listedAt} · {d.size}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    {d.downloads.toLocaleString("en-US")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      color: d.earnings > 0 ? "var(--success)" : "var(--text-muted)",
                    }}
                  >
                    {d.price === 0 ? "—" : `${(d.earnings / 1e8).toFixed(2)} APT`}
                  </span>
                  <span
                    className="text-gradient"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {d.price === 0 ? "Free" : `${(d.price / 1e8).toFixed(2)} APT`}
                  </span>
                  <Link
                    href={`/datasets/${d.datasetAddr}`}
                    className="btn-ghost"
                    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Purchases tab ── */}
        {tab === "purchases" && (
          <div className="data-table">
            {/* Table header */}
            <div className="data-table-header" style={{ gridTemplateColumns: "1fr 100px 100px 120px" }}>
              <span>Dataset</span>
              <span>Paid</span>
              <span>Size</span>
              <span></span>
            </div>

            {purchases.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  No purchases yet
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
                  Explore the marketplace to find datasets for your AI models.
                </p>
                <Link href="/" className="btn-primary">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              purchases.map((d) => (
                <div key={d.id} className="data-table-row" style={{ gridTemplateColumns: "1fr 100px 100px 120px" }}>
                  <div style={{ minWidth: 0 }}>
                    <Link
                      href={`/datasets/${d.datasetAddr}`}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name}
                    </Link>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {d.size}
                    </div>
                  </div>

                  <span
                    className="text-gradient"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {d.price === 0 ? "Free" : `${(d.price / 1e8).toFixed(2)} APT`}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                    {d.size}
                  </span>

                  <button
                    onClick={() => handleDownload(d.datasetAddr, d.name)}
                    disabled={downloading === d.datasetAddr}
                    className="btn-secondary"
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.75rem",
                      opacity: downloading === d.datasetAddr ? 0.6 : 1,
                    }}
                  >
                    {downloading === d.datasetAddr ? (
                      <>
                        <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>
                        Downloading
                      </>
                    ) : (
                      <>↓ Download</>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
