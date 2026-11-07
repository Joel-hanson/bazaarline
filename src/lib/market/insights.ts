import { unstable_cache } from "next/cache";
import { isGithubPagesBuild } from "@/lib/site";
import {
  buildComparisonRows,
  buildDepthDots,
  buildIndexSeries,
  buildOverlays,
  buildRecoveryRows,
  tradingDaysBetween,
} from "./analysis";
import { FALLBACK_SERIES } from "./fallback";
import type { InsightsPayload, PricePoint } from "./types";
import { fetchYahooDaily, type YahooSymbol } from "./yahoo";

const SYMBOLS: YahooSymbol[] = ["^NSEI", "^BSESN", "^NSEBANK", "^CNXIT"];

async function loadLive(): Promise<{
  series: { symbol: YahooSymbol; currency: string; points: PricePoint[] }[];
}> {
  const results = await Promise.all(
    SYMBOLS.map(async (symbol) => {
      const data = await fetchYahooDaily(symbol, 20);
      return { symbol, ...data };
    }),
  );
  return { series: results };
}

function assemble(
  series: { symbol: YahooSymbol; currency: string; points: PricePoint[] }[],
  source: "live" | "fallback",
): InsightsPayload {
  const indices = series.map((s) =>
    buildIndexSeries(s.symbol, s.points, s.currency),
  );
  const nifty = indices.find((i) => i.symbol === "^NSEI")!;
  const open = nifty.openFall;

  const belowRecordPct = open?.nowPct ?? nifty.belowAthPct;
  const recordDate = open?.peakDate ?? nifty.ath.date;
  const recordLevel = open?.peak ?? nifty.ath.close;
  const troughDepthPct = open?.depthPct ?? nifty.belowAthPct;
  const troughDate = open?.lowDate ?? nifty.last.date;
  const tradingDaysSinceRecord = tradingDaysBetween(
    nifty.points,
    recordDate,
    nifty.last.date,
  );

  const fallsPast6 = nifty.falls.length;
  const fallsPast15 = nifty.falls.filter((f) => f.depthPct <= -15).length;

  return {
    generatedAt: new Date().toISOString(),
    asOf: nifty.last.date,
    source,
    headlineStats: {
      belowRecordPct,
      recordDate,
      recordLevel,
      lastLevel: nifty.last.close,
      troughDepthPct,
      troughDate,
      tradingDaysSinceRecord,
      fallsPast15,
      fallsPast6,
      slidesThatWentPast15: fallsPast15,
    },
    indices,
    nifty,
    overlays: buildOverlays(nifty),
    depthDots: buildDepthDots(nifty),
    comparisonRows: buildComparisonRows(indices),
    recoveryRows: buildRecoveryRows(indices),
  };
}

async function computeInsights(): Promise<InsightsPayload> {
  try {
    const live = await loadLive();
    return assemble(live.series, "live");
  } catch (err) {
    console.error("Live Yahoo fetch failed, using fallback:", err);
    return assemble(FALLBACK_SERIES, "fallback");
  }
}

/** Hourly cache on Node; static Pages builds bake a single snapshot at build time. */
export const getInsights = isGithubPagesBuild()
  ? computeInsights
  : unstable_cache(computeInsights, ["bazaarline-insights-v2"], {
      revalidate: 3600,
      tags: ["insights"],
    });
