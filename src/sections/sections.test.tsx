import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { About } from './About'
import { Hero } from './Hero'
import { fireEvent } from '@testing-library/react'
import { Experience, firstSentence } from './Experience'
import { MemoryRouter } from 'react-router'
import { waitFor } from '@testing-library/react'
import { projects } from '@/data/projects'
import { metricText } from '@/components/ProjectCard'
import { filterProjects, Projects } from './Projects'

const wrap = (ui: React.ReactNode) => render(<AppProviders>{ui}</AppProviders>)

describe('Hero', () => {
  test('shows name, pitch, CTAs and stats', async () => {
    wrap(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: /Satyam Soni/ })).toBeInTheDocument()
    expect(screen.getByText(/design data platforms, AI systems/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View work' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get in touch' })).toBeInTheDocument()
    expect(screen.getByText('years building software')).toBeInTheDocument()
    expect(await screen.findByText('9', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

describe('About', () => {
  test('shows bio with 10+ years, pillars and industries', () => {
    wrap(<About />)
    expect(screen.getByText(/10\+ years of experience/)).toBeInTheDocument()
    for (const t of ['Data & Platforms', 'AI & LLMs', 'Leadership']) expect(screen.getByText(t)).toBeInTheDocument()
    expect(screen.getByText('Manufacturing')).toBeInTheDocument()
  })
})

describe('Experience', () => {
  test('firstSentence cuts at the first full stop', () => {
    expect(firstSentence('One thing. Two things.')).toBe('One thing.')
    expect(firstSentence('No stop')).toBe('No stop')
  })

  test('lists 5 roles; first is open; clicking another expands it', () => {
    wrap(<Experience />)
    const toggles = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'))
    expect(toggles).toHaveLength(5)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggles[1])
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Designed fault-tolerant cloud-native architectures on AWS/)).toBeInTheDocument()
  })
})

describe('Projects', () => {
  test('filterProjects', () => {
    expect(filterProjects(projects, 'all')).toHaveLength(9)
    expect(filterProjects(projects, 'freelance').map((p) => p.slug)).toEqual(['defect-detection', 'stryve', 'crickbuzz'])
    expect(filterProjects(projects, 'enterprise')).toHaveLength(6)
  })

  test('metricText', () => {
    expect(metricText({ value: 5, prefix: '≤ ', suffix: ' s', label: 'x' })).toBe('≤ 5 s')
    expect(metricText({ text: 'In-house', label: 'x' })).toBe('In-house')
  })

  test('cards link to case studies and filtering hides enterprise', async () => {
    wrap(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Stryve/ })).toHaveAttribute('href', '/projects/stryve')
    expect(screen.getAllByRole('link', { name: /case study/i })).toHaveLength(9)
    const freelance = screen.getByRole('button', { name: 'Freelance' })
    fireEvent.click(freelance)
    expect(freelance).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(screen.queryByRole('link', { name: /FUSION/ })).not.toBeInTheDocument(), { timeout: 3000 })
  })
})
