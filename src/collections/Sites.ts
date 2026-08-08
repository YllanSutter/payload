import type { CollectionConfig } from 'payload'

export const Sites: CollectionConfig = {
  slug: 'sites',

  orderable: true,

  admin: {
    useAsTitle: 'Titre',
    defaultColumns: ['Titre', 'siteUrl', 'categories'],

    components: {
      beforeList: ['/components/admin/EditCategoryFromSites'],
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
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
  ],
}
