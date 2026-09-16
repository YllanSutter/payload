'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

type ScreenshotCapturePopoverProps = {
  siteIds: string[]
}

type CustomCSSPreset = {
  id?: string
  title: string
  css: string
  isDefault?: boolean | null
}

export default function ScreenshotCapturePopover({ siteIds }: ScreenshotCapturePopoverProps) {
  const [open, setOpen] = useState(false)
  const [delaySeconds, setDelaySeconds] = useState(2)
  const [desktop, setDesktop] = useState(true)
  const [mobile, setMobile] = useState(true)
  const [parallelCaptures, setParallelCaptures] = useState(2)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[][]>([])
  const [customCSSPresets, setCustomCSSPresets] = useState<CustomCSSPreset[]>([])
  const [selectedCustomCSSPresetIds, setSelectedCustomCSSPresetIds] = useState<string[]>([])
  const [loadingCustomCSSPresets, setLoadingCustomCSSPresets] = useState(false)

  function addLog(message: string, column = 0, columnCount = 1) {
    const time = new Date().toLocaleTimeString()

    setLogs((currentLogs) => {
      const nextLogs =
        currentLogs.length >= columnCount
          ? currentLogs.map((columnLogs) => [...columnLogs])
          : Array.from({ length: columnCount }, () => [])

      nextLogs[column].push(`[${time}] ${message}`)

      return nextLogs
    })
  }

  const router = useRouter()

  const ids = siteIds.filter(Boolean)

  async function loadCustomCSSPresets() {
    setLoadingCustomCSSPresets(true)

    try {
      const response = await fetch('/api/globals/screenshot-settings?depth=0', {
        credentials: 'include',
      })
      const data = (await response.json()) as { customCSSPresets?: CustomCSSPreset[] }

      if (!response.ok) {
        throw new Error('Impossible de charger les CSS personnalisés')
      }

      const presets = Array.isArray(data.customCSSPresets) ? data.customCSSPresets : []
      setCustomCSSPresets(presets)
      setSelectedCustomCSSPresetIds(
        presets.flatMap((preset) => (preset.isDefault && preset.id ? [preset.id] : [])),
      )
    } catch {
      setMessage('Impossible de charger les CSS personnalisés.')
    } finally {
      setLoadingCustomCSSPresets(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (nextOpen && customCSSPresets.length === 0 && !loadingCustomCSSPresets) {
      void loadCustomCSSPresets()
    }
  }

  async function generateScreenshots() {
    setMessage('')
    setLogs([])
    if (!ids.length) {
      setMessage('Aucun site sélectionné.')
      return
    }

    if (!desktop && !mobile) {
      setMessage('Sélectionne au moins une version.')
      return
    }

    if (!Number.isFinite(delaySeconds) || delaySeconds < 0 || delaySeconds > 30) {
      setMessage('Le délai doit être compris entre 0 et 30 secondes.')
      return
    }

    setLoading(true)

    let completed = 0
    let errors = 0
    let nextIndex = 0
    const workerCount = Math.min(parallelCaptures, ids.length)

    setLogs([])
    addLog(`Début de la capture pour ${ids.length} site(s).`, 0, workerCount)
    addLog(
      `Versions : ${desktop ? 'desktop' : ''}${desktop && mobile ? ' + ' : ''}${
        mobile ? 'mobile' : ''
      }`,
      0,
      workerCount,
    )
    addLog(`Délai configuré : ${delaySeconds} seconde(s).`, 0, workerCount)

    async function captureOne(index: number, siteId: string, workerIndex: number) {
      const currentNumber = index + 1

      addLog('--------------------', workerIndex, workerCount)
      addLog(`Site ${currentNumber}/${ids.length} : lancement de la requête.`, workerIndex, workerCount)

      try {
        const controller = new AbortController()

        const timeout = window.setTimeout(
          () => {
            controller.abort()
          },
          8 * 60 * 1000,
        )

        addLog(
          `Site ${currentNumber}/${ids.length} : navigateur en cours de préparation...`,
          workerIndex,
          workerCount,
        )

        const response = await fetch(`/api/sites/${siteId}/generate-screenshots`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            delaySeconds,
            desktop,
            mobile,
            customCSSPresetIds: selectedCustomCSSPresetIds,
          }),
          signal: controller.signal,
        })

        window.clearTimeout(timeout)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Erreur pendant la capture')
        }

        completed += 1

        addLog(`Site ${currentNumber}/${ids.length} : captures enregistrées.`, workerIndex, workerCount)

        setMessage(`${completed}/${ids.length} site(s) traité(s)`)
      } catch (error) {
        errors += 1

        if (error instanceof DOMException && error.name === 'AbortError') {
          addLog(
            `Site ${currentNumber}/${ids.length} : délai dépassé après 8 minutes.`,
            workerIndex,
            workerCount,
          )
        } else {
          addLog(
            `Site ${currentNumber}/${ids.length} : erreur — ${
              error instanceof Error ? error.message : 'Erreur inconnue'
            }`,
            workerIndex,
            workerCount,
          )
        }
      }
    }

    async function worker(workerIndex: number) {
      while (nextIndex < ids.length) {
        const index = nextIndex++
        await captureOne(index, ids[index], workerIndex)
      }
    }

    await Promise.all(Array.from({ length: workerCount }, (_, workerIndex) => worker(workerIndex)))

    setLoading(false)

    if (errors > 0) {
      setMessage(`${completed} terminé(s), ${errors} erreur(s).`)

      return
    }

    setMessage(`${completed} capture(s) générée(s) avec succès.`)

    router.refresh()

    window.setTimeout(() => {
      window.location.reload()
    }, 700)
  }

  return (
    <div className="">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className=""
          render={
            <button
              type="button"
              disabled={loading || ids.length === 0}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
            />
          }
        >
          {loading ? 'Génération en cours...' : 'Générer les captures'}
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="popoverContentCustom gutter gutter--left gutter--right"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Paramètres de capture</h3>

              <p className="mt-1 text-xs text-zinc-400">
                {ids.length} site
                {ids.length > 1 ? 's' : ''} sélectionné
                {ids.length > 1 ? 's' : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xl leading-none text-zinc-400 hover:text-white close"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <label className="mb-4 block">
            <span className="mb-1 block text-zinc-300">Délai après le scroll, en secondes</span>

            <input
              type="number"
              min="0"
              max="30"
              step="1"
              value={delaySeconds}
              onChange={(event) => {
                setDelaySeconds(Number(event.target.value))
                setMessage('')
              }}
              disabled={loading}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-cyan-500"
            />
          </label>

          <div className="mb-5 space-y-3">
            <p className="text-sm font-medium text-zinc-200">Versions à générer</p>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={desktop}
                onChange={(event) => {
                  setDesktop(event.target.checked)
                  setMessage('')
                }}
                disabled={loading}
                className="h-4 w-4 accent-cyan-500"
              />

              <span>Capture desktop</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={mobile}
                onChange={(event) => {
                  setMobile(event.target.checked)
                  setMessage('')
                }}
                disabled={loading}
                className="h-4 w-4 accent-cyan-500"
              />

              <span>Capture mobile</span>
            </label>
          </div>

          {ids.length > 1 && (
            <label className="mb-5 block">
              <span className="mb-1 block text-zinc-300">Captures simultanées</span>

              <select
                value={parallelCaptures}
                onChange={(event) => setParallelCaptures(Number(event.target.value))}
                disabled={loading}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-cyan-500"
              >
                <option value={1}>Une à la fois</option>
                <option value={2}>Deux à la fois (recommandé)</option>
                <option value={3}>Trois à la fois</option>
              </select>
            </label>
          )}

          <div className="mb-5 space-y-3">
            <p className="text-sm font-medium text-zinc-200">CSS personnalisés</p>

            <p className="text-xs text-zinc-400">
              Le CSS personnalisé déjà enregistré sur le site est toujours inclus.
            </p>

            {loadingCustomCSSPresets && (
              <p className="text-xs text-zinc-400">Chargement des CSS disponibles...</p>
            )}

            {!loadingCustomCSSPresets && customCSSPresets.length === 0 && (
              <p className="text-xs text-zinc-400">
                Aucun CSS personnalisé configuré dans les réglages screenshots.
              </p>
            )}

            {!loadingCustomCSSPresets && customCSSPresets.length > 0 && (
              <div className="space-y-2">
                {customCSSPresets.map((preset) => {
                  if (!preset.id) {
                    return null
                  }

                  const checked = selectedCustomCSSPresetIds.includes(preset.id)

                  return (
                    <label className="flex cursor-pointer items-center gap-3" key={preset.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          setSelectedCustomCSSPresetIds((currentIds) =>
                            event.target.checked
                              ? [...currentIds, preset.id as string]
                              : currentIds.filter((id) => id !== preset.id),
                          )
                          setMessage('')
                        }}
                        disabled={loading}
                        className="h-4 w-4 accent-cyan-500"
                      />

                      <span>{preset.title}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={generateScreenshots}
            disabled={loading || ids.length === 0}
            className="w-full rounded-md bg-cyan-600 px-3 py-2 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
          >
            {loading ? 'Traitement en cours...' : 'Lancer la capture'}
          </button>

          {logs.length > 0 && (
            <div className="mt-4 capture-logs">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Journal de capture</p>

              <div className="capture-logs__columns">
                {logs.map((columnLogs, columnIndex) => (
                  <div className="capture-logs__column" key={columnIndex}>
                    <p className="capture-logs__column-title">
                      {logs.length > 1 ? `Worker ${columnIndex + 1}` : 'Progression'}
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

          {message && (
            <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400">{message}</p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
