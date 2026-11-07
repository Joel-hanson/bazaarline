import type { PricePoint } from "./types";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

export const INDEX_META = {
  "^NSEI": { name: "Nifty 50", short: "Nifty" },
  "^BSESN": { name: "BSE Sensex", short: "Sensex" },
  "^NSEBANK": { name: "Nifty Bank", short: "Bank Nifty" },
  "^CNXIT": { name: "Nifty IT", short: "Nifty IT" },
  /** Yahoo serves the Kotak NV20 ETF price series under this symbol. */
  "NV20.NS": { name: "Nifty 50 Value 20", short: "Value 20" },
} as const;

export type YahooSymbol = keyof typeof INDEX_META;

/**
 * Yahoo sometimes leaves ETF unit splits unmarked (e.g. NV20.NS ~10:1 on
 * 2026-02-27). Rebase later closes onto the pre-split scale so drawdowns stay
 * continuous. Only extreme one-day jumps (>4× or <1/4) are adjusted.
 */
export function adjustObviousUnitSplits(
  points: PricePoint[],
): PricePoint[] {
  if (points.length < 2) return points;
  const out = points.map((p) => ({ ...p }));
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1].close;
    const cur = out[i].close;
    if (!(prev > 0 && cur > 0)) continue;
    const ratio = cur / prev;
    for (const factor of [10, 5, 2] as const) {
      if (ratio > 1 / (factor * 1.2) && ratio < 1 / (factor * 0.8)) {
        for (let j = i; j < out.length; j++) {
          out[j].close = Number((out[j].close * factor).toFixed(4));
        }
        break;
      }
      if (ratio > factor * 0.8 && ratio < factor * 1.2) {
        for (let j = i; j < out.length; j++) {
          out[j].close = Number((out[j].close / factor).toFixed(4));
        }
        break;
      }
    }
  }
  return out;
}

type YahooChartResponse = {
  chart: {
    result: Array<{
      meta: {
        currency?: string;
        symbol: string;
        regularMarketPrice?: number;
        fiftyTwoWeekHigh?: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: Array<number | null>;
        }>;
      };
    }> | null;
    error: unknown;
  };
};

const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toDateIST(unixSeconds: number): string {
  return istDateFormatter.format(new Date(unixSeconds * 1000));
}

export async function fetchYahooDaily(
  symbol: YahooSymbol,
  yearsBack = 20,
): Promise<{ currency: string; points: PricePoint[] }> {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - Math.floor(yearsBack * 365.25 * 24 * 3600);
  const url = `${YAHOO_CHART}/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d&events=history`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Bazaarline/1.0; +https://joel-hanson.github.io/bazaarline/)",
      Accept: "application/json",
    },
    // ISR revalidate is unsupported under `output: "export"`; cache for the build instead.
    ...(process.env.GITHUB_PAGES === "true"
      ? { cache: "force-cache" as const }
      : { next: { revalidate: 3600 } }),
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance ${symbol} HTTP ${res.status}`);
  }

  const json = (await res.json()) as YahooChartResponse;
  const result = json.chart?.result?.[0];
  if (!result?.timestamp?.length) {
    throw new Error(`Yahoo Finance ${symbol} returned no data`);
  }

  const closes = result.indicators.quote[0]?.close ?? [];
  const points: PricePoint[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const close = closes[i];
    if (close == null || !Number.isFinite(close)) continue;
    points.push({ date: toDateIST(result.timestamp[i]), close });
  }

  if (points.length < 100) {
    throw new Error(`Yahoo Finance ${symbol} too few points (${points.length})`);
  }

  return {
    currency: result.meta.currency ?? "INR",
    points: symbol === "NV20.NS" ? adjustObviousUnitSplits(points) : points,
  };
}
