"use client";

import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { DepthDot } from "@/lib/market/types";

export function DepthScatter({ dots }: { dots: DepthDot[] }) {
  const data = [...dots]
    .sort((a, b) => a.year - b.year)
    .map((d, i) => ({
      ...d,
      x: i + 1,
      y: d.depthPct,
    }));

  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="rgba(15, 40, 48, 0.08)" vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            name="episode"
            tickLine={false}
            axisLine={false}
            tick={false}
            label={{
              value: "Each Nifty fall from a record that reached 6% since 2007",
              position: "insideBottom",
              offset: -2,
              fill: "#5A6B72",
              fontSize: 12,
            }}
            domain={[0, data.length + 1]}
          />
          <YAxis
            type="number"
            dataKey="y"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#5A6B72", fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <ZAxis range={[80, 80]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#F4F8F7",
              border: "1px solid rgba(15,40,48,0.12)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value);
              return [
                `${Number.isFinite(num) ? num.toFixed(1) : value}%`,
                "Depth before next record",
              ];
            }}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as DepthDot | undefined;
              return row ? `${row.label}${row.open ? " (open)" : ""}` : "";
            }}
          />
          <Scatter data={data} isAnimationActive animationDuration={700}>
            {data.map((d) => (
              <Cell
                key={d.id}
                fill={d.open ? "#0A7A6A" : d.depthPct <= -15 ? "#8B3A4A" : "#1F4B7A"}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
