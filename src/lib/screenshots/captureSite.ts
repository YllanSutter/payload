import { chromium } from 'playwright'
import type { Page } from 'playwright'

function enableImageDebug(page: Page, label: string) {
  page.on('response', (response) => {
    const request = response.request()

    if (request.resourceType() === 'image' && response.status() >= 400) {
      console.error(`[${label}] Image en erreur`, response.status(), response.url())
    }
  })

  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'image') {
      console.error(
        `[${label}] Image impossible à charger`,
        request.failure()?.errorText,
        request.url(),
      )
    }
  })
}

async function scrollToBottomAndBack(page: Page, delaySeconds: number) {
  await page.evaluate(async () => {
    const wait = (milliseconds: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds)
      })

    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)

    const maxScroll = Math.max(pageHeight - window.innerHeight, 0)

    const numberOfSteps = 20

    for (let step = 0; step <= numberOfSteps; step++) {
      const position = (maxScroll * step) / numberOfSteps

      window.scrollTo({
        top: position,
        behavior: 'instant',
      })

      await wait(100)
    }

    await wait(700)

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })

    await wait(300)
  })

  await page.waitForTimeout(delaySeconds * 1000)
}

async function waitForImages(page: Page) {
  await page
    .waitForFunction(
      () => Array.from(document.images).every((image) => image.complete || image.naturalWidth > 0),
      {
        timeout: 10_000,
      },
    )
    .catch(() => {
      console.warn('Certaines images ne sont pas disponibles. La capture continue.')
    })

  await page.waitForTimeout(500)
}

type CaptureSiteOptions = {
  url: string
  customCSS?: string | null
  delaySeconds?: number
  captureDesktop?: boolean
  captureMobile?: boolean
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

  if (!url.pathname || url.pathname === '') {
    url.pathname = '/'
  }

  const hasForceParameter = /(?:\?|&)force(?:=|&|$)/i.test(url.search)

  if (!hasForceParameter) {
    url.search = url.search ? `${url.search}&force` : '?force'
  }

  return url.toString()
}

export async function captureSite({
  url,
  customCSS,
  delaySeconds = 2,
  captureDesktop = true,
  captureMobile = true,
}: CaptureSiteOptions) {
  const normalizedURL = normalizeScreenshotURL(url)

  console.log(`Capture du site avec l’URL : ${normalizedURL}`)

  const browser = await chromium.launch({
    headless: true,
  })

  try {
    const baseCSS = `
html, body {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
}

#wrappersite {
  overflow: hidden!important;
}

#header,#headerGrid {
  width:100%;
}

.home #content :is(.blocthumb,.specialthumb,.tertiarythumb,.quaternarythumb,.gallery-item,.wp-block-image,.wp-block-image img) {
  transform: initial!important;
  opacity:1!important;
}

#sections :is(.specialthumb,.blocthumb,.specialthumb img,.blocthumb img) {
  background-attachment: inherit!important;
}

.gallery-item img {
  opacity:1!important;
  transform: initial!important;
}

.sectionsbloc img,body .vegas-container,#content img {
  transform: initial!important;
}

#tarteaucitronAlertSmall, #tarteaucitronAlertBig,.fixedParent,.fixed-header,.animationDirection::before,.to-top,#popup,#banner,#ckbp_popup,#ckbp_banner,
#loader-wrapper,.loader,#ckbp_popup,#ckbp_banner,#AVcontentBox,#AVoverlay,#event_animation_container {
  display: none!important;
}

.fixe-bg,.baseBefore::before,#reassurances,#prestations {
  background-attachment: initial!important;
}

.animClass, .animClassChild, .animClassToogle, .animClassChildToogle {
  overflow: inherit!important;
}

.animClass, .animClassChild>*, .animClassToogle, .animClassChildToogle>* {
  transform: translate(0,0)!important;
  opacity: 1!important;
}

#prestations .hiddenChild .prestations-wrapper>*:not(.prestations-title) {
  opacity: 0;
}
`

    const css = `
${baseCSS}
${customCSS ?? ''}
`

    let desktopBuffer: Buffer | null = null
    let mobileBuffer: Buffer | null = null

    if (captureDesktop) {
      const desktopPage = await browser.newPage({
        viewport: {
          width: 1920,
          height: 1080,
        },
        deviceScaleFactor: 1,
      })

      enableImageDebug(desktopPage, 'desktop')

      await desktopPage.goto(normalizedURL, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      })

      await desktopPage.addStyleTag({
        content: css,
      })

      await scrollToBottomAndBack(desktopPage, delaySeconds)
      await waitForImages(desktopPage)

      desktopBuffer = await desktopPage.screenshot({
        type: 'png',
        fullPage: true,
      })

      await desktopPage.close()
    }

    if (captureMobile) {
      const mobilePage = await browser.newPage({
        viewport: {
          width: 390,
          height: 844,
        },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      })

      enableImageDebug(mobilePage, 'mobile')

      await mobilePage.goto(normalizedURL, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      })

      await mobilePage.addStyleTag({
        content: css,
      })

      await scrollToBottomAndBack(mobilePage, delaySeconds)
      // await waitForImages(mobilePage)

      mobileBuffer = await mobilePage.screenshot({
        type: 'png',
        fullPage: false,
      })

      await mobilePage.close()
    }

    if (!desktopBuffer && !mobileBuffer) {
      throw new Error('Aucune capture n’a été générée')
    }

    return {
      desktopBuffer: desktopBuffer ?? Buffer.from(''),
      mobileBuffer: mobileBuffer ?? Buffer.from(''),
    }
  } finally {
    await browser.close()
  }
}
