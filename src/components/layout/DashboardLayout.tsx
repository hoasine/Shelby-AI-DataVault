"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarWidth = isMobile ? "0px" : sidebarCollapsed ? "72px" : "240px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* Sidebar */}
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      {/* Top Header */}
      <TopHeader sidebarWidth={sidebarWidth} />

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          paddingTop: "64px",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >
        <div
          style={{
            padding: "24px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
