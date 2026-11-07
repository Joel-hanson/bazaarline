#!/usr/bin/env node
/**
 * Refresh Yahoo Finance daily snapshots used as the offline fallback
 * (and as a warm cache seed) for Bazaarline.
 *
 * Usage: node scripts/update-market-data.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src/lib/market/data");

const SERIES = [
  { file: "NSEI.json", symbol: "^NSEI" },
  { file: "BSESN.json", symbol: "^BSESN" },
  { file: "NSEBANK.json", symbol: "^NSEBANK" },
  { file: "CNXIT.json", symbol: "^CNXIT" },
];

const YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart";
const YEARS_BACK = 20;

const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

async function fetchSymbol(symbol) {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - Math.floor(YEARS_BACK * 365.25 * 24 * 3600);
  const url = `${YAHOO}/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d&events=history`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BazaarlineDataBot/1.0)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`${symbol}: HTTP ${res.status}`);
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result?.timestamp?.length) {
    throw new Error(`${symbol}: empty chart payload`);
  }

  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const points = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const close = closes[i];
    if (close == null || !Number.isFinite(close)) continue;
    points.push({
      date: istDateFormatter.format(new Date(result.timestamp[i] * 1000)),
      close: Number(close.toFixed(2)),
    });
  }

  if (points.length < 100) {
    throw new Error(`${symbol}: too few points (${points.length})`);
  }

  return {
    symbol,
    currency: result.meta?.currency ?? "INR",
    updatedAt: new Date().toISOString(),
    points,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const summaries = [];

  for (const entry of SERIES) {
    const snapshot = await fetchSymbol(entry.symbol);
    const outPath = path.join(OUT_DIR, entry.file);
    await writeFile(outPath, `${JSON.stringify(snapshot)}\n`, "utf8");
    const last = snapshot.points.at(-1);
    summaries.push({
      symbol: entry.symbol,
      points: snapshot.points.length,
      last: last?.date,
      close: last?.close,
      file: entry.file,
    });
    console.log(
      `Wrote ${entry.file}: ${snapshot.points.length} points, last ${last?.date} @ ${last?.close}`,
    );
  }

  console.log(JSON.stringify({ ok: true, summaries }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
