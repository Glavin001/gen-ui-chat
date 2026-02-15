"use client";

import { createContext, useContext } from "react";

/**
 * Context that provides a callback for catalog components to send
 * error messages back to the AI chat for auto-correction.
 *
 * The `ChatMessage` component provides this context around the Renderer,
 * so any catalog component can display a "Send to AI" button without
 * prop drilling through json-render.
 */

export type RequestFixFn = (message: string) => void;

const ErrorContext = createContext<RequestFixFn | null>(null);

export const ErrorContextProvider = ErrorContext.Provider;

/**
 * Hook for catalog components to get the "request fix" callback.
 * Returns null when rendered outside of a chat message (e.g. in a storybook).
 */
export function useRequestFix(): RequestFixFn | null {
  return useContext(ErrorContext);
}
