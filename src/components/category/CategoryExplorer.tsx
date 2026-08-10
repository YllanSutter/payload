'use client'

import CategoryCard, {
  RootCategoryRow,
  type CategoryCardData,
} from '@/components/category/CategoryCard'
import FilterBar from '@/components/filters/FilterBar'
import { useMemo, useState, type ReactNode } from 'react'

const NOISE_TEXTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

type Category = CategoryCardData

type Site = {
  id: string
  title: string
  url: string
  desktopScreenshot: string | null
  mobileScreenshot: string | null
  categoryIds: string[]
}

type CategoryExplorerProps = {
  categories: Category[]
  sites: Site[]
}

function hostFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function CategoryExplorer({ categories, sites }: CategoryExplorerProps) {
  const [selectedRoot, setSelectedRoot] = useState<Category | null>(null)
  const [selectedChild, setSelectedChild] = useState<Category | null>(null)

  function switchRoot(nextRoot: Category) {
    const childStillBelongsToRoot = selectedChild?.parentIds.includes(nextRoot.id)

    setSelectedRoot(categories.find((category) => category.id === nextRoot.id) ?? null)

    if (!childStillBelongsToRoot) {
      setSelectedChild(null)
    }
  }

  const rootCategories = useMemo(
    () => categories.filter((category) => category.parentIds.length === 0),
    [categories],
  )

  const childCategories = useMemo(() => {
    if (!selectedRoot) return []
    return categories.filter((category) => category.parentIds.includes(selectedRoot.id))
  }, [categories, selectedRoot])

  const filteredSites = useMemo(() => {
    if (!selectedRoot || !selectedChild) return []

    return sites.filter((site) => {
      const hasRoot = site.categoryIds.includes(selectedRoot.id)
      const hasChild = site.categoryIds.includes(selectedChild.id)
      return hasRoot && hasChild
    })
  }, [sites, selectedRoot, selectedChild])

  function reset() {
    setSelectedRoot(null)
    setSelectedChild(null)
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1c1a15] antialiased selection:bg-[#e8490f] selection:text-white dark:bg-[#141210] dark:text-[#ede8dc]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(55%_45%_at_82%_0%,rgba(232,73,15,0.07),transparent_70%)] dark:bg-[radial-gradient(55%_45%_at_82%_0%,rgba(232,73,15,0.12),transparent_70%)]"
      />

      {/* Grain par-dessus tout, façon impression */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
        style={{ backgroundImage: `url("${NOISE_TEXTURE}")` }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-10 sm:px-8 lg:px-14 lg:pt-14">
        {/* ── En-tête ─────────────────────────────────────────── */}
        <header className="">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8490f]">
                Catalogue · Édition 2026
              </p>
              <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
                Notre sélection,{' '}
                <span className="italic text-[#1c1a15]/55 dark:text-[#ede8dc]/55">classée</span> par
                univers.
              </h1>
              {/* <p className="mt-6 max-w-md text-sm leading-relaxed text-[#1c1a15]/60 dark:text-[#ede8dc]/60">
                Un univers, un thème, puis les sites retenus. Chaque entrée est vérifiée à la main —
                rien n'est référencé au hasard.
              </p> */}
            </div>

            <dl className="flex shrink-0 gap-12">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1c1a15]/45 dark:text-[#ede8dc]/45">
                  Univers
                </dt>
                <dd className="mt-2 font-serif text-4xl">
                  {String(rootCategories.length).padStart(2, '0')}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#1c1a15]/45 dark:text-[#ede8dc]/45">
                  Sites
                </dt>
                <dd className="mt-2 font-serif text-4xl">
                  {String(sites.length).padStart(2, '0')}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        {/* ── Barre de parcours (sticky) ──────────────────────── */}
        <FilterBar
          rootCategories={rootCategories}
          childCategories={childCategories}
          selectedRoot={selectedRoot}
          selectedChild={selectedChild}
          onReset={reset}
          onRootChange={switchRoot}
          onChildChange={setSelectedChild}
          onChildReset={() => setSelectedChild(null)}
        />

        {/* ── Étape 01 · Univers ──────────────────────────────── */}
        {!selectedRoot && (
          <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <SectionHeading
              step="01"
              title="Choisis un point de départ"
              meta={`${String(rootCategories.length).padStart(2, '0')} univers`}
            />

            <div className="border-t border-[#1c1a15]/15 dark:border-[#ede8dc]/15">
              {rootCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="border-b border-[#1c1a15]/15 dark:border-[#ede8dc]/15"
                >
                  <RootCategoryRow category={category} index={index} onSelect={switchRoot} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Étape 02 · Thèmes ───────────────────────────────── */}
        {selectedRoot && !selectedChild && (
          <section
            key={selectedRoot.id}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            <SectionHeading
              step="02"
              title={
                <>
                  Affine <span className="italic">« {selectedRoot.name} »</span>
                </>
              }
              meta={`${String(childCategories.length).padStart(2, '0')} thèmes`}
            />

            {childCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((category, index) => {
                  const contextualSiteCount = sites.filter((site) => {
                    return (
                      site.categoryIds.includes(selectedRoot.id) &&
                      site.categoryIds.includes(category.id)
                    )
                  }).length

                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      index={index}
                      onSelect={setSelectedChild}
                      countOverride={contextualSiteCount}
                    />
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="Aucun thème"
                text="Cet univers ne propose pas encore de filtre secondaire."
              />
            )}
          </section>
        )}

        {/* ── Étape 03 · Sites ────────────────────────────────── */}
        {selectedRoot && selectedChild && (
          <section
            key={selectedChild.id}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            <SectionHeading
              step="03"
              title="Sites retenus"
              meta={`${filteredSites.length} résultat${filteredSites.length > 1 ? 's' : ''}`}
            />

            {filteredSites.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredSites.map((site, index) => (
                  <SiteCard key={site.id} site={site} index={index} />
                ))}
              </div>
            ) : (
              <EmptyState title="" text="Aucun site ne correspond à ce croisement de catégories." />
            )}
          </section>
        )}

        {/* ── Pied de page ────────────────────────────────────── */}
        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c1a15]/15 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-[#1c1a15]/40 dark:border-[#ede8dc]/15 dark:text-[#ede8dc]/40">
          <span>Fin de l'index</span>
          <span>{String(sites.length).padStart(2, '0')} sites référencés</span>
        </footer>
      </div>
    </div>
  )
}

/* ── Sous-composants ─────────────────────────────────────────── */

function SectionHeading({ step, title, meta }: { step: string; title: ReactNode; meta: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#e8490f]">
            Étape {step} / 03
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h2>
        </div>
        <span className="shrink-0 pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#1c1a15]/45 dark:text-[#ede8dc]/45">
          {meta}
        </span>
      </div>
      <div className="mt-5 h-px w-full bg-[#1c1a15]/15 dark:bg-[#ede8dc]/15" />
    </div>
  )
}

function SiteCard({ site, index }: { site: Site; index: number }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}
      className="group relative block animate-in fade-in fill-mode-both border border-[#1c1a15]/15 bg-[#fbf9f4] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1c1a15] hover:shadow-[0_24px_48px_-28px_rgba(28,26,21,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8490f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ea] dark:border-[#ede8dc]/15 dark:bg-[#1b1814] dark:hover:border-[#ede8dc] dark:hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.85)] dark:focus-visible:ring-offset-[#141210]"
    >
      {/* Barre de navigateur */}
      <div className="flex items-center gap-1.5 border-b border-[#1c1a15]/10 px-4 py-2.5 dark:border-[#ede8dc]/10">
        <span className="h-2 w-2 rounded-full bg-[#1c1a15]/15 dark:bg-[#ede8dc]/25" />
        <span className="h-2 w-2 rounded-full bg-[#1c1a15]/15 dark:bg-[#ede8dc]/25" />
        <span className="h-2 w-2 rounded-full bg-[#1c1a15]/15 dark:bg-[#ede8dc]/25" />
        <span className="ml-3 truncate font-mono text-[10px] tracking-[0.12em] text-[#1c1a15]/45 dark:text-[#ede8dc]/45">
          {hostFromUrl(site.url)}
        </span>
      </div>

      {/* Fenêtre scrollable sur la capture desktop */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e7e1d3] dark:bg-[#242019]">
        {site.desktopScreenshot ? (
          <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">
            <img src={site.desktopScreenshot} alt="" className="w-full" draggable={false} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-6xl italic text-[#1c1a15]/15 dark:text-[#ede8dc]/15">
            {site.title.charAt(0)}
          </div>
        )}

        {/* Fondu bas : signale que la capture défile */}
        {site.desktopScreenshot && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fbf9f4] to-transparent dark:from-[#1b1814]" />
        )}

        {/* Mobile flottant */}
        {site.mobileScreenshot && (
          <div className="absolute bottom-3 right-3 w-16 rotate-3 overflow-hidden rounded-lg border border-[#1c1a15]/20 bg-[#fbf9f4] p-1 shadow-xl transition-all duration-500 group-hover:-translate-y-1.5 group-hover:rotate-0 sm:w-[72px] dark:border-[#ede8dc]/20 dark:bg-[#1b1814]">
            <img
              src={site.mobileScreenshot}
              alt=""
              className="aspect-[9/18] w-full rounded-[5px] object-cover"
            />
          </div>
        )}

        {/* CTA */}
        <span className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-[#e8490f] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Visiter ↗
        </span>
      </div>

      {/* Titre */}
      <div className="flex items-baseline justify-between gap-3 px-4 py-3.5 sm:px-5">
        <h3 className="truncate font-serif text-lg tracking-tight sm:text-xl">{site.title}</h3>
        <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-[#e8490f]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </a>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-[#1c1a15]/15 bg-[#fbf9f4] px-8 py-16 text-center dark:border-[#ede8dc]/15 dark:bg-[#1b1814]">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8490f]">{title}</p>
      <p className="mx-auto mt-4 max-w-sm font-serif text-2xl italic text-[#1c1a15]/70 dark:text-[#ede8dc]/70">
        {text}
      </p>
    </div>
  )
}
