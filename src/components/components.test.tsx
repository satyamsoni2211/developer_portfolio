import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { copyText } from '@/lib/clipboard'
import { CountUp, formatMetric } from './CountUp'
import { Reveal } from './Reveal'
import { SocialLinks } from './SocialLinks'
import { ToastProvider, useToast } from './Toast'

afterEach(() => vi.restoreAllMocks())

describe('formatMetric', () => {
  test('formats integers and decimals', () => {
    expect(formatMetric(97)).toBe('97')
    expect(formatMetric(96.6)).toBe('97')
    expect(formatMetric(1234)).toBe('1,234')
    expect(formatMetric(4.25, 1)).toBe('4.3')
  })
})

describe('CountUp', () => {
  test('ends on the final formatted value', async () => {
    render(<CountUp value={97} suffix="%" />)
    expect(await screen.findByText('97%', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

describe('Reveal', () => {
  test('content ends fully visible once in view', async () => {
    render(<Reveal>visible text</Reveal>)
    const el = screen.getByText('visible text')
    await vi.waitFor(() => expect(el.style.opacity).toBe('1'), { timeout: 3000 })
  })
})

describe('copyText', () => {
  test('returns true when clipboard works and false when it throws or is missing', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    expect(await copyText('a')).toBe(true)
    writeText.mockRejectedValue(new Error('denied'))
    expect(await copyText('a')).toBe(false)
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    expect(await copyText('a')).toBe(false)
  })
})

describe('Toast', () => {
  test('shows a message', async () => {
    function Trigger() {
      const toast = useToast()
      return <button onClick={() => toast('Saved')}>go</button>
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    await act(async () => fireEvent.click(screen.getByText('go')))
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})

describe('SocialLinks', () => {
  test('includes X (Twitter), opening in a new tab', () => {
    render(<SocialLinks />)
    const x = screen.getByRole('link', { name: 'X (Twitter)' })
    expect(x).toHaveAttribute('href', 'https://x.com/_satyamsoni_')
    expect(x).toHaveAttribute('target', '_blank')
  })
})
