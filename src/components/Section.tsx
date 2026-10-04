import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

type Props = { id: string; eyebrow: string; title: string; intro?: string; children: ReactNode; className?: string }

export function Section({ id, eyebrow, title, intro, children, className }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 max-w-3xl text-title font-semibold">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-2xl text-lg text-muted">{intro}</p>}
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  )
}
