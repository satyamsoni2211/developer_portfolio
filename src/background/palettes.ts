import type { SectionId } from '@/data/sections'

export type RGB = [number, number, number]
export type Palette = [RGB, RGB, RGB]

const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB
const p = (a: string, b: string, c: string): Palette => [hex(a), hex(b), hex(c)]

/** Aurora colours per section: hero green → blues → violet → magenta/amber → back to green. */
export const PALETTES: Record<SectionId, Palette> = {
  hero: p('#2bff88', '#00d4c8', '#3b6cff'),
  about: p('#00d4c8', '#2a8cff', '#6a5cff'),
  experience: p('#2a6cff', '#5b4bff', '#00c2ff'),
  projects: p('#8a4bff', '#ff4bd8', '#4b6bff'),
  opensource: p('#2bff88', '#2a8cff', '#00d4c8'),
  writing: p('#ffb347', '#ff4bd8', '#6a5cff'),
  recommendations: p('#00c2ff', '#8a4bff', '#2bff88'),
  speaking: p('#00d4c8', '#ffb347', '#2bff88'),
  skills: p('#ff4bd8', '#ffb347', '#8a4bff'),
  education: p('#ffb347', '#7dff6a', '#00d4c8'),
  contact: p('#2bff88', '#00d4c8', '#8a4bff'),
}

export function paletteFor(context: string): Palette {
  if (context.startsWith('project:')) return PALETTES.projects
  return PALETTES[context as SectionId] ?? PALETTES.hero
}

export function mixPalette(a: Palette, b: Palette, t: number): Palette {
  const k = Math.min(1, Math.max(0, t))
  return a.map((c, i) => c.map((v, j) => v * (1 - k) + b[i][j] * k)) as Palette
}

const rgba = ([r, g, b]: RGB, alpha: number) => `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`

const PEAKS = [0.42, 0.36, 0.28]

/** Opacity of the CSS fallback layer in light mode. */
export const LIGHT_FALLBACK_OPACITY = 0.85
/** Each light-mode stop is lifted to at least this luminance, a margin above LIGHT_MIN_LUM, because stacked sRGB mixing dips slightly. */
const LIGHT_STOP_LUM = 0.74

const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const luminance = ([r, g, b]: RGB) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

/** Mix toward white (in sRGB) just far enough to reach the light-mode stop luminance. */
function liftToLight(c: RGB): RGB {
  let lo = 0
  let hi = 1
  for (let n = 0; n < 24; n++) {
    const t = (lo + hi) / 2
    if (luminance(c.map((v) => v + (1 - v) * t) as RGB) < LIGHT_STOP_LUM) lo = t
    else hi = t
  }
  return c.map((v) => v + (1 - v) * hi) as RGB
}

/** The three light-mode gradient stops: palette colours lifted toward white, with their peak alphas. */
export function lightStops(pal: Palette): { rgb: RGB; alpha: number }[] {
  return pal.map((c, i) => ({ rgb: luminance(c) >= LIGHT_STOP_LUM ? c : liftToLight(c), alpha: PEAKS[i] }))
}

/** Static CSS stand-in for the WebGL aurora (no WebGL / reduced motion). */
export function paletteGradient(pal: Palette, light = false): string {
  const [a, b, c] = light ? lightStops(pal).map((s) => s.rgb) : pal
  return [
    `radial-gradient(70% 45% at 18% 8%, ${rgba(a, PEAKS[0])}, transparent 70%)`,
    `radial-gradient(60% 40% at 78% 4%, ${rgba(b, PEAKS[1])}, transparent 70%)`,
    `radial-gradient(80% 50% at 50% 0%, ${rgba(c, PEAKS[2])}, transparent 75%)`,
  ].join(', ')
}
