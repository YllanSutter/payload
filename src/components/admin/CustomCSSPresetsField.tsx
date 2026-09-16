'use client'

import { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

type CustomCSSPreset = {
  id: string
  title: string
  isDefault?: boolean | null
}

type CustomCSSPresetsFieldProps = {
  path: string
}

export default function CustomCSSPresetsField({ path }: CustomCSSPresetsFieldProps) {
  const { value, setValue } = useField<string[]>({ path })
  const [presets, setPresets] = useState<CustomCSSPreset[]>([])
  const [loading, setLoading] = useState(true)
  const selectedIds = Array.isArray(value) ? value.map(String) : []

  useEffect(() => {
    async function loadPresets() {
      try {
        const response = await fetch('/api/globals/screenshot-settings?depth=0', {
          credentials: 'include',
        })
        const data = await response.json()
        const loadedPresets: CustomCSSPreset[] = Array.isArray(data.customCSSPresets)
          ? data.customCSSPresets.filter(
              (preset: CustomCSSPreset) => preset.id && preset.title,
            )
          : []

        setPresets(loadedPresets)

        if (value === undefined || value === null) {
          setValue(loadedPresets.filter((preset) => preset.isDefault).map((preset) => preset.id))
        }
      } finally {
        setLoading(false)
      }
    }

    void loadPresets()
  }, [setValue])

  function togglePreset(id: string, checked: boolean) {
    setValue(
      checked
        ? Array.from(new Set([...selectedIds, id]))
        : selectedIds.filter((selectedId) => selectedId !== id),
    )
  }

  return (
    <div className="sites-bulk-create__categories custom-css-presets-field">
      <div className="sites-bulk-create__categories-header">
        <span className="field-label">Presets CSS personnalisés pour la capture</span>
        <span>{selectedIds.length} sélectionné(s)</span>
      </div>

      <p className="field-description">
        Les presets marqués par défaut sont inclus automatiquement.
      </p>

      {loading && <p>Chargement des presets...</p>}
      {!loading && presets.length === 0 && <p>Aucun preset configuré.</p>}

      {!loading && presets.length > 0 && (
        <div className="custom-css-presets-field__list sites-bulk-create__preset-list">
          {presets.map((preset) => (
            <label className="sites-bulk-create__option" key={preset.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(preset.id)}
                onChange={(event) => togglePreset(preset.id, event.target.checked)}
              />
              <span>{preset.title}</span>
              {preset.isDefault && <small>(par défaut)</small>}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
