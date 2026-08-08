'use client'

import type { CategoryCardData } from '@/components/category/CategoryCard'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FilterBarProps = {
  rootCategories: CategoryCardData[]
  childCategories: CategoryCardData[]
  selectedRoot: CategoryCardData | null
  selectedChild: CategoryCardData | null
  onReset: () => void
  onRootChange: (category: CategoryCardData) => void
  onChildChange: (category: CategoryCardData) => void
  onChildReset: () => void
}

function CategoryVisual({
  category,
  placeholder,
  compact = false,
}: {
  category?: CategoryCardData | null
  placeholder: string
  compact?: boolean
}) {
  if (!category) {
    return <span className="truncate text-sm text-zinc-500">{placeholder}</span>
  }

  const imageSize = compact ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <span className="flex min-w-0 items-center gap-3">
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt=""
          width={compact ? 24 : 32}
          height={compact ? 24 : 32}
          className={`${imageSize} shrink-0 rounded-md object-cover`}
        />
      ) : (
        <span
          className={`${imageSize} flex shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-xs text-cyan-300`}
        >
          {category.name.charAt(0).toUpperCase()}
        </span>
      )}

      <span className="truncate text-sm text-white">{category.name}</span>
    </span>
  )
}

export default function FilterBar({
  rootCategories,
  childCategories,
  selectedRoot,
  selectedChild,
  onReset,
  onRootChange,
  onChildChange,
  onChildReset,
}: FilterBarProps) {
  const handleBack = () => {
    if (selectedChild) {
      onChildReset()
      return
    }

    if (selectedRoot) {
      onReset()
    }
  }

  const handleRootChange = (value: string | null) => {
    if (!value) return
    const nextRoot = rootCategories.find((category) => category.id === value)

    if (nextRoot) {
      onRootChange(nextRoot)
    }
  }

  const handleChildChange = (value: string | null) => {
    if (!value) return
    const nextChild = childCategories.find((category) => category.id === value)

    if (nextChild) {
      onChildChange(nextChild)
    }
  }

  return (
    <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleBack}
        disabled={!selectedRoot}
        aria-label={selectedChild ? 'Revenir à la catégorie principale' : 'Revenir aux univers'}
        className="h-12 w-12 shrink-0 rounded-full border-white/15 bg-white/[0.04] text-white hover:border-cyan-300 hover:bg-cyan-300 hover:text-zinc-950 disabled:opacity-30"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Select value={selectedRoot?.id ?? ''} onValueChange={handleRootChange}>
        <SelectTrigger className="h-14 flex-1 rounded-2xl border-white/15 bg-white/[0.05] px-4 text-white shadow-none hover:border-cyan-300 focus:ring-0">
          <SelectValue aria-label={selectedRoot?.name ?? 'Choisir un univers'}>
            <CategoryVisual category={selectedRoot} placeholder="Choisir un univers" />
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          side="bottom"
          sideOffset={6}
          align="start"
          className="z-[100] max-h-80 w-[var(--radix-select-trigger-width)] min-w-0 rounded-2xl border-white/10 bg-zinc-950 p-1 text-white shadow-2xl"
        >
          {rootCategories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="h-10 w-full rounded-xl py-1.5 pl-3 pr-8 focus:bg-cyan-300 focus:text-zinc-950"
            >
              <CategoryVisual category={category} placeholder="" compact />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRoot && (
        <Select value={selectedChild?.id ?? ''} onValueChange={handleChildChange}>
          <SelectTrigger className="h-14 flex-1 rounded-2xl border-cyan-300/40 bg-cyan-300/10 px-4 text-cyan-100 shadow-none hover:border-cyan-300 focus:ring-0">
            <SelectValue aria-label={selectedChild?.name ?? `Affiner ${selectedRoot.name}`}>
              <CategoryVisual
                category={selectedChild}
                placeholder={`Affiner ${selectedRoot.name}`}
              />
            </SelectValue>
          </SelectTrigger>

          <SelectContent
            side="bottom"
            sideOffset={6}
            align="start"
            className="z-[100] max-h-80 w-[var(--radix-select-trigger-width)] min-w-0 rounded-2xl border-white/10 bg-zinc-950 p-1 text-white shadow-2xl"
          >
            {childCategories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="h-10 w-full rounded-xl py-1.5 pl-3 pr-8 focus:bg-cyan-300 focus:text-zinc-950"
              >
                <CategoryVisual category={category} placeholder="" compact />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
