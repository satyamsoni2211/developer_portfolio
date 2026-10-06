import { describe, expect, test } from 'vitest'
import { emit, MAX_SPARKS, step, type Spark } from './trail'

const half = () => 0.5

describe('emit', () => {
  test('ignores jitter smaller than two pixels', () => {
    const sparks: Spark[] = []
    emit(sparks, 100, 100, 1, 1, half)
    expect(sparks).toHaveLength(0)
  })

  test('faster movement sheds more sparks, up to four per move', () => {
    const slow: Spark[] = []
    const fast: Spark[] = []
    emit(slow, 100, 100, 5, 0, half)
    emit(fast, 100, 100, 200, 0, half)
    expect(slow).toHaveLength(1)
    expect(fast).toHaveLength(4)
  })

  test('sparks drift backwards along the path, behind the pointer', () => {
    const sparks: Spark[] = []
    emit(sparks, 100, 100, 40, 0, half)
    for (const s of sparks) {
      expect(s.vx).toBeLessThan(0)
      expect(s.x).toBeLessThanOrEqual(100)
    }
  })

  test('never holds more than MAX_SPARKS', () => {
    const sparks: Spark[] = []
    for (let i = 0; i < 200; i++) emit(sparks, i, 0, 200, 0, half)
    expect(sparks).toHaveLength(MAX_SPARKS)
  })
})

describe('step', () => {
  test('moves sparks and removes them once their time is up', () => {
    const sparks: Spark[] = [{ x: 0, y: 0, vx: 100, vy: 0, age: 0, ttl: 0.5, size: 1, hue: 0 }]
    step(sparks, 0.1)
    expect(sparks[0].x).toBeGreaterThan(0)
    expect(sparks[0].age).toBeCloseTo(0.1)
    step(sparks, 0.5)
    expect(sparks).toHaveLength(0)
  })
})
