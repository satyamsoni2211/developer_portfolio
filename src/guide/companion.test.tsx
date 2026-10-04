import { StrictMode } from 'react'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { Companion } from './Companion'
import { GuideProvider, useGuide } from './GuideProvider'

/** The hero head was last seen near the top of the page (as when scrolling past the hero). */
function SeedHeadRect() {
  const { heroHeadRect: headRectRef } = useGuide()
  headRectRef.current ??= new DOMRect(400, -50, 80, 100)
  return null
}

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

test('with no known pointer the companion settles bottom-right, even under StrictMode', async () => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === '(pointer: fine)',
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  Object.assign(window, { innerWidth: 1000, innerHeight: 800 })
  const { container } = render(
    <StrictMode>
      <AppProviders>
        <MemoryRouter>
          <GuideProvider context="skills">
            <SeedHeadRect />
            <Companion />
          </GuideProvider>
        </MemoryRouter>
      </AppProviders>
    </StrictMode>,
  )
  const el = container.querySelector('[data-guide]') as HTMLElement
  await waitFor(() => expect(el.style.transform).toMatch(/translateX\(90[34](\.\d+)?px\) translateY\(70[34](\.\d+)?px\)/), { timeout: 4000 })
})
