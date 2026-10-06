import { describe, expect, test } from 'vitest'
import { groupByYear } from './groupByYear'

describe('groupByYear', () => {
  test('groups newest year first and keeps item order inside a year', () => {
    const items = [
      { id: 'a', year: 2022 },
      { id: 'b', year: 2026 },
      { id: 'c', year: 2022 },
      { id: 'd', year: 2025 },
    ]
    expect(groupByYear(items)).toEqual([
      { year: 2026, items: [{ id: 'b', year: 2026 }] },
      { year: 2025, items: [{ id: 'd', year: 2025 }] },
      { year: 2022, items: [{ id: 'a', year: 2022 }, { id: 'c', year: 2022 }] },
    ])
  })

  test('empty input gives no groups', () => {
    expect(groupByYear([])).toEqual([])
  })
})
