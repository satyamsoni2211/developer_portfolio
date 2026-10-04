import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { CountUp } from '@/components/CountUp'
import { ProjectCover } from '@/components/ProjectCover'
import { Reveal, RevealGroup, RevealItem } from '@/components/Reveal'
import { Tag } from '@/components/Tag'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import type { Project } from '@/data/types'
import { useDocumentMeta } from '@/lib/useDocumentMeta'
import { NotFound } from './NotFound'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-20">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Neighbor({ project, dir }: { project: Project; dir: 'Previous' | 'Next' }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      viewTransition
      className="card group flex flex-1 flex-col gap-1 p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex items-center gap-1 text-sm text-muted">
        {dir === 'Previous' && <ArrowLeft aria-hidden className="h-4 w-4" />}
        {dir}
        {dir === 'Next' && <ArrowRight aria-hidden className="h-4 w-4" />}
      </span>
      <span className="text-lg font-semibold">{project.name}</span>
    </Link>
  )
}

export default function ProjectPage() {
  const { slug } = useParams()
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]
  useDocumentMeta(project ? `${project.name} — ${profile.name}` : 'Page not found — Satyam Soni', project?.tagline)
  if (!project) return <NotFound />

  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const facts = [
    { label: 'Role', value: project.role },
    { label: project.kind === 'freelance' ? 'Engagement' : 'Company', value: project.kind === 'freelance' ? 'Freelance' : project.company! },
    { label: 'Industry', value: project.industry },
  ]

  return (
    <main id="main" className="pb-24 pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link to="/" state={{ scrollTo: 'projects' }} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="h-4 w-4" /> All projects
        </Link>

        <ProjectCover variant={project.cover} slug={project.slug} className="mt-6 aspect-[16/9] rounded-[28px] border border-line sm:aspect-[21/9]" />

        <Reveal className="mt-10">
          <p className="text-sm font-semibold text-accent">{project.kind === 'freelance' ? 'Freelance' : project.company}</p>
          <h1 className="mt-2 text-title font-semibold">{project.name}</h1>
          <p className="mt-4 max-w-3xl text-xl text-muted sm:text-2xl">{project.tagline}</p>
        </Reveal>

        <Reveal className="mt-10">
          <dl className="card grid gap-6 p-6 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Block title="Overview">
          <Reveal className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted">
            <p>{project.summary}</p>
            {project.problem && (
              <p>
                <span className="font-semibold text-fg">The problem. </span>
                {project.problem}
              </p>
            )}
            {project.solution && (
              <p>
                <span className="font-semibold text-fg">The solution. </span>
                {project.solution}
              </p>
            )}
          </Reveal>
        </Block>

        {project.architecture && (
          <Block title="Architecture">
            <ArchitectureDiagram graph={project.architecture} />
          </Block>
        )}

        {project.services.length > 0 && (
          <Block title="Services">
            <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2">
              {project.services.map((s) => (
                <RevealItem as="li" key={s.name} className="card p-6">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 text-muted">{s.description}</p>
                  {s.points && (
                    <ul className="mt-4 space-y-2 text-[15px]">
                      {s.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </RevealItem>
              ))}
            </RevealGroup>
          </Block>
        )}

        {project.models && (
          <Block title="Models">
            <ul className="flex flex-wrap gap-2">
              {project.models.map((m) => (
                <li key={m}>
                  <Tag>{m}</Tag>
                </li>
              ))}
            </ul>
          </Block>
        )}

        <Block title="Tech stack">
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Results">
          <dl className="grid gap-4 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="card flex flex-col-reverse p-6">
                <dt className="mt-2 text-muted">{m.label}</dt>
                <dd className="text-5xl font-semibold tracking-tight">
                  {'text' in m ? m.text : <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        <nav aria-label="More projects" className="mt-24 flex flex-col gap-4 sm:flex-row">
          <Neighbor project={prev} dir="Previous" />
          <Neighbor project={next} dir="Next" />
        </nav>
      </div>
    </main>
  )
}
