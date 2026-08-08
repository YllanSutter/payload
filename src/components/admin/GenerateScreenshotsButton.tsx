'use client'

import { useState } from 'react'

export default function GenerateScreenshotsButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function getSiteId() {
    const match = window.location.pathname.match(/\/collections\/sites\/([^/]+)/)

    return match?.[1] ?? null
  }

  async function generateScreenshots() {
    const siteId = getSiteId()

    if (!siteId) {
      setMessage('Impossible de récupérer le site.')
      return
    }

    const confirmed = window.confirm('Générer les captures desktop et mobile de ce site ?')

    if (!confirmed) {
      return
    }

    setLoading(true)
    setMessage('Capture en cours...')

    try {
      const response = await fetch(`/api/sites/${siteId}/generate-screenshots`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Erreur pendant la génération')
      }

      setMessage('Captures générées avec succès.')

      window.setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={generateScreenshots}
        disabled={loading}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
      >
        {loading ? 'Génération en cours...' : 'Générer les captures'}
      </button>

      {message && <span className="text-xs text-zinc-500">{message}</span>}
    </div>
  )
}
