import { getInsights } from "@/lib/market/insights";
import { toPublicPayload } from "@/lib/market/public-payload";
import { connection } from "next/server";

export async function GET() {
  await connection();
  try {
    const data = toPublicPayload(await getInsights());
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
