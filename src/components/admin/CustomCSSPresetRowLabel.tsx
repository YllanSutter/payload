'use client'

import { useRowLabel } from '@payloadcms/ui'

type CustomCSSPresetRow = {
  title?: string | null
}

export default function CustomCSSPresetRowLabel() {
  const { data, rowNumber } = useRowLabel<CustomCSSPresetRow>()

  return data?.title?.trim() || `Preset CSS ${rowNumber + 1}`
}
