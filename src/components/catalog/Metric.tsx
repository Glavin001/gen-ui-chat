"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";
import { ComponentError, ErrorCode } from "./ComponentError";

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

  // Guard: missing required props
  if (value === undefined && label === undefined) {
    return (
      <ComponentError
        component="Metric"
        errorType="missing props"
        message={
          <>
            Metric requires at least a <ErrorCode>value</ErrorCode> or{" "}
            <ErrorCode>label</ErrorCode> prop.
          </>
        }
      />
    );
  }

  // Coerce value to displayable string
  const displayValue =
    value === null || value === undefined ? "—" : String(value);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label ?? "Metric"}
      </p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-zinc-100 tabular-nums">
          {displayValue}
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
