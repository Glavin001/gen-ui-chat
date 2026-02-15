"use client";

import type { ComponentRenderProps } from "@json-render/react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
];

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  title?: string;
  height?: number;
}

export function BarChartComponent({
  element,
}: ComponentRenderProps<BarChartProps>) {
  const { data, xKey, yKeys, colors, title, height = 300 } = element.props;
  const palette = colors ?? DEFAULT_COLORS;

  if (!data?.length || !yKeys?.length) {
    return (
      <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500 animate-pulse" style={{ height }}>
        Loading chart...
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <p className="text-sm font-medium text-zinc-300 mb-2">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            stroke="#3f3f46"
          />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#e4e4e7",
              fontSize: 12,
            }}
          />
          {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />}
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={palette[i % palette.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
