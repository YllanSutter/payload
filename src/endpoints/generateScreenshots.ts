import type { Endpoint } from 'payload'

export const generateScreenshotsEndpoint: Endpoint = {
  path: '/:id/generate-screenshots',
  method: 'post',

  handler: async (req) => {
    if (!req.user) {
      return Response.json(
        {
          error: 'Authentification requise',
        },
        {
          status: 401,
        },
      )
    }

    const rawId = req.routeParams?.id

    if (!rawId) {
      return Response.json(
        {
          error: 'ID du site manquant',
        },
        {
          status: 400,
        },
      )
    }

    const siteId = Array.isArray(rawId) ? String(rawId[0]) : String(rawId)

    const body = (await req.json?.().catch(() => ({}))) as {
      delaySeconds?: unknown
    }

    const requestedDelay = Number(body.delaySeconds ?? 2)

    const delaySeconds = Math.min(
      Math.max(Number.isFinite(requestedDelay) ? requestedDelay : 2, 0),
      30,
    )

    try {
      const site = await req.payload.findByID({
        collection: 'sites',
        id: siteId,
        depth: 0,
        overrideAccess: false,
        user: req.user,
      })

      if (!site.siteUrl) {
        return Response.json(
          {
            error: 'Le site ne possède pas d’URL',
          },
          {
            status: 400,
          },
        )
      }
      const { captureSite } = await import('@/lib/screenshots/captureSite')

      const { desktopBuffer, mobileBuffer } = await captureSite({
        url: site.siteUrl,
        customCSS: site.customCSS,
        delaySeconds,
      })

      const desktopMedia = await req.payload.create({
        collection: 'media',
        data: {
          alt: `Capture desktop de ${site.Titre}`,
        },
        file: {
          data: desktopBuffer,
          mimetype: 'image/png',
          name: `${site.Titre}-desktop.png`,
          size: desktopBuffer.length,
        },
        overrideAccess: false,
        user: req.user,
      })

      const mobileMedia = await req.payload.create({
        collection: 'media',
        data: {
          alt: `Capture mobile de ${site.Titre}`,
        },
        file: {
          data: mobileBuffer,
          mimetype: 'image/png',
          name: `${site.Titre}-mobile.png`,
          size: mobileBuffer.length,
        },
        overrideAccess: false,
        user: req.user,
      })

      const updatedSite = await req.payload.update({
        collection: 'sites',
        id: siteId,
        data: {
          desktopScreenshot: desktopMedia.id,
          mobileScreenshot: mobileMedia.id,
        },
        overrideAccess: false,
        user: req.user,
      })

      return Response.json({
        success: true,
        site: updatedSite,
        desktopScreenshot: desktopMedia.id,
        mobileScreenshot: mobileMedia.id,
      })
    } catch (error) {
      console.error('Erreur génération captures:', error)

      return Response.json(
        {
          error:
            error instanceof Error ? error.message : 'Erreur pendant la génération des captures',
        },
        {
          status: 500,
        },
      )
    }
  },
}
