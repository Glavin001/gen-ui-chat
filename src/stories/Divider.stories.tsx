import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "@/components/catalog/Divider";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Divider",
  component: Divider as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-md">
        <p className="text-sm text-zinc-300 mb-2">Content above</p>
        <Story />
        <p className="text-sm text-zinc-300 mt-2">Content below</p>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <Divider element={mockElement("Divider", args) as never} emit={() => {}} />
);

export const Simple: Story = {
  render,
  args: {},
};

export const WithLabel: Story = {
  render,
  args: { label: "OR" },
};

export const WithLongLabel: Story = {
  render,
  args: { label: "Section Break" },
};
