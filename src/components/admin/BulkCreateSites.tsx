'use client'

import { useState } from 'react'

export default function BulkCreateSites() {
  const [numberToCreate, setNumberToCreate] = useState(1)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function createSites() {
    setMessage('')

    const count = Math.floor(numberToCreate)

    if (!Number.isFinite(count) || count < 1) {
      setMessage('Indique un nombre supérieur ou égal à 1.')
      return
    }

    if (count > 100) {
      setMessage('Tu peux créer au maximum 100 sites à la fois.')
      return
    }

    setLoading(true)

    let created = 0
    let errors = 0

    for (let index = 0; index < count; index++) {
      try {
        const response = await fetch('/api/sites', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Titre: '',
            siteUrl: '',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.errors?.[0]?.message ?? data?.message ?? 'Erreur pendant la création',
          )
        }

        created += 1

        setMessage(`${created}/${count} site(s) créé(s)`)
      } catch (error) {
        errors += 1

        setMessage(`${created}/${count} site(s) créé(s), ${errors} erreur(s)`)
      }
    }

    setLoading(false)

    if (errors > 0) {
      setMessage(`${created} site(s) créé(s), ${errors} erreur(s).`)

      return
    }

    setMessage(`${created} site(s) créé(s) avec succès.`)

    window.setTimeout(() => {
      window.location.href = '/admin/collections/sites?where[Titre][exists]=false'
    }, 800)
  }

  return (
    <div className="sites-bulk-create">
      <div className="sites-bulk-create__controls">
        <label htmlFor="sites-number-to-create" className="field-label">
          Nombre de sites
        </label>

        <input
          id="sites-number-to-create"
          type="number"
          min="1"
          max="100"
          value={numberToCreate}
          onChange={(event) => {
            setNumberToCreate(Number(event.target.value))
            setMessage('')
          }}
          disabled={loading}
          className="input sites-bulk-create__input"
        />

        <button
          type="button"
          onClick={createSites}
          disabled={loading}
          className="btn btn--style-primary"
        >
          {loading ? 'Création en cours...' : 'Créer automatiquement'}
        </button>

        {message && (
          <span className="sites-bulk-create__message" role="status" aria-live="polite">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
