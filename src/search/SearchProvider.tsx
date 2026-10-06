import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { SearchPalette } from './SearchPalette'

type SearchContextValue = { open: () => void }

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return
      e.preventDefault()
      setIsOpen((o) => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo(() => ({ open }), [open])
  return (
    <SearchContext.Provider value={value}>
      {children}
      {isOpen && <SearchPalette onClose={close} />}
    </SearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>')
  return ctx
}

const isMac = () => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform)

export function SearchButton() {
  const { open } = useSearch()
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search"
      title="Search"
      className="inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Search aria-hidden className="h-[18px] w-[18px]" />
      <kbd aria-hidden className="hidden rounded border border-line px-1.5 font-sans text-[11px] sm:inline">
        {isMac() ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  )
}
