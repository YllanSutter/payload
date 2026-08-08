'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import ScreenshotCapturePopover from './ScreenshotCapturePopover'

export default function GenerateScreenshotsButton() {
  const { id } = useDocumentInfo()

  if (!id) {
    return null
  }

  return <ScreenshotCapturePopover siteIds={[String(id)]} />
}
