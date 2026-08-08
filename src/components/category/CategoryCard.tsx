'use client'

export type CategoryCardData = {
  id: string
  name: string
  imageUrl: string | null
  parentIds: string[]
  childCount: number
  siteCount: number
}

type CategoryCardProps = {
  category: CategoryCardData
  index: number
  onSelect: (category: CategoryCardData) => void
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

  const countLabel = isLeaf
    ? `site${count > 1 ? 's' : ''}`
    : `sous-catégorie${count > 1 ? 's' : ''}`

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group relative min-h-[270px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 text-left transition duration-500 hover:-translate-y-2 hover:border-cyan-300/50"
    >
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-110 group-hover:opacity-70"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#164e63,_#09090b_65%)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">{String(index + 1).padStart(2, '0')}</span>

          <span className="text-lg text-cyan-300 opacity-0 transition duration-300 group-hover:opacity-100">
            ↗
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">{category.name}</h2>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-cyan-200">
              {count} {countLabel}
            </span>

            <span className="text-sm text-zinc-500 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              Explorer →
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
