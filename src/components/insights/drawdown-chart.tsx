"use client";

import {
  clientToSvgPoint,
  interpolatePct,
  niceTicks,
} from "@/components/insights/chart-utils";
import { formatDateLong, formatPct } from "@/lib/market/labels";
import type { OverlaySeries } from "@/lib/market/types";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

const WIDTH = 920;
const HEIGHT = 460;
const PAD = { top: 28, right: 28, bottom: 56, left: 56 };

function downsample(
  points: { day: number; pct: number }[],
  maxPoints = 180,
): { day: number; pct: number }[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const out: { day: number; pct: number }[] = [];
  let trough = points[0];
  for (let i = 0; i < points.length; i++) {
    if (points[i].pct < trough.pct) trough = points[i];
    if (i % step === 0 || i === points.length - 1) out.push(points[i]);
  }
  if (!out.some((p) => p.day === trough.day && p.pct === trough.pct)) {
    out.push(trough);
    out.sort((a, b) => a.day - b.day);
  }
  return out;
}

type HoverState = {
  day: number;
  svgX: number;
  svgY: number;
  rows: {
    id: string;
    label: string;
    color: string;
    pct: number;
    open: boolean;
  }[];
  focusId: string;
};

export function DrawdownChart({ overlays }: { overlays: OverlaySeries[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const series = overlays.map((o) => ({
    ...o,
    points: downsample(o.points),
  }));

  const maxDay = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.day)));
  const minPct = Math.min(-5, ...series.flatMap((s) => s.points.map((p) => p.pct)));
  const maxPct = 2;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const x = (day: number) => PAD.left + (day / maxDay) * innerW;
  const y = (pct: number) =>
    PAD.top + ((maxPct - pct) / (maxPct - minPct)) * innerH;

  const yTicks = niceTicks(minPct, maxPct, 6);
  const xTicks = [
    0,
    Math.round(maxDay / 4),
    Math.round(maxDay / 2),
    Math.round((3 * maxDay) / 4),
    maxDay,
  ];

  const ordered = [
    ...series.filter((s) => !s.open),
    ...series.filter((s) => s.open),
  ];

  const focusId = pinnedId ?? hover?.focusId ?? null;

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const local = clientToSvgPoint(svg, event.clientX, event.clientY);
    if (!local) return;

    if (
      local.x < PAD.left ||
      local.x > PAD.left + innerW ||
      local.y < PAD.top ||
      local.y > PAD.top + innerH
    ) {
      setHover(null);
      return;
    }

    const day = Math.max(
      0,
      Math.min(maxDay, Math.round(((local.x - PAD.left) / innerW) * maxDay)),
    );

    const rows = ordered
      .map((s) => {
        const pct = interpolatePct(s.points, day);
        if (pct == null) return null;
        return {
          id: s.id,
          label: s.label,
          color: s.color,
          pct,
          open: s.open,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null)
      .sort((a, b) => a.pct - b.pct);

    if (rows.length === 0) {
      setHover(null);
      return;
    }

    const closest = rows.reduce((best, row) => {
      const dist = Math.abs(y(row.pct) - local.y);
      const bestDist = Math.abs(y(best.pct) - local.y);
      return dist < bestDist ? row : best;
    });

    setHover({
      day,
      svgX: x(day),
      svgY: local.y,
      rows,
      focusId: pinnedId ?? closest.id,
    });
  }

  function areaPath(s: (typeof series)[number]): string | null {
    if (!s.open || s.points.length < 2) return null;
    const line = s.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.pct).toFixed(1)}`,
      )
      .join(" ");
    const last = s.points[s.points.length - 1];
    const first = s.points[0];
    return `${line} L${x(last.day).toFixed(1)},${y(0).toFixed(1)} L${x(first.day).toFixed(1)},${y(0).toFixed(1)} Z`;
  }

  const tooltipLeftPct = hover
    ? Math.min(72, Math.max(4, ((hover.svgX + 16) / WIDTH) * 100))
    : 0;
  const tooltipTopPct = hover
    ? Math.min(58, Math.max(8, ((hover.svgY - 20) / HEIGHT) * 100))
    : 0;

  return (
    <div className="chart-frame chart-frame--bleed chart-frame--interactive">
      <div className="chart-legend" role="list">
        {ordered.map((s) => {
          const active = focusId === s.id;
          const dimmed = focusId != null && !active;
          return (
            <button
              key={s.id}
              type="button"
              role="listitem"
              className={`chart-legend__item${active ? " is-active" : ""}${dimmed ? " is-dimmed" : ""}${s.open ? " is-current" : ""}`}
              style={{ "--swatch": s.color } as CSSProperties}
              aria-pressed={pinnedId === s.id}
              onClick={() =>
                setPinnedId((prev) => (prev === s.id ? null : s.id))
              }
              onMouseEnter={() => {
                if (!pinnedId) {
                  setHover((prev) =>
                    prev
                      ? { ...prev, focusId: s.id }
                      : {
                          day: s.troughDay,
                          svgX: x(s.troughDay),
                          svgY: y(s.depthPct),
                          rows: [
                            {
                              id: s.id,
                              label: s.label,
                              color: s.color,
                              pct: s.depthPct,
                              open: s.open,
                            },
                          ],
                          focusId: s.id,
                        },
                  );
                }
              }}
            >
              <span className="chart-legend__swatch" aria-hidden />
              <span className="chart-legend__label">{s.label}</span>
              <span className="chart-legend__meta">{formatPct(s.depthPct)}</span>
            </button>
          );
        })}
      </div>

      <div className="chart-stage">
        <svg
          ref={svgRef}
          className="chart-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Nifty 50 drawdowns from record closes, compared across crashes. Hover to inspect each day from the peak."
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="drawdown-now-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-now)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--chart-now)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={PAD.left}
                x2={PAD.left + innerW}
                y1={y(tick)}
                y2={y(tick)}
                className={tick === 0 ? "chart-axis" : "chart-grid"}
              />
              <text
                x={PAD.left - 12}
                y={y(tick) + 4}
                textAnchor="end"
                className="chart-tick"
              >
                {tick}%
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={x(tick)}
                x2={x(tick)}
                y1={PAD.top + innerH}
                y2={PAD.top + innerH + 6}
                className="chart-axis"
              />
              <text
                x={x(tick)}
                y={HEIGHT - 24}
                textAnchor="middle"
                className="chart-tick"
              >
                {tick}
              </text>
            </g>
          ))}

          <text
            x={PAD.left + innerW / 2}
            y={HEIGHT - 6}
            textAnchor="middle"
            className="chart-axis-label"
          >
            Trading days from record close
          </text>

          {ordered.map((s) => {
            const fill = areaPath(s);
            return fill ? (
              <path
                key={`fill-${s.id}`}
                d={fill}
                fill="url(#drawdown-now-fill)"
                className="chart-area-fill"
                pointerEvents="none"
              />
            ) : null;
          })}

          {ordered.map((s) => {
            if (s.points.length < 2) return null;
            const d = s.points
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.pct).toFixed(1)}`,
              )
              .join(" ");
            const trough = s.points.reduce(
              (m, p) => (p.pct < m.pct ? p : m),
              s.points[0],
            );
            const last = s.points[s.points.length - 1];
            const active = focusId == null || focusId === s.id;
            const emphasized = focusId === s.id || (focusId == null && s.open);

            return (
              <g
                key={s.id}
                className={`chart-series${emphasized ? " is-emphasized" : ""}`}
                style={{
                  color: s.color,
                  opacity: emphasized ? 1 : active ? 1 : 0.18,
                }}
              >
                <path
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={emphasized ? (s.open ? 3 : 2.4) : s.open ? 2.6 : 1.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={s.open || emphasized ? 1 : 0.78}
                  className="chart-series__line"
                />
                <circle
                  cx={x(trough.day)}
                  cy={y(trough.pct)}
                  r={emphasized ? 4.2 : 3}
                  fill="currentColor"
                />
                <circle
                  cx={x(last.day)}
                  cy={y(last.pct)}
                  r={emphasized ? 3.6 : 2.4}
                  fill="#fff"
                  stroke="currentColor"
                  strokeWidth={emphasized ? 2.2 : 1.6}
                />
              </g>
            );
          })}

          {hover ? (
            <g className="chart-crosshair" pointerEvents="none">
              <line
                x1={hover.svgX}
                x2={hover.svgX}
                y1={PAD.top}
                y2={PAD.top + innerH}
                className="chart-crosshair__line"
              />
              {hover.rows.map((row) => (
                <circle
                  key={`dot-${row.id}`}
                  cx={hover.svgX}
                  cy={y(row.pct)}
                  r={row.id === hover.focusId ? 5 : 3.5}
                  fill={row.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={
                    focusId == null || focusId === row.id ? 1 : 0.25
                  }
                />
              ))}
            </g>
          ) : null}
        </svg>

        {hover ? (
          <div
            className="chart-tooltip"
            style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}
            role="status"
            aria-live="polite"
          >
            <p className="chart-tooltip__title">
              Day {hover.day} from peak
            </p>
            <ul className="chart-tooltip__list">
              {hover.rows.map((row) => (
                <li
                  key={row.id}
                  className={`chart-tooltip__row${row.id === hover.focusId ? " is-focus" : ""}`}
                >
                  <span
                    className="chart-tooltip__swatch"
                    style={{ background: row.color }}
                    aria-hidden
                  />
                  <span className="chart-tooltip__name">
                    {row.label}
                    {row.open ? " · open" : ""}
                  </span>
                  <span className="chart-tooltip__value">
                    {formatPct(row.pct)}
                  </span>
                </li>
              ))}
            </ul>
            {(() => {
              const focus = ordered.find((s) => s.id === hover.focusId);
              if (!focus) return null;
              return (
                <p className="chart-tooltip__note">
                  {focus.label} peaked {formatDateLong(focus.peakDate)} · trough{" "}
                  {formatPct(focus.depthPct)}
                </p>
              );
            })()}
          </div>
        ) : (
          <p className="chart-hint">
            Hover to compare each crash on the same day from its record close
          </p>
        )}
      </div>
    </div>
  );
}
