import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { DARK_MAX_LUM, LIGHT_MIN_LUM } from '../src/background/auroraGl'
import { LIGHT_FALLBACK_OPACITY, lightStops, PALETTES, paletteGradient } from '../src/background/palettes'

// Text sits directly on the aurora. The shader holds the background to these luminance budgets,
// so every text colour must clear WCAG AA (4.5:1) against the worst background the budget allows.
const css = readFileSync('src/index.css', 'utf8')
const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)))
const token = (b: string, name: string) => b.match(new RegExp(`--${name}: (\\d+) (\\d+) (\\d+);`))!.slice(1).map(Number)
const lum = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

describe('text over the aurora', () => {
  const light = block(':root {')
  const dark = block(":root[data-theme='dark']")
  for (const name of ['fg', 'fg-muted', 'accent', 'danger']) {
    test(`dark --${name} vs the brightest allowed aurora`, () => {
      expect(contrast(lum(token(dark, name)), DARK_MAX_LUM)).toBeGreaterThanOrEqual(4.5)
    })
    test(`light --${name} vs the darkest allowed daylight aurora`, () => {
      expect(contrast(lum(token(light, name)), LIGHT_MIN_LUM)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('glass cards never reduce text contrast', () => {
  const card = (b: string) => b.match(/--card: rgba\((\d+), (\d+), (\d+), ([\d.]+)\);/)!.slice(1).map(Number)
  const light = block(':root {')
  const dark = block(":root[data-theme='dark']")

  test('light card is a white veil: it can only raise the page luminance', () => {
    const [r, g, b, a] = card(light)
    expect(lum([r, g, b])).toBeGreaterThanOrEqual(LIGHT_MIN_LUM)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })

  test('dark card is a dark veil: it can only lower the page luminance', () => {
    const [r, g, b, a] = card(dark)
    expect(lum([r, g, b])).toBeLessThanOrEqual(DARK_MAX_LUM)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })

  test('the light floor is low enough for the aurora to show colour', () => {
    expect(LIGHT_MIN_LUM).toBeLessThanOrEqual(0.7)
  })

  test('the OS-dark block matches the explicit dark theme', () => {
    const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'))
    const os = media.slice(media.indexOf(':root:not('), media.indexOf('}', media.indexOf(':root:not(')))
    for (const name of ['fg', 'fg-muted', 'accent']) expect(token(os, name)).toEqual(token(dark, name))
    expect(card(os)).toEqual(card(dark))
  })
})

describe('light-mode CSS fallback gradient honours the luminance floor', () => {
  const bg = [251, 251, 253]
  for (const [id, pal] of Object.entries(PALETTES)) {
    test(`${id}: all three peaks stacked stay >= LIGHT_MIN_LUM`, () => {
      let px = bg.slice()
      for (const { rgb, alpha } of lightStops(pal)) {
        const a = alpha * LIGHT_FALLBACK_OPACITY
        px = px.map((v, i) => v * (1 - a) + rgb[i] * 255 * a)
      }
      expect(lum(px)).toBeGreaterThanOrEqual(LIGHT_MIN_LUM)
    })
  }

  test('dark-mode gradient is unchanged', () => {
    expect(paletteGradient(PALETTES.hero, false)).toBe(
      'radial-gradient(70% 45% at 18% 8%, rgba(43, 255, 136, 0.42), transparent 70%), ' +
        'radial-gradient(60% 40% at 78% 4%, rgba(0, 212, 200, 0.36), transparent 70%), ' +
        'radial-gradient(80% 50% at 50% 0%, rgba(59, 108, 255, 0.28), transparent 75%)',
    )
  })
})
