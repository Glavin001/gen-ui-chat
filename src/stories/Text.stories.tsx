import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@/components/catalog/Text";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Text",
  component: Text as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    content: { control: "text" },
    variant: {
      control: "select",
      options: ["body", "heading", "caption", "code"],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <Text element={mockElement("Text", args) as never} emit={() => {}} />
);

export const Body: Story = {
  render,
  args: {
    content: "This is body text. It uses a comfortable reading size with relaxed line height for longer content passages.",
    variant: "body",
  },
};

export const Heading: Story = {
  render,
  args: {
    content: "This is a Heading",
    variant: "heading",
  },
};

export const Caption: Story = {
  render,
  args: {
    content: "This is caption text — small and muted for secondary info",
    variant: "caption",
  },
};

export const Code: Story = {
  render,
  args: {
    content: "const x = 42;",
    variant: "code",
  },
};

/** Shows all variants stacked for visual comparison */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <Text element={mockElement("Text", { content: "Heading Variant", variant: "heading" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "Body variant with normal text that might be longer and wrap to multiple lines in narrow containers.", variant: "body" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "Caption variant for metadata", variant: "caption" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "console.log('code variant')", variant: "code" }) as never} emit={() => {}} />
    </div>
  ),
};
