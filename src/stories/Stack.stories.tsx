import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@/components/catalog/Stack";
import { Button } from "@/components/catalog/Button";
import { Badge } from "@/components/catalog/Badge";
import { Text } from "@/components/catalog/Text";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Stack",
  component: Stack as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    direction: { control: "select", options: ["horizontal", "vertical"] },
    gap: { control: "select", options: ["none", "sm", "md", "lg"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
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

export const Vertical: Story = {
  render: (args: Record<string, unknown>) => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "md", ...args }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "First item", variant: "heading" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "Second item with body text that can wrap to multiple lines in narrow containers.", variant: "body" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "Third item caption", variant: "caption" }) as never} emit={() => {}} />
    </Stack>
  ),
  args: { direction: "vertical", gap: "md", align: "stretch" },
};

export const HorizontalButtons: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
      <Button element={mockElement("Button", { label: "Save", variant: "primary" }) as never} emit={() => {}} />
      <Button element={mockElement("Button", { label: "Cancel", variant: "outline" }) as never} emit={() => {}} />
    </Stack>
  ),
  name: "Horizontal Buttons",
};

export const HorizontalBadges: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "horizontal", gap: "sm", align: "center" }) as never} emit={() => {}}>
      <Badge element={mockElement("Badge", { text: "React", variant: "info" }) as never} emit={() => {}} />
      <Badge element={mockElement("Badge", { text: "TypeScript", variant: "default" }) as never} emit={() => {}} />
      <Badge element={mockElement("Badge", { text: "Active", variant: "success" }) as never} emit={() => {}} />
    </Stack>
  ),
  name: "Horizontal Badges",
};

export const CenteredContent: Story = {
  render: () => (
    <Stack element={mockElement("Stack", { direction: "vertical", gap: "sm", align: "center" }) as never} emit={() => {}}>
      <Text element={mockElement("Text", { content: "Centered Heading", variant: "heading" }) as never} emit={() => {}} />
      <Text element={mockElement("Text", { content: "Everything is aligned to center", variant: "body" }) as never} emit={() => {}} />
      <Button element={mockElement("Button", { label: "Get Started", variant: "primary" }) as never} emit={() => {}} />
    </Stack>
  ),
};
