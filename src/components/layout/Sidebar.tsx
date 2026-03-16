"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./SidebarItem";

// Icons as SVG components for cleaner code
const ExploreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const ListDataIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PortfolioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const FaucetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v6" />
    <path d="M12 22c3.5 0 6-2.5 6-6 0-4.5-6-10-6-10S6 11.5 6 16c0 3.5 2.5 6 6 6z" />
  </svg>
);

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  const sidebarWidth = collapsed ? "72px" : "240px";

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: isMobile ? "260px" : sidebarWidth,
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-default)",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
    transition: "width 0.2s ease, transform 0.2s ease",
    transform: isMobile && !mobileOpen ? "translateX(-100%)" : "translateX(0)",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 40,
    opacity: mobileOpen ? 1 : 0,
    pointerEvents: mobileOpen ? "auto" : "none",
    transition: "opacity 0.2s ease",
  };

  const logoContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: collapsed ? "0" : "10px",
    padding: collapsed ? "16px 12px" : "16px 20px",
    borderBottom: "1px solid var(--border-default)",
    justifyContent: collapsed ? "center" : "flex-start",
  };

  const logoTextStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading)",
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: collapsed ? 0 : 1,
    width: collapsed ? 0 : "auto",
    transition: "opacity 0.15s ease, width 0.2s ease",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.6875rem",
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: collapsed ? "16px 8px 8px" : "16px 14px 8px",
    opacity: collapsed ? 0 : 1,
    height: collapsed ? 0 : "auto",
    overflow: "hidden",
    transition: "opacity 0.15s ease",
  };

  const navContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "8px",
    gap: "4px",
    overflowY: "auto",
  };

  const collapseButtonStyle: React.CSSProperties = {
    display: isMobile ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    margin: "8px",
    borderRadius: "8px",
    background: "transparent",
    border: "none",
    color: "var(--text-tertiary)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  const mobileMenuButtonStyle: React.CSSProperties = {
    position: "fixed",
    top: "16px",
    left: "16px",
    width: "44px",
    height: "44px",
    display: isMobile ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "10px",
    color: "var(--text-primary)",
    cursor: "pointer",
    zIndex: 30,
    boxShadow: "var(--shadow-md)",
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button style={mobileMenuButtonStyle} onClick={() => setMobileOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      <div style={overlayStyle} onClick={() => setMobileOpen(false)} />

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <Link href="/" style={logoContainerStyle}>
          <Image
            src="/images/logo.png"
            alt="Shelby"
            width={32}
            height={32}
            style={{ borderRadius: "8px" }}
          />
          <span style={logoTextStyle}>Shelby AI DataVault</span>
        </Link>

        {/* Navigation */}
        <nav style={navContainerStyle}>
          {/* Main Section */}
          <span style={sectionLabelStyle}>Main</span>
          <SidebarItem
            href="/"
            icon={<ExploreIcon />}
            label="Explore"
            collapsed={collapsed && !isMobile}
          />
          <SidebarItem
            href="/upload"
            icon={<ListDataIcon />}
            label="List Data"
            collapsed={collapsed && !isMobile}
          />

          {/* Account Section */}
          <span style={{ ...sectionLabelStyle, marginTop: "8px" }}>Account</span>
          <SidebarItem
            href="/dashboard"
            icon={<PortfolioIcon />}
            label="Portfolio"
            collapsed={collapsed && !isMobile}
          />
          <SidebarItem
            href="https://aptos.dev/network/faucet"
            icon={<FaucetIcon />}
            label="Faucet"
            external
            collapsed={collapsed && !isMobile}
          />
        </nav>

        {/* Collapse Button */}
        <button
          style={collapseButtonStyle}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </aside>
    </>
  );
}
