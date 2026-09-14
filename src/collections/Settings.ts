import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Paramètres',
  fields: [
    {
      name: 'sitesPerCategory',
      label: 'Nombre de sites par catégorie',
      type: 'number',
      required: true,
      defaultValue: 6,
      min: 1,
      admin: {
        description: 'Nombre maximum de sites chargés lorsque l’on ouvre une sous-catégorie.',
      },
    },
  ],
}