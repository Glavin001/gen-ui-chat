"use client";

import React from "react";
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
import { ChartWrapper } from "./ChartWrapper";

const DEFAULT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  title?: string;
  height?: number;
}

/**
 * Coerce y-values to numbers (AI may send "123" as strings).
 * Non-coercible values become 0 so charts still render.
 */
function coerceChartData(
  data: Record<string, unknown>[],
  yKeys: string[]
): Record<string, unknown>[] {
  return data.map((row) => {
    const out = { ...row };
    for (const key of yKeys) {
      const v = out[key];
      if (v !== undefined && typeof v !== "number") {
        const num = Number(v);
        out[key] = isNaN(num) ? 0 : num;
      }
    }
    return out;
  });
}

const MemoizedBarChart = React.memo(function MemoizedBarChart({
  data,
  xKey,
  yKeys,
  colors,
  title,
  height,
}: {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors: string[];
  title?: string;
  height: number;
}) {
  const safeData = coerceChartData(data, yKeys);

  return (
    <>
      {title && (
        <p className="text-sm font-medium text-zinc-300 mb-2">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={safeData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
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
          {yKeys.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
          )}
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </>
  );
});

export function BarChartComponent({
  element,
}: ComponentRenderProps<BarChartProps>) {
  const {
    data,
    xKey,
    yKeys,
    colors,
    title,
    height: rawHeight = 300,
  } = element.props;

  const height =
    typeof rawHeight === "string"
      ? parseInt(rawHeight, 10) || 300
      : (rawHeight ?? 300);
  const palette = colors ?? DEFAULT_COLORS;

  return (
    <ChartWrapper
      chartType="BarChart"
      dataPropName="data"
      data={data}
      height={height}
      hasRequiredProps={!!(yKeys?.length && xKey)}
      diagnostics={{ xKey, yKeys, height }}
    >
      <MemoizedBarChart
        data={data as Record<string, unknown>[]}
        xKey={xKey}
        yKeys={yKeys}
        colors={palette}
        title={title}
        height={height}
      />
    </ChartWrapper>
  );
}
