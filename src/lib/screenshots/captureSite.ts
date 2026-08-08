import { chromium } from 'playwright'

type CaptureSiteOptions = {
  url: string
  customCSS?: string | null
}

function normalizeScreenshotURL(input: string) {
  let rawURL = input.trim()

  if (!/^https?:\/\//i.test(rawURL)) {
    rawURL = `https://${rawURL}`
  }

  const url = new URL(rawURL)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('L’URL doit utiliser http:// ou https://')
  }

  // Ajoute un slash uniquement si on capture la racine du site
  if (!url.pathname || url.pathname === '') {
    url.pathname = '/'
  }

  // Ajoute ?force sans supprimer les paramètres existants
  const hasForceParameter = /(?:\?|&)force(?:=|&|$)/i.test(url.search)

  if (!hasForceParameter) {
    url.search = url.search ? `${url.search}&force` : '?force'
  }

  return url.toString()
}

export async function captureSite({ url, customCSS }: CaptureSiteOptions) {
  const normalizedURL = normalizeScreenshotURL(url)

  console.log(`Capture du site avec l’URL : ${normalizedURL}`)

  const browser = await chromium.launch({
    headless: true,
  })

  try {
    const baseCSS = `
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: auto !important;
      }

      body {
        margin: 0 !important;
      }
    `

    const css = `
      ${baseCSS}
      ${customCSS ?? ''}
    `

    const desktopPage = await browser.newPage({
      viewport: {
        width: 1440,
        height: 900,
      },
      deviceScaleFactor: 1,
    })

    await desktopPage.goto(normalizedURL, {
      waitUntil: 'networkidle',
      timeout: 60_000,
    })

    await desktopPage.addStyleTag({
      content: css,
    })

    await desktopPage.waitForTimeout(1500)

    const desktopBuffer = await desktopPage.screenshot({
      type: 'png',
      fullPage: true,
    })

    const mobilePage = await browser.newPage({
      viewport: {
        width: 390,
        height: 844,
      },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    })

    await mobilePage.goto(normalizedURL, {
      waitUntil: 'networkidle',
      timeout: 60_000,
    })

    await mobilePage.addStyleTag({
      content: css,
    })

    await mobilePage.waitForTimeout(1500)

    const mobileBuffer = await mobilePage.screenshot({
      type: 'png',
      fullPage: false,
    })

    return {
      desktopBuffer,
      mobileBuffer,
    }
  } finally {
    await browser.close()
  }
}
