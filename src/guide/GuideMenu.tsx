import { useEffect, useRef, type ReactNode } from 'react'
import { Copy, EyeOff, Palette, X } from 'lucide-react'
import { useMotionValue } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { useToast } from '@/components/Toast'
import { profile } from '@/data/profile'
import { SECTIONS } from '@/data/sections'
import { copyText } from '@/lib/clipboard'
import { scrollToId } from '@/lib/scroll'
import { useTheme } from '@/theme/ThemeProvider'
import { Badge } from './Badge'
import { useGuide } from './GuideProvider'

const DESTINATIONS = [{ id: 'hero', label: 'Top' }, ...SECTIONS]

function Row({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-fg/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  )
}

export default function GuideMenu() {
  const { closeMenu, setHidden } = useGuide()
  const { pref, cycle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ref = useRef<HTMLDialogElement>(null)
  const still = useMotionValue(0)

  // Idempotent and no close() in cleanup: StrictMode re-runs effects, and close() would fire
  // onClose → closeMenu. Unmounting removes the dialog, which takes it out of the top layer.
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const go = (id: string) => {
    closeMenu()
    if (pathname === '/' && scrollToId(id)) return
    navigate('/', { state: { scrollTo: id } })
  }

  const copy = async () => {
    toast((await copyText(profile.email)) ? 'Email copied' : profile.email)
    closeMenu()
  }

  return (
    <dialog
      ref={ref}
      aria-label="Guide menu"
      onClose={closeMenu}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close()
      }}
      className="glass m-auto w-[min(92vw,360px)] rounded-3xl border border-line p-0 text-fg shadow-2xl backdrop:bg-black/30 backdrop:backdrop-blur-sm"
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0">
            <Badge gazeX={still} gazeY={still} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Where to?</p>
            <p className="text-sm text-muted">I&apos;ll take you there.</p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close guide menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-fg/[.06]"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => go(d.id)}
                className="w-full rounded-xl bg-fg/[.05] px-3 py-2.5 text-left text-sm font-medium hover:bg-fg/[.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {d.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-3">
          <Row icon={<Palette className="h-4 w-4" />} onClick={cycle}>
            Theme: {pref[0].toUpperCase() + pref.slice(1)}
          </Row>
          <Row icon={<Copy className="h-4 w-4" />} onClick={copy}>
            Copy email
          </Row>
          <Row
            icon={<EyeOff className="h-4 w-4" />}
            onClick={() => {
              setHidden(true)
              closeMenu()
            }}
          >
            Hide guide
          </Row>
        </div>
      </div>
    </dialog>
  )
}
