"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  description?: string;
}

export function Metric({ element }: ComponentRenderProps<MetricProps>) {
  const { label, value, unit, trend, trendValue, description } = element.props;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-zinc-100 tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
        {trend && trendValue && (
          <span
            className={cn(
              "ml-2 text-xs font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
              trend === "flat" && "text-zinc-500"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "flat" && "→"} {trendValue}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}
