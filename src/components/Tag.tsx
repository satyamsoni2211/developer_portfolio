import type { ReactNode } from 'react'

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-elevated/50 px-3 py-1 text-[13px] text-fg/80">
      {children}
    </span>
  )
}
