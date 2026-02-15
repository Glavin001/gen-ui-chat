import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "@/components/catalog/Button";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Button",
  component: Button as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const emitSpy = fn();

const render = (args: Record<string, unknown>) => (
  <Button element={mockElement("Button", args) as never} emit={emitSpy} />
);

export const Primary: Story = {
  render,
  args: { label: "Submit", variant: "primary" },
};

export const Secondary: Story = {
  render,
  args: { label: "Cancel", variant: "secondary" },
};

export const Outline: Story = {
  render,
  args: { label: "Learn More", variant: "outline" },
};

export const Ghost: Story = {
  render,
  args: { label: "Skip", variant: "ghost" },
};

export const Destructive: Story = {
  render,
  args: { label: "Delete Account", variant: "destructive" },
};

export const Disabled: Story = {
  render,
  args: { label: "Unavailable", variant: "primary", disabled: true },
};

/** All button variants displayed together for comparison */
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap items-center">
      {(["primary", "secondary", "outline", "ghost", "destructive"] as const).map((v) => (
        <Button
          key={v}
          element={mockElement("Button", { label: v.charAt(0).toUpperCase() + v.slice(1), variant: v }) as never}
          emit={emitSpy}
        />
      ))}
    </div>
  ),
};
