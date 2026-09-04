'use client'

import { useState } from 'react'
import { useSelection } from '@payloadcms/ui'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Fonction utilitaire pour extraire les IDs (identique à ton autre composant)
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

// Nettoyage des noms de fichiers pour éviter les erreurs dans le ZIP
function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\:*?"<>|]/g, '_').trim() || 'site'
}

export default function DownloadSelectedMedia() {
  const { selected, count } = useSelection()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  if (count === 0) {
    return null
  }

  const handleDownload = async () => {
    const ids = getSelectedIds(selected)
    if (ids.length === 0) return

    setLoading(true)
    setProgress('Récupération des sites...')

    try {
      // 1. Récupérer les sites avec depth=1 pour avoir les objets médias complets (url, filename)
      const whereIn = ids.join(',')
      const response = await fetch(
        `/api/sites?where[id][in]=${whereIn}&depth=1&limit=${ids.length}`,
        { credentials: 'include' },
      )

      if (!response.ok) throw new Error('Erreur lors de la récupération des sites')
      const data = await response.json()

      const mediaToDownload: { url: string; filename: string }[] = []

      // 2. Extraire les URLs des captures desktop et mobile
      for (const site of data.docs) {
        const siteName = sanitizeFilename(site.Titre || `site_${site.id}`)

        if (site.desktopScreenshot && typeof site.desktopScreenshot !== 'number') {
          mediaToDownload.push({
            url: site.desktopScreenshot.url,
            filename: `${siteName}_desktop_${site.desktopScreenshot.filename}`,
          })
        }
        if (site.mobileScreenshot && typeof site.mobileScreenshot !== 'number') {
          mediaToDownload.push({
            url: site.mobileScreenshot.url,
            filename: `${siteName}_mobile_${site.mobileScreenshot.filename}`,
          })
        }
      }

      if (mediaToDownload.length === 0) {
        setProgress('Aucun média trouvé pour cette sélection.')
        setTimeout(() => {
          setLoading(false)
          setProgress('')
        }, 2000)
        return
      }

      // 3. Télécharger les images et les ajouter au ZIP
      setProgress(`Téléchargement de 0/${mediaToDownload.length} images...`)
      const zip = new JSZip()

      for (let i = 0; i < mediaToDownload.length; i++) {
        const media = mediaToDownload[i]
        setProgress(`Téléchargement de ${i + 1}/${mediaToDownload.length} images...`)

        try {
          // On fetch l'image en tant que Blob
          const imgRes = await fetch(media.url, { credentials: 'include' })
          if (!imgRes.ok) continue
          const blob = await imgRes.blob()
          zip.file(media.filename, blob)
        } catch (e) {
          console.warn(`Impossible de télécharger ${media.filename}`, e)
        }
      }

      // 4. Générer le ZIP et déclencher le téléchargement
      setProgress('Génération du fichier ZIP...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `captures_sites_${new Date().getTime()}.zip`)

      setProgress('Terminé !')
    } catch (error) {
      console.error(error)
      setProgress('Une erreur est survenue.')
    } finally {
      setTimeout(() => {
        setLoading(false)
        setProgress('')
      }, 2500)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="h-10 rounded-md bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
    >
      {loading ? progress : `Télécharger les médias (${count})`}
    </button>
  )
}
