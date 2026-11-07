import type { IndexSeries, InsightsPayload } from "./types";

function withoutPoints(index: IndexSeries): IndexSeries {
  return {
    ...index,
    points: [],
  };
}

/** Drop bulky OHLC history before rendering — charts use precomputed series. */
export function toPublicPayload(data: InsightsPayload): InsightsPayload {
  return {
    ...data,
    nifty: withoutPoints(data.nifty),
    indices: data.indices.map(withoutPoints),
  };
}
