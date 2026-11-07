import type { PricePoint } from "./types";
import type { YahooSymbol } from "./yahoo";
import nsei from "./data/NSEI.json";
import bsesn from "./data/BSESN.json";
import nsebank from "./data/NSEBANK.json";
import cnxit from "./data/CNXIT.json";

type Snapshot = {
  symbol: YahooSymbol;
  currency: string;
  points: PricePoint[];
};

export const FALLBACK_SERIES: Snapshot[] = [
  nsei as Snapshot,
  bsesn as Snapshot,
  nsebank as Snapshot,
  cnxit as Snapshot,
];
