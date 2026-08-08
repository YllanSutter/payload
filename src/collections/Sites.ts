import type { CollectionConfig } from 'payload'
import { generateScreenshotsEndpoint } from '@/endpoints/generateScreenshots'

export const Sites: CollectionConfig = {
  slug: 'sites',

  orderable: true,

  endpoints: [generateScreenshotsEndpoint],

  admin: {
    useAsTitle: 'Titre',
    defaultColumns: ['Titre', 'siteUrl', 'desktopScreenshot', 'mobileScreenshot'],

    components: {
      beforeList: ['/components/admin/EditCategoryFromSites'],

      edit: {
        beforeDocumentControls: ['/components/admin/GenerateScreenshotsButton'],
      },
    },
  },

  fields: [
    {
      name: 'Titre',
      type: 'text',
      required: true,
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      label: 'Miniature',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'desktopScreenshot',
      label: 'Capture desktop',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'mobileScreenshot',
      label: 'Capture mobile',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'customCSS',
      label: 'CSS personnalisé pour la capture',
      type: 'code',
      admin: {
        language: 'css',
      },
    },
  ],
}
