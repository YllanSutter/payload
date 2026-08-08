'use client'
import CategoryCard, { type CategoryCardData } from '@/components/category/CategoryCard'
import FilterBar from '@/components/filters/FilterBar'

import { useMemo, useState } from 'react'

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

export default function CategoryExplorer({ categories, sites }: CategoryExplorerProps) {
  const [selectedRoot, setSelectedRoot] = useState<Category | null>(null)

  const [selectedChild, setSelectedChild] = useState<Category | null>(null)

  function switchRoot(nextRoot: { id: string; [key: string]: unknown }) {
    const childStillBelongsToRoot = selectedChild && selectedChild.parentIds.includes(nextRoot.id)

    setSelectedRoot(categories.find((category) => category.id === nextRoot.id) ?? null)

    if (!childStillBelongsToRoot) {
      setSelectedChild(null)
    }
  }

  function selectChild(category: Category) {
    setSelectedChild(category)
  }

  const rootCategories = useMemo(() => {
    return categories.filter((category) => category.parentIds.length === 0)
  }, [categories])

  const childCategories = useMemo(() => {
    if (!selectedRoot) {
      return []
    }

    return categories.filter((category) => category.parentIds.includes(selectedRoot.id))
  }, [categories, selectedRoot])

  const filteredSites = useMemo(() => {
    if (!selectedRoot || !selectedChild) {
      return []
    }

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

  function selectRoot(category: Category) {
    setSelectedRoot(category)
    setSelectedChild(null)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-14 lg:py-14">
        <header className="mb-16 max-w-4xl">
          <div className="mb-7 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-300">
            <span className="h-px w-12 bg-cyan-300" />
            Curated digital spaces
          </div>

          <h1 className="max-w-4xl text-5xl font-medium leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-9xl">
            Explore.
            <span className="block text-zinc-600">Select.</span>
            Discover.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Parcours les univers, affine ta sélection et découvre les projets qui correspondent
            vraiment à tes envies.
          </p>
        </header>

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

        {!selectedRoot && (
          <section>
            <div className="mb-7 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Niveau 01</p>

                <h2 className="mt-2 text-3xl tracking-tight">Choisis un univers</h2>
              </div>

              <span className="text-sm text-zinc-600">{rootCategories.length} univers</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rootCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  onSelect={switchRoot}
                />
              ))}
            </div>
          </section>
        )}

        {selectedRoot && !selectedChild && (
          <section>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Niveau 02</p>

              <h2 className="mt-2 text-3xl tracking-tight">Affiner {selectedRoot.name}</h2>
            </div>

            {childCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((category, index) => {
                  const contextualSiteCount = sites.filter((site) => {
                    const belongsToParent = site.categoryIds.includes(selectedRoot.id)

                    const belongsToChild = site.categoryIds.includes(category.id)

                    return belongsToParent && belongsToChild
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
              <EmptyState text="Aucun filtre secondaire pour cet univers." />
            )}
          </section>
        )}

        {selectedRoot && selectedChild && (
          <section>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Sélection finale
                </p>

                <h2 className="mt-2 text-3xl tracking-tight">Sites sélectionnés</h2>
              </div>

              <span className="text-sm text-zinc-500">
                {filteredSites.length} résultat
                {filteredSites.length > 1 ? 's' : ''}
              </span>
            </div>

            {filteredSites.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredSites.map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/50"
                  >
                    {site.mobileScreenshot ? (
                      <img
                        src={site.mobileScreenshot}
                        alt=""
                        className="h-[100px] w-[80px] z-10 absolute bottom-5 right-5 object-cover transition duration-700"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-cyan-300/20">
                        {site.title.charAt(0)}
                      </div>
                    )}

                    <div className="relative aspect-[1.5] overflow-hidden bg-zinc-900 ">
                      {site.desktopScreenshot ? (
                        <div className="h-full w-full object-cover transition duration-700 overflow-y-auto">
                          <img
                            src={site.desktopScreenshot}
                            alt=""
                            className="h-full w-full object-cover transition duration-700"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl text-cyan-300/20">
                          {site.title.charAt(0)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                      <span className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.2em] text-cyan-200">
                        Ouvrir ↗
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl tracking-tight">{site.title}</h3>

                      <p className="mt-2 truncate text-sm text-zinc-500">{site.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState text="Aucun site ne correspond à ces deux catégories." />
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 px-6 py-16 text-center">
      <p className="text-zinc-400">{text}</p>
    </div>
  )
}
