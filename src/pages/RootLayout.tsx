import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SECTION_IDS } from '@/data/sections'
import { GuideProvider } from '@/guide/GuideProvider'
import { startSmoothScroll } from '@/lib/scroll'
import { useActiveSection } from '@/lib/useActiveSection'

export function RootLayout() {
  const { pathname } = useLocation()
  const active = useActiveSection(SECTION_IDS, pathname)
  const projectSlug = pathname.match(/^\/projects\/([^/]+)/)?.[1]
  const context = projectSlug ? `project:${projectSlug}` : (active ?? 'hero')

  useEffect(() => startSmoothScroll(), [])

  return (
    <GuideProvider context={context}>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <Nav active={pathname === '/' ? active : null} />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </GuideProvider>
  )
}
