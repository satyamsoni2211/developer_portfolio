import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { TiltCard } from '@/components/TiltCard'
import { Section } from '@/components/Section'
import { projects } from '@/data/projects'
import type { Project } from '@/data/types'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'

export type ProjectFilter = 'all' | 'collaboration' | 'enterprise'

// eslint-disable-next-line react-refresh/only-export-components
export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  return filter === 'all' ? list : list.filter((p) => p.kind === filter)
}

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'collaboration', label: 'Collaborations' },
  { id: 'enterprise', label: 'Enterprise' },
]

export function Projects() {
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const visible = filterProjects(projects, filter)

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I've designed and shipped."
      intro="Three recent computer-vision collaborations, plus enterprise platforms delivered at SenecaGlobal and HSBC."
    >
      <Reveal>
        <div role="group" aria-label="Filter projects" className="glass inline-flex rounded-full border border-line p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                filter === f.id ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {filter === f.id && (
                <motion.span layoutId="project-filter-pill" transition={springs.soft} className="absolute inset-0 rounded-full bg-elevated shadow-sm" />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <LayoutGroup>
        <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                layout
                key={p.slug}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ ...springs.pop, delay: (i % 3) * 0.08 }}
              >
                <TiltCard>
                  <ProjectCard project={p} />
                </TiltCard>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </Section>
  )
}
