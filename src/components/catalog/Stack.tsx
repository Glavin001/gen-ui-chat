"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface StackProps {
  direction?: "horizontal" | "vertical";
  gap?: "none" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
}

const gapMap = { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6" };
const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export function Stack({ element, children }: ComponentRenderProps<StackProps>) {
  const { direction = "vertical", gap = "md", align = "stretch" } = element.props;
  return (
    <div
      className={cn(
        "flex",
        direction === "horizontal" ? "flex-row" : "flex-col",
        gapMap[gap],
        alignMap[align]
      )}
    >
      {children}
    </div>
  );
}
