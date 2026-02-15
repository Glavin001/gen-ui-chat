import type { StorybookConfig } from "@storybook/react-vite";
import react from "@vitejs/plugin-react";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    // Resolve path aliases to match Next.js tsconfig
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": new URL("../src", import.meta.url).pathname,
    };

    // Ensure automatic JSX runtime so we don't need `import React` everywhere
    config.plugins = config.plugins || [];
    // Remove any existing react plugins to avoid conflicts
    config.plugins = config.plugins.filter(
      (p) => p && !(Array.isArray(p) ? false : (p as { name?: string }).name?.includes("react"))
    );
    config.plugins.push(react({ jsxRuntime: "automatic" }));

    return config;
  },
};

export default config;
