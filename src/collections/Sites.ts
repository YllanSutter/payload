import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { generateScreenshotsEndpoint } from '@/endpoints/generateScreenshots'

const applyDefaultCategories: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create') {
    return data
  }

  const existingCategories = Array.isArray(data?.categories) ? data.categories : []

  if (existingCategories.length > 0) {
    return data
  }

  const defaultCategories = await req.payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    user: req.user,
    where: {
      isDefault: {
        equals: true,
      },
    },
  })

  if (defaultCategories.docs.length === 0) {
    return data
  }

  return {
    ...data,
    categories: defaultCategories.docs.map((category) => category.id),
  }
}

export const Sites: CollectionConfig = {
  slug: 'sites',

  orderable: true,

  endpoints: [generateScreenshotsEndpoint],

  hooks: {
    beforeValidate: [applyDefaultCategories],
  },

  admin: {
    useAsTitle: 'Titre',
    components: {
      beforeList: ['/components/admin/SitesListToolbar'],
      afterListTable: ['/components/admin/DownloadSelectedMedia'],

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
      label: 'Catégories',
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
