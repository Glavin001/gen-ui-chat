"use client";

import type { ComponentRenderProps } from "@json-render/react";

interface DividerProps {
  label?: string;
}

export function Divider({ element }: ComponentRenderProps<DividerProps>) {
  const { label } = element.props;

  if (label) {
    return (
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-zinc-950 px-3 text-xs text-zinc-500">{label}</span>
        </div>
      </div>
    );
  }

  return <hr className="my-4 border-zinc-800" />;
}
