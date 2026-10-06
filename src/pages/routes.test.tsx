import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderRoute } from '@/test/render'

describe('routes', () => {
  test('home renders the name as the page heading', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ }, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^SS\..*home/ })).toHaveAttribute('href', '/')
  })

  test('project route renders the project', async () => {
    renderRoute('/projects/stryve')
    expect(await screen.findByRole('heading', { level: 1, name: 'Stryve' }, { timeout: 3000 })).toBeInTheDocument()
  })

  test('unknown project slug renders 404 with a link home', async () => {
    renderRoute('/projects/nope')
    expect(await screen.findByText(/wandered off/i, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
  })

  test('/contact lands on the home page and asks it to scroll to the contact section', async () => {
    const { router } = renderRoute('/contact')
    expect(await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ }, { timeout: 3000 })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.state).toEqual({ scrollTo: 'contact' })
  })

  test('unknown path renders 404', async () => {
    renderRoute('/does/not/exist')
    expect(await screen.findByText(/wandered off/i, {}, { timeout: 3000 })).toBeInTheDocument()
  })

  test('case study shows overview, services, architecture, results and next link', async () => {
    renderRoute('/projects/defect-detection')
    expect(await screen.findByRole('heading', { level: 1, name: 'Defect Detection' }, { timeout: 3000 })).toBeInTheDocument()
    for (const h of ['Overview', 'Architecture', 'Services', 'Models', 'Tech stack', 'Results']) {
      expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
    }
    expect(screen.getByRole('img', { name: /Architecture: Defect Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Next.*Stryve/ })).toHaveAttribute('href', '/projects/stryve')
    expect(screen.getByRole('link', { name: /Previous.*Automatic Certificate Renewal/ })).toBeInTheDocument()
  })

  test('enterprise case study without services omits that section', async () => {
    renderRoute('/projects/tool-suite')
    expect(await screen.findByRole('heading', { level: 1, name: 'Tool Suite' }, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Services' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Architecture' })).not.toBeInTheDocument()
  })
})
