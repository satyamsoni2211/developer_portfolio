import { experience } from '@/data/experience'
import { packages } from '@/data/opensource'
import { projects } from '@/data/projects'
import { recommendations } from '@/data/recommendations'
import { SECTIONS } from '@/data/sections'
import { skillCategories } from '@/data/skills'
import { talks } from '@/data/talks'
import { posts } from '@/data/writing'

export type SearchTarget =
  | { kind: 'section'; id: string }
  | { kind: 'route'; to: string }
  | { kind: 'external'; url: string }

export type SearchItem = {
  id: string
  group:
    | 'Sections'
    | 'Projects'
    | 'Open Source'
    | 'Writing'
    | 'Speaking'
    | 'Experience'
    | 'Skills'
    | 'Recommendations'
  title: string
  subtitle?: string
  /** Extra text that should match but is not shown. */
  keywords: string
  target: SearchTarget
}

const sections: SearchItem[] = SECTIONS.filter((s) => s.id !== 'recommendations' || recommendations.length > 0).map(
  (s) => ({
    id: `section:${s.id}`,
    group: 'Sections',
    title: s.label,
    keywords: '',
    target: { kind: 'section', id: s.id },
  }),
)

const projectItems: SearchItem[] = projects.map((p) => ({
  id: `project:${p.slug}`,
  group: 'Projects',
  title: p.name,
  subtitle: p.tagline,
  keywords: [p.industry, p.company, p.role, ...p.tech, ...(p.models ?? []), p.summary].filter(Boolean).join(' '),
  target: { kind: 'route', to: `/projects/${p.slug}` },
}))

const packageItems: SearchItem[] = packages.map((p) => ({
  id: `package:${p.name}`,
  group: 'Open Source',
  title: p.name,
  subtitle: p.summary,
  keywords: `pip install ${p.name} pypi python`,
  target: { kind: 'external', url: p.pypi },
}))

const postItems: SearchItem[] = posts.map((p, i) => ({
  id: `post:${i}`,
  group: 'Writing',
  title: p.title,
  subtitle: `${p.platform} · ${p.year}`,
  keywords: p.blurb,
  target: { kind: 'external', url: p.url },
}))

const talkItems: SearchItem[] = talks.map((t, i) => ({
  id: `talk:${i}`,
  group: 'Speaking',
  title: t.title,
  subtitle: `${t.event} ${t.year}`,
  keywords: [t.subtitle, t.city, t.kind].filter(Boolean).join(' '),
  target: { kind: 'external', url: t.url },
}))

const experienceItems: SearchItem[] = experience.map((j, i) => ({
  id: `experience:${i}`,
  group: 'Experience',
  title: j.role,
  subtitle: `${j.company} · ${j.period}`,
  keywords: `${j.description} ${j.technologies.join(' ')}`,
  target: { kind: 'section', id: 'experience' },
}))

const skillItems: SearchItem[] = skillCategories.map((c) => ({
  id: `skill:${c.id}`,
  group: 'Skills',
  title: c.label,
  subtitle: c.items.slice(0, 6).join(', '),
  keywords: c.items.join(' '),
  target: { kind: 'section', id: 'skills' },
}))

const recommendationItems: SearchItem[] = recommendations.map((r, i) => ({
  id: `recommendation:${i}`,
  group: 'Recommendations',
  title: r.name,
  subtitle: r.title,
  keywords: r.relationship,
  target: { kind: 'section', id: 'recommendations' },
}))

export const searchItems: SearchItem[] = [
  ...sections,
  ...projectItems,
  ...packageItems,
  ...postItems,
  ...talkItems,
  ...experienceItems,
  ...skillItems,
  ...recommendationItems,
]

export function searchPortfolio(query: string, items: SearchItem[] = searchItems, limit = 8): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.filter((i) => i.group === 'Sections')
  const tokens = q.split(/\s+/)

  const ranked: { item: SearchItem; rank: number; index: number }[] = []
  items.forEach((item, index) => {
    const title = item.title.toLowerCase()
    const haystack = `${title} ${item.subtitle ?? ''} ${item.keywords} ${item.group}`.toLowerCase()
    if (!tokens.every((t) => haystack.includes(t))) return
    const rank = title.startsWith(q) ? 0 : tokens.every((t) => title.includes(t)) ? 1 : 2
    ranked.push({ item, rank, index })
  })
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index)
  return ranked.slice(0, limit).map((r) => r.item)
}
