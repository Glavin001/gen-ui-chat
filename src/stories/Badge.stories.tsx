import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/catalog/Badge";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Badge",
  component: Badge as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
    },
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

const render = (args: Record<string, unknown>) => (
  <Badge element={mockElement("Badge", args) as never} emit={() => {}} />
);

export const Default: Story = {
  render,
  args: { text: "Default", variant: "default" },
};

export const Success: Story = {
  render,
  args: { text: "Active", variant: "success" },
};

export const Warning: Story = {
  render,
  args: { text: "Pending", variant: "warning" },
};

export const Error: Story = {
  render,
  args: { text: "Failed", variant: "error" },
};

export const Info: Story = {
  render,
  args: { text: "Beta", variant: "info" },
};

/** All badge variants side by side */
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {(["default", "success", "warning", "error", "info"] as const).map((v) => (
        <Badge
          key={v}
          element={mockElement("Badge", { text: v.charAt(0).toUpperCase() + v.slice(1), variant: v }) as never}
          emit={() => {}}
        />
      ))}
    </div>
  ),
};
