/**
 * GET /api/auth/nonce
 *
 * Issues a time-limited, HMAC-signed nonce for download authentication.
 * Works across Vercel serverless instances (no shared in-memory store).
 * The client passes this nonce to their wallet's signMessage(), then presents
 * the signature to the download route.
 *
 * Response: { nonce: string }
 */

import { NextResponse } from "next/server";
import { createNonce } from "@/lib/nonceStore";

export async function GET() {
  return NextResponse.json({ nonce: createNonce() });
}
