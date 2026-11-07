import type { OverlaySeries } from "@/lib/market/types";

const WIDTH = 920;
const HEIGHT = 420;
const PAD = { top: 28, right: 168, bottom: 48, left: 48 };

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

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const step = Math.ceil(span / (count - 1) / 5) * 5;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 0.01; v += step) ticks.push(v);
  return ticks;
}

export function DrawdownChart({ overlays }: { overlays: OverlaySeries[] }) {
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
  const xTicks = [0, Math.round(maxDay / 4), Math.round(maxDay / 2), Math.round((3 * maxDay) / 4), maxDay];

  // Draw historical first, current last (on top)
  const ordered = [
    ...series.filter((s) => !s.open),
    ...series.filter((s) => s.open),
  ];

  return (
    <div className="chart-frame chart-frame--bleed">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Nifty 50 drawdowns from record closes, compared across crashes"
      >
        {/* grid */}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? "chart-axis" : "chart-grid"}
            />
            <text x={PAD.left - 10} y={y(tick) + 4} textAnchor="end" className="chart-tick">
              {tick}%
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text
            key={`x-${tick}`}
            x={x(tick)}
            y={HEIGHT - 18}
            textAnchor="middle"
            className="chart-tick"
          >
            {tick}
          </text>
        ))}
        <text
          x={PAD.left + innerW / 2}
          y={HEIGHT - 2}
          textAnchor="middle"
          className="chart-axis-label"
        >
          Trading days from record close
        </text>

        {ordered.map((s) => {
          if (s.points.length < 2) return null;
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.pct).toFixed(1)}`)
            .join(" ");
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.id}>
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={s.open ? 2.75 : 1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={s.open ? 1 : 0.78}
                className={s.open ? "chart-line chart-line--current" : "chart-line"}
              />
              <circle
                cx={x(last.day)}
                cy={y(last.pct)}
                r={s.open ? 3.5 : 2.4}
                fill={s.color}
              />
              <text
                x={x(last.day) + 8}
                y={y(last.pct) + 4}
                className={s.open ? "chart-end-label chart-end-label--current" : "chart-end-label"}
                fill={s.color}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
