import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { profile } from '@/data/profile'
import { scrollToId } from '@/lib/scroll'
import { useDocumentMeta } from '@/lib/useDocumentMeta'

export default function Home() {
  const location = useLocation()
  useDocumentMeta(`${profile.name} — ${profile.role}`, profile.metaDescription)

  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (id) requestAnimationFrame(() => scrollToId(id))
  }, [location.state])

  return (
    <main id="main">
      <section id="hero" className="mx-auto max-w-6xl px-4 pt-32 sm:px-6">
        <h1 className="text-display font-semibold">{profile.name}.</h1>
      </section>
    </main>
  )
}
