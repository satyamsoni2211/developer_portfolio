import { useParams } from 'react-router'
import { projects } from '@/data/projects'
import { NotFound } from './NotFound'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return <NotFound />
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
      <h1 className="text-title font-semibold">{project.name}</h1>
    </main>
  )
}
