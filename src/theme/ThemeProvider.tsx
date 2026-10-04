import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { nextPref, readPref, resolveTheme, writePref, type Theme, type ThemePref } from './theme'

type ThemeContextValue = {
  pref: ThemePref
  theme: Theme
  setPref: (pref: ThemePref) => void
  cycle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readPref)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme = resolveTheme(pref, systemDark)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    writePref(p)
  }, [])

  const cycle = useCallback(() => setPref(nextPref(pref)), [pref, setPref])

  const value = useMemo(() => ({ pref, theme, setPref, cycle }), [pref, theme, setPref, cycle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
