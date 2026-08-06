/**
 * Signed download nonces for serverless (Vercel) deployments.
 *
 * Nonces are HMAC-signed tokens with an embedded expiry. Any instance can
 * verify them without shared memory — unlike the previous in-memory Map,
 * which broke when /api/auth/nonce and /download hit different lambdas.
 *
 * Format:  `<id>.<expMs>.<sig>`
 *   id    — random hex
 *   expMs — unix expiry in milliseconds
 *   sig   — base64url HMAC-SHA256 over `${id}.${expMs}`
 *
 * Replay within TTL is accepted without a shared store. That is fine here:
 * the wallet signature + on-chain access check still gate the download, and
 * an intercepted request already proves key control for that window.
 *
 * Secret (first match):
 *   DOWNLOAD_AUTH_SECRET
 *   NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY  (already required server-side)
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function authSecret(): string {
  const secret =
    process.env.DOWNLOAD_AUTH_SECRET ||
    process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
  if (!secret) {
    throw new Error(
      "DOWNLOAD_AUTH_SECRET or NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY must be set"
    );
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", authSecret()).update(payload).digest());
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Issues a time-limited, server-signed nonce (no shared store required). */
export function createNonce(): string {
  const id = randomBytes(16).toString("hex");
  const expMs = Date.now() + NONCE_TTL_MS;
  const payload = `${id}.${expMs}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Validates a signed nonce (expiry + HMAC).
 * Returns true if valid; false if missing, malformed, expired, or forged.
 */
export function consumeNonce(nonce: string): boolean {
  if (!nonce || typeof nonce !== "string") return false;
  const parts = nonce.split(".");
  if (parts.length !== 3) return false;

  const [id, expStr, sig] = parts;
  if (!id || !expStr || !sig) return false;

  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || Date.now() > expMs) return false;

  const payload = `${id}.${expStr}`;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  return safeEqual(sig, expected);
}
