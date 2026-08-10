'use client'

import type { CategoryCardData } from '@/components/category/CategoryCard'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

type Category = CategoryCardData

type FilterBarProps = {
  rootCategories: Category[]
  childCategories: Category[]
  selectedRoot: Category | null
  selectedChild: Category | null
  onReset: () => void
  onRootChange: (root: Category) => void
  onChildChange: (child: Category) => void
  onChildReset: () => void
}

const chipBase =
  'group inline-flex max-w-[36vw] cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] font-normal transition-colors sm:max-w-[240px]'

const menuClasses =
  'max-h-[340px] w-64 overflow-y-auto rounded-xl border-[#1c1a15]/15 bg-[#fbf9f4] p-1.5 shadow-[0_24px_48px_-24px_rgba(28,26,21,0.35)] dark:border-[#ede8dc]/15 dark:bg-[#1b1814] dark:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]'

const itemClasses =
  'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#1c1a15]/80 focus:bg-[#1c1a15]/5 focus:text-[#e8490f] dark:text-[#ede8dc]/80 dark:focus:bg-[#ede8dc]/10 dark:focus:text-[#e8490f]'

const headingClasses =
  'px-3 pb-1.5 pt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#1c1a15]/40 dark:text-[#ede8dc]/40'

const slash = 'font-mono text-xs text-[#1c1a15]/35 dark:text-[#ede8dc]/35'

/* Simple <div> au lieu de DropdownMenuLabel :
   Base UI exige que GroupLabel soit dans <Menu.Group>,
   un heading neutre évite totalement la contrainte. */
function MenuHeading({ children }: { children: ReactNode }) {
  return <div className={headingClasses}>{children}</div>
}

export default function FilterBar(props: FilterBarProps) {
  const {
    rootCategories,
    childCategories,
    selectedRoot,
    selectedChild,
    onReset,
    onRootChange,
    onChildChange,
    onChildReset,
  } = props

  return (
    <div className="sticky top-0 z-40 -mx-5 my-10 border-y border-[#1c1a15]/15 bg-[#f4f1ea]/85 backdrop-blur-md sm:-mx-8 lg:-mx-14 dark:border-[#ede8dc]/15 dark:bg-[#141210]/85">
      <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-14">
        {/* ── Fil de parcours ─────────────────────────────── */}
        <nav aria-label="Parcours" className="flex min-w-0 items-center gap-2.5">
          {/* Racine */}
          <button
            type="button"
            onClick={onReset}
            title="Revenir au départ"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#1c1a15]/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1c1a15]/60 transition-colors hover:border-[#e8490f] hover:text-[#e8490f] dark:border-[#ede8dc]/25 dark:text-[#ede8dc]/60"
          >
            ⌂ Index
          </button>

          <span className={slash}>/</span>

          {/* Sélecteur d'univers */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    chipBase,
                    selectedRoot
                      ? 'border-[#1c1a15] bg-[#1c1a15] text-[#f4f1ea] hover:bg-[#1c1a15]/90 dark:border-[#ede8dc] dark:bg-[#ede8dc] dark:text-[#141210] dark:hover:bg-[#ede8dc]/90'
                      : 'border-[#1c1a15]/30 text-[#1c1a15]/60 hover:border-[#e8490f] hover:text-[#e8490f] dark:border-[#ede8dc]/30 dark:text-[#ede8dc]/60',
                  )}
                />
              }
            >
              <span className="truncate">{selectedRoot ? selectedRoot.name : 'Univers'}</span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className={menuClasses}>
              <MenuHeading>Univers</MenuHeading>

              {rootCategories.map((category) => {
                const isSelected = selectedRoot?.id === category.id

                return (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onRootChange(category)}
                    className={itemClasses}
                  >
                    <span className="flex-1 truncate">{category.name}</span>
                    <span className="shrink-0 text-[#1c1a15]/40 dark:text-[#ede8dc]/40">
                      {String(category.childCount).padStart(2, '0')}
                    </span>
                    {isSelected && <span className="shrink-0 text-[#e8490f]">✓</span>}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className={slash}>/</span>

          {/* Sélecteur de thème */}
          {selectedRoot ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      chipBase,
                      selectedChild
                        ? 'border-[#1c1a15] bg-[#1c1a15] text-[#f4f1ea] hover:bg-[#1c1a15]/90 dark:border-[#ede8dc] dark:bg-[#ede8dc] dark:text-[#141210] dark:hover:bg-[#ede8dc]/90'
                        : 'border-dashed border-[#1c1a15]/30 text-[#1c1a15]/50 hover:border-[#e8490f] hover:text-[#e8490f] dark:border-[#ede8dc]/30 dark:text-[#ede8dc]/50',
                    )}
                  />
                }
              >
                <span className="truncate">{selectedChild ? selectedChild.name : 'Thème…'}</span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className={menuClasses}>
                {selectedChild && (
                  <>
                    <DropdownMenuItem
                      onClick={onChildReset}
                      className={cn(itemClasses, 'text-[#e8490f] dark:text-[#e8490f]')}
                    >
                      ✕ Effacer le thème
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#1c1a15]/10 dark:bg-[#ede8dc]/10" />
                  </>
                )}

                <MenuHeading>Thèmes · {selectedRoot.name}</MenuHeading>

                {childCategories.length > 0 ? (
                  childCategories.map((category) => {
                    const isSelected = selectedChild?.id === category.id

                    return (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => onChildChange(category)}
                        className={itemClasses}
                      >
                        <span className="flex-1 truncate">{category.name}</span>
                        <span className="shrink-0 text-[#1c1a15]/40 dark:text-[#ede8dc]/40">
                          {String(category.siteCount).padStart(2, '0')}
                        </span>
                        {isSelected && <span className="shrink-0 text-[#e8490f]">✓</span>}
                      </DropdownMenuItem>
                    )
                  })
                ) : (
                  <MenuHeading>Aucun thème</MenuHeading>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                chipBase,
                'cursor-default border-dashed border-[#1c1a15]/30 text-[#1c1a15]/40 dark:border-[#ede8dc]/30 dark:text-[#ede8dc]/40',
              )}
            >
              Thème…
            </span>
          )}
        </nav>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1.5">
          {selectedRoot && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1c1a15]/55 hover:bg-transparent hover:text-[#e8490f] dark:text-[#ede8dc]/55 dark:hover:bg-transparent dark:hover:text-[#e8490f]"
            >
              Réinitialiser ✕
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
