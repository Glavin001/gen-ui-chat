import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    // Storybook stories use patterns (like children-as-prop) that don't apply to Next.js rules
    files: ["src/stories/**/*.tsx", "src/stories/**/*.ts"],
    rules: {
      "react/no-children-prop": "off",
    },
  },
];

export default eslintConfig;
