"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface GridProps {
  columns?: number;
  gap?: "none" | "sm" | "md" | "lg";
}

const gapMap = { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6" };
const colMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function Grid({ element, children }: ComponentRenderProps<GridProps>) {
  const { columns = 2, gap = "md" } = element.props;
  return (
    <div className={cn("grid", colMap[columns] ?? colMap[2], gapMap[gap])}>
      {children}
    </div>
  );
}
