import type { CollectionConfig } from 'payload'

export const Sites: CollectionConfig = {
  slug: 'sites',

  admin: {
    useAsTitle: 'Titre',
    defaultColumns: ['Titre', 'siteUrl', 'image'],
  },

  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'Titre',
      type: 'text',
      required: true,
    },
    {
      name: 'siteUrl',
      label: 'Lien du site',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      label: 'Image du site',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
