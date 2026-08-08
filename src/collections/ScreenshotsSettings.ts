import type { GlobalConfig } from 'payload'

export const ScreenshotSettings: GlobalConfig = {
  slug: 'screenshot-settings',

  fields: [
    {
      name: 'baseCSS',
      label: 'CSS global des captures',
      type: 'code',
      admin: {
        language: 'css',
      },
    },
  ],
}
