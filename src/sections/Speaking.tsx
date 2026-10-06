import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { TiltCard } from '@/components/TiltCard'
import { YearGroups } from '@/components/YearGroups'
import { isUpcoming, talks } from '@/data/talks'

const events = [...new Set(talks.map((t) => t.event))]
const eventList = events.length > 1 ? `${events.slice(0, -1).join(', ')} and ${events[events.length - 1]}` : events[0]

export function Speaking() {
  const [now] = useState(() => new Date())
  return (
    <Section
      id="speaking"
      eyebrow="Speaking"
      title="Teaching what I build."
      intro={`${talks.length} workshops at ${eventList}.`}
    >
      <YearGroups label="Speaking" items={talks} getKey={(talk) => talk.url}>
        {(talk) => (
          <TiltCard>
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">{talk.event}</span>
                {talk.city && <span className="text-muted">{talk.city}</span>}
                <span className="ml-auto flex items-center gap-2">
                  {isUpcoming(talk, now) && (
                    <span className="rounded-full bg-accent-fill px-2.5 py-1 font-semibold text-white">Upcoming</span>
                  )}
                  <Tag>{talk.kind}</Tag>
                </span>
              </div>
              <h4 className="mt-4 text-xl font-semibold tracking-tight">{talk.title}</h4>
              {talk.subtitle && <p className="mt-2 text-muted">{talk.subtitle}</p>}
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
                View session
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </TiltCard>
        )}
      </YearGroups>
    </Section>
  )
}
