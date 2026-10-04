import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/AppProviders'
import { routes } from '@/routes'

export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { router, ...render(<AppProviders><RouterProvider router={router} /></AppProviders>) }
}
