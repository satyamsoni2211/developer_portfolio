import { render } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { StarTrail } from './StarTrail'

const media = (matching: string[]) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  )

afterEach(() => vi.restoreAllMocks())

const mount = () => render(<AppProviders><StarTrail /></AppProviders>)

describe('StarTrail', () => {
  test('mounts a click-through, hidden-from-AT canvas for mouse users', () => {
    media(['(pointer: fine)'])
    const { container } = mount()
    const canvas = container.querySelector('canvas')!
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas.className).toContain('pointer-events-none')
  })

  test('renders nothing and listens to nothing on touch devices', () => {
    media([])
    const add = vi.spyOn(window, 'addEventListener')
    const { container } = mount()
    expect(container.querySelector('canvas')).toBeNull()
    expect(add.mock.calls.some(([type]) => type === 'pointermove')).toBe(false)
  })

  test('renders nothing when the visitor prefers reduced motion', () => {
    media(['(pointer: fine)', '(prefers-reduced-motion: reduce)'])
    const { container } = mount()
    expect(container.querySelector('canvas')).toBeNull()
  })

  test('removes its listeners on unmount', () => {
    media(['(pointer: fine)'])
    const remove = vi.spyOn(window, 'removeEventListener')
    mount().unmount()
    expect(remove.mock.calls.some(([type]) => type === 'pointermove')).toBe(true)
  })
})
