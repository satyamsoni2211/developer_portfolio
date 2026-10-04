import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { buttonClass } from '@/components/Button'
import { NotFound } from './NotFound'

export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-title font-semibold">Something went wrong.</h1>
      <p className="mt-4 text-lg text-muted">A part of the page failed to load — usually a refresh fixes it.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary')}>
          Reload
        </button>
        <Link to="/" className={buttonClass('secondary')}>
          Home
        </Link>
      </div>
    </main>
  )
}
