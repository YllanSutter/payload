'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useState } from 'react'

export default function InlineTextCell({ cellData, field, rowData }: DefaultCellComponentProps) {
  const fieldName = (field as { name: string }).name
  const [value, setValue] = useState(String(cellData ?? ''))
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const response = await fetch(`/api/sites/${rowData.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [fieldName]: value }),
    })
    setSaving(false)
    if (response.ok) setEditing(false)
  }

  if (!editing) {
    return (
      <button
        className="site-inline-text"
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setEditing(true)
        }}
      >
        {value || '—'}
      </button>
    )
  }

  return (
    <div className="site-inline-editor" onClick={(event) => event.stopPropagation()}>
      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && save()}
      />
      <button type="button" onClick={save} disabled={saving}>
        {saving ? '…' : 'OK'}
      </button>
      <button type="button" onClick={() => setEditing(false)}>
        ×
      </button>
    </div>
  )
}
