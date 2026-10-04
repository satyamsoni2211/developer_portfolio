import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './theme/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ToastProvider>
    </ThemeProvider>
  )
}
