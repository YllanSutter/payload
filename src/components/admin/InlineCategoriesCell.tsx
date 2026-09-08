'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Category = { id: number; Nom: string }
type CategoryValue = number | string | { id: number | string; Nom?: string }

function ids(value: unknown): string[] {
  if (typeof value === 'string' || typeof value === 'number') return [String(value)]
  return Array.isArray(value)
    ? value.map((item: CategoryValue) => String(typeof item === 'object' ? item.id : item))
    : []
}

export default function InlineCategoriesCell({ cellData, rowData }: DefaultCellComponentProps) {
  const [all, setAll] = useState<Category[]>([])
  const [selected, setSelected] = useState(ids(cellData ?? rowData.categories))
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    fetch('/api/categories?limit=100&sort=Nom', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setAll(data.docs ?? []))
  }, [])

  const names = all
    .filter((category) => selected.includes(String(category.id)))
    .map((category) => category.Nom)
  const initialNames = Array.isArray(cellData)
    ? cellData.flatMap((item: CategoryValue) =>
        typeof item === 'object' && item.Nom ? [item.Nom] : [],
      )
    : []
  const visibleNames = names.length ? names : initialNames

  async function save() {
    setSaving(true)
    const response = await fetch(`/api/sites/${rowData.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: selected.map(Number) }),
    })
    setSaving(false)
    if (response.ok) setOpen(false)
  }

  function toggleMenu() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.bottom + 6, left: rect.left })
    }
    setOpen((current) => !current)
  }

  return (
    <div className="site-inline-categories" onClick={(event) => event.stopPropagation()}>
      <button ref={triggerRef} type="button" className="site-category-trigger" onClick={toggleMenu}>
        {visibleNames.length ? visibleNames.join(', ') : 'Ajouter'}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="site-category-menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {all.map((category) => (
            <label key={category.id}>
              <input
                type="checkbox"
                checked={selected.includes(String(category.id))}
                onChange={() =>
                  setSelected((current) =>
                    current.includes(String(category.id))
                      ? current.filter((id) => id !== String(category.id))
                      : [...current, String(category.id)],
                  )
                }
              />
              {category.Nom}
            </label>
          ))}
          <button type="button" onClick={save} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      , document.body)}
    </div>
  )
}
