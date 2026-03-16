"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { MODULE_ADDRESS } from "@/constants";
import { AccountAddress } from "@aptos-labs/ts-sdk";

type DatasetInfo = {
  datasetAddr: string;
  name: string;
  owner: string;
  sizeBytes: number;
  price: number;
  downloads: number;
  isActive: boolean;
};

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(1)} GB`;
}

export default function DatasetDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { account, signAndSubmitTransaction, signMessage } = useWallet();
  const [dataset,     setDataset]    = useState<DatasetInfo | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [notFound,    setNotFound]   = useState(false);
  const [purchasing,  setPurchasing]  = useState(false);
  const [purchased,   setPurchased]   = useState(false);
  const [hasAccess,   setHasAccess]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const datasetAddr = id;

  useEffect(() => {
    if (!datasetAddr) return;
    setLoading(true);
    const aptos = aptosClient();
    aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_info`,
        typeArguments: [],
        functionArguments: [datasetAddr],
      },
    }).then(([, owner, name, , sizeRaw, priceRaw, dlRaw, isActive]) => {
      setDataset({
        datasetAddr,
        name: name as string,
        owner: owner as string,
        sizeBytes: Number(sizeRaw),
        price: Number(priceRaw),
        downloads: Number(dlRaw),
        isActive: isActive as boolean,
      });
    }).catch(() => {
      setNotFound(true);
    }).finally(() => setLoading(false));
  }, [datasetAddr]);

  useEffect(() => {
    if (!account || !datasetAddr || !dataset) return;
    const walletAddr = account.address.toString();

    try {
      const ownerNorm = AccountAddress.fromString(dataset.owner).toString();
      const walletNorm = AccountAddress.fromString(walletAddr).toString();
      if (ownerNorm === walletNorm) { setHasAccess(true); return; }
    } catch { /* fall through */ }

    const aptos = aptosClient();
    aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::marketplace::has_access`,
        typeArguments: [],
        functionArguments: [walletAddr, datasetAddr],
      },
    }).then(([result]) => {
      if (result) setHasAccess(true);
    }).catch(() => {});
  }, [account, datasetAddr, dataset]);

  const handlePurchase = async () => {
    if (!account) { setError("Connect your wallet to purchase."); return; }
    setError(null); setPurchasing(true);
    try {
      const res = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::marketplace::purchase_dataset` as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [datasetAddr],
        },
      });
      await aptosClient().waitForTransaction({ transactionHash: res.hash });
      setPurchased(true);
      setHasAccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transaction failed");
      return;
    } finally { setPurchasing(false); }

    await handleDownload();
  };

  const handleDownload = async () => {
    if (!account || !signMessage) { setError("Connect your wallet to download."); return; }
    setDownloading(true);
    setError(null);
    try {
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to obtain download nonce.");
      const { nonce } = await nonceRes.json();
      const signed = await signMessage({ message: "Shelby AI DataVault download auth", nonce });
      const res = await fetch(`/api/datasets/${datasetAddr}/download`, {
        headers: {
          "x-buyer-address": account.address.toString(),
          "x-nonce":         nonce,
          "x-signature":     signed.signature.toString(),
          "x-public-key":    account.publicKey?.toString() ?? "",
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Download failed." }));
        throw new Error(body.error ?? "Download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (dataset?.name ?? "dataset").replace(/[^a-zA-Z0-9]/g, "_");
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally { setDownloading(false); }
  };

  if (loading) {
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", gap: "1rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid var(--border-default)",
              borderTopColor: "var(--accent-primary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
            Loading dataset...
          </span>
        </div>
      </div>
    );
  }

  if (notFound || !dataset) {
    return (
      <div>
        <div style={{ maxWidth: "480px", margin: "6rem auto", padding: "0 var(--container-padding)", textAlign: "center" }}>
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
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
            Dataset Not Found
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            This dataset doesn't exist or has been removed from the marketplace.
          </p>
          <Link href="/" className="btn-primary">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isFree = dataset.price === 0;
  const canDownload = isFree || purchased || hasAccess;

  return (
    <div>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0" }}>

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            marginBottom: "2rem",
          }}
        >
          <Link href="/" style={{ color: "var(--text-tertiary)" }}>Marketplace</Link>
          <span style={{ color: "var(--border-default)" }}>/</span>
          <span className="line-clamp-1" style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
            {dataset.name}
          </span>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "3rem", alignItems: "start" }}>

          {/* ── Left: Dataset details ── */}
          <div>
            {/* Title + status */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                {dataset.isActive ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      background: "var(--success-dim)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      fontWeight: 500,
                      color: "var(--success)",
                      textTransform: "uppercase",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
                    Active
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      background: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    Inactive
                  </span>
                )}
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  color: "var(--text-primary)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {dataset.name}
              </h1>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--border-subtle)",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "2rem",
              }}
            >
              {[
                { label: "File Size", value: formatSize(dataset.sizeBytes) },
                { label: "Downloads", value: dataset.downloads.toLocaleString("en-US") },
                { label: "Status", value: dataset.isActive ? "Listed" : "Unlisted" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "var(--bg-card)",
                    padding: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "1.25rem",
                      color: "var(--text-primary)",
                      lineHeight: 1,
                      marginBottom: "6px",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Provenance section */}
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  color: "var(--text-primary)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Provenance & Integrity
              </h2>

              <div className="surface" style={{ padding: "0" }}>
                {[
                  { label: "Object Address", value: dataset.datasetAddr },
                  { label: "Owner", value: dataset.owner },
                  { label: "Storage Layer", value: "shelby.xyz (Testnet)" },
                  { label: "Erasure Coding", value: "Clay Codes (10 data + 6 parity)" },
                  { label: "Settlement", value: "Aptos Blockchain" },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "160px 1fr",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        paddingTop: "2px",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8125rem",
                        color: row.label === "Object Address" || row.label === "Owner" ? "var(--accent-primary)" : "var(--text-secondary)",
                        wordBreak: "break-all",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Purchase card ── */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div className="surface-elevated" style={{ padding: "1.5rem" }}>

              {/* Price */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Price
                </div>
                {isFree ? (
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "2.25rem",
                      color: "var(--success)",
                      lineHeight: 1,
                    }}
                  >
                    Free
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span
                      className="text-gradient"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "2.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {(dataset.price / 1e8).toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      APT
                    </span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    background: "var(--error-dim)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "8px",
                    color: "var(--error)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Action button */}
              {canDownload ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "1rem",
                    opacity: downloading ? 0.7 : 1,
                  }}
                >
                  {downloading ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>
                      Preparing Download...
                    </>
                  ) : (
                    <>
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
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Dataset
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !account}
                  className={!account ? "btn-secondary" : "btn-primary"}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    opacity: purchasing || !account ? 0.7 : 1,
                  }}
                >
                  {!account ? (
                    "Connect Wallet to Purchase"
                  ) : purchasing ? (
                    <>
                      <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>
                      Confirming Transaction...
                    </>
                  ) : (
                    `Purchase for ${(dataset.price / 1e8).toFixed(2)} APT`
                  )}
                </button>
              )}

              {/* Trust signals */}
              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: "◈", text: "Ownership verified on Aptos" },
                  { icon: "◇", text: "Erasure-coded storage via shelby.xyz" },
                  { icon: "◉", text: "Instant access after purchase" },
                ].map((item) => (
                  <div
                    key={item.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8125rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <span style={{ color: "var(--accent-primary)", fontSize: "0.875rem" }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
