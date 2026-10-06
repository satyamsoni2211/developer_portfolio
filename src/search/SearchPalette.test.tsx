import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { packages } from '@/data/opensource'
import { SearchButton, SearchProvider } from './SearchProvider'

afterEach(() => vi.restoreAllMocks())

function Probe() {
  return <p data-testid="path">{useLocation().pathname}</p>
}

function setup() {
  render(
    <AppProviders>
      <MemoryRouter initialEntries={['/']}>
        <SearchProvider>
          <SearchButton />
          <Routes>
            <Route path="*" element={<Probe />} />
          </Routes>
        </SearchProvider>
      </MemoryRouter>
    </AppProviders>,
  )
}

const dialog = () => screen.queryByRole('dialog', { name: 'Search the portfolio' })
const input = () => screen.getByRole('combobox')
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const mod = { key: 'k', metaKey: true }

describe('SearchPalette', () => {
  test('is closed by default and toggles with Cmd+K and Ctrl+K', () => {
    setup()
    expect(dialog()).toBeNull()
    fireEvent.keyDown(window, mod)
    expect(dialog()).toBeInTheDocument()
    expect(input()).toHaveFocus()
    fireEvent.keyDown(window, mod)
    expect(dialog()).toBeNull()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(dialog()).toBeInTheDocument()
  })

  test('the nav button opens it', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(dialog()).toBeInTheDocument()
  })

  test('Enter on a project result navigates to it and closes', () => {
    setup()
    fireEvent.keyDown(window, mod)
    type('stryve')
    expect(screen.getByRole('option', { name: /Stryve/ })).toBeInTheDocument()
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(screen.getByTestId('path')).toHaveTextContent('/projects/stryve')
    expect(dialog()).toBeNull()
  })

  test('Enter on a package opens PyPI in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    setup()
    fireEvent.keyDown(window, mod)
    type('eventsail')
    fireEvent.keyDown(input(), { key: 'Enter' })
    const url = packages.find((p) => p.name === 'eventsail')!.pypi
    expect(open).toHaveBeenCalledWith(url, '_blank', expect.stringContaining('noopener'))
    expect(dialog()).toBeNull()
  })

  test('arrow keys move the active option and wrap', () => {
    setup()
    fireEvent.keyDown(window, mod)
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(2)
    expect(input()).toHaveAttribute('aria-activedescendant', options[0].id)
    fireEvent.keyDown(input(), { key: 'ArrowDown' })
    expect(input()).toHaveAttribute('aria-activedescendant', options[1].id)
    fireEvent.keyDown(input(), { key: 'ArrowUp' })
    fireEvent.keyDown(input(), { key: 'ArrowUp' })
    expect(input()).toHaveAttribute('aria-activedescendant', options[options.length - 1].id)
  })

  test('Escape closes and returns focus to the opener', () => {
    setup()
    const button = screen.getByRole('button', { name: 'Search' })
    button.focus()
    fireEvent.click(button)
    expect(input()).toHaveFocus()
    fireEvent.keyDown(input(), { key: 'Escape' })
    expect(dialog()).toBeNull()
    expect(button).toHaveFocus()
  })

  test('shows a message when nothing matches', () => {
    setup()
    fireEvent.keyDown(window, mod)
    type('zzzz-nope')
    expect(screen.getByText(/No results for/)).toBeInTheDocument()
  })

  test('locks page scroll while open and restores it', () => {
    setup()
    fireEvent.keyDown(window, mod)
    expect(document.documentElement.style.overflow).toBe('hidden')
    fireEvent.keyDown(input(), { key: 'Escape' })
    expect(document.documentElement.style.overflow).toBe('')
  })

  test('a keydown without a key does not throw or open it', () => {
    setup()
    expect(() => window.dispatchEvent(new Event('keydown'))).not.toThrow()
    expect(dialog()).toBeNull()
  })

  test('Tab is trapped and a click on panel chrome keeps focus in the input', () => {
    setup()
    fireEvent.keyDown(window, mod)
    expect(fireEvent.keyDown(document.body, { key: 'Tab' })).toBe(false)
    fireEvent.mouseDown(screen.getByText(/to navigate/))
    expect(input()).toHaveFocus()
  })

  test('Enter during IME composition does not activate', () => {
    setup()
    fireEvent.keyDown(window, mod)
    type('stryve')
    fireEvent.keyDown(input(), { key: 'Enter', isComposing: true })
    expect(dialog()).toBeInTheDocument()
    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })

  test('the listbox contains labelled groups of options', () => {
    setup()
    fireEvent.keyDown(window, mod)
    const groups = screen.getAllByRole('group')
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0]).toHaveAccessibleName('Sections')
    expect(screen.getByRole('listbox').children).toHaveLength(groups.length)
  })
})
