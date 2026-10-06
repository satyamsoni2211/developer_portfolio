import { useId, useState } from 'react'
import { ArrowUpRight, Quote } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { profile } from '@/data/profile'
import { recommendations } from '@/data/recommendations'
import type { Recommendation } from '@/data/types'
import { formatMonth } from '@/lib/dates'
import { cn } from '@/lib/utils'

const LONG_QUOTE = 320

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

function RecommendationCard({ item }: { item: Recommendation }) {
  const [open, setOpen] = useState(false)
  const quoteId = useId()
  const long = item.text.length > LONG_QUOTE
  return (
    <figure className="card mb-5 break-inside-avoid p-6">
      <Quote aria-hidden className="h-6 w-6 text-accent" />
      <blockquote id={quoteId} className={cn('mt-3 whitespace-pre-line leading-relaxed', long && !open && 'line-clamp-6')}>
        {item.text}
      </blockquote>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={quoteId}
          onClick={() => setOpen((v) => !v)}
          className="mt-2 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
      <figcaption className="mt-5 flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
          {initials(item.name)}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{item.name}</span>
          <span className="block text-sm text-muted">{item.title}</span>
          <span className="block text-xs text-muted">
            {[item.relationship, item.date && formatMonth(item.date)].filter(Boolean).join(' · ')}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

export function Recommendations({ items = recommendations }: { items?: Recommendation[] }) {
  if (items.length === 0) return null
  return (
    <Section
      id="recommendations"
      eyebrow="Recommendations"
      title="In their words."
      intro="What managers and teammates have written about working with me."
    >
      <Reveal>
        <div className="gap-5 md:columns-2">
          {items.map((item) => (
            <RecommendationCard key={`${item.name}-${item.date ?? item.text.slice(0, 24)}`} item={item} />
          ))}
        </div>
      </Reveal>
      <p className="mt-8">
        <a
          href={`${profile.linkedin}/details/recommendations/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Read them on LinkedIn <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </p>
    </Section>
  )
}
