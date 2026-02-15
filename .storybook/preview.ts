import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#09090b" }, // zinc-950
        { name: "darkAlt", value: "#18181b" }, // zinc-900
        { name: "light", value: "#ffffff" },
      ],
    },
    layout: "padded",
  },
};

export default preview;
