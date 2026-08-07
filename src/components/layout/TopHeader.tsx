"use client";

import { WalletSelector } from "@/components/WalletSelector";
import { NETWORK_LABEL } from "@/constants";

interface TopHeaderProps {
  sidebarWidth?: string;
}

export function TopHeader({ sidebarWidth = "240px" }: TopHeaderProps) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: "64px",
        backgroundColor: "rgba(6, 6, 10, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        zIndex: 40,
        transition: "left 0.2s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "16px",
        }}
      >
        {/* Search Bar (optional enhancement) */}
        <div
          style={{
            flex: 1,
            maxWidth: "400px",
            marginRight: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              color: "var(--text-tertiary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.5 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span style={{ opacity: 0.6 }}>Search datasets...</span>
            <span
              style={{
                marginLeft: "auto",
                padding: "2px 6px",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
                fontSize: "0.6875rem",
                fontFamily: "var(--font-mono)",
                color: "var(--text-tertiary)",
              }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Network Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "var(--success-dim)",
            borderRadius: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
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
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          {NETWORK_LABEL}
        </div>

        {/* Wallet Selector */}
        <WalletSelector />
      </div>
    </header>
  );
}
