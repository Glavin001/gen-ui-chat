"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  subtitle?: string;
  variant?: "default" | "outlined" | "elevated";
}

export function Card({ element, children }: ComponentRenderProps<CardProps>) {
  const { title, subtitle, variant = "default" } = element.props;

  return (
    <div
      className={cn(
        "rounded-xl p-4 transition-colors",
        variant === "default" && "bg-zinc-900 border border-zinc-800",
        variant === "outlined" && "border-2 border-zinc-700 bg-transparent",
        variant === "elevated" &&
          "bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/20"
      )}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
