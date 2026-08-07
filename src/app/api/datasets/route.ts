import { NextResponse } from "next/server";
import { getAptosServerClient } from "@/lib/aptosServer";
import { fetchAllDatasetsFromChain, withRetry } from "@/lib/datasetList";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datasets = await withRetry(() =>
      fetchAllDatasetsFromChain(getAptosServerClient()),
    );
    return NextResponse.json({ datasets });
  } catch (err) {
    console.error("[api/datasets] failed to load:", err);
    return NextResponse.json(
      { datasets: [], error: "Failed to load datasets from Shelbynet." },
      { status: 503 },
    );
  }
}
