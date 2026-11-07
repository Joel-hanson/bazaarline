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
  const value20 = data.indices.find((i) => i.symbol === "NV20.NS");
  const mildCount = data.depthDots.filter((d) => d.depthPct > -15).length;

  return (
    <article className="article" id="insight">
      <header className="article__header">
        <p className="article__date">{formatDateLong(data.asOf)}</p>
        <h1 className="article__title">
          How India&apos;s 2026 Nifty slide compares with past crashes
        </h1>
        <p className="article__lead">
          On {formatDateLong(data.asOf)} the Nifty 50 closed{" "}
          {formatPct(s.belowRecordPct)} below its record close from{" "}
          {formatDateLong(s.recordDate)}. The bounce makes the episode look
          small. The trough tells more: {formatPct(s.troughDepthPct)} below that
          same record, on {formatDateLong(s.troughDate)}.
        </p>
        <p className="article__lead">
          Measured on daily closes, that trough sits with other mid-sized Indian
          corrections, not with 2008 or Covid. Bank Nifty
          {bank ? ` is ${formatPct(bank.belowAthPct)} below its own record` : ""}
          , close to the Nifty. Nifty IT is still carrying a deeper scar
          {it
            ? `: ${formatPct(it.belowAthPct)} below its late-2024 peak`
            : ""}
          .
        </p>
        <p className="article__meta">
          {data.source === "live"
            ? "Yahoo Finance closes, refreshed about hourly"
            : "Cached Yahoo snapshot"}{" "}
          · as of {formatDateLong(data.asOf)} · price indices only, no dividends
        </p>
      </header>

      <StatStrip data={data} />

      <section className="article__section">
        <h2>What a “fall” means here</h2>
        <p>
          Start at a new record close. Follow every later close. The fall ends
          when the index closes back at or above that record. Depth is the worst
          close in between, as a percent under the record.
        </p>
        <ol className="fall-steps">
          <li>
            <span className="fall-steps__label">Record close</span>
            <span className="fall-steps__detail">A new high close sets the peak</span>
          </li>
          <li>
            <span className="fall-steps__label">Trough</span>
            <span className="fall-steps__detail">
              Deepest later close, as % below that record
            </span>
          </li>
          <li>
            <span className="fall-steps__label">Next record</span>
            <span className="fall-steps__detail">
              First close back at or above the peak ends the fall
            </span>
          </li>
        </ol>
        <p>
          Intraday spikes do not count. Nifty printed a higher high during the 5
          Jan 2026 session, but that day still closed below the{" "}
          {formatDateLong(s.recordDate)} record, so the record stays put.
        </p>
      </section>

      <section className="article__section">
        <h2>Nifty path from each record close</h2>
        <p>
          Each line is one fall: trading days from the record on the x-axis,
          percent below that record on the y-axis. Blue is the open 2026
          episode. Grey lines are earlier slides that also reached at least 15%.
          Of the {s.fallsPast6} Nifty falls past 6% since 2007,{" "}
          {s.fallsPast15} also cleared 15%.
        </p>
        <p className="article__note">
          Daily closes through {formatDateLong(data.asOf)}. Hover the chart to
          read each series on the same day-from-peak.
        </p>
        <DrawdownChart overlays={data.overlays} />
        <FallsTable falls={data.nifty.falls} />
      </section>

      <section className="article__section">
        <h2>Most 6% drops never became a crash</h2>
        <p>
          One dot for every Nifty fall from a record that reached 6% since 2007.
          Height is trough depth. {mildCount} of {data.depthDots.length} stopped
          before −15%. The open 2026 trough sits near that line, not down with
          Covid or 2008.
        </p>
        <DepthScatter dots={data.depthDots} />
      </section>

      <section className="article__section">
        <h2>Mild on the Nifty, still rough for IT</h2>
        <p>
          Each index is measured against its own record close, not against the
          Nifty&apos;s. That matters: Sensex and Nifty IT may still be inside
          older open slides that began in 2024, even while we name the Nifty
          episode “2026”. Bank Nifty
          {bank ? ` (${formatPct(bank.belowAthPct)})` : ""} is near the Nifty;
          Nifty 50 Value 20
          {value20 ? ` is ${formatPct(value20.belowAthPct)} below its record` : ""}
          ; IT is the outlier.
        </p>
        <p className="article__note">Daily closes through {formatDateLong(data.asOf)}</p>
        <ComparisonTable data={data} />
      </section>

      <section className="article__section">
        <h2>How long it took to get back to the record</h2>
        <p>
          Time from each index&apos;s record close to the first later close at or
          above it. These are price indices, so dividends are ignored. For
          someone who bought at the record and held the index itself, this is
          the slow case.
        </p>
        <RecoveryTable data={data} />
      </section>

      <section className="article__section article__about" id="about-data">
        <h2>About the data</h2>
        <ul>
          <li>
            Sources are Yahoo Finance daily closes for Nifty 50 (^NSEI), Sensex
            (^BSESN), Bank Nifty (^NSEBANK), Nifty IT (^CNXIT), and Nifty 50
            Value 20 (NV20.NS).
          </li>
          <li>
            A fall runs from a record close to the next record close. Depth is
            the lowest close in between. Intraday highs and lows are ignored.
          </li>
          <li>
            “2026 correction” is our name for the open Nifty slide since the{" "}
            {formatDateLong(s.recordDate)} record close. Other indices can still
            be unfinished slides that started earlier.
          </li>
          <li>
            Value 20 history on Yahoo starts in late 2015, so earlier crash rows
            show as blank for that column. NV20.NS is the Kotak NV20 ETF price
            series that tracks the index; an unmarked Feb 2026 unit split is
            rebased before drawdowns are computed.
          </li>
          <li>
            The broad-index series begin around 2007, when these Yahoo daily
            histories become continuous enough to trust. Earlier crashes (1992,
            early 2000s) are outside the chart.
          </li>
          <li>
            On the live server, figures refresh from Yahoo about every hour. If
            Yahoo is down, the page falls back to a recent committed snapshot.
            The GitHub Pages build freezes whatever Yahoo returned at deploy
            time.
          </li>
        </ul>
      </section>
    </article>
  );
}
