import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { About } from './About'
import { Hero } from './Hero'
import { fireEvent } from '@testing-library/react'
import { Experience, firstSentence } from './Experience'

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
