"use client";

import { clientToSvgPoint } from "@/components/insights/chart-utils";
import { formatDateLong, formatPct } from "@/lib/market/labels";
import type { DepthDot } from "@/lib/market/types";
import { useRef, useState } from "react";

const WIDTH = 920;
const HEIGHT = 340;
const PAD = { top: 28, right: 28, bottom: 48, left: 56 };

function beeswarmX(
  sorted: DepthDot[],
  xBase: (i: number) => number,
  y: (pct: number) => number,
  radius = 7,
): number[] {
  const placed: { x: number; y: number }[] = [];
  return sorted.map((d, i) => {
    let x = xBase(i);
    const cy = y(d.depthPct);
    let guard = 0;
    while (
      guard < 40 &&
      placed.some((p) => {
        const dx = p.x - x;
        const dy = p.y - cy;
        return dx * dx + dy * dy < (radius * 2.05) ** 2;
      })
    ) {
      x += (guard % 2 === 0 ? 1 : -1) * (Math.floor(guard / 2) + 1) * 3.2;
      guard += 1;
    }
    placed.push({ x, y: cy });
    return x;
  });
}

function dotFill(d: DepthDot): string {
  if (d.open) return "var(--chart-now)";
  if (d.depthPct <= -30) return "#E5E5E5";
  if (d.depthPct <= -15) return "#A3A3A3";
  return "#525252";
}

type HoverDot = {
  dot: DepthDot;
  cx: number;
  cy: number;
};

export function DepthScatter({ dots }: { dots: DepthDot[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<HoverDot | null>(null);

  const sorted = [...dots].sort(
    (a, b) => a.year - b.year || a.depthPct - b.depthPct,
  );
  const minPct = Math.min(-10, ...sorted.map((d) => d.depthPct)) - 4;
  const maxPct = 0;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const xBase = (i: number) =>
    PAD.left + ((i + 0.5) / Math.max(sorted.length, 1)) * innerW;
  const y = (pct: number) =>
    PAD.top + ((maxPct - pct) / (maxPct - minPct)) * innerH;

  const xs = beeswarmX(sorted, xBase, y);
  const yTicks = [0, -10, -15, -20, -40, -60].filter((v) => v >= minPct - 1);

  function nearestDot(clientX: number, clientY: number): HoverDot | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientToSvgPoint(svg, clientX, clientY);
    if (!local) return null;

    let best: HoverDot | null = null;
    let bestDist = 28 ** 2;
    sorted.forEach((d, i) => {
      const cx = xs[i];
      const cy = y(d.depthPct);
      const dist = (cx - local.x) ** 2 + (cy - local.y) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = { dot: d, cx, cy };
      }
    });
    return best;
  }

  const tooltipLeftPct = hover
    ? Math.min(70, Math.max(4, ((hover.cx + 14) / WIDTH) * 100))
    : 0;
  const tooltipTopPct = hover
    ? Math.min(62, Math.max(6, ((hover.cy - 12) / HEIGHT) * 100))
    : 0;

  return (
    <div className="chart-frame chart-frame--bleed chart-frame--interactive">
      <div className="chart-legend-inline" aria-hidden>
        <span>
          <i className="dot dot--now" /> Open slide
        </span>
        <span>
          <i className="dot dot--past" /> Past slides
        </span>
        <span>
          <i className="dot dot--deep" /> Past 30%+
        </span>
        <span className="chart-legend-inline__note">−15% crash line</span>
      </div>

      <div className="chart-stage">
        <svg
          ref={svgRef}
          className="chart-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Depth of each Nifty fall of 6% or more since 2007. Hover a dot for details."
          onPointerMove={(event) =>
            setHover(nearestDot(event.clientX, event.clientY))
          }
          onPointerLeave={() => setHover(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={y(tick)}
                y2={y(tick)}
                className={
                  tick === 0
                    ? "chart-axis"
                    : tick === -15
                      ? "chart-grid chart-grid--emphasis"
                      : "chart-grid"
                }
                strokeDasharray={tick === -15 ? "4 4" : undefined}
              />
              <text
                x={PAD.left - 12}
                y={y(tick) + 4}
                textAnchor="end"
                className={`chart-tick${tick === -15 ? " chart-tick--emphasis" : ""}`}
              >
                {tick}%
              </text>
            </g>
          ))}

          {minPct <= -15 ? (
            <text
              x={PAD.left + innerW - 4}
              y={y(-15) - 8}
              textAnchor="end"
              className="chart-ref-label"
            >
              crash territory
            </text>
          ) : null}

          {sorted.map((d, i) => {
            const cx = xs[i];
            const cy = y(d.depthPct);
            const active = hover?.dot.id === d.id;
            const dimmed = hover != null && !active;
            const fill = dotFill(d);
            return (
              <g
                key={d.id}
                className={`chart-dot${active ? " is-active" : ""}${dimmed ? " is-dimmed" : ""}`}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill="transparent"
                  className="chart-dot__hit"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? (d.open ? 9 : 7.5) : d.open ? 7 : 5.5}
                  fill={fill}
                  stroke={d.open || active ? fill : "transparent"}
                  strokeWidth={d.open || active ? 2.5 : 0}
                  strokeOpacity={0.35}
                  opacity={dimmed ? 0.28 : 1}
                  className="chart-dot__mark"
                />
                {d.open && !hover ? (
                  <text
                    x={cx}
                    y={cy - 16}
                    textAnchor="middle"
                    className="chart-end-label chart-end-label--current"
                    fill="var(--chart-now)"
                  >
                    {d.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {hover ? (
            <g pointerEvents="none">
              <line
                x1={hover.cx}
                x2={hover.cx}
                y1={PAD.top}
                y2={PAD.top + innerH}
                className="chart-crosshair__line"
              />
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={hover.cy}
                y2={hover.cy}
                className="chart-crosshair__line chart-crosshair__line--soft"
              />
            </g>
          ) : null}

          <text
            x={PAD.left + innerW / 2}
            y={HEIGHT - 10}
            textAnchor="middle"
            className="chart-axis-label"
          >
            Each Nifty fall from a record that reached 6% since 2007
          </text>
        </svg>

        {hover ? (
          <div
            className="chart-tooltip"
            style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}
            role="status"
            aria-live="polite"
          >
            <p className="chart-tooltip__title">
              {hover.dot.label}
              {hover.dot.open ? " · open" : ""}
            </p>
            <ul className="chart-tooltip__list">
              <li className="chart-tooltip__row is-focus">
                <span className="chart-tooltip__name">Trough depth</span>
                <span className="chart-tooltip__value">
                  {formatPct(hover.dot.depthPct)}
                </span>
              </li>
              <li className="chart-tooltip__row">
                <span className="chart-tooltip__name">Peak date</span>
                <span className="chart-tooltip__value">
                  {formatDateLong(hover.dot.peakDate)}
                </span>
              </li>
              <li className="chart-tooltip__row">
                <span className="chart-tooltip__name">Days to low</span>
                <span className="chart-tooltip__value">
                  {hover.dot.tradingDaysToLow}
                </span>
              </li>
            </ul>
          </div>
        ) : (
          <p className="chart-hint">
            Hover a dot for trough depth, peak date, and days to the low
          </p>
        )}
      </div>
    </div>
  );
}
