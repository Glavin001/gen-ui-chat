import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "@/components/catalog/CodeBlock";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/CodeBlock",
  component: CodeBlock as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    code: { control: "text" },
    language: { control: "text" },
    title: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <CodeBlock element={mockElement("CodeBlock", args) as never} emit={() => {}} />
);

export const TypeScript: Story = {
  render,
  args: {
    code: `import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const result = await streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: "You are a helpful assistant.",
  messages,
});`,
    language: "typescript",
    title: "api/chat.ts",
  },
};

export const JSON: Story = {
  render,
  args: {
    code: `{
  "name": "gen-ui-chat",
  "version": "0.1.0",
  "dependencies": {
    "ai": "^6.0.86",
    "react": "^19.0.0"
  }
}`,
    language: "json",
    title: "package.json",
  },
};

export const Bash: Story = {
  render,
  args: {
    code: `npm install @json-render/react
npm run build
npm start`,
    language: "bash",
  },
};

export const PlainText: Story = {
  render,
  args: {
    code: "Just some plain text output from a command.",
  },
};
