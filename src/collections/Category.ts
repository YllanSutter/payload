import type { CollectionConfig } from 'payload'

export const Category: CollectionConfig = {
  slug: 'categories',

  orderable: true,

  admin: {
    useAsTitle: 'Nom',
  },

  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'Nom',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'parents',
      label: 'Catégories parentes',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: false,
    },
  ],
}
