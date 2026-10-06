import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { packages } from '@/data/opensource'
import { formatMonth } from '@/lib/dates'
import { OpenSource } from './OpenSource'

describe('open source data', () => {
  test('nine unique packages, newest release first, with canonical PyPI links', () => {
    expect(packages.map((p) => p.name)).toEqual([
      'async-patcher', 'lazy-alchemy', 'fastapi-proxykit', 'eventsail', 'flask-dantic',
      'lazy-env-configurator', 'codebuild-ci', 'py-lambda-warmer', 'crypto-data-fetcher',
    ])
    const released = packages.map((p) => p.released)
    expect(released).toEqual([...released].sort().reverse())
    for (const p of packages) {
      expect(p.pypi, p.name).toBe(`https://pypi.org/project/${p.name}/`)
      expect(p.year, p.name).toBe(Number(p.released.slice(0, 4)))
      expect(p.summary.length, p.name).toBeGreaterThan(20)
      if (p.repo) expect(p.repo, p.name).toMatch(/^https:\/\/github\.com\/satyamsoni2211\//)
    }
  })
})

describe('formatMonth', () => {
  test('formats an ISO day as short month and year', () => {
    expect(formatMonth('2026-06-07')).toBe('Jun 2026')
    expect(formatMonth('2021-01-01')).toBe('Jan 2021')
  })
})

describe('OpenSource', () => {
  test('lists every package under its release year with external links', () => {
    render(<AppProviders><OpenSource /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'Libraries I maintain.' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026 — Open Source', '2024 — Open Source', '2023 — Open Source', '2022 — Open Source', '2021 — Open Source'])
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(9)
    const pypi = screen.getByRole('link', { name: 'eventsail on PyPI' })
    expect(pypi).toHaveAttribute('href', 'https://pypi.org/project/eventsail/')
    expect(pypi).toHaveAttribute('target', '_blank')
    expect(pypi.getAttribute('rel')).toContain('noopener')
    expect(screen.getByText('pip install lazy-alchemy')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'flask-dantic source on GitHub' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All packages on PyPI/ })).toHaveAttribute('href', 'https://pypi.org/user/satyamsoni2211/')
  })
})
