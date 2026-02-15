"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  disabled?: boolean;
  icon?: string;
}

export function Button({ element, emit }: ComponentRenderProps<ButtonProps>) {
  const { label, variant = "primary", disabled = false } = element.props;

  return (
    <button
      onClick={() => emit("press")}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
        variant === "secondary" &&
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-900",
        variant === "outline" &&
          "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 active:bg-zinc-900",
        variant === "ghost" &&
          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50",
        variant === "destructive" &&
          "bg-red-600 text-white hover:bg-red-500 active:bg-red-700"
      )}
    >
      {label}
    </button>
  );
}
