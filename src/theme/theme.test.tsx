import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { nextPref, readPref, resolveTheme, writePref } from './theme'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => vi.restoreAllMocks())

describe('theme logic', () => {
  test('resolveTheme follows system unless overridden', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  test('nextPref cycles dark → light → system → dark', () => {
    expect(nextPref('dark')).toBe('light')
    expect(nextPref('light')).toBe('system')
    expect(nextPref('system')).toBe('dark')
  })

  test('nothing stored defaults to dark', () => {
    expect(readPref()).toBe('dark')
  })

  test('every pref persists, including system', () => {
    writePref('light')
    expect(readPref()).toBe('light')
    writePref('system')
    expect(localStorage.getItem('theme')).toBe('system')
    expect(readPref()).toBe('system')
    writePref('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(readPref()).toBe('dark')
  })

  test('garbage or blocked storage falls back to dark', () => {
    localStorage.setItem('theme', 'purple')
    expect(readPref()).toBe('dark')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readPref()).toBe('dark')
    expect(() => writePref('dark')).not.toThrow()
  })
})

function mockSystemDark(dark: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: dark,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  )
}

describe('ThemeToggle', () => {
  test('starts dark, then cycles light and system, applying data-theme on <html>', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button', { name: /theme: dark/i })).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('dark')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /theme: light/i })).toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: /theme: system/i })).toBeInTheDocument()
    expect(localStorage.getItem('theme')).toBe('system')
  })

  test.each([
    [true, 'dark'],
    [false, 'light'],
  ])('a stored system pref follows the OS (dark=%s → %s)', (osDark, expected) => {
    localStorage.setItem('theme', 'system')
    mockSystemDark(osDark)
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(document.documentElement.dataset.theme).toBe(expected)
  })
})
