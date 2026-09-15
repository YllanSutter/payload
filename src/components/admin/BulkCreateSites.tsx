'use client'

import { useEffect, useState } from 'react'

type Category = {
  id: number
  Nom: string
  isDefault?: boolean
}

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
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [captureLogs, setCaptureLogs] = useState<string[][]>([])
  const [captureAfterCreate, setCaptureAfterCreate] = useState(true)
  const [captureDelay, setCaptureDelay] = useState(2)
  const [captureDesktop, setCaptureDesktop] = useState(true)
  const [captureMobile, setCaptureMobile] = useState(true)
  const [parallelCaptures, setParallelCaptures] = useState(2)
  const urlCount = urls.split(/\r?\n/).filter((line) => line.trim()).length

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories?limit=1000&sort=Nom', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Impossible de charger les catégories.')
        }

        const data = await response.json()
        const loadedCategories: Category[] = Array.isArray(data.docs) ? data.docs : []

        setCategories(loadedCategories)
        setSelectedCategoryIds(
          loadedCategories.filter((category) => category.isDefault).map((category) => category.id),
        )
      } catch {
        setMessage('Impossible de charger les catégories.')
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString()

    setLogs((currentLogs) => [...currentLogs, `[${time}] ${message}`])
  }

  function addCaptureLog(message: string, column: number, columnCount: number) {
    const time = new Date().toLocaleTimeString()

    setCaptureLogs((currentLogs) => {
      const nextLogs =
        currentLogs.length >= columnCount
          ? currentLogs.map((columnLogs) => [...columnLogs])
          : Array.from({ length: columnCount }, () => [])

      nextLogs[column].push(`[${time}] ${message}`)

      return nextLogs
    })
  }

  async function createSites() {
    let capturesCreated = 0
    let captureErrors = 0
    setMessage('')
    setLogs([])
    setCaptureLogs([])

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

    if (categoriesLoading) {
      setMessage('Chargement des catégories en cours...')
      return
    }

    if (captureAfterCreate && !captureDesktop && !captureMobile) {
      setMessage('Sélectionne au moins une version à capturer.')
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
    const sitesToCapture: { id: string; title: string }[] = []

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
            categories: selectedCategoryIds,
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

        if (captureAfterCreate && createdSiteId) {
          sitesToCapture.push({ id: String(createdSiteId), title: site.Titre })
        }
      } catch (error) {
        errors += 1

        addLog(
          `Erreur pour ${site.Titre} : ${
            error instanceof Error ? error.message : 'Erreur inconnue'
          }`,
        )
      }
    }

    let nextCaptureIndex = 0
    const workerCount = Math.min(parallelCaptures, sitesToCapture.length)

    async function captureOne(site: { id: string; title: string }, workerIndex: number) {
      addCaptureLog('--------------------', workerIndex, workerCount)
      addCaptureLog(`Captures en cours pour ${site.title}...`, workerIndex, workerCount)

      try {
        const captureResponse = await fetch(`/api/sites/${site.id}/generate-screenshots`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delaySeconds: captureDelay,
            desktop: captureDesktop,
            mobile: captureMobile,
          }),
        })
        const captureData = await captureResponse.json()

        if (!captureResponse.ok) {
          throw new Error(captureData?.error ?? 'Erreur pendant la génération des captures')
        }

        capturesCreated += 1
        addCaptureLog(`Captures terminées : ${site.title}`, workerIndex, workerCount)
      } catch (error) {
        captureErrors += 1
        addCaptureLog(
          `Erreur captures pour ${site.title} : ${
            error instanceof Error ? error.message : 'Erreur inconnue'
          }`,
          workerIndex,
          workerCount,
        )
      }
    }

    async function captureWorker(workerIndex: number) {
      while (nextCaptureIndex < sitesToCapture.length) {
        const site = sitesToCapture[nextCaptureIndex++]
        await captureOne(site, workerIndex)
      }
    }

    if (sitesToCapture.length > 0) {
      await Promise.all(
        Array.from({ length: workerCount }, (_, workerIndex) => captureWorker(workerIndex)),
      )
    }

    setLoading(false)

    if (errors > 0 || captureErrors > 0) {
      setMessage(
        `${created} site(s) créé(s), ${capturesCreated} capture(s) générée(s), ${
          errors + captureErrors
        } erreur(s).`,
      )

      return
    }

    setMessage(
      captureAfterCreate
        ? `${created} site(s) créé(s), ${capturesCreated} capture(s) générée(s) avec succès.`
        : `${created} site(s) créé(s) avec succès.`,
    )

    window.setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <section className="sites-bulk-create">
      <div className="sites-bulk-create__header">
        <div className="sites-bulk-create__title">
          <span className="sites-bulk-create__mark">01</span>
          <div>
            <h2>Importer des sites</h2>
            <p>Colle une adresse par ligne, puis crée ta sélection.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={createSites}
          disabled={loading || categoriesLoading}
          className="btn btn--style-primary"
        >
          {loading ? 'Création en cours...' : categoriesLoading ? 'Chargement...' : 'Créer les sites'}
        </button>
      </div>

      <div className="sites-bulk-create__input-area">
        <div className="sites-bulk-create__input-label">
          <span>Adresses des sites</span>
          <span>
            {urlCount} URL{urlCount > 1 ? 's' : ''}
          </span>
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
      </div>
      <div className="sites-bulk-create__categories">
        <div className="sites-bulk-create__categories-header">
          <span className="field-label">Catégories</span>
          <span>{selectedCategoryIds.length} sélectionnée(s)</span>
        </div>

        {categories.length > 0 ? (
          <div className="sites-bulk-create__category-list">
            {categories.map((category) => {
              const categoryId = category.id

              return (
                <label key={String(categoryId)} className="sites-bulk-create__option">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(categoryId)}
                    onChange={(event) => {
                      setSelectedCategoryIds((currentIds) =>
                        event.target.checked
                          ? Array.from(new Set([...currentIds, categoryId]))
                          : currentIds.filter((id) => id !== categoryId),
                      )
                    }}
                    disabled={loading || categoriesLoading}
                  />
                  <span>{category.Nom}</span>
                </label>
              )
            })}
          </div>
        ) : (
          <p className="sites-bulk-create__categories-empty">Aucune catégorie disponible.</p>
        )}
      </div>
      <div className="sites-bulk-create__capture-options">
        <label className="sites-bulk-create__option sites-bulk-create__option--primary">
          <input
            type="checkbox"
            checked={captureAfterCreate}
            onChange={(event) => setCaptureAfterCreate(event.target.checked)}
            disabled={loading}
          />

          <span>Générer les captures automatiquement</span>
        </label>

        {captureAfterCreate && (
          <>
            <label className="sites-bulk-create__option">
              <input
                type="checkbox"
                checked={captureDesktop}
                onChange={(event) => setCaptureDesktop(event.target.checked)}
                disabled={loading}
              />
              <span>Capture desktop</span>
            </label>

            <label className="sites-bulk-create__option">
              <input
                type="checkbox"
                checked={captureMobile}
                onChange={(event) => setCaptureMobile(event.target.checked)}
                disabled={loading}
              />
              <span>Capture mobile</span>
            </label>

            <label className="sites-bulk-create__delay">
              <span className="field-label">Délai en secondes</span>

              <input
                type="number"
                min="0"
                max="30"
                value={captureDelay}
                onChange={(event) => setCaptureDelay(Number(event.target.value))}
                disabled={loading}
                className="sites-bulk-create__control"
              />
            </label>

            <label className="sites-bulk-create__delay">
              <span className="field-label">Captures simultanées</span>

              <select
                value={parallelCaptures}
                onChange={(event) => setParallelCaptures(Number(event.target.value))}
                disabled={loading}
                className="sites-bulk-create__control"
              >
                <option value={1}>1</option>
                <option value={2}>2 (recommandé)</option>
                <option value={3}>3</option>
              </select>
            </label>
          </>
        )}
      </div>

      <p className="sites-bulk-create__hint">
        Les noms sont proposés à partir du domaine. Tu pourras les modifier directement dans le
        tableau.
      </p>

      {message && <div className="notice notice--info">{message}</div>}

      {logs.length > 0 && (
        <div className="bulk-create-log">
          <p className="field-label">Journal de création</p>

          <pre className="bulk-create-log__content">{logs.join('\n')}</pre>
        </div>
      )}

      {captureLogs.length > 0 && (
        <div className="bulk-create-log capture-log">
          <p className="field-label">Journal des captures</p>

          <div className="capture-logs__columns">
            {captureLogs.map((columnLogs, columnIndex) => (
              <div className="capture-logs__column" key={columnIndex}>
                <p className="capture-logs__column-title">
                  {captureLogs.length > 1 ? `Worker ${columnIndex + 1}` : 'Progression'}
                </p>
                <div className="capture-logs__content">
                  {columnLogs.map((log, logIndex) => (
                    <div key={`${log}-${logIndex}`}>{log}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
