import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { experience } from '@/data/experience'
import { cn } from '@/lib/utils'
import { EASE } from '@/theme/motion'

// eslint-disable-next-line react-refresh/only-export-components
export function firstSentence(text: string): string {
  const match = text.match(/^.*?\.(?=\s|$)/)
  return match ? match[0] : text
}

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const fill = useTransform(scrollYProgress, (v) => (reduce ? 1 : v))
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Ten years, five companies, one through-line."
      intro="From ETL automation in banking to architecting AI platforms in real estate."
    >
      <div ref={listRef} className="relative ml-1.5 sm:ml-2">
        <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />
        <motion.div aria-hidden style={{ scaleY: fill }} className="absolute bottom-2 left-0 top-2 w-px origin-top bg-accent" />
        <ol>
          {experience.map((job, i) => {
            const isOpen = open === i
            return (
              <li key={job.company} className="relative pb-12 pl-8 last:pb-0 sm:pl-12">
                <span
                  aria-hidden
                  className={cn(
                    'absolute -left-[5px] top-2 h-[11px] w-[11px] rounded-full border-2 border-bg transition-colors',
                    isOpen ? 'bg-accent' : 'bg-muted/60',
                  )}
                />
                <Reveal>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`job-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <p className="text-sm text-muted">
                      {job.period} · {job.location}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{job.role}</h3>
                    <p className="mt-1 flex items-center gap-1 font-medium text-accent">
                      {job.company}
                      <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform duration-300', isOpen && 'rotate-180')} />
                    </p>
                    {!isOpen && <p className="mt-3 line-clamp-2 text-muted">{firstSentence(job.description)}</p>}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`job-${i}`}
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{job.description}</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {job.technologies.map((t) => (
                            <li key={t}>
                              <Tag>{t}</Tag>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
