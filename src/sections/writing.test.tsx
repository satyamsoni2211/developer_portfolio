import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { posts } from '@/data/writing'
import { Writing } from './Writing'

describe('writing data', () => {
  test('eight posts, newest first, unique https links, year matches date', () => {
    expect(posts).toHaveLength(8)
    const days = posts.map((p) => p.published)
    expect(days).toEqual([...days].sort().reverse())
    expect(new Set(posts.map((p) => p.url)).size).toBe(8)
    for (const p of posts) {
      expect(p.url, p.title).toMatch(/^https:\/\//)
      expect(p.year, p.title).toBe(Number(p.published.slice(0, 4)))
    }
    expect(posts.filter((p) => p.platform === 'dev.to')).toHaveLength(6)
    expect(posts.find((p) => p.platform === 'X')?.url).toBe('https://x.com/_satyamsoni_/status/2023652639779807338')
  })
})

describe('Writing', () => {
  test('renders each post as an external link under its year', () => {
    render(<AppProviders><Writing /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'Notes from the build.' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026 — Writing', '2025 — Writing', '2024 — Writing', '2022 — Writing'])
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
    }
    expect(screen.getByRole('link', { name: /How I Turned Obsidian Into a Hiring Second Brain/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/pulse/how-i-turned-obsidian-hiring-second-brain-satyam-soni-qmwac/',
    )
  })
})
