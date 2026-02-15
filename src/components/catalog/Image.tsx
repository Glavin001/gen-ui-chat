"use client";

import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill";
}

export function ImageComponent({ element }: ComponentRenderProps<ImageProps>) {
  const { src, alt, width, height, fit = "cover" } = element.props;

  return (
    <div className="overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "max-w-full",
          fit === "cover" && "object-cover",
          fit === "contain" && "object-contain",
          fit === "fill" && "object-fill"
        )}
      />
    </div>
  );
}
