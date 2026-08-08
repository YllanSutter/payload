'use client'

import { useState } from 'react'

function normalizeURL(value: string) {
  let url = value.trim()

  if (!url) {
    return ''
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  return url
}

function extractURL(value: string) {
  const markdownMatch = value.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/i)

  if (markdownMatch?.[1]) {
    return markdownMatch[1].trim()
  }

  return value.trim()
}

function getSiteTitle(value: string) {
  const normalizedURL = normalizeURL(extractURL(value))

  const parsedURL = new URL(normalizedURL)

  const hostname = parsedURL.hostname
    .replace(/^www\./i, '')
    .split('.')[0]
    .replace(/[-_]+/g, ' ')
    .trim()
    .toLowerCase()

  if (!hostname) {
    return ''
  }

  return hostname.charAt(0).toUpperCase() + hostname.slice(1)
}

export default function BulkCreateSites() {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [captureAfterCreate, setCaptureAfterCreate] = useState(true)
  const [captureDelay, setCaptureDelay] = useState(2)

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString()

    setLogs((currentLogs) => [...currentLogs, `[${time}] ${message}`])
  }

  async function createSites() {
    let capturesCreated = 0
    let captureErrors = 0
    setMessage('')
    setLogs([])

    const lines = urls
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (!lines.length) {
      setMessage('Ajoute au moins une URL dans la zone de texte.')
      return
    }

    if (lines.length > 100) {
      setMessage('Tu peux ajouter au maximum 100 sites à la fois.')
      return
    }

    const sites = []

    for (const line of lines) {
      try {
        const rawURL = extractURL(line)
        const siteUrl = normalizeURL(rawURL)
        const Titre = getSiteTitle(line)

        if (!Titre || !siteUrl) {
          throw new Error('URL invalide')
        }

        new URL(siteUrl)

        sites.push({
          Titre,
          siteUrl,
        })
      } catch {
        setMessage(`URL invalide : ${line}`)
        return
      }
    }

    setLoading(true)

    let created = 0
    let errors = 0

    addLog(`Début de la création de ${sites.length} site(s).`)

    for (const [index, site] of sites.entries()) {
      const currentNumber = index + 1

      addLog(`Création ${currentNumber}/${sites.length} : ${site.Titre}`)

      try {
        const response = await fetch('/api/sites', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Titre: site.Titre,
            siteUrl: site.siteUrl,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.errors?.[0]?.message ?? data?.message ?? 'Erreur pendant la création',
          )
        }
        const createdSiteId = data?.doc?.id ?? data?.id

        created += 1

        addLog(`Site créé : ${site.Titre}`)

        if (captureAfterCreate && createdSiteId) {
          addLog(`Captures en cours pour ${site.Titre}...`)

          try {
            const captureResponse = await fetch(
              `/api/sites/${createdSiteId}/generate-screenshots`,
              {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  delaySeconds: captureDelay,
                  desktop: true,
                  mobile: true,
                }),
              },
            )

            const captureData = await captureResponse.json()

            if (!captureResponse.ok) {
              throw new Error(captureData?.error ?? 'Erreur pendant la génération des captures')
            }

            capturesCreated += 1

            addLog(`Captures terminées : ${site.Titre}`)
          } catch (error) {
            captureErrors += 1

            addLog(
              `Erreur captures pour ${site.Titre} : ${
                error instanceof Error ? error.message : 'Erreur inconnue'
              }`,
            )
          }
        }

        addLog(`Site créé : ${site.Titre}`)
      } catch (error) {
        errors += 1

        addLog(
          `Erreur pour ${site.Titre} : ${
            error instanceof Error ? error.message : 'Erreur inconnue'
          }`,
        )
      }

      if (captureAfterCreate) {
        setMessage(
          `${created} site(s) créé(s), ${capturesCreated} capture(s) générée(s)${
            captureErrors ? `, ${captureErrors} erreur(s) de capture` : ''
          }.`,
        )
      } else {
        setMessage(`${created} site(s) créé(s) avec succès.`)
      }
    }

    setLoading(false)

    if (errors > 0) {
      setMessage(`${created} site(s) créé(s), ${errors} erreur(s).`)

      return
    }

    setMessage(`${created} site(s) créé(s) avec succès.`)

    window.setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="sites-bulk-create">
      <div className="sites-bulk-create__header">
        <div>
          <h2 className="field-label">Ajouter plusieurs sites</h2>

          <p className="field-description">Ajoute une URL par ligne.</p>
        </div>

        <button
          type="button"
          onClick={createSites}
          disabled={loading}
          className="btn btn--style-primary"
        >
          {loading ? 'Création en cours...' : 'Créer les sites'}
        </button>
      </div>

      <textarea
        value={urls}
        onChange={(event) => {
          setUrls(event.target.value)
          setMessage('')
        }}
        disabled={loading}
        placeholder={`www.ats-com.fr
          https://www.mts68.fr
          https://www.example.com`}
        className="textarea sites-bulk-create__textarea"
        rows={8}
      />
      <div className="sites-bulk-create__capture-options flex gap-[20px] mt-[10px]">
        <label className="checkbox-input gap-[10px] ">
          <input
            type="checkbox"
            checked={captureAfterCreate}
            onChange={(event) => setCaptureAfterCreate(event.target.checked)}
            disabled={loading}
          />

          <span>Générer les captures automatiquement</span>
        </label>

        {captureAfterCreate && (
          <label className="sites-bulk-create__delay gap-[10px] flex">
            <span className="field-label">Délai en secondes</span>

            <input
              type="number"
              min="0"
              max="30"
              value={captureDelay}
              onChange={(event) => setCaptureDelay(Number(event.target.value))}
              disabled={loading}
              className="input"
            />
          </label>
        )}
      </div>

      <p className="sites-bulk-create__hint">
        Une URL par ligne. Le nom sera généré automatiquement depuis le domaine.
      </p>

      {message && <div className="notice notice--info">{message}</div>}

      {logs.length > 0 && (
        <div className="bulk-create-log">
          <p className="field-label">Journal de création</p>

          <pre className="bulk-create-log__content">{logs.join('\n')}</pre>
        </div>
      )}
    </div>
  )
}
