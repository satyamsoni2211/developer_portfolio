import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { AppProviders } from './AppProviders'

test('providers render children', () => {
  render(
    <AppProviders>
      <p>hello</p>
    </AppProviders>,
  )
  expect(screen.getByText('hello')).toBeInTheDocument()
})
