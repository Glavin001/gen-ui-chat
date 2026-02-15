"use client";

import type { ComponentRenderProps } from "@json-render/react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  title?: string;
  height?: number;
  showLabels?: boolean;
}

export function PieChartComponent({
  element,
}: ComponentRenderProps<PieChartProps>) {
  const { data, title, height = 300, showLabels = true } = element.props;

  if (!data?.length) {
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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={
              showLabels
                ? ({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : false
            }
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#e4e4e7",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
