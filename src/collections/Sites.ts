import type { CollectionConfig } from 'payload'
import { generateScreenshotsEndpoint } from '@/endpoints/generateScreenshots'

export const Sites: CollectionConfig = {
  slug: 'sites',

  orderable: true,

  endpoints: [generateScreenshotsEndpoint],

  admin: {
    useAsTitle: 'Titre',
    components: {
      beforeList: ['/components/admin/SitesListToolbar'],

      edit: {
        beforeDocumentControls: [
          '/components/admin/GenerateScreenshotsButton',
          '/components/admin/EditCategoryFromSites',
        ],
      },
    },
  },

  fields: [
    {
      name: 'Titre',
      type: 'text',
      required: false,
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: false,
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
