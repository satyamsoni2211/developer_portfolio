export type YearGroup<T> = { year: number; items: T[] }

/** Buckets items by `year`, newest year first; order inside a year is preserved. */
export function groupByYear<T extends { year: number }>(items: readonly T[]): YearGroup<T>[] {
  const byYear = new Map<number, T[]>()
  for (const item of items) {
    const bucket = byYear.get(item.year)
    if (bucket) bucket.push(item)
    else byYear.set(item.year, [item])
  }
  return [...byYear.entries()].sort(([a], [b]) => b - a).map(([year, grouped]) => ({ year, items: grouped }))
}
