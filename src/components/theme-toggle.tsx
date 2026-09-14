'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative h-8 w-8 text-[#1c1a15]/60 hover:bg-[#1c1a15]/5 hover:text-[#ff008e] dark:text-[#ede8dc]/60 dark:hover:bg-[#ede8dc]/5 dark:hover:text-[#ff008e]"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
