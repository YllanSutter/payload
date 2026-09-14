import JSZip from 'jszip'
import type { Endpoint } from 'payload'

type Relation = string | number | { id: string | number }

type MediaDocument = {
  id: string | number
  filename?: string
  url?: string
  alt?: string
}

type CategoryDocument = {
  id: string | number
  Nom: string
  isDefault?: boolean
  image?: Relation | null
  parents?: Relation[]
}

function getRelationId(value: unknown): string | number | null {
  if (value == null) return null
  return typeof value === 'object' ? (value as { id: string | number }).id : (value as string | number)
}

function safeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_').trim() || 'media'
}

function mediaPath(media: MediaDocument): string {
  return `media/${safeFilename(media.filename || `media-${media.id}`)}`
}

export const exportSitesArchiveEndpoint: Endpoint = {
  path: '/export-archive',
  method: 'post',

  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const body = (await req.json?.().catch(() => ({}))) as { ids?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id): id is string | number => typeof id === 'string' || typeof id === 'number')
      : []

    if (!ids.length) {
      return Response.json({ error: 'Aucun site sélectionné' }, { status: 400 })
    }

    try {
      const result = await req.payload.find({
        collection: 'sites',
        depth: 10,
        limit: ids.length,
        overrideAccess: false,
        user: req.user,
        where: { id: { in: ids } },
      })

      const media = new Map<string, MediaDocument>()
      const categories = new Map<string, CategoryDocument>()
      const addMedia = (value: unknown) => {
        if (typeof value !== 'object' || value === null) return
        const item = value as Partial<MediaDocument>
        if (!item.id || !item.filename || !item.url) return
        media.set(String(item.id), item as MediaDocument)
      }

      const addCategory = (value: unknown) => {
        if (typeof value !== 'object' || value === null) return
        const category = value as unknown as CategoryDocument
        if (typeof category.Nom !== 'string') return
        categories.set(String(category.id), category)
        addMedia(category.image)
        category.parents?.forEach(addCategory)
      }

      const sites = result.docs.map((site) => {
        addMedia(site.desktopScreenshot)
        addMedia(site.mobileScreenshot)
        site.categories?.forEach(addCategory)

        return {
          id: site.id,
          Titre: site.Titre,
          siteUrl: site.siteUrl,
          desktopScreenshot: getRelationId(site.desktopScreenshot),
          mobileScreenshot: getRelationId(site.mobileScreenshot),
          categories: site.categories?.map(getRelationId).filter((id): id is string | number => id !== null) || [],
          customCSS: site.customCSS,
        }
      })

      const archive = new JSZip()
      archive.file(
        'manifest.json',
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            sites,
            categories: Array.from(categories.values()).map((category) => ({
              id: category.id,
              Nom: category.Nom,
              isDefault: category.isDefault,
              image: getRelationId(category.image),
              parents: category.parents?.map(getRelationId).filter((id): id is string | number => id !== null) || [],
            })),
            media: Array.from(media.values()).map((item) => ({
              id: item.id,
              filename: item.filename,
              alt: item.alt,
              path: mediaPath(item),
            })),
          },
          null,
          2,
        ),
      )

      for (const item of media.values()) {
        const fileURL = new URL(item.url!, req.url)
        const response = await fetch(fileURL, { headers: { cookie: req.headers.get('cookie') || '' } })
        if (!response.ok) continue
        archive.file(mediaPath(item), await response.arrayBuffer())
      }

      const buffer = await archive.generateAsync({ type: 'nodebuffer' })
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="sites-export-${Date.now()}.zip"`,
        },
      })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Erreur pendant l’export des sites' })
      return Response.json({ error: 'Impossible de générer l’archive' }, { status: 500 })
    }
  },
}