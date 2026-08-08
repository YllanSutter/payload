import Image from 'next/image'
import type { Site } from '@/payload-types'

type SitesProps = {
  sites: Site[]
}

export default function Sites({ sites }: SitesProps) {
  if (!sites.length) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-sm text-zinc-400">Aucun site n&apos;est encore disponible.</p>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-cyan-400">
            Sélection
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Mes sites
          </h2>
        </div>

        <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500 sm:block">
          {sites.length} projet{sites.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => {
          const desktopScreenshot =
            typeof site.desktopScreenshot === 'object' && site.desktopScreenshot !== null
              ? site.desktopScreenshot
              : null

          return (
            <article
              key={site.id}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/20 transition duration-500 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-cyan-950/30"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />

              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                {desktopScreenshot?.url ? (
                  <Image
                    src={desktopScreenshot.url}
                    alt={desktopScreenshot.alt || site.Titre}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_right,_#164e63,_#09090b_60%)]">
                    <span className="text-5xl font-semibold text-cyan-300/30">
                      {site.Titre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="absolute left-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-sm font-semibold text-white backdrop-blur-md">
                  {site.Titre.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="relative z-20 -mt-20 p-6">
                <div className="mb-5">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
                    {site.categories?.length
                      ? site.categories
                          .map((cat) => (typeof cat === 'object' && cat !== null ? cat.Nom : ''))
                          .join(', ')
                      : 'Aucune catégorie'}
                  </p>

                  <h3 className="text-2xl font-semibold tracking-tight text-white">{site.Titre}</h3>
                </div>

                <a
                  href={site.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:border-cyan-300/60 hover:bg-cyan-300 hover:text-zinc-950"
                >
                  Visiter le site
                  <span
                    aria-hidden="true"
                    className="text-base transition-transform group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
