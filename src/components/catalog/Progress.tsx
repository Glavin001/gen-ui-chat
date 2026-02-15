"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface ProgressProps {
  value: number;
  label?: string;
  variant?: "default" | "success" | "warning" | "error";
}

export function Progress({ element }: ComponentRenderProps<ProgressProps>) {
  const { value, label, variant = "default" } = element.props;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-400">{label}</span>
          <span className="text-xs text-zinc-500 tabular-nums">{clamped}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            variant === "default" && "bg-indigo-500",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "error" && "bg-red-500"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
