"use client";

import React from "react";
import type { ComponentRenderProps } from "@json-render/react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { ComponentError, ErrorCode } from "./ComponentError";

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

/**
 * Coerce data items: ensure `value` is numeric (AI may send strings).
 * Filter out items that can't be coerced.
 */
function coercePieData(data: PieChartDataItem[]): PieChartDataItem[] {
  return data
    .map((item) => ({
      ...item,
      name: String(item.name ?? "Unknown"),
      value:
        typeof item.value === "number"
          ? item.value
          : parseFloat(String(item.value)),
    }))
    .filter((item) => !isNaN(item.value) && item.value > 0);
}

const MemoizedPieChart = React.memo(function MemoizedPieChart({
  data,
  title,
  height,
  showLabels,
}: {
  data: PieChartDataItem[];
  title?: string;
  height: number;
  showLabels: boolean;
}) {
  // Coerce data to ensure numeric values
  const safeData = coercePieData(data);

  if (safeData.length === 0) {
    return (
      <ComponentError
        component="PieChart"
        errorType="no valid data"
        minHeight={height}
        message={
          <>
            All data items had non-numeric or zero values. Each item needs a
            numeric <ErrorCode>value</ErrorCode> greater than 0.
          </>
        }
      />
    );
  }

  // Calculate responsive radii based on available height
  // Leave room for title (~24px), legend (~30px), and padding
  const chartArea = height - (title ? 24 : 0) - 40;
  const outerRadius = Math.max(40, Math.floor(chartArea / 2.5));
  const innerRadius = Math.max(20, Math.floor(outerRadius * 0.6));

  return (
    <>
      {title && (
        <p className="text-sm font-medium text-zinc-300 mb-2">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 24 : 0)}>
        <RechartsPieChart>
          <Pie
            data={safeData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={
              showLabels && safeData.length <= 8
                ? ({ name, percent }: { name: string; percent: number }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                : false
            }
            labelLine={showLabels && safeData.length <= 8}
          >
            {safeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                }
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
    </>
  );
});

export function PieChartComponent({
  element,
}: ComponentRenderProps<PieChartProps>) {
  const {
    data,
    title,
    height: rawHeight = 300,
    showLabels = true,
  } = element.props;

  const height =
    typeof rawHeight === "string"
      ? parseInt(rawHeight, 10) || 300
      : (rawHeight ?? 300);

  return (
    <ChartWrapper
      chartType="PieChart"
      dataPropName="data"
      data={data}
      height={height}
      hasRequiredProps={true}
      diagnostics={{ itemCount: Array.isArray(data) ? data.length : undefined }}
    >
      <MemoizedPieChart
        data={data as PieChartDataItem[]}
        title={title}
        height={height}
        showLabels={showLabels}
      />
    </ChartWrapper>
  );
}
