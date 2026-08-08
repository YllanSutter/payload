'use client'

import { useEffect, useState } from 'react'
import { useSelection } from '@payloadcms/ui'

type Category = {
  id: string
  Nom: string
}

type Mode = 'add' | 'remove'

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

function getCategoryId(category: string | { id: string }): string | null {
  if (typeof category === 'string') {
    return category
  }

  if (typeof category === 'object' && category !== null && 'id' in category) {
    return String(category.id)
  }

  return null
}

export default function EditCategoryFromSites() {
  const { selected, count } = useSelection()

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (count === 0) {
      return
    }

    async function loadCategories() {
      const response = await fetch('/api/categories?limit=1000&sort=Nom', {
        credentials: 'include',
      })

      if (!response.ok) {
        setMessage('Impossible de charger les catégories.')
        return
      }

      const data = await response.json()
      setCategories(data.docs)
    }

    loadCategories()
  }, [count])

  async function updateCategory(mode: Mode) {
    const selectedIds = getSelectedIds(selected)

    if (selectedIds.length === 0) {
      setMessage('Impossible de récupérer les sites sélectionnés.')
      return
    }

    if (!categoryId) {
      setMessage('Choisis une catégorie.')
      return
    }

    const category = categories.find((item) => item.id === categoryId)

    const actionLabel = mode === 'add' ? 'ajouter' : 'retirer'

    const confirmed = window.confirm(
      `${actionLabel.charAt(0).toUpperCase()}${actionLabel.slice(
        1,
      )} "${category?.Nom}" sur ${selectedIds.length} site(s) ?`,
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setMessage('Mise à jour en cours...')

    let updated = 0
    let errors = 0

    for (const siteId of selectedIds) {
      try {
        const siteResponse = await fetch(`/api/sites/${siteId}?depth=0`, {
          credentials: 'include',
        })

        if (!siteResponse.ok) {
          errors++
          continue
        }

        const site = await siteResponse.json()

        const currentCategoryIds = Array.isArray(site.categories)
          ? site.categories.map(getCategoryId).filter((id: any): id is string => Boolean(id))
          : []

        const nextCategoryIds =
          mode === 'add'
            ? Array.from(new Set([...currentCategoryIds, categoryId]))
            : currentCategoryIds.filter((id: string) => id !== categoryId)

        const updateResponse = await fetch(`/api/sites/${siteId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories: nextCategoryIds,
          }),
        })

        if (updateResponse.ok) {
          updated++
        } else {
          errors++
        }
      } catch {
        errors++
      }
    }

    setLoading(false)

    setMessage(`${updated} site(s) mis à jour${errors ? `, ${errors} erreur(s)` : ''}.`)

    window.location.reload()
  }

  // Le panneau est invisible tant qu'aucun site n'est sélectionné.
  if (count === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-[10px] rounded-lg p-4 text-sm text-white gutter gutter--left gutter--right">
      <strong className="font-semibold text-white">Modifier les catégories</strong>

      <span className="text-accent-400">
        {count} site{count > 1 ? 's' : ''} sélectionné
        {count > 1 ? 's' : ''}
      </span>

      <select
        value={categoryId}
        onChange={(event) => {
          setCategoryId(event.target.value)
          setMessage('')
        }}
        disabled={loading}
        className="h-10 min-w-[220px] rounded-md border border-white/15 bg-zinc-900 px-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Choisir une catégorie</option>

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.Nom}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => updateCategory('add')}
        disabled={loading || !categoryId}
        className="h-10 rounded-md bg-emerald-600 px-4 font-medium text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {loading ? 'Mise à jour...' : 'Ajouter la catégorie'}
      </button>

      <button
        type="button"
        onClick={() => updateCategory('remove')}
        disabled={loading || !categoryId}
        className="h-10 rounded-md bg-red-600 px-4 font-medium text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {loading ? 'Mise à jour...' : 'Retirer la catégorie'}
      </button>

      {message && <span className="basis-full text-sm text-zinc-400">{message}</span>}
    </div>
  )
}
