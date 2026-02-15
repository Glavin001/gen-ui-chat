"use client";

import { useState } from "react";
import type { ComponentRenderProps } from "@json-render/react";
import { cn } from "@/lib/cn";
import { ComponentError, ErrorCode } from "./ComponentError";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill";
}

export function ImageComponent({ element }: ComponentRenderProps<ImageProps>) {
  const { src, alt, width, height, fit = "cover" } = element.props;
  const [loadError, setLoadError] = useState(false);

  // Guard: missing src
  if (!src || typeof src !== "string") {
    return (
      <ComponentError
        component="Image"
        errorType="missing source"
        message={
          <>
            The <ErrorCode>src</ErrorCode> prop is required. Got{" "}
            <ErrorCode>{JSON.stringify(src)}</ErrorCode>.
          </>
        }
      />
    );
  }

  if (loadError) {
    return (
      <ComponentError
        component="Image"
        errorType="failed to load"
        severity="error"
        message={
          <>
            Could not load image from{" "}
            <ErrorCode severity="error">
              {src.length > 120 ? src.slice(0, 120) + "…" : src}
            </ErrorCode>
            . The URL may be invalid or inaccessible.
          </>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? "Image"}
        width={
          typeof width === "string" ? parseInt(width, 10) || undefined : width
        }
        height={
          typeof height === "string"
            ? parseInt(height, 10) || undefined
            : height
        }
        onError={() => setLoadError(true)}
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
