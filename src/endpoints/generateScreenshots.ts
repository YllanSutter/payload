import type { Endpoint } from 'payload'

function getScreenshotFileBase(siteUrl: string) {
  const normalizedURL = siteUrl.trim().match(/^https?:\/\//i)
    ? siteUrl.trim()
    : `https://${siteUrl.trim()}`

  const url = new URL(normalizedURL)
  const hostname = url.hostname.replace(/^www\./i, '')
  const parts = hostname.split('.').filter(Boolean)

  const commonSecondLevelDomains = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac'])

  const baseParts =
    parts.length > 2 &&
    parts[parts.length - 1].length === 2 &&
    commonSecondLevelDomains.has(parts[parts.length - 2].toLowerCase())
      ? parts.slice(0, -2)
      : parts.slice(0, -1)

  const fallbackBase = baseParts.join('.') || hostname || 'screenshot'

  return (
    fallbackBase
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'screenshot'
  )
}

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
      desktop?: unknown
      mobile?: unknown
      customCSSPresetIds?: unknown
    }

    const requestedDelay = Number(body.delaySeconds ?? 2)

    const delaySeconds = Math.min(
      Math.max(Number.isFinite(requestedDelay) ? requestedDelay : 2, 0),
      30,
    )
    const captureDesktop = body.desktop !== false
    const captureMobile = body.mobile !== false

    if (!captureDesktop && !captureMobile) {
      return Response.json(
        { error: 'Sélectionne au moins une version à capturer' },
        { status: 400 },
      )
    }

    try {
      const site = await req.payload.findByID({
        collection: 'sites',
        id: siteId,
        depth: 0,
        overrideAccess: false,
        user: req.user,
      })

      const screenshotSettings = await req.payload.findGlobal({
        slug: 'screenshot-settings',
        depth: 0,
        overrideAccess: false,
        user: req.user,
      })

      const requestedPresetIds = Array.isArray(body.customCSSPresetIds)
        ? body.customCSSPresetIds.map(String)
        : []
      const sitePresetIds = Array.isArray(site.customCSSPresetIds)
        ? site.customCSSPresetIds.map(String)
        : []
      const customCSSPresets = Array.isArray(screenshotSettings.customCSSPresets)
        ? screenshotSettings.customCSSPresets
        : []
      const defaultPresetIds = customCSSPresets
        .filter((preset) => preset.isDefault && preset.id)
        .map((preset) => String(preset.id))
      const selectedPresetIds = new Set([
        ...defaultPresetIds,
        ...sitePresetIds,
        ...requestedPresetIds,
      ])
      const selectedCustomCSS = customCSSPresets
        .filter((preset) => preset.id && selectedPresetIds.has(String(preset.id)))
        .map((preset) => preset.css)
        .filter(Boolean)
        .join('\n')

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
      const screenshotFileBase = getScreenshotFileBase(site.siteUrl)

      const { desktopBuffer, mobileBuffer } = await captureSite({
        url: site.siteUrl,
        customCSS: [site.customCSS, selectedCustomCSS].filter(Boolean).join('\n'),
        delaySeconds,
        captureDesktop,
        captureMobile,
      })

      const desktopMedia = captureDesktop
        ? await req.payload.create({
            collection: 'media',
            data: {
              alt: `Capture desktop de ${site.Titre}`,
            },
            file: {
              data: desktopBuffer,
              mimetype: 'image/jpeg',
              name: `${screenshotFileBase}.jpg`,
              size: desktopBuffer.length,
            },
            overrideAccess: false,
            user: req.user,
          })
        : null

      const mobileMedia = captureMobile
        ? await req.payload.create({
            collection: 'media',
            data: {
              alt: `Capture mobile de ${site.Titre}`,
            },
            file: {
              data: mobileBuffer,
              mimetype: 'image/jpeg',
              name: `${screenshotFileBase}-mobile.jpg`,
              size: mobileBuffer.length,
            },
            overrideAccess: false,
            user: req.user,
          })
        : null

      const updatedSite = await req.payload.update({
        collection: 'sites',
        id: siteId,
        data: {
          ...(desktopMedia ? { desktopScreenshot: desktopMedia.id } : {}),
          ...(mobileMedia ? { mobileScreenshot: mobileMedia.id } : {}),
        },
        overrideAccess: false,
        user: req.user,
      })

      return Response.json({
        success: true,
        site: updatedSite,
        desktopScreenshot: desktopMedia?.id,
        mobileScreenshot: mobileMedia?.id,
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
