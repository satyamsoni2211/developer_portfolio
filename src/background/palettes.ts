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

/** Static CSS stand-in for the WebGL aurora (no WebGL / reduced motion). */
export function paletteGradient(pal: Palette): string {
  return [
    `radial-gradient(70% 45% at 18% 8%, ${rgba(pal[0], 0.42)}, transparent 70%)`,
    `radial-gradient(60% 40% at 78% 4%, ${rgba(pal[1], 0.36)}, transparent 70%)`,
    `radial-gradient(80% 50% at 50% 0%, ${rgba(pal[2], 0.28)}, transparent 75%)`,
  ].join(', ')
}
