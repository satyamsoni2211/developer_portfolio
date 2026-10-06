import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { About } from './About'
import { Hero } from './Hero'
import { GuideProvider } from '@/guide/GuideProvider'
import { fireEvent } from '@testing-library/react'
import { Experience, firstSentence } from './Experience'
import { MemoryRouter } from 'react-router'
import { waitFor } from '@testing-library/react'
import { projects } from '@/data/projects'
import { metricText } from '@/components/ProjectCard'
import { filterProjects, Projects } from './Projects'
import { vi } from 'vitest'
import { Contact } from './Contact'
import { Education } from './Education'
import { Skills } from './Skills'
import { Speaking } from './Speaking'

const wrap = (ui: React.ReactNode) => render(<AppProviders>{ui}</AppProviders>)

describe('Hero', () => {
  test('shows name, pitch, CTAs and stats', async () => {
    wrap(
      <GuideProvider context="hero">
        <Hero />
      </GuideProvider>,
    )
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

  test('lists 6 roles; first is open; clicking another expands it', () => {
    wrap(<Experience />)
    const toggles = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'))
    expect(toggles).toHaveLength(6)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(toggles[2]).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggles[2])
    expect(toggles[2]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Designed fault-tolerant cloud-native architectures on AWS/)).toBeInTheDocument()
  })
})

describe('Projects', () => {
  test('filterProjects', () => {
    expect(filterProjects(projects, 'all')).toHaveLength(9)
    expect(filterProjects(projects, 'collaboration').map((p) => p.slug)).toEqual(['defect-detection', 'stryve', 'crickbuzz'])
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
    const collab = screen.getByRole('button', { name: 'Collaborations' })
    fireEvent.click(collab)
    expect(collab).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(screen.queryByRole('link', { name: /FUSION/ })).not.toBeInTheDocument(), { timeout: 3000 })
  })
})

describe('Speaking', () => {
  test('groups workshops under year headings, newest first', () => {
    wrap(<Speaking />)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026 — Speaking', '2025 — Speaking', '2022 — Speaking'])
    expect(screen.getByRole('heading', { level: 4, name: 'Why Your FastAPI Is Not Fast' })).toBeInTheDocument()
  })

  test('renders four external talk links under the heading', () => {
    wrap(<Speaking />)
    expect(screen.getByRole('heading', { level: 2, name: 'Teaching what I build.' })).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(4)
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
    }
    expect(links[0]).toHaveAttribute('href', 'https://pycon.hk/2026/en/speakers/satyam-soni/')
  })
})

describe('Skills / Education / Contact', () => {
  test('skills shows all 8 categories', () => {
    wrap(<Skills />)
    for (const label of ['Programming Languages', 'Frameworks & Libraries', 'AI / ML', 'Databases', 'DevOps & Tools', 'Cloud Technologies', 'Version Control & Tools', 'Operating Systems']) {
      expect(screen.getByRole('heading', { level: 3, name: label })).toBeInTheDocument()
    }
  })

  test('education card', () => {
    wrap(<Education />)
    expect(screen.getByText('Bachelor of Engineering in Computer Science')).toBeInTheDocument()
    expect(screen.getByText(/75\/100/)).toBeInTheDocument()
  })

  test('contact copies email and toasts', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    wrap(<Contact />)
    expect(screen.getByRole('link', { name: /satyamsoni@hotmail.co.uk/ })).toHaveAttribute('href', 'mailto:satyamsoni@hotmail.co.uk')
    fireEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText('Email copied')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('satyamsoni@hotmail.co.uk')
    expect(screen.getByText('Résumé available on request.')).toBeInTheDocument()
  })

  test('contact falls back when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    wrap(<Contact />)
    fireEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText(/Press ⌘C/)).toBeInTheDocument()
  })
})

describe('follow-ups', () => {
  test('experience intro mentions GenAI at EPAM', () => {
    wrap(<Experience />)
    expect(screen.getByText('From ETL automation in banking to architecting GenAI solutions at EPAM.')).toBeInTheDocument()
  })
})
