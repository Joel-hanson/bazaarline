export type PricePoint = {
  date: string; // YYYY-MM-DD
  close: number;
};

export type FallEpisode = {
  id: string;
  label: string;
  peakDate: string;
  peak: number;
  lowDate: string;
  low: number;
  depthPct: number;
  tradingDaysToLow: number;
  recoveredDate: string | null;
  yearsToRecover: number | null;
  open: boolean;
  nowPct: number | null;
  now: number | null;
};

export type IndexSeries = {
  symbol: string;
  name: string;
  currency: string;
  points: PricePoint[];
  last: PricePoint;
  ath: PricePoint;
  belowAthPct: number;
  falls: FallEpisode[];
  openFall: FallEpisode | null;
};

export type OverlaySeries = {
  id: string;
  label: string;
  color: string;
  /** trading-day offset from peak → % below peak */
  points: { day: number; pct: number }[];
  depthPct: number;
  open: boolean;
};

export type DepthDot = {
  id: string;
  label: string;
  depthPct: number;
  open: boolean;
  year: number;
};

export type InsightsPayload = {
  generatedAt: string;
  asOf: string;
  source: "live" | "fallback";
  headlineStats: {
    belowRecordPct: number;
    recordDate: string;
    recordLevel: number;
    lastLevel: number;
    troughDepthPct: number;
    troughDate: string;
    tradingDaysSinceRecord: number;
    fallsPast15: number;
    fallsPast6: number;
    slidesThatWentPast15: number;
  };
  indices: IndexSeries[];
  nifty: IndexSeries;
  overlays: OverlaySeries[];
  depthDots: DepthDot[];
  comparisonRows: {
    index: string;
    belowRecordNow: string;
    pastFalls: string;
  }[];
  recoveryRows: {
    crash: string;
    nifty: string;
    sensex: string;
    bankNifty: string;
    niftyIt: string;
  }[];
};
