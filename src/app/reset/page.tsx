"use client";

import { useEffect, useState } from "react";

/**
 * One-click cache / Service Worker wipe for stuck production clients.
 * Visit: https://shelby-ai-data-vault.vercel.app/reset
 */
export default function ResetPage() {
  const [log, setLog] = useState<string[]>(["Starting reset…"]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const lines: string[] = [];
      const push = (msg: string) => {
        lines.push(msg);
        if (!cancelled) setLog([...lines]);
      };

      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          push(`Found ${regs.length} service worker(s).`);
          for (const reg of regs) {
            const ok = await reg.unregister();
            push(ok ? `Unregistered: ${reg.scope}` : `Failed to unregister: ${reg.scope}`);
          }
          if (regs.length === 0) push("No service workers registered.");
        } else {
          push("Service workers not supported in this browser.");
        }
      } catch (e) {
        push(`SW error: ${e instanceof Error ? e.message : String(e)}`);
      }

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          push(`Found ${keys.length} cache(s).`);
          for (const key of keys) {
            await caches.delete(key);
            push(`Deleted cache: ${key}`);
          }
          if (keys.length === 0) push("No Cache Storage entries.");
        }
      } catch (e) {
        push(`Cache error: ${e instanceof Error ? e.message : String(e)}`);
      }

      try {
        localStorage.removeItem("AptosWalletName");
        push("Cleared AptosWalletName from localStorage.");
      } catch {
        /* ignore */
      }

      push("Done. Redirecting to home…");
      if (!cancelled) setDone(true);

      setTimeout(() => {
        window.location.replace("/");
      }, 1200);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e2e8f0",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: "2rem",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Site reset</h1>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Clearing Service Workers and caches, then reloading the marketplace.
      </p>
      <pre
        style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: 8,
          padding: "1rem",
          fontSize: "0.75rem",
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {log.join("\n")}
      </pre>
      {done && (
        <p style={{ marginTop: "1rem", color: "#34d399" }}>
          Redirecting… If nothing happens, open{" "}
          <a href="/" style={{ color: "#60a5fa" }}>
            home
          </a>
          .
        </p>
      )}
    </div>
  );
}
