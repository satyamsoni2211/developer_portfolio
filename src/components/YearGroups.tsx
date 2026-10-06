import type { ReactNode } from 'react'
import { groupByYear } from '@/lib/groupByYear'
import { cn } from '@/lib/utils'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

type Props<T extends { year: number }> = {
  items: readonly T[]
  getKey: (item: T) => string
  children: (item: T) => ReactNode
  columns?: string
  /** Section name appended (screen-reader only) to each year heading. */
  label?: string
}

/** Items under sticky year headings, newest year first. Item titles should be <h4>. */
export function YearGroups<T extends { year: number }>({ items, getKey, children, columns = 'sm:grid-cols-2', label }: Props<T>) {
  return (
    <div className="space-y-14">
      {groupByYear(items).map((group) => (
        <div key={group.year} className="grid gap-5 lg:grid-cols-[7rem_1fr] lg:gap-8">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-3xl font-semibold tracking-tight text-muted">{group.year}
              {label && <span className="sr-only"> — {label}</span>}
            </h3>
          </Reveal>
          <RevealGroup as="ul" className={cn('grid gap-4', columns)}>
            {group.items.map((item) => (
              <RevealItem as="li" key={getKey(item)} pop>
                {children(item)}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      ))}
    </div>
  )
}
