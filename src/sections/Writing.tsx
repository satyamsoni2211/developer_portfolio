import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { TiltCard } from '@/components/TiltCard'
import { YearGroups } from '@/components/YearGroups'
import { posts } from '@/data/writing'
import { formatMonth } from '@/lib/dates'

export function Writing() {
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="Notes from the build."
      intro={`${posts.length} articles on Python, developer tooling and AI, published on dev.to, LinkedIn and X.`}
    >
      <YearGroups label="Writing" items={posts} getKey={(p) => p.url}>
        {(p) => (
          <TiltCard>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">{p.platform}</span>
                <span className="text-muted">{formatMonth(p.published)}</span>
              </div>
              <h4 className="mt-4 text-lg font-semibold leading-snug tracking-tight">{p.title}</h4>
              <p className="mt-2 text-muted">{p.blurb}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
                Read article
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </TiltCard>
        )}
      </YearGroups>
    </Section>
  )
}
