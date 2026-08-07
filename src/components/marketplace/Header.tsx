"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletSelector } from "@/components/WalletSelector";

const NAV = [
  { href: "/",          label: "Explore",   icon: "◈", external: false },
  { href: "/upload",    label: "List Data", icon: "↑", external: false },
  { href: "/dashboard", label: "Portfolio", icon: "▣", external: false },
  { href: "https://aptos.dev/network/faucet", label: "Faucet", icon: "◎", external: true },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(6, 6, 10, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "0 var(--container-padding)",
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Logo mark */}
          <img
            src="/images/logo.png"
            alt="Shelby"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--text-primary)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Shelby
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.625rem",
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              AI DataVault
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          {NAV.map((item) => {
            const active = !item.external && pathname === item.href;
            const linkStyle = {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "6px",
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: active ? "var(--text-primary)" : "var(--text-tertiary)",
              background: active ? "var(--bg-elevated)" : "transparent",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap" as const,
              textDecoration: "none",
            };

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-tertiary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: "0.875rem", opacity: 0.6 }}>{item.icon}</span>
                  {item.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: "2px", opacity: 0.5 }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                style={linkStyle}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "var(--surface-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-tertiary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "0.875rem", opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Network indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "var(--success-dim)",
              borderRadius: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: "var(--success)",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--success)",
              }}
            />
            Shelbynet
          </div>
          <WalletSelector />
        </div>
      </div>
    </header>
  );
}
