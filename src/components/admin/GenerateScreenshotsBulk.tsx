'use client'

import { useSelection } from '@payloadcms/ui'
import ScreenshotCapturePopover from './ScreenshotCapturePopover'

function getSelectedIds(selection: unknown): string[] {
  if (selection instanceof Map) {
    return Array.from(selection.entries())
      .filter(([, value]) => value === true)
      .map(([id]) => String(id))
  }

  if (selection instanceof Set) {
    return Array.from(selection).map(String)
  }

  if (typeof selection === 'object' && selection !== null) {
    return Object.entries(selection)
      .filter(([, value]) => value === true)
      .map(([id]) => id)
  }

  return []
}

export default function GenerateScreenshotsBulk() {
  const { selected, count } = useSelection()

  if (count === 0) {
    return null
  }

  const selectedIds = getSelectedIds(selected)

  return <ScreenshotCapturePopover siteIds={selectedIds} />
}
