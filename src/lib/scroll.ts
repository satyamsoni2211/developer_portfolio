import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll(): () => void {
  if (prefersReduced()) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.12 })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  if (lenis) lenis.scrollTo(el, { offset: -64 })
  else el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
  return true
}

export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' })
}
