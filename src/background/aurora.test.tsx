import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { SplitHeading } from '@/components/SplitHeading'
import { tiltFromPointer } from '@/components/TiltCard'
import { SECTION_IDS } from '@/data/sections'
import { Aurora } from './Aurora'
import { mixPalette, paletteFor, PALETTES } from './palettes'

afterEach(() => vi.restoreAllMocks())

describe('palettes', () => {
  test('every section has a palette and project pages use the projects palette', () => {
    for (const id of SECTION_IDS) expect(PALETTES[id], id).toHaveLength(3)
    expect(paletteFor('project:stryve')).toBe(PALETTES.projects)
    expect(paletteFor('unknown')).toBe(PALETTES.hero)
  })

  test('mixPalette interpolates and clamps', () => {
    const a = PALETTES.hero
    const b = PALETTES.projects
    expect(mixPalette(a, b, 0)).toEqual(a)
    expect(mixPalette(a, b, 1)).toEqual(b)
    expect(mixPalette(a, b, 2)).toEqual(b)
    const mid = mixPalette(a, b, 0.5)
    expect(mid[0][0]).toBeCloseTo((a[0][0] + b[0][0]) / 2)
  })
})

describe('tiltFromPointer', () => {
  const rect = { left: 100, top: 100, width: 200, height: 100 }
  test('centre is flat, glare centred', () => {
    expect(tiltFromPointer(200, 150, rect)).toEqual({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 })
  })
  test('corners reach ±max and are clamped outside', () => {
    expect(tiltFromPointer(300, 100, rect)).toEqual({ rotateX: 6, rotateY: 6, glareX: 100, glareY: 0 })
    expect(tiltFromPointer(-500, 900, rect, 6)).toEqual({ rotateX: -6, rotateY: -6, glareX: 0, glareY: 100 })
  })
})

describe('Aurora', () => {
  test('falls back to a CSS gradient when WebGL is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { container } = render(
      <AppProviders>
        <Aurora context="hero" />
      </AppProviders>,
    )
    const fallback = container.querySelector('[data-aurora="fallback"]') as HTMLElement
    expect(fallback).toBeInTheDocument()
    expect(fallback.style.backgroundImage).toContain('radial-gradient')
    await new Promise((r) => setTimeout(r, 400))
    expect(container.querySelector('canvas')).toBeNull()
  })
})

describe('SplitHeading', () => {
  test('observes the heading itself, not the masked (clipped) words', () => {
    const observed: Element[] = []
    const Original = globalThis.IntersectionObserver
    class Spy {
      observe(el: Element) {
        observed.push(el)
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    vi.stubGlobal('IntersectionObserver', Spy)
    render(<SplitHeading as="h2" text="Things I've designed" />)
    vi.stubGlobal('IntersectionObserver', Original)
    expect(observed.map((el) => el.tagName)).toEqual(['H2'])
  })

  test('keeps the full text as the accessible name', () => {
    render(<SplitHeading as="h2" text="Things I've designed and shipped." />)
    expect(screen.getByRole('heading', { level: 2, name: "Things I've designed and shipped." })).toBeInTheDocument()
  })
})
