import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { recommendations } from '@/data/recommendations'
import type { Recommendation } from '@/data/types'
import { Recommendations } from './Recommendations'

const LONG = 'Fixture sentence for the test. '.repeat(20).trim()
const fixtures: Recommendation[] = [
  { name: 'Test Person', title: 'Engineering Manager, Example Co', relationship: 'Managed Satyam directly', date: '2024-03-01', text: 'Short fixture quote.' },
  { name: 'Second Tester', title: 'Staff Engineer, Example Co', relationship: 'Worked on the same team', text: LONG },
]

describe('Recommendations', () => {
  test('renders nothing at all when there are no recommendations', () => {
    const { container } = render(<AppProviders><Recommendations items={[]} /></AppProviders>)
    expect(container.querySelector('section')).toBeNull()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  test('shows quote, author, title and relationship, and links to LinkedIn', () => {
    render(<AppProviders><Recommendations items={fixtures} /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'In their words.' })).toBeInTheDocument()
    expect(screen.getByText('Short fixture quote.')).toBeInTheDocument()
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    expect(screen.getByText('Engineering Manager, Example Co')).toBeInTheDocument()
    expect(screen.getByText(/Managed Satyam directly/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read them on LinkedIn/ })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/-satyamsoni/details/recommendations/',
    )
  })

  test('only long quotes get a Read more toggle, and it expands', () => {
    render(<AppProviders><Recommendations items={fixtures} /></AppProviders>)
    const toggles = screen.getAllByRole('button', { name: 'Read more' })
    expect(toggles).toHaveLength(1)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggles[0])
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
  })

  test('shipped data is well-formed', () => {
    for (const r of recommendations) {
      expect(r.name.trim().length).toBeGreaterThan(0)
      expect(r.text.trim().length).toBeGreaterThan(0)
    }
  })
})
