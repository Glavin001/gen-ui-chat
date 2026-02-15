import React from "react";

/**
 * Creates a mock `element` object matching json-render's ComponentRenderProps shape.
 * This allows us to render catalog components directly in Storybook
 * without the full json-render runtime.
 */
export function mockElement<T extends Record<string, unknown>>(
  type: string,
  props: T
) {
  return {
    id: `storybook-${type}`,
    type,
    props,
    children: [],
    visible: true,
  };
}

/**
 * A no-op emit function for components that use action events (e.g. Button).
 */
export function mockEmit(action: string, ...args: unknown[]) {
  console.log(`[Storybook] emit("${action}")`, ...args);
}

/**
 * Wraps children in the dark themed container matching the app's look.
 */
export function DarkContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 text-zinc-100 antialiased p-6 min-h-[200px]">
      {children}
    </div>
  );
}
