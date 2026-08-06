/**
 * Signed download nonces for serverless (Vercel) deployments.
 *
 * Nonces are HMAC-signed tokens with an embedded expiry. Any instance can
 * verify them without shared memory — unlike the previous in-memory Map,
 * which broke when /api/auth/nonce and /download hit different lambdas.
 *
 * Format (hex only, wallet-safe — no '.' that some wallets truncate on):
 *   <id:32><expHex:16><mac:64>   = 112 hex chars
 *   id     — 16 random bytes
 *   expHex — expiry unix-ms as 8-byte big-endian hex
 *   mac    — HMAC-SHA256(secret, id||expHex) as hex
 *
 * Secret (first match):
 *   DOWNLOAD_AUTH_SECRET
 *   NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY  (already required server-side)
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ID_LEN = 32;
const EXP_LEN = 16;
const MAC_LEN = 64;
const TOTAL_LEN = ID_LEN + EXP_LEN + MAC_LEN;

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

function macHex(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length === 0 || ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Issues a time-limited, server-signed nonce (no shared store required). */
export function createNonce(): string {
  const id = randomBytes(16).toString("hex");
  const expMs = Date.now() + NONCE_TTL_MS;
  const expHex = expMs.toString(16).padStart(EXP_LEN, "0");
  if (expHex.length !== EXP_LEN) {
    throw new Error("Nonce expiry overflow");
  }
  const payload = `${id}${expHex}`;
  return `${payload}${macHex(payload)}`;
}

/**
 * Validates a signed nonce (expiry + HMAC).
 * Accepts the current hex format and the previous `id.exp.sig` format
 * so in-flight clients during deploy still work until TTL ends.
 */
export function consumeNonce(nonce: string): boolean {
  if (!nonce || typeof nonce !== "string") return false;

  // Current format: fixed-length hex
  if (/^[0-9a-f]+$/i.test(nonce) && nonce.length === TOTAL_LEN) {
    const id = nonce.slice(0, ID_LEN);
    const expHex = nonce.slice(ID_LEN, ID_LEN + EXP_LEN);
    const mac = nonce.slice(ID_LEN + EXP_LEN);
    const expMs = Number.parseInt(expHex, 16);
    if (!Number.isFinite(expMs) || Date.now() > expMs) return false;
    const payload = `${id}${expHex}`;
    try {
      return safeEqualHex(mac, macHex(payload));
    } catch {
      return false;
    }
  }

  // Legacy dotted format from the first HMAC deploy
  const parts = nonce.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, sig] = parts;
  if (!id || !expStr || !sig) return false;
  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || Date.now() > expMs) return false;
  const payload = `${id}.${expStr}`;
  try {
    const expected = createHmac("sha256", authSecret())
      .update(payload)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const ba = Buffer.from(sig);
    const bb = Buffer.from(expected);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
