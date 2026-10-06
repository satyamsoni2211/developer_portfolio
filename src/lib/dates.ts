const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** '2026-06-07' → 'Jun 2026'. */
export function formatMonth(isoDay: string): string {
  return MONTH.format(new Date(`${isoDay}T00:00:00Z`))
}
