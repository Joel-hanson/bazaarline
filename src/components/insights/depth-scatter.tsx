import type { DepthDot } from "@/lib/market/types";

const WIDTH = 920;
const HEIGHT = 320;
const PAD = { top: 24, right: 24, bottom: 44, left: 48 };

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

export function DepthScatter({ dots }: { dots: DepthDot[] }) {
  const sorted = [...dots].sort((a, b) => a.year - b.year || a.depthPct - b.depthPct);
  const minPct = Math.min(-10, ...sorted.map((d) => d.depthPct)) - 4;
  const maxPct = 0;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const xBase = (i: number) =>
    PAD.left + ((i + 0.5) / Math.max(sorted.length, 1)) * innerW;
  const y = (pct: number) =>
    PAD.top + ((maxPct - pct) / (maxPct - minPct)) * innerH;

  const xs = beeswarmX(sorted, xBase, y);
  const refLines = [-10, -20, -40].filter((v) => v >= minPct && v <= maxPct);

  const yTicks = [0, -10, -20, -40, -60].filter((v) => v >= minPct - 1);

  return (
    <div className="chart-frame chart-frame--bleed">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Depth of each Nifty fall of 6% or more since 2007"
      >
        {yTicks.map((tick) => (
          <g key={tick}>
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

        {refLines.map((ref) => (
          <text
            key={`ref-${ref}`}
            x={PAD.left + innerW - 4}
            y={y(ref) - 6}
            textAnchor="end"
            className="chart-ref-label"
          >
            {ref}%
          </text>
        ))}

        {sorted.map((d, i) => {
          const cx = xs[i];
          const cy = y(d.depthPct);
          const fill = d.open ? "var(--chart-now)" : d.depthPct <= -30 ? "#334155" : "#94A3B8";
          return (
            <g key={d.id}>
              <circle
                cx={cx}
                cy={cy}
                r={d.open ? 7 : 5.5}
                fill={fill}
                stroke={d.open ? "var(--chart-now)" : "transparent"}
                strokeWidth={d.open ? 2 : 0}
                opacity={d.open ? 1 : 0.9}
              >
                <title>
                  {d.label}
                  {d.open ? " (open)" : ""}: {d.depthPct.toFixed(1)}%
                </title>
              </circle>
              {d.open ? (
                <text
                  x={cx}
                  y={cy - 14}
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

        <text
          x={PAD.left + innerW / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="chart-axis-label"
        >
          Each Nifty fall from a record that reached 6% since 2007
        </text>
      </svg>
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
      </div>
    </div>
  );
}
