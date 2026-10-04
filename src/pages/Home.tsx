import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'
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
import { Speaking } from '@/sections/Speaking'

export default function Home() {
  const location = useLocation()
  const navigationType = useNavigationType()
  useDocumentMeta(`${profile.name} — ${profile.role}`, profile.metaDescription)

  // Only jump on fresh navigations; on Back/Forward/reload (POP) scroll restoration wins.
  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (id && navigationType !== 'POP') requestAnimationFrame(() => scrollToId(id))
  }, [location.state, navigationType])

  return (
    <main id="main">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Speaking />
      <Skills />
      <Education />
      <Contact />
    </main>
  )
}
