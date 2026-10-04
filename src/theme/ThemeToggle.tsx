import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const

export function ThemeToggle({ className }: { className?: string }) {
  const { pref, cycle } = useTheme()
  const Icon = ICONS[pref]
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${pref}. Click to change.`}
      title={`Theme: ${pref}`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  )
}
