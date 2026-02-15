"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface BadgeProps {
  text: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function Badge({ element }: ComponentRenderProps<BadgeProps>) {
  const { text, variant = "default" } = element.props;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-zinc-800 text-zinc-300",
        variant === "success" && "bg-emerald-500/15 text-emerald-400",
        variant === "warning" && "bg-amber-500/15 text-amber-400",
        variant === "error" && "bg-red-500/15 text-red-400",
        variant === "info" && "bg-blue-500/15 text-blue-400"
      )}
    >
      {text}
    </span>
  );
}
