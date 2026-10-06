import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { Link, useLocation, useNavigate } from 'react-router'
import { NAV_SECTIONS } from '@/data/sections'
import { scrollToId, scrollToTop } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/theme/ThemeToggle'

export function Nav({ active, extra }: { active: string | null; extra?: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  const go = (id: string) => {
    setOpen(false)
    if (pathname === '/' && scrollToId(id)) return
    navigate('/', { state: { scrollTo: id } })
  }

  return (
    <header className="glass fixed inset-x-0 top-0 z-40 border-b border-line">
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#2bff88] via-[#00d4c8] to-[#8a4bff]"
      />
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault()
              scrollToTop()
            }
          }}
          className="text-lg font-semibold tracking-tight"
        >
          SS<span className="text-accent">.</span>
          <span className="sr-only"> Satyam Soni — home</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-current={active === s.id ? 'true' : undefined}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active === s.id ? 'bg-fg/[.06] text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {extra}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-fg/[.06] hover:text-fg lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line px-4 lg:hidden"
          >
            {NAV_SECTIONS.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => go(s.id)} className="block w-full py-3 text-left text-lg font-medium">
                  {s.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
