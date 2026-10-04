import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <main id="main" className="p-8">
        <h1 className="text-display font-semibold">Satyam Soni</h1>
      </main>
    </AppProviders>
  </StrictMode>,
)
