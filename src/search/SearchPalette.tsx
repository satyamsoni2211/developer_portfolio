import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { scrollToId } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { searchPortfolio, type SearchItem } from './searchIndex'

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  // Captured during the first render, before autoFocus moves focus into the dialog.
  const [opener] = useState(() => document.activeElement as HTMLElement | null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uid = useId()
  const listId = `${uid}-list`
  const optionId = (i: number) => `${uid}-opt-${i}`

  const results = useMemo(() => searchPortfolio(query), [query])
  const groups = useMemo(() => {
    const out: { name: string; entries: { item: SearchItem; i: number }[] }[] = []
    results.forEach((item, i) => {
      const last = out[out.length - 1]
      if (last && last.name === item.group) last.entries.push({ item, i })
      else out.push({ name: item.group, entries: [{ item, i }] })
    })
    return out
  }, [results])
  const current = Math.min(active, Math.max(results.length - 1, 0))

  useEffect(() => {
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = overflow
      opener?.focus?.()
    }
  }, [opener])

  useEffect(() => {
    document.getElementById(optionId(current))?.scrollIntoView?.({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, results])

  // Keep Tab inside the dialog even when focus has fallen to the page behind.
  useEffect(() => {
    const trap = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Tab') e.preventDefault()
    }
    window.addEventListener('keydown', trap)
    return () => window.removeEventListener('keydown', trap)
  }, [])

  const activate = (item: SearchItem | undefined) => {
    if (!item) return
    onClose()
    const t = item.target
    if (t.kind === 'section') {
      if (pathname === '/' && scrollToId(t.id)) return
      navigate('/', { state: { scrollTo: t.id } })
    } else if (t.kind === 'route') {
      navigate(t.to)
    } else {
      window.open(t.url, '_blank', 'noopener,noreferrer')
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const last = results.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive(current >= last ? 0 : current + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive(current <= 0 ? last : current - 1)
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(Math.max(last, 0))
        break
      case 'Enter':
        if (e.nativeEvent.isComposing) break
        e.preventDefault()
        activate(results[current])
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'Tab':
        e.preventDefault()
        break
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search the portfolio"
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => {
          if (e.target !== inputRef.current) e.preventDefault()
        }}
        className="card w-full max-w-[36rem] overflow-hidden !rounded-2xl"
      >
        <input
          ref={inputRef}
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? optionId(current) : undefined}
          aria-autocomplete="list"
          aria-label="Search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search projects, packages, articles…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          className="w-full border-b border-line bg-transparent px-5 py-4 text-base text-fg placeholder:text-muted/70 focus-visible:outline-none"
        />
        <div
          id={listId}
          role="listbox"
          aria-label="Results"
          data-lenis-prevent
          className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
        >
          {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">No results for “{query.trim()}”</p>}
          {groups.map((g) => (
            <div key={g.name} role="group" aria-labelledby={`${uid}-group-${g.name}`}>
              <p
                id={`${uid}-group-${g.name}`}
                className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                {g.name}
              </p>
              {g.entries.map(({ item, i }) => (
                <div
                  key={item.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === current}
                  onMouseMove={() => i !== current && setActive(i)}
                  onClick={() => activate(item)}
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2',
                    i === current ? 'bg-fg/[.08]' : 'hover:bg-fg/[.05]',
                  )}
                >
                  <p className="truncate text-sm font-medium text-fg">{item.title}</p>
                  {item.subtitle && <p className="truncate text-xs text-muted">{item.subtitle}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="border-t border-line px-5 py-2.5 text-xs text-muted">↑↓ to navigate · ↵ to open · esc to close</p>
      </motion.div>
    </div>
  )
}
