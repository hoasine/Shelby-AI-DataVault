/**
 * GET /api/auth/nonce
 *
 * Issues a time-limited, HMAC-signed nonce for download authentication.
 * Works across Vercel serverless instances (no shared in-memory store).
 * The client passes this nonce to their wallet's signMessage(), then presents
 * the signature to the download route.
 *
 * Response: { nonce: string }
 *
 * IMPORTANT: must be dynamic — a static/prerendered response bakes one nonce
 * at build time that expires ~5 minutes after deploy and breaks all downloads.
 */

import { NextResponse } from "next/server";
import { createNonce } from "@/lib/nonceStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { nonce: createNonce() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
