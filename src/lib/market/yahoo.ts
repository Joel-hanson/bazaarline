import type { PricePoint } from "./types";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

export const INDEX_META = {
  "^NSEI": { name: "Nifty 50", short: "Nifty" },
  "^BSESN": { name: "BSE Sensex", short: "Sensex" },
  "^NSEBANK": { name: "Nifty Bank", short: "Bank Nifty" },
  "^CNXIT": { name: "Nifty IT", short: "Nifty IT" },
} as const;

export type YahooSymbol = keyof typeof INDEX_META;

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
        "Mozilla/5.0 (compatible; Bazaarline/1.0; +https://localhost)",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
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
    points,
  };
}
