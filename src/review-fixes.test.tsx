import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { nextPlacement } from '@/guide/geometry'
import { routes } from '@/routes'
import { Skills } from '@/sections/Skills'
import { scrollToId } from '@/lib/scroll'
import { renderRoute } from '@/test/render'

vi.mock('@/lib/scroll', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/scroll')>()),
  scrollToId: vi.fn(() => true),
}))

const tick = (ms = 50) => act(() => new Promise((r) => setTimeout(r, ms)))

afterEach(() => vi.restoreAllMocks())

describe('final review fixes', () => {
  test('canonical and og:url follow the current route', async () => {
    renderRoute('/projects/stryve')
    await screen.findByRole('heading', { level: 1, name: 'Stryve' })
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.satyamsoni.com/projects/stryve')
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://www.satyamsoni.com/projects/stryve')
  })

  test('companion placement keeps identity when unchanged (no per-move re-render)', () => {
    const prev = { below: false, left: true }
    expect(nextPlacement(prev, { below: false, left: true })).toBe(prev)
    expect(nextPlacement(prev, { below: true, left: true })).toEqual({ below: true, left: true })
  })

  test('no guide badge flashes on Home before the hero is measured', async () => {
    class SilentObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    const original = globalThis.IntersectionObserver
    vi.stubGlobal('IntersectionObserver', SilentObserver)
    renderRoute('/')
    await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ })
    await tick(100)
    expect(screen.queryByRole('button', { name: 'Open guide' })).not.toBeInTheDocument()
    vi.stubGlobal('IntersectionObserver', original)
  })

  test('scrollTo state is honoured on PUSH but not replayed on POP (back/reload)', async () => {
    const spy = vi.mocked(scrollToId)
    spy.mockClear()
    const router = createMemoryRouter(routes, { initialEntries: [{ pathname: '/', state: { scrollTo: 'contact' } }] })
    render(<AppProviders><RouterProvider router={router} /></AppProviders>)
    await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ })
    await tick()
    expect(spy).not.toHaveBeenCalled()
    await act(() => router.navigate('/', { state: { scrollTo: 'skills' } }))
    await tick()
    expect(spy).toHaveBeenCalledWith('skills')
  })

  test('skills marquee can be paused without a mouse', () => {
    render(<AppProviders><Skills /></AppProviders>)
    const button = screen.getByRole('button', { name: /pause/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelector('.marquee')).toHaveAttribute('data-paused', 'true')
  })
})
