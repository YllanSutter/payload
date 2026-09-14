'use client'

import { useState } from 'react'
import { useSelection } from '@payloadcms/ui'

function getSelectedIds(selection: unknown): string[] {
  if (selection instanceof Map) {
    return Array.from(selection.entries())
      .filter(([, value]) => value === true)
      .map(([id]) => String(id))
  }
  if (selection instanceof Set) return Array.from(selection).map(String)
  if (typeof selection === 'object' && selection !== null) {
    return Object.entries(selection)
      .filter(([, value]) => value === true)
      .map(([id]) => id)
  }
  return []
}

export default function ExportSitesArchive() {
  const { selected, count } = useSelection()
  const [loading, setLoading] = useState(false)

  if (count === 0) return null

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sites/export-archive', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: getSelectedIds(selected) }),
      })

      if (!response.ok) throw new Error('Impossible de générer l’archive.')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sites-export-${Date.now()}.zip`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Erreur pendant l’export.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="h-10 rounded-md bg-emerald-600 px-4 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Création de l’archive...' : `Exporter avec médias (${count})`}
    </button>
  )
}