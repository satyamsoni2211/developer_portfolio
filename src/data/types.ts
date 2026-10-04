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
  kind: 'freelance' | 'enterprise'
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

export type SkillCategory = { id: string; label: string; items: string[] }
