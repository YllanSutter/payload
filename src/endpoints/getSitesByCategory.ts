import type { Endpoint } from 'payload'

function getId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) return String(value.id)
  return null
}

export const getSitesByCategoryEndpoint: Endpoint = {
  path: '/by-category',
  method: 'get',
  handler: async (req) => {
    const categoryId = typeof req.query?.category === 'string' ? req.query.category : null

    if (!categoryId) {
      return Response.json({ error: 'Catégorie manquante' }, { status: 400 })
    }

    const settings = await req.payload.findGlobal({
      slug: 'settings',
      depth: 0,
    })
    const configuredLimit = Number(settings.sitesPerCategory)
    const limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? Math.floor(configuredLimit) : 6
    const result = await req.payload.find({
      collection: 'sites',
      depth: 1,
      limit,
      sort: '-createdAt',
      where: {
        categories: {
          contains: categoryId,
        },
      },
    })

    return Response.json({
      docs: result.docs
        .filter((site) => Boolean(site.Titre?.trim()) && Boolean(site.siteUrl?.trim()))
        .map((site) => ({
          id: String(site.id),
          title: site.Titre?.trim() || 'Site sans titre',
          url: site.siteUrl?.trim() || '',
          mobileScreenshot:
            typeof site.mobileScreenshot === 'object' && site.mobileScreenshot?.url
              ? site.mobileScreenshot.url
              : null,
          desktopScreenshot:
            typeof site.desktopScreenshot === 'object' && site.desktopScreenshot?.url
              ? site.desktopScreenshot.url
              : null,
          categoryIds: Array.isArray(site.categories)
            ? site.categories.map(getId).filter((id): id is string => Boolean(id))
            : [],
        })),
    })
  },
}