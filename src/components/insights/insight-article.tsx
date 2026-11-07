import { ComparisonTable, RecoveryTable } from "@/components/insights/comparison-table";
import { DepthScatter } from "@/components/insights/depth-scatter";
import { DrawdownChart } from "@/components/insights/drawdown-chart";
import { FallsTable } from "@/components/insights/falls-table";
import { StatStrip } from "@/components/insights/stat-strip";
import { formatDateLong, formatPct } from "@/lib/market/labels";
import type { InsightsPayload } from "@/lib/market/types";

export function InsightArticle({ data }: { data: InsightsPayload }) {
  const s = data.headlineStats;
  const it = data.indices.find((i) => i.symbol === "^CNXIT");
  const bank = data.indices.find((i) => i.symbol === "^NSEBANK");

  return (
    <article className="article" id="insight">
      <header className="article__header">
        <p className="article__date">{formatDateLong(data.asOf)}</p>
        <h1 className="article__title">
          India&apos;s 2026 correction compared to well-known stock market crashes
        </h1>
        <p className="article__lead">
          After a shallow-looking bounce, the Nifty 50 is only{" "}
          {formatPct(s.belowRecordPct)} below its record close. Put next to past
          Indian crashes, the 2026 slide was a mid-sized correction —{" "}
          {formatPct(s.troughDepthPct)} at the trough — not a crisis. IT stocks
          tell a harder story
          {it ? `: Nifty IT is still ${formatPct(it.belowAthPct)} below its record` : ""}
          . We&apos;ll keep tracking the episode here with daily Yahoo Finance
          closes.
        </p>
        <p className="article__meta">
          Data {data.source === "live" ? "live from Yahoo Finance" : "from cached snapshot"} ·
          updated for {formatDateLong(data.asOf)}
        </p>
      </header>

      <StatStrip data={data} />

      <section className="article__section">
        <h2>How far the Nifty 50 fell below a record close</h2>
        <p>
          Each line runs from a record high toward the low that followed. The
          blue line is the open 2026 correction; greys are past slides. Seven of
          the {s.fallsPast6} falls past 6% since 2007 also cleared 15%.
        </p>
        <p className="article__note">Daily closes to {formatDateLong(data.asOf)}</p>
        <DrawdownChart overlays={data.overlays} />
        <FallsTable falls={data.nifty.falls} />
      </section>

      <section className="article__section">
        <h2>Most drops of 6% stopped well short of a crash</h2>
        <p>
          Every Nifty 50 fall from a record that reached 6% since 2007 — one dot
          each at how deep it went before the next record.{" "}
          {data.depthDots.filter((d) => d.depthPct > -15).length} of{" "}
          {data.depthDots.length} stopped before −15%.
        </p>
        <DepthScatter dots={data.depthDots} />
      </section>

      <section className="article__section">
        <h2>Mild for the Nifty, still rough for IT</h2>
        <p>
          How far each index is below its own record now, against the lows of its
          best-known past falls. Bank Nifty
          {bank ? ` is ${formatPct(bank.belowAthPct)} below its record` : ""} —
          close to the Nifty — while Nifty IT remains in a deeper drawdown from
          its late-2024 peak.
        </p>
        <p className="article__note">Daily closes to {formatDateLong(data.asOf)}</p>
        <ComparisonTable data={data} />
      </section>

      <section className="article__section">
        <h2>How long Indian indices took to reclaim each record</h2>
        <p>
          Years from each index&apos;s record close to its first close back at or
          above it. Prices only: with dividends reinvested, most recoveries were
          shorter. These are the worst cases for someone who bought at the
          record.
        </p>
        <RecoveryTable data={data} />
      </section>

      <section className="article__section article__about" id="about-data">
        <h2>About the data</h2>
        <ul>
          <li>
            Nifty 50, Sensex, Bank Nifty and Nifty IT are price indices without
            dividends, from daily Yahoo Finance closes (symbols ^NSEI, ^BSESN,
            ^NSEBANK, ^CNXIT).
          </li>
          <li>
            A fall runs from a record close to the next record. Its depth is the
            lowest close before that next record.
          </li>
          <li>
            &ldquo;2026 correction&rdquo; is our name for the open slide since
            the Nifty&apos;s {formatDateLong(s.recordDate)} record.
          </li>
          <li>
            History shown starts around 2007, when continuous Yahoo daily series
            for these NSE/BSE indices become reliable — so earlier episodes such
            as 1992 or the early 2000s are outside this view.
          </li>
          <li>
            Figures refresh from Yahoo on each page load (revalidated hourly). If
            the live feed is unreachable, a recent snapshot is shown instead.
          </li>
        </ul>
      </section>
    </article>
  );
}
