import { Navigate, type RouteObject } from 'react-router'
import Home from './pages/Home'
import { NotFound } from './pages/NotFound'
import { RootLayout } from './pages/RootLayout'
import { RouteError } from './pages/RouteError'

// eslint-disable-next-line react-refresh/only-export-components -- route-level fallback, not a hot-reloaded component
function PageFallback() {
  return <div className="min-h-screen" />
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    HydrateFallback: PageFallback,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'projects/:slug',
        lazy: async () => ({ Component: (await import('./pages/ProjectPage')).default }),
      },
      { path: 'contact', element: <Navigate to="/" state={{ scrollTo: 'contact' }} replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
