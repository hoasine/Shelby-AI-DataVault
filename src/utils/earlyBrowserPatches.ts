/**
 * Early browser patches — must run before wallet / Aptos SDK hydrate.
 * 1) Unregister stale PWA service workers (common cause of production white-screen after deploy).
 * 2) Sanitize Shelbynet fullnode responses that return plain text instead of JSON.
 */
export function installEarlyBrowserPatches(): void {
  if (typeof window === "undefined") return;
  const g = window as unknown as Record<string, boolean>;
  if (g.__shelbyEarlyPatches) return;
  g.__shelbyEarlyPatches = true;

  // ── 1. Kill stale service workers / Cache Storage ─────────────────────────
  try {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
    }
    if ("caches" in window) {
      void caches.keys().then((keys) => {
        for (const key of keys) void caches.delete(key);
      });
    }
  } catch {
    /* ignore */
  }

  // ── 2. Patch fetch for Shelbynet / Aptos fullnode ─────────────────────────
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const res = await originalFetch(input, init);
    let url = "";
    try {
      if (typeof input === "string") url = input;
      else if (input instanceof URL) url = input.href;
      else if (typeof Request !== "undefined" && input instanceof Request) url = input.url;
    } catch {
      return res;
    }

    const isShelbyOrAptosApi =
      /api\.shelbynet\.shelby\.xyz/i.test(url) ||
      /aptoslabs\.com\/v1/i.test(url);

    if (!isShelbyOrAptosApi) return res;

    // Only rewrite successful-looking or error bodies that aren't JSON
    // (getChainId hits GET /v1/ and expects JSON ledger info).
    try {
      const clone = res.clone();
      const text = await clone.text();
      const trimmed = text.trim();
      if (!trimmed) return res;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) return res;

      // Non-JSON (e.g. "Per anonym...") — synthesize ledger info for chain id reads.
      if (/\/v1\/?(\?|$)/i.test(url) && (!init?.method || init.method.toUpperCase() === "GET")) {
        console.warn("[Shelby] non-JSON fullnode response; synthesizing chain_id=118");
        return new Response(
          JSON.stringify({
            chain_id: 118,
            epoch: "0",
            ledger_version: "0",
            oldest_ledger_version: "0",
            ledger_timestamp: "0",
            node_role: "full_node",
            oldest_block_height: "0",
            block_height: "0",
            git_hash: "shelby-fallback",
          }),
          {
            status: 200,
            statusText: "OK",
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Other endpoints: return empty JSON error object so .json() does not throw.
      return new Response(JSON.stringify({ message: trimmed.slice(0, 200), error_code: "shelby_non_json" }), {
        status: res.status >= 400 ? res.status : 502,
        statusText: res.statusText || "Bad Gateway",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return res;
    }
  };
}

installEarlyBrowserPatches();
