import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { generateScreenshotsEndpoint } from '@/endpoints/generateScreenshots'
import { exportSitesArchiveEndpoint } from '@/endpoints/exportSitesArchive'
import { getSitesByCategoryEndpoint } from '@/endpoints/getSitesByCategory'

const applyDefaultCategories: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create') {
    return data
  }

  if (Array.isArray(data?.categories)) {
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

  endpoints: [generateScreenshotsEndpoint, exportSitesArchiveEndpoint, getSitesByCategoryEndpoint],

  hooks: {
    beforeValidate: [applyDefaultCategories],
  },

  admin: {
    useAsTitle: 'Titre',
    defaultColumns: ['Titre', 'siteUrl', 'desktopScreenshot', 'mobileScreenshot', 'categories'],
    components: {
      beforeList: ['/components/admin/SitesListToolbar'],
      afterListTable: ['/components/admin/DownloadSelectedMedia'],

      edit: {
        beforeDocumentControls: ['/components/admin/GenerateScreenshotsButton'],
      },
    },
  },

  fields: [
    {
      name: 'Titre',
      type: 'text',
      required: false,
      admin: { components: { Cell: '/components/admin/InlineTextCell' } },
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: false,
      admin: { components: { Cell: '/components/admin/InlineTextCell' } },
    },
    {
      name: 'desktopScreenshot',
      label: 'Capture desktop',
      type: 'upload',
      relationTo: 'media',
      admin: { components: { Cell: '/components/admin/InlineMediaCell' } },
    },
    {
      name: 'mobileScreenshot',
      label: 'Capture mobile',
      type: 'upload',
      relationTo: 'media',
      admin: { components: { Cell: '/components/admin/InlineMediaCell' } },
    },
    {
      name: 'categories',
      label: 'Catégories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { components: { Cell: '/components/admin/InlineCategoriesCell' } },
    },
    {
      name: 'customCSS',
      label: 'CSS personnalisé pour la capture',
      type: 'code',
      admin: {
        language: 'css',
      },
    },
    {
      name: 'customCSSPresetIds',
      label: 'Presets CSS personnalisés pour la capture',
      type: 'json',
      admin: {
        components: {
          Field: '/components/admin/CustomCSSPresetsField',
        },
      },
    },
  ],
}
