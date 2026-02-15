import type { Meta, StoryObj } from "@storybook/react";
import { ImageComponent } from "@/components/catalog/Image";
import { mockElement } from "./helpers";

const meta: Meta = {
  title: "Catalog/Image",
  component: ImageComponent as unknown as React.ComponentType,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
    fit: { control: "select", options: ["cover", "contain", "fill"] },
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
  <ImageComponent element={mockElement("Image", args) as never} emit={() => {}} />
);

export const Default: Story = {
  render,
  args: {
    src: "https://picsum.photos/seed/genui/600/400",
    alt: "A sample placeholder image",
    width: 600,
    height: 400,
  },
};

export const FixedSize: Story = {
  render,
  args: {
    src: "https://picsum.photos/seed/small/200/200",
    alt: "Small square image",
    width: 200,
    height: 200,
    fit: "cover",
  },
};

export const ContainFit: Story = {
  render,
  args: {
    src: "https://picsum.photos/seed/contain/800/400",
    alt: "Wide landscape image with contain fit",
    width: 400,
    height: 300,
    fit: "contain",
  },
};
