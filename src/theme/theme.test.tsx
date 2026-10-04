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

  test('nextPref cycles system → light → dark → system', () => {
    expect(nextPref('system')).toBe('light')
    expect(nextPref('light')).toBe('dark')
    expect(nextPref('dark')).toBe('system')
  })

  test('pref persists; system clears the key', () => {
    writePref('dark')
    expect(readPref()).toBe('dark')
    writePref('system')
    expect(localStorage.getItem('theme')).toBeNull()
    expect(readPref()).toBe('system')
  })

  test('garbage or blocked storage falls back to system', () => {
    localStorage.setItem('theme', 'purple')
    expect(readPref()).toBe('system')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readPref()).toBe('system')
    expect(() => writePref('dark')).not.toThrow()
  })
})

describe('ThemeToggle', () => {
  test('cycles and applies data-theme on <html>', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    const button = screen.getByRole('button', { name: /theme: system/i })
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: /theme: light/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
