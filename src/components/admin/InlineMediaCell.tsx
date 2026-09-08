'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useState } from 'react'
import { useListDrawer } from '@payloadcms/ui'

type MediaValue = { id?: string | number; url?: string; filename?: string }

export default function InlineMediaCell({ cellData, field, rowData }: DefaultCellComponentProps) {
  const fieldName = (field as { name: string }).name
  const rawValue = cellData ?? rowData[fieldName]
  const initial = typeof rawValue === 'object' && rawValue ? (rawValue as MediaValue) : null
  const [media, setMedia] = useState<MediaValue | null>(initial)
  const [saving, setSaving] = useState(false)
  const [MediaDrawer, , { closeDrawer, openDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
  })

  useEffect(() => {
    if (typeof rawValue !== 'string' && typeof rawValue !== 'number') return
    fetch(`/api/media/${rawValue}`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setMedia(data.doc ?? data))
  }, [rawValue])

  async function selectMedia(selectedMedia: MediaValue) {
    if (!selectedMedia.id) return

    setSaving(true)

    const update = await fetch(`/api/sites/${rowData.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldName]: selectedMedia.id }),
    })

    if (update.ok) {
      setMedia(selectedMedia)
      closeDrawer()
    }
    setSaving(false)
  }

  async function remove() {
    setSaving(true)
    const response = await fetch(`/api/sites/${rowData.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldName]: null }),
    })
    if (response.ok) setMedia(null)
    setSaving(false)
  }

  return (
    <div className="site-inline-media-wrap" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="site-inline-media"
        title="Choisir un média dans la médiathèque"
        onClick={openDrawer}
        disabled={saving}
      >
        {media?.url ? <img src={media.url} alt="" /> : <span>Ajouter</span>}
        <span className="site-inline-media__overlay">
          {saving ? 'Enregistrement…' : media ? 'Remplacer' : 'Ajouter'}
        </span>
      </button>
      <MediaDrawer onSelect={({ doc }) => void selectMedia(doc as MediaValue)} />
      {media && (
        <div className="site-inline-media-actions">
          <button
            className="site-inline-media-remove"
            type="button"
            onClick={remove}
            disabled={saving}
            title="Supprimer le média"
          >
            ×
          </button>
          {media.url && (
            <a
              className="site-inline-media-open"
              href={media.url}
              target="_blank"
              rel="noreferrer"
              title="Ouvrir le média dans un nouvel onglet"
            >
              ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}
