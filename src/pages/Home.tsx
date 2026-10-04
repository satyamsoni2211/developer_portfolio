import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { profile } from '@/data/profile'
import { scrollToId } from '@/lib/scroll'
import { useDocumentMeta } from '@/lib/useDocumentMeta'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Education } from '@/sections/Education'
import { Experience } from '@/sections/Experience'
import { Hero } from '@/sections/Hero'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'

export default function Home() {
  const location = useLocation()
  useDocumentMeta(`${profile.name} — ${profile.role}`, profile.metaDescription)

  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (id) requestAnimationFrame(() => scrollToId(id))
  }, [location.state])

  return (
    <main id="main">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
    </main>
  )
}
