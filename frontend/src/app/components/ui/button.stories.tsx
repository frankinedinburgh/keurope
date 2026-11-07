import { fn } from 'storybook/test'

import { Button as Component } from './button'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'UI/Button',
  component: Component,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/arg-types
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
}

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Button = {
  args: {
    children: 'Button',
    variant: 'destructive',
    size: 'icon',
    asChild: true
  },
}


import { Save } from 'lucide-react' // or whatever icon set keurope uses

export const WithIcon = {
  args: {
    children: (
      <>
        <Save className="size-4" />
        Save
      </>
    ),
    variant: 'default',
  },
}

