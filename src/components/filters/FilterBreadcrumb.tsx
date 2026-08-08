'use client'

export type BreadcrumbCategory = {
  id: string
  name: string
  parentIds: string[]
}

type FilterBreadcrumbProps = {
  rootCategories: BreadcrumbCategory[]
  selectedRoot: BreadcrumbCategory | null
  selectedChild: BreadcrumbCategory | null
  onReset: () => void
  onRootChange: (category: BreadcrumbCategory) => void
  onChildReset: () => void
}

export default function FilterBreadcrumb({
  rootCategories,
  selectedRoot,
  selectedChild,
  onReset,
  onRootChange,
  onChildReset,
}: FilterBreadcrumbProps) {
  return (
    <nav aria-label="Navigation des filtres" className="mb-10 space-y-5">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={onReset}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
            !selectedRoot
              ? 'border-cyan-300 bg-cyan-300 text-zinc-950'
              : 'border-white/15 text-zinc-400 hover:border-white/40 hover:text-white'
          }`}
        >
          Tous les univers
        </button>

        {rootCategories.map((root) => {
          const isActive = selectedRoot?.id === root.id

          return (
            <button
              key={root.id}
              type="button"
              onClick={() => onRootChange(root)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-cyan-300 bg-cyan-300 text-zinc-950'
                  : 'border-white/15 text-zinc-400 hover:border-white/40 hover:text-white'
              }`}
            >
              {root.name}
            </button>
          )
        })}
      </div>

      {selectedRoot && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600">Parcours actuel :</span>

          <button
            type="button"
            onClick={onChildReset}
            className={`transition ${
              selectedChild ? 'text-zinc-400 hover:text-cyan-300' : 'text-cyan-300'
            }`}
          >
            {selectedRoot.name}
          </button>

          {selectedChild && (
            <>
              <span className="text-zinc-700">/</span>

              <span aria-current="page" className="text-cyan-300">
                {selectedChild.name}
              </span>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
