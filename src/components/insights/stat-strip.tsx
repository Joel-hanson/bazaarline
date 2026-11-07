import { formatDateLong, formatLevel, formatPct } from "@/lib/market/labels";
import type { InsightsPayload } from "@/lib/market/types";

export function StatStrip({ data }: { data: InsightsPayload }) {
  const s = data.headlineStats;
  const items = [
    {
      label: "Below record",
      value: formatPct(s.belowRecordPct),
      hint: `From record close ${formatDateLong(s.recordDate)}`,
    },
    {
      label: "Trough of this slide",
      value: formatPct(s.troughDepthPct),
      hint: formatDateLong(s.troughDate),
    },
    {
      label: "Trading days since record",
      value: String(s.tradingDaysSinceRecord),
      hint: `Since ${formatDateLong(s.recordDate)}`,
    },
    {
      label: "Slides that went past 15%",
      value: `${s.slidesThatWentPast15} of ${s.fallsPast6}`,
      hint: `Slides since 2007 that reached 6%`,
    },
  ];

  return (
    <section aria-label="Nifty 50 headline stats" className="stat-strip">
      <p className="stat-strip__eyebrow">
        The Nifty 50 at the close on {formatDateLong(data.asOf)} ·{" "}
        {formatLevel(s.lastLevel)}
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
