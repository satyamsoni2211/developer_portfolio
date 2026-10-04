import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Metric, Project } from '@/data/types'
import { cn } from '@/lib/utils'
import { ProjectCover } from './ProjectCover'
import { Tag } from './Tag'

// eslint-disable-next-line react-refresh/only-export-components
export function metricText(m: Metric): string {
  return 'text' in m ? m.text : `${m.prefix ?? ''}${m.value}${m.suffix ?? ''}`
}

export function ProjectCard({ project }: { project: Project }) {
  const freelance = project.kind === 'freelance'
  const headline = project.metrics[0]
  return (
    <Link
      to={`/projects/${project.slug}`}
      viewTransition
      className="card group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ProjectCover variant={project.cover} slug={project.slug} className={freelance ? 'aspect-[4/3]' : 'aspect-[16/10]'} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={cn('rounded-full px-2.5 py-1', freelance ? 'bg-accent/10 text-accent' : 'bg-fg/[.06] text-muted')}>
            {freelance ? 'Freelance' : project.company}
          </span>
          <span className="text-muted">{project.industry}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">{project.name}</h3>
        <p className="mt-2 text-muted">{project.tagline}</p>
        {headline && (
          <p className="mt-4 text-sm">
            <span className="font-semibold">{metricText(headline)}</span> <span className="text-muted">{headline.label}</span>
          </p>
        )}
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <li key={t}>
              <Tag>{t}</Tag>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
          Read case study <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
