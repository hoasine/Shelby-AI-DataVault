"use client";

import { useState, useEffect, useMemo } from "react";
import { DatasetCard, type Dataset } from "@/components/marketplace/DatasetCard";
import Link from "next/link";

export default function HomePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");

  useEffect(() => {
    fetch("/api/datasets", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ datasets: [] }));
        return data.datasets ?? [];
      })
      .then(setDatasets)
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return datasets;
    const q = query.toLowerCase();
    return datasets.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.seller.toLowerCase().includes(q)
    );
  }, [query, datasets]);


  return (
    <div>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 100% at 50% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 100% at 50% 0%, black, transparent)",
          }}
        />

        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
            padding: "2rem var(--container-padding) 3rem",
            position: "relative",
          }}
        >
          {/* Hero content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              maxWidth: "720px",
            }}
          >
            {/* Shelbynet migration notice */}
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                background: "var(--accent-dim)",
                border: "1px solid rgba(0, 212, 255, 0.28)",
                borderRadius: "10px",
                maxWidth: "560px",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: "2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent-primary)",
                  boxShadow: "0 0 8px var(--accent-primary)",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  color: "var(--text-secondary)",
                }}
              >
                <strong style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                  Now on Shelbynet.
                </strong>{" "}
                Marketplace and blob storage run on Shelby Protocol&apos;s Shelbynet (chain ID 118).
                Connect your wallet to Shelbynet to list, buy, and download datasets.
              </p>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              The Marketplace for{" "}
              <span className="text-gradient">AI Training Data</span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.125rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: "560px",
              }}
            >
              Buy, sell, and discover high-quality datasets with cryptographic integrity.
              Powered by{" "}
              <a
                href="https://shelby.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-primary)", textDecoration: "none" }}
              >
                Shelby Protocol
              </a>
              {" "}and Aptos blockchain.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <Link
                href="/upload"
                className="btn-primary"
                style={{ padding: "0.875rem 1.75rem" }}
              >
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
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                List Your Dataset
              </Link>
              <a
                href="#browse"
                className="btn-secondary"
                style={{ padding: "0.875rem 1.75rem" }}
              >
                Browse Marketplace
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BROWSE SECTION
          ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="browse"
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "3rem var(--container-padding) 5rem",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.75rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              Explore Datasets
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                color: "var(--text-tertiary)",
              }}
            >
              Discover verified, high-quality datasets for your AI models
            </p>
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: "320px", flex: "0 1 400px" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search datasets by name or creator..."
              className="field-input"
              style={{
                paddingLeft: "44px",
                height: "44px",
              }}
            />
          </div>
        </div>

        {/* Results count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            }}
          >
            {loading ? "Loading..." : `${filtered.length} dataset${filtered.length !== 1 ? "s" : ""} available`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "6rem 2rem",
              gap: "1rem",
            }}
          >
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
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
              }}
            >
              Loading datasets...
            </span>
          </div>
        ) : filtered.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {filtered.map((d, i) => (
              <DatasetCard key={d.datasetAddr} dataset={d} index={i} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "6rem 2rem",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 1.5rem",
                borderRadius: "16px",
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.25rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              No datasets found
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9375rem",
                color: "var(--text-tertiary)",
                marginBottom: "1.5rem",
              }}
            >
              {datasets.length === 0
                ? "Be the first to list a dataset on the marketplace."
                : "Try adjusting your search terms."}
            </p>
            {datasets.length === 0 && (
              <Link href="/upload" className="btn-primary">
                List Your First Dataset
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "2.5rem var(--container-padding)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--container-max)",
            margin: "0 auto",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "2rem",
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
                <img
                  src="/images/logo.png"
                  alt="Shelby"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Shelby
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--text-tertiary)",
                  maxWidth: "280px",
                  lineHeight: 1.5,
                }}
              >
                Decentralized AI data marketplace powered by Shelby Protocol and Aptos blockchain.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: "3rem" }}>
              {/* Protocol */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "0.875rem",
                  }}
                >
                  Protocol
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  <a
                    href="https://shelby.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    shelby.xyz
                  </a>
                  <a
                    href="https://aptos.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    Aptos Docs
                  </a>
                </div>
              </div>

              {/* Community */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "0.875rem",
                  }}
                >
                  Community
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  <a
                    href="https://x.com/HoaTranRom"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </a>
                  <a
                    href="https://github.com/hoasine/Shelby-Vault"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-primary)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    RomRom
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
              }}
            >
              © 2024 Shelby Protocol. Built on Aptos.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  background: "var(--success-dim)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "4px",
                  color: "var(--success)",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
                Shelbynet
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
