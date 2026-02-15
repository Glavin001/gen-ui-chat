import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/catalog/Card";
import { mockElement } from "./helpers";

/**
 * Card is the primary container component for grouping related content.
 * It supports three visual variants and optional title/subtitle.
 */
const meta: Meta = {
  title: "Catalog/Card",
  component: Card as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "outlined", "elevated"],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 text-zinc-100 antialiased p-6 max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const render = (args: Record<string, unknown>) => (
  <Card element={mockElement("Card", args) as never} emit={() => {}}>
    <p className="text-sm text-zinc-300">
      This is the card content area. You can put any components here.
    </p>
  </Card>
);

export const Default: Story = {
  render,
  args: {
    title: "Card Title",
    subtitle: "A brief description",
    variant: "default",
  },
};

export const Outlined: Story = {
  render,
  args: {
    title: "Outlined Card",
    subtitle: "Uses a thicker border, no fill",
    variant: "outlined",
  },
};

export const Elevated: Story = {
  render,
  args: {
    title: "Elevated Card",
    subtitle: "With drop shadow for depth",
    variant: "elevated",
  },
};

export const NoTitle: Story = {
  render,
  args: {
    variant: "default",
  },
  name: "Without Title",
};
