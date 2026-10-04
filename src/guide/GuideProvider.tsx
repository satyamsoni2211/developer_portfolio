import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { safeGet, safeRemove, safeSet } from '@/lib/storage'
import type { Point } from './geometry'

export type GuideContextValue = {
  context: string
  hidden: boolean
  setHidden: (v: boolean) => void
  heroVisible: boolean
  setHeroVisible: (v: boolean) => void
  heroHeadRect: RefObject<DOMRect | null>
  pointer: RefObject<Point | null>
  shownTips: RefObject<Set<string>>
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
}

const GuideContext = createContext<GuideContextValue | null>(null)
const HIDDEN_KEY = 'guide-hidden'

export function GuideProvider({ context, children }: { context: string; children: ReactNode }) {
  const [hidden, setHiddenState] = useState(() => safeGet(HIDDEN_KEY) === '1')
  const [heroVisible, setHeroVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const heroHeadRect = useRef<DOMRect | null>(null)
  const pointer = useRef<Point | null>(null)
  const shownTips = useRef(new Set<string>())

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const setHidden = useCallback((v: boolean) => {
    setHiddenState(v)
    if (v) safeSet(HIDDEN_KEY, '1')
    else safeRemove(HIDDEN_KEY)
  }, [])
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const value = useMemo(
    () => ({ context, hidden, setHidden, heroVisible, setHeroVisible, heroHeadRect, pointer, shownTips, menuOpen, openMenu, closeMenu }),
    [context, hidden, setHidden, heroVisible, menuOpen, openMenu, closeMenu],
  )
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuide(): GuideContextValue {
  const ctx = useContext(GuideContext)
  if (!ctx) throw new Error('useGuide must be used inside <GuideProvider>')
  return ctx
}
