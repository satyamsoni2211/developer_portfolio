import { safeGet, safeRemove, safeSet } from '@/lib/storage'

export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

const KEY = 'theme'
const ORDER: ThemePref[] = ['system', 'light', 'dark']

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === 'system') return systemDark ? 'dark' : 'light'
  return pref
}

export function nextPref(pref: ThemePref): ThemePref {
  return ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length]
}

export function readPref(): ThemePref {
  const value = safeGet(KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function writePref(pref: ThemePref): void {
  if (pref === 'system') safeRemove(KEY)
  else safeSet(KEY, pref)
}
