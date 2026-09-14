'use client'

export type CategoryCardData = {
  id: string
  name: string
  imageUrl: string | null
  parentIds: string[]
  childCount: number
  siteCount: number
}

type BaseCategoryProps = {
  category: CategoryCardData
  index: number
  onSelect: (category: CategoryCardData) => void
}

/* ── Niveau 01 · rangée éditoriale indexée ───────────────────── */

export function RootCategoryRow({ category, index, onSelect }: BaseCategoryProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group grid w-full animate-in fade-in slide-in-from-bottom-2 fill-mode-both grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-5 text-left transition-colors duration-300 hover:bg-[#1c1a15]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff008e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ea] sm:grid-cols-[auto_auto_1fr_auto] sm:gap-6 sm:px-3 sm:py-6 dark:hover:bg-[#ede8dc]/5 dark:focus-visible:ring-offset-[#141210]"
    >
      <span className="w-8 font-mono text-xs text-[#ff008e] sm:w-10">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Vignette */}
      <span className="hidden h-14 w-20 shrink-0 overflow-hidden border border-[#1c1a15]/15 bg-[#e7e1d3] sm:block dark:border-[#ede8dc]/15 dark:bg-[#242019]">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-2xl italic text-[#1c1a15]/25 dark:text-[#ede8dc]/25">
            {category.name.charAt(0)}
          </span>
        )}
      </span>

      {/* Nom + méta */}
      <span className="min-w-0">
        <span className="block truncate font-serif text-2xl tracking-tight sm:text-[1.75rem]">
          {category.name}
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#1c1a15]/45 dark:text-[#ede8dc]/45">
          {category.childCount} sous-catégorie{category.childCount > 1 ? 's' : ''}
        </span>
      </span>

      {/* Flèche */}
      <span className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-[#1c1a15]/25 text-sm transition-all duration-300 group-hover:border-[#ff008e] group-hover:bg-[#ff008e] group-hover:text-white dark:border-[#ede8dc]/25">
        <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
    </button>
  )
}

/* ── Niveau 02 · carte thématique (image en haut, texte en bas) ── */

type CategoryCardProps = BaseCategoryProps & {
  countOverride?: number
}

export default function CategoryCard({
  category,
  index,
  onSelect,
  countOverride,
}: CategoryCardProps) {
  const isLeaf = category.childCount === 0

  const count =
    countOverride !== undefined ? countOverride : isLeaf ? category.siteCount : category.childCount

  const label = isLeaf ? `site${count > 1 ? 's' : ''}` : `thème${count > 1 ? 's' : ''}`

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group flex h-full w-full animate-in fade-in fill-mode-both flex-col border border-[#1c1a15]/15 bg-[#fbf9f4] text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1c1a15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff008e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ea] dark:border-[#ede8dc]/15 dark:bg-[#1b1814] dark:hover:border-[#ede8dc] dark:focus-visible:ring-offset-[#141210]"
    >
      {/* Image en haut, pleine largeur */}
      <span className="relative block aspect-[4/3] w-full overflow-hidden border-b border-[#1c1a15]/15 bg-[#e7e1d3] dark:border-[#ede8dc]/15 dark:bg-[#242019]">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-serif text-6xl italic text-[#1c1a15]/15 dark:text-[#ede8dc]/15">
            {category.name.charAt(0)}
          </span>
        )}

        <span className="absolute left-3 top-3 border border-[#1c1a15]/20 bg-[#f4f1ea]/90 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-[#1c1a15] backdrop-blur-sm dark:border-[#ede8dc]/20 dark:bg-[#141210]/90 dark:text-[#ede8dc]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>

      {/* Texte en dessous */}
      <span className="flex flex-1 flex-col justify-between p-5">
        <span className="block font-serif text-xl tracking-tight sm:text-2xl">{category.name}</span>

        <span className="mt-5 flex items-center justify-between border-t border-[#1c1a15]/10 pt-4 dark:border-[#ede8dc]/10">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1c1a15]/55 dark:text-[#ede8dc]/55">
            {count} {label}
          </span>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff008e] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            Ouvrir →
          </span>
        </span>
      </span>
    </button>
  )
}
