'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

type ScreenshotCapturePopoverProps = {
  siteIds: string[]
}

export default function ScreenshotCapturePopover({ siteIds }: ScreenshotCapturePopoverProps) {
  const [open, setOpen] = useState(false)
  const [delaySeconds, setDelaySeconds] = useState(2)
  const [desktop, setDesktop] = useState(true)
  const [mobile, setMobile] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString()

    setLogs((currentLogs) => [...currentLogs, `[${time}] ${message}`])
  }

  const router = useRouter()

  const ids = siteIds.filter(Boolean)

  async function generateScreenshots() {
    setMessage('')
    setLogs([])
    addLog(`Début de la capture pour ${ids.length} site(s).`)
    addLog(
      `Versions : ${desktop ? 'desktop' : ''}${desktop && mobile ? ' + ' : ''}${
        mobile ? 'mobile' : ''
      }`,
    )
    addLog(`Délai configuré : ${delaySeconds} seconde(s).`)

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

    for (const [index, siteId] of ids.entries()) {
      const currentNumber = index + 1

      addLog(`Site ${currentNumber}/${ids.length} : lancement de la requête.`)

      try {
        const controller = new AbortController()

        const timeout = window.setTimeout(
          () => {
            controller.abort()
          },
          8 * 60 * 1000,
        )

        addLog(`Site ${currentNumber}/${ids.length} : navigateur en cours de préparation...`)

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
          }),
          signal: controller.signal,
        })

        window.clearTimeout(timeout)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Erreur pendant la capture')
        }

        completed += 1

        addLog(`Site ${currentNumber}/${ids.length} : captures enregistrées.`)

        setMessage(`${completed}/${ids.length} site(s) traité(s)`)
      } catch (error) {
        errors += 1

        if (error instanceof DOMException && error.name === 'AbortError') {
          addLog(`Site ${currentNumber}/${ids.length} : délai dépassé après 8 minutes.`)
        } else {
          addLog(
            `Site ${currentNumber}/${ids.length} : erreur — ${
              error instanceof Error ? error.message : 'Erreur inconnue'
            }`,
          )
        }
      }
    }

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
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

      <PopoverContent align="end" sideOffset={8} className="popoverContentCustom">
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

        <button
          type="button"
          onClick={generateScreenshots}
          disabled={loading || ids.length === 0}
          className="w-full rounded-md bg-cyan-600 px-3 py-2 font-medium text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
        >
          {loading ? 'Traitement en cours...' : 'Lancer la capture'}
        </button>

        {logs.length > 0 && (
          <div className="mt-4 logs">
            <p className="mb-2 text-xs font-semibold text-zinc-300">Journal de capture</p>

            <div className="logsText max-h-48 overflow-y-auto rounded-md border border-zinc-800 bg-black p-3 font-mono text-[11px] leading-5 text-zinc-400">
              {logs.map((log, index) => (
                <div key={`${log}-${index}`}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400">{message}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
