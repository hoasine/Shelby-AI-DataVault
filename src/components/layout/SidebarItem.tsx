"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
  collapsed?: boolean;
}

export function SidebarItem({ href, icon, label, external = false, collapsed = false }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = !external && pathname === href;
  const [showTooltip, setShowTooltip] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: collapsed ? "0" : "12px",
    padding: collapsed ? "12px" : "10px 14px",
    borderRadius: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
    background: isActive ? "var(--surface-hover)" : "transparent",
    transition: "all 0.15s ease",
    textDecoration: "none",
    position: "relative",
    justifyContent: collapsed ? "center" : "flex-start",
    cursor: "pointer",
  };

  const iconStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
    flexShrink: 0,
  };

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    left: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    marginLeft: "12px",
    padding: "6px 12px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "6px",
    fontFamily: "var(--font-body)",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    zIndex: 100,
    boxShadow: "var(--shadow-lg)",
    opacity: showTooltip && collapsed ? 1 : 0,
    pointerEvents: "none",
    transition: "opacity 0.15s ease",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!isActive) {
      e.currentTarget.style.background = "var(--surface-hover)";
      e.currentTarget.style.color = "var(--text-secondary)";
    }
    if (collapsed) setShowTooltip(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!isActive) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "var(--text-tertiary)";
    }
    setShowTooltip(false);
  };

  const content = (
    <>
      <span style={iconStyle}>{icon}</span>
      {!collapsed && <span>{label}</span>}
      {external && !collapsed && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: "auto", opacity: 0.5 }}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
      <span style={tooltipStyle}>{label}</span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={itemStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      style={itemStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </Link>
  );
}
