import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/catalog/Progress";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Progress",
  component: Progress as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    label: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error"],
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
  <Progress element={mockElement("Progress", args) as never} emit={() => {}} />
);

export const Default: Story = {
  render,
  args: { value: 65, label: "Upload Progress" },
};

export const Complete: Story = {
  render,
  args: { value: 100, label: "Download Complete", variant: "success" },
};

export const Warning: Story = {
  render,
  args: { value: 80, label: "Storage Used", variant: "warning" },
};

export const Error: Story = {
  render,
  args: { value: 95, label: "CPU Usage", variant: "error" },
};

export const NoLabel: Story = {
  render,
  args: { value: 42 },
  name: "Without Label",
};

/** All progress variants at different levels */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Progress element={mockElement("Progress", { value: 25, label: "Default (25%)", variant: "default" }) as never} emit={() => {}} />
      <Progress element={mockElement("Progress", { value: 50, label: "Success (50%)", variant: "success" }) as never} emit={() => {}} />
      <Progress element={mockElement("Progress", { value: 75, label: "Warning (75%)", variant: "warning" }) as never} emit={() => {}} />
      <Progress element={mockElement("Progress", { value: 95, label: "Error (95%)", variant: "error" }) as never} emit={() => {}} />
    </div>
  ),
};
