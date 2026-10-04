import type { Talk } from './types'

export const talks: Talk[] = [
  {
    title: 'Why Your FastAPI Is Not Fast',
    subtitle: 'A Deep Dive into Hidden Bottlenecks',
    kind: 'Workshop',
    event: 'PyCon Hong Kong',
    year: 2026,
    city: 'Hong Kong',
    date: '2026-11-14',
    url: 'https://pycon.hk/2026/en/speakers/satyam-soni/',
  },
  {
    title: 'Mastering the Multi-Stack',
    subtitle: 'Orchestrated Debugging with Python and Beyond',
    kind: 'Workshop',
    event: 'PyConf Hyderabad',
    year: 2026,
    city: 'Hyderabad',
    url: 'https://2026.pyconfhyd.org/speakers/satyam-soni',
  },
  {
    title: 'Debugging Python Applications like a Pro',
    kind: 'Workshop',
    event: 'PyConf Hyderabad',
    year: 2025,
    city: 'Hyderabad',
    url: 'https://2025.pyconfhyd.org/speakers/satyam-soni',
  },
  {
    title: 'Decorators and Generators',
    subtitle: 'Control your code with ease',
    kind: 'Workshop',
    event: 'PyConf Hyderabad',
    year: 2022,
    city: 'Hyderabad',
    url: 'https://pyconf.hydpy.org/2022/#timetable',
  },
]

const DAY_MS = 24 * 60 * 60 * 1000

/** True until the end of the session's day (UTC); undated talks are in the past. */
export function isUpcoming(talk: Talk, now: Date): boolean {
  return talk.date !== undefined && now.getTime() < Date.parse(`${talk.date}T00:00:00Z`) + DAY_MS
}
