import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ThemeProvider } from './theme/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}
