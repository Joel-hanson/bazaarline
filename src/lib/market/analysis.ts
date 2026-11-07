import { formatPct, labelFall } from "./labels";
import type {
  DepthDot,
  FallEpisode,
  IndexSeries,
  OverlaySeries,
  PricePoint,
} from "./types";
import { INDEX_META, type YahooSymbol } from "./yahoo";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function parseDate(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function findFalls(
  points: PricePoint[],
  thresholdPct = -6,
): FallEpisode[] {
  const threshold = thresholdPct / 100;
  const falls: FallEpisode[] = [];

  let peak = -Infinity;
  let peakIdx = -1;
  let trough = Infinity;
  let troughIdx = -1;
  let inFall = false;

  const pushClosed = () => {
    const depth = trough / peak - 1;
    if (depth > threshold) return;

    let recoveredIdx = -1;
    for (let k = troughIdx + 1; k < points.length; k++) {
      if (points[k].close >= peak) {
        recoveredIdx = k;
        break;
      }
    }

    let tradingDays = 0;
    for (let k = peakIdx; k <= troughIdx; k++) tradingDays += 1;

    const peakDate = points[peakIdx].date;
    const depthPct = Number((depth * 100).toFixed(2));
    const recoveredDate =
      recoveredIdx >= 0 ? points[recoveredIdx].date : null;
    const yearsToRecover =
      recoveredIdx >= 0
        ? Number(
            (
              (parseDate(points[recoveredIdx].date) - parseDate(peakDate)) /
              MS_PER_YEAR
            ).toFixed(2),
          )
        : null;

    falls.push({
      id: `${peakDate}-${depthPct}`,
      label: labelFall(peakDate, depthPct),
      peakDate,
      peak: peak,
      lowDate: points[troughIdx].date,
      low: trough,
      depthPct,
      tradingDaysToLow: tradingDays,
      recoveredDate,
      yearsToRecover,
      open: false,
      nowPct: null,
      now: null,
    });
  };

  for (let i = 0; i < points.length; i++) {
    const v = points[i].close;
    if (v >= peak) {
      if (inFall) pushClosed();
      peak = v;
      peakIdx = i;
      trough = v;
      troughIdx = i;
      inFall = false;
    } else {
      inFall = true;
      if (v < trough) {
        trough = v;
        troughIdx = i;
      }
    }
  }

  if (inFall) {
    const depth = trough / peak - 1;
    if (depth <= threshold) {
      const last = points[points.length - 1];
      let tradingDays = 0;
      for (let k = peakIdx; k <= troughIdx; k++) tradingDays += 1;
      const peakDate = points[peakIdx].date;
      const depthPct = Number((depth * 100).toFixed(2));
      const nowPct = Number(((last.close / peak - 1) * 100).toFixed(2));
      falls.push({
        id: `${peakDate}-${depthPct}-open`,
        label: labelFall(peakDate, depthPct),
        peakDate,
        peak,
        lowDate: points[troughIdx].date,
        low: trough,
        depthPct,
        tradingDaysToLow: tradingDays,
        recoveredDate: null,
        yearsToRecover: null,
        open: true,
        nowPct,
        now: last.close,
      });
    }
  }

  return falls;
}

export function buildIndexSeries(
  symbol: YahooSymbol,
  points: PricePoint[],
  currency: string,
): IndexSeries {
  let ath = points[0];
  for (const p of points) {
    if (p.close > ath.close) ath = p;
  }
  const last = points[points.length - 1];
  const falls = findFalls(points, -6);
  const openFall = falls.find((f) => f.open) ?? null;

  return {
    symbol,
    name: INDEX_META[symbol].name,
    currency,
    points,
    last,
    ath,
    belowAthPct: Number(((last.close / ath.close - 1) * 100).toFixed(2)),
    falls,
    openFall,
  };
}

const OVERLAY_COLORS = [
  "#0A7A6A", // current — teal
  "#C45C26", // covid-ish terracotta avoided? use rust carefully - use slate coral
  "#1F4B7A",
  "#8B3A4A",
  "#5B6B2F",
  "#6B4C9A",
  "#2F5D50",
];

export function buildOverlays(
  nifty: IndexSeries,
  maxSeries = 7,
): OverlaySeries[] {
  const candidates = [...nifty.falls]
    .filter((f) => f.depthPct <= -15 || f.open)
    .sort((a, b) => {
      if (a.open !== b.open) return a.open ? -1 : 1;
      return a.depthPct - b.depthPct;
    })
    .slice(0, maxSeries);

  // Prefer showing open + deepest historical
  const ordered = [
    ...candidates.filter((f) => f.open),
    ...candidates
      .filter((f) => !f.open)
      .sort((a, b) => a.depthPct - b.depthPct),
  ].slice(0, maxSeries);

  return ordered.map((fall, idx) => {
    const startIdx = nifty.points.findIndex((p) => p.date === fall.peakDate);
    const endIdx = fall.open
      ? nifty.points.length - 1
      : nifty.points.findIndex((p) => p.date === fall.recoveredDate) >= 0
        ? nifty.points.findIndex((p) => p.date === fall.recoveredDate)
        : nifty.points.findIndex((p) => p.date === fall.lowDate);

    const peak = fall.peak;
    const series: { day: number; pct: number }[] = [];
    let day = 0;
    const limit = Math.min(endIdx, startIdx + 450);
    for (let i = startIdx; i <= limit; i++) {
      const pct = Number((((nifty.points[i].close / peak - 1) * 100)).toFixed(2));
      series.push({ day, pct });
      day += 1;
      // stop a bit after trough for closed falls once recovered near peak
      if (!fall.open && i > startIdx + fall.tradingDaysToLow + 30 && pct > -1) {
        break;
      }
    }

    return {
      id: fall.id,
      label: fall.open ? `${fall.label} (now)` : fall.label,
      color: OVERLAY_COLORS[idx % OVERLAY_COLORS.length],
      points: series,
      depthPct: fall.depthPct,
      open: fall.open,
    };
  });
}

export function buildDepthDots(nifty: IndexSeries): DepthDot[] {
  return nifty.falls.map((f) => ({
    id: f.id,
    label: f.label,
    depthPct: f.depthPct,
    open: f.open,
    year: Number(f.peakDate.slice(0, 4)),
  }));
}

export function tradingDaysBetween(
  points: PricePoint[],
  fromDate: string,
  toDate: string,
): number {
  let count = 0;
  for (const p of points) {
    if (p.date >= fromDate && p.date <= toDate) count += 1;
  }
  return count;
}

export function buildComparisonRows(indices: IndexSeries[]): {
  index: string;
  belowRecordNow: string;
  pastFalls: string;
}[] {
  return indices.map((idx) => {
    const open = idx.openFall;
    const below = open
      ? `${formatPct(open.nowPct ?? idx.belowAthPct)} since ${open.peakDate}`
      : `${formatPct(idx.belowAthPct)} vs ATH ${idx.ath.date}`;

    const past = [...idx.falls]
      .filter((f) => !f.open && f.depthPct <= -15)
      .sort((a, b) => a.depthPct - b.depthPct)
      .slice(0, 4)
      .map((f) => `${f.label} ${formatPct(f.depthPct)}`)
      .join(", ");

    return {
      index: idx.name,
      belowRecordNow: below,
      pastFalls: past || "—",
    };
  });
}

function recoveryCell(fall: FallEpisode | undefined): string {
  if (!fall) return "—";
  if (fall.open) {
    return `Not yet: ${formatPct(fall.nowPct ?? fall.depthPct)}`;
  }
  if (fall.yearsToRecover == null) return "—";
  if (fall.yearsToRecover < 1) {
    const months = Math.max(1, Math.round(fall.yearsToRecover * 12));
    return `${months} mo`;
  }
  return `${fall.yearsToRecover.toFixed(1)} yr`;
}

function matchFall(
  series: IndexSeries,
  predicate: (f: FallEpisode) => boolean,
): FallEpisode | undefined {
  return series.falls.find(predicate);
}

export function buildRecoveryRows(indices: IndexSeries[]) {
  const byName = Object.fromEntries(indices.map((i) => [i.symbol, i])) as Record<
    string,
    IndexSeries
  >;
  const nifty = byName["^NSEI"];
  const sensex = byName["^BSESN"];
  const bank = byName["^NSEBANK"];
  const it = byName["^CNXIT"];

  const episodes: { crash: string; test: (f: FallEpisode) => boolean }[] = [
    {
      crash: "2008 global crisis",
      test: (f) => f.peakDate >= "2007-12-01" && f.peakDate <= "2008-06-01",
    },
    {
      crash: "2011 European crisis",
      test: (f) => f.peakDate.startsWith("2010") || f.peakDate.startsWith("2011"),
    },
    {
      crash: "2015–16 sell-off",
      test: (f) => f.peakDate.startsWith("2015"),
    },
    {
      crash: "Covid crash",
      test: (f) =>
        (f.peakDate.startsWith("2020") || f.peakDate.startsWith("2019")) &&
        f.depthPct <= -20,
    },
    {
      crash: "2022 correction",
      test: (f) => f.peakDate.startsWith("2021") && f.depthPct <= -15,
    },
    {
      crash: "2024–25 slide",
      test: (f) => f.peakDate.startsWith("2024"),
    },
    {
      crash: "2026 correction",
      test: (f) => f.open || f.peakDate.startsWith("2026"),
    },
  ];

  return episodes.map(({ crash, test }) => ({
    crash,
    nifty: recoveryCell(matchFall(nifty, test)),
    sensex: recoveryCell(matchFall(sensex, test)),
    bankNifty: recoveryCell(matchFall(bank, test)),
    niftyIt: recoveryCell(matchFall(it, test)),
  }));
}
