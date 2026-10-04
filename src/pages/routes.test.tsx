import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderRoute } from '@/test/render'

describe('routes', () => {
  test('home renders the name as the page heading', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('project route renders the project', async () => {
    renderRoute('/projects/stryve')
    expect(await screen.findByRole('heading', { level: 1, name: 'Stryve' })).toBeInTheDocument()
  })

  test('unknown project slug renders 404 with a link home', async () => {
    renderRoute('/projects/nope')
    expect(await screen.findByText(/wandered off/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
  })

  test('unknown path renders 404', async () => {
    renderRoute('/does/not/exist')
    expect(await screen.findByText(/wandered off/i)).toBeInTheDocument()
  })
})
