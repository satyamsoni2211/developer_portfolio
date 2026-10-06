import { describe, expect, test } from 'vitest'
import { packages } from '@/data/opensource'
import { projects } from '@/data/projects'
import { recommendations } from '@/data/recommendations'
import { talks } from '@/data/talks'
import { posts } from '@/data/writing'
import { searchItems, searchPortfolio } from './searchIndex'

const kind = (group: string) => searchItems.filter((i) => i.group === group)

describe('searchItems', () => {
  test('ids are unique', () => {
    const ids = searchItems.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('one item per project, package, post and talk', () => {
    expect(kind('Projects')).toHaveLength(projects.length)
    expect(kind('Open Source')).toHaveLength(packages.length)
    expect(kind('Writing')).toHaveLength(posts.length)
    expect(kind('Speaking')).toHaveLength(talks.length)
  })

  test('project items route to /projects/<slug>', () => {
    for (const p of projects) {
      const item = kind('Projects').find((i) => i.title === p.name)
      expect(item?.target).toEqual({ kind: 'route', to: `/projects/${p.slug}` })
    }
  })
})

describe('searchPortfolio', () => {
  test('an empty query returns only the section items', () => {
    const results = searchPortfolio('   ')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((i) => i.group === 'Sections')).toBe(true)
  })

  test('finds projects and packages by keyword', () => {
    const titles = searchPortfolio('fastapi', searchItems, 50).map((i) => i.title)
    expect(titles).toContain('Stryve')
    expect(titles).toContain('fastapi-proxykit')
  })

  test('a title match outranks a keyword-only match', () => {
    expect(searchPortfolio('eventsail')[0].title).toBe('eventsail')
  })

  test('every token must match', () => {
    expect(searchPortfolio('graph neo4j').map((i) => i.title)).toContain('FUSION')
    expect(searchPortfolio('zzzz-nope')).toEqual([])
  })

  test('recommendation quotes are not searchable', () => {
    const others = searchItems.map((i) => `${i.title} ${i.subtitle ?? ''} ${i.keywords} ${i.group}`.toLowerCase()).join(' ')
    const words = recommendations.flatMap((r) => r.text.toLowerCase().match(/[a-z]{7,}/g) ?? [])
    const word = words.find((w) => !others.includes(w))
    expect(word).toBeDefined()
    expect(searchPortfolio(word!, searchItems, 50).filter((i) => i.group === 'Recommendations')).toEqual([])
  })

  test('limit is honoured', () => {
    expect(searchPortfolio('a', searchItems, 3)).toHaveLength(3)
  })
})
