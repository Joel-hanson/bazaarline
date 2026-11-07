"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OverlaySeries } from "@/lib/market/types";

function mergeOverlayData(overlays: OverlaySeries[]) {
  const maxDay = Math.max(0, ...overlays.flatMap((o) => o.points.map((p) => p.day)));
  const rows: Record<string, number | undefined>[] = [];
  for (let day = 0; day <= Math.min(maxDay, 400); day++) {
    const row: Record<string, number | undefined> = { day };
    for (const o of overlays) {
      const pt = o.points.find((p) => p.day === day);
      if (pt) row[o.id] = pt.pct;
    }
    rows.push(row);
  }
  return rows;
}

export function DrawdownChart({ overlays }: { overlays: OverlaySeries[] }) {
  const data = mergeOverlayData(overlays);

  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="rgba(15, 40, 48, 0.08)" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A6B72", fontSize: 12 }}
            label={{
              value: "Trading days from record close",
              position: "insideBottom",
              offset: -2,
              fill: "#5A6B72",
              fontSize: 12,
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A6B72", fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
            domain={["auto", 2]}
          />
          <Tooltip
            contentStyle={{
              background: "#F4F8F7",
              border: "1px solid rgba(15,40,48,0.12)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, name) => {
              const series = overlays.find((o) => o.id === name);
              const num = typeof value === "number" ? value : Number(value);
              return [
                `${Number.isFinite(num) ? num.toFixed(1) : value}%`,
                series?.label ?? String(name),
              ];
            }}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => overlays.find((o) => o.id === value)?.label ?? value}
          />
          {overlays.map((o) => (
            <Line
              key={o.id}
              type="monotone"
              dataKey={o.id}
              stroke={o.color}
              strokeWidth={o.open ? 2.75 : 1.6}
              strokeOpacity={o.open ? 1 : 0.85}
              dot={false}
              isAnimationActive
              animationDuration={900}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
