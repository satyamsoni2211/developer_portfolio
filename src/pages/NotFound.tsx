import { Link } from 'react-router'
import { buttonClass } from '@/components/Button'
import { useDocumentMeta } from '@/lib/useDocumentMeta'

export function NotFound() {
  useDocumentMeta('Page not found — Satyam Soni')
  return (
    <main id="main" className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 pt-14 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-3 text-title font-semibold">This page wandered off.</h1>
      <p className="mt-4 text-lg text-muted">The link may be broken, or the project may have moved.</p>
      <Link to="/" className={buttonClass('primary', 'mt-8')}>
        Back home
      </Link>
    </main>
  )
}
