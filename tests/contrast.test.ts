import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { DARK_MAX_LUM, LIGHT_MIN_LUM } from '../src/background/auroraGl'

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
  for (const name of ['fg', 'fg-muted', 'accent']) {
    test(`dark --${name} vs the brightest allowed aurora`, () => {
      expect(contrast(lum(token(dark, name)), DARK_MAX_LUM)).toBeGreaterThanOrEqual(4.5)
    })
    test(`light --${name} vs the darkest allowed dawn wash`, () => {
      expect(contrast(lum(token(light, name)), LIGHT_MIN_LUM)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
