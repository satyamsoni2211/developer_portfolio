export type Metric =
  | { value: number; prefix?: string; suffix?: string; label: string }
  | { text: string; label: string }

export type CoverVariant =
  | 'gear' | 'pose' | 'pitch' | 'graph' | 'brackets' | 'layers' | 'pipeline' | 'grid' | 'certificate'

export type ArchNode = {
  id: string
  label: string
  sub?: string
  kind: 'client' | 'service' | 'store' | 'device' | 'model'
}

export type ArchEdge = { from: string; to: string; label?: string; bidirectional?: boolean }

export type Architecture = { nodes: ArchNode[]; edges: ArchEdge[] }

export type Service = { name: string; description: string; points?: string[] }

export type Project = {
  slug: string
  name: string
  tagline: string
  kind: 'collaboration' | 'enterprise'
  company?: string
  industry: string
  role: string
  summary: string
  problem?: string
  solution?: string
  services: Service[]
  models?: string[]
  tech: string[]
  metrics: Metric[]
  architecture?: Architecture
  cover: CoverVariant
}

export type Job = {
  company: string
  location: string
  role: string
  period: string
  description: string
  technologies: string[]
}

export type Talk = {
  title: string
  subtitle?: string
  kind: 'Workshop'
  event: string
  year: number
  city?: string
  /** ISO day of the session (YYYY-MM-DD); drives the "Upcoming" badge. */
  date?: string
  url: string
}

export type SkillCategory = { id: string; label: string; items: string[] }

export type OpenSourcePackage = {
  name: string
  summary: string
  /** Year of the latest release; drives year grouping. */
  year: number
  /** ISO day of the latest release on PyPI (YYYY-MM-DD). */
  released: string
  pypi: string
  repo?: string
}

export type Post = {
  title: string
  blurb: string
  platform: 'dev.to' | 'LinkedIn' | 'X'
  /** ISO day published (YYYY-MM-DD). */
  published: string
  year: number
  url: string
}

export type Recommendation = {
  name: string
  /** Their headline, e.g. "Engineering Manager, Acme". */
  title: string
  /** How they know Satyam, e.g. "Managed Satyam directly". */
  relationship: string
  /** ISO day the recommendation was given (YYYY-MM-DD). */
  date?: string
  text: string
}
