import { formatDateLong, formatLevel, formatPct } from "@/lib/market/labels";
import type { InsightsPayload } from "@/lib/market/types";

export function StatStrip({ data }: { data: InsightsPayload }) {
  const s = data.headlineStats;
  const items = [
    {
      label: "Now vs record close",
      value: formatPct(s.belowRecordPct),
      hint: `Record close ${formatDateLong(s.recordDate)}`,
    },
    {
      label: "Trough so far",
      value: formatPct(s.troughDepthPct),
      hint: formatDateLong(s.troughDate),
    },
    {
      label: "Trading days since record",
      value: String(s.tradingDaysSinceRecord),
      hint: `Since ${formatDateLong(s.recordDate)}`,
    },
    {
      label: "Falls that cleared 15%",
      value: `${s.slidesThatWentPast15} of ${s.fallsPast6}`,
      hint: "Nifty falls past 6% since 2007",
    },
  ];

  return (
    <section aria-label="Nifty 50 headline stats" className="stat-strip">
      <p className="stat-strip__eyebrow">
        Nifty 50 close on {formatDateLong(data.asOf)}: {formatLevel(s.lastLevel)}
      </p>
      <div className="stat-strip__grid">
        {items.map((item) => (
          <div key={item.label} className="stat-strip__item">
            <p className="stat-strip__label">{item.label}</p>
            <p className="stat-strip__value">{item.value}</p>
            <p className="stat-strip__hint">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
