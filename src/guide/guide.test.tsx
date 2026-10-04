import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { GuideProvider, useGuide } from './GuideProvider'
import { HeroCharacter } from './HeroCharacter'

function HiddenProbe() {
  const g = useGuide()
  return <p>hidden:{String(g.hidden)}</p>
}

describe('GuideProvider', () => {
  test('reads persisted hidden flag', () => {
    localStorage.setItem('guide-hidden', '1')
    render(
      <GuideProvider context="hero">
        <HiddenProbe />
      </GuideProvider>,
    )
    expect(screen.getByText('hidden:true')).toBeInTheDocument()
  })
})

describe('HeroCharacter', () => {
  test('renders layered images and greets once per session', async () => {
    const { container } = render(
      <AppProviders>
        <GuideProvider context="hero">
          <HeroCharacter />
        </GuideProvider>
      </AppProviders>,
    )
    expect(container.querySelectorAll('img')).toHaveLength(2)
    expect(await screen.findByText(/Let me show you around/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(sessionStorage.getItem('guide-greeted')).toBe('1')
  })
})
