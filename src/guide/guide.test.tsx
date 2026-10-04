import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { GuideProvider, useGuide } from './GuideProvider'
import { HeroCharacter } from './HeroCharacter'
import { fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { renderRoute } from '@/test/render'
import { StrictMode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/routes'

function HiddenProbe() {
  const g = useGuide()
  return <p>hidden:{String(g.hidden)}</p>
}

describe('GuideProvider', () => {
  test('reads persisted hidden flag', () => {
    localStorage.setItem('guide-hidden', '1')
    render(
      <GuideProvider context="hero">
        <HiddenProbe />
      </GuideProvider>,
    )
    expect(screen.getByText('hidden:true')).toBeInTheDocument()
  })
})

describe('HeroCharacter', () => {
  test('renders layered images and greets once per session', async () => {
    const { container } = render(
      <AppProviders>
        <GuideProvider context="hero">
          <HeroCharacter />
        </GuideProvider>
      </AppProviders>,
    )
    expect(container.querySelectorAll('img')).toHaveLength(2)
    expect(await screen.findByText(/Let me show you around/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(sessionStorage.getItem('guide-greeted')).toBe('1')
  })
})

describe('guide layer', () => {
  test('touch/coarse pointer: docked badge opens the guide menu', async () => {
    renderRoute('/projects/stryve')
    const badge = await screen.findByRole('button', { name: 'Open guide' })
    fireEvent.click(badge)
    expect(await screen.findByText('Where to?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    expect(await screen.findByRole('button', { name: 'Show guide' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Open guide' })).not.toBeInTheDocument(), { timeout: 3000 })
    expect(localStorage.getItem('guide-hidden')).toBe('1')
  })

  test('works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderRoute('/projects/crickbuzz')
    expect(await screen.findByRole('button', { name: 'Open guide' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})

describe('guide menu under StrictMode', () => {
  test('stays open after the double-invoked effects', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/projects/stryve'] })
    render(
      <StrictMode>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </StrictMode>,
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Open guide' }))
    expect(await screen.findByText('Where to?')).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.getByText('Where to?')).toBeInTheDocument()
    expect(document.querySelector('dialog')?.open).toBe(true)
  })
})
