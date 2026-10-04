import { lazy, Suspense } from 'react'
import { Sparkles } from 'lucide-react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { Companion } from './Companion'
import { Docked } from './Docked'
import { useGuide } from './GuideProvider'

const GuideMenu = lazy(() => import('./GuideMenu'))

export function GuideLayer() {
  const { hidden, heroVisible, menuOpen } = useGuide()
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const show = !hidden && !(pathname === '/' && heroVisible)
  const follow = finePointer && !reduce

  return (
    <>
      <AnimatePresence>{show && (follow ? <Companion key="companion" /> : <Docked key="docked" />)}</AnimatePresence>
      {menuOpen && (
        <Suspense fallback={null}>
          <GuideMenu />
        </Suspense>
      )}
    </>
  )
}

export function GuideNavButton() {
  const { hidden, setHidden } = useGuide()
  if (!hidden) return null
  return (
    <button
      type="button"
      onClick={() => setHidden(false)}
      aria-label="Show guide"
      title="Show guide"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Sparkles aria-hidden className="h-[18px] w-[18px]" />
    </button>
  )
}

export function GuideSkipLink() {
  const { openMenu, hidden } = useGuide()
  if (hidden) return null
  return (
    <button
      type="button"
      onClick={openMenu}
      className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-40 focus:top-3"
    >
      Open guide menu
    </button>
  )
}
