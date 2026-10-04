import { describe, expect, test } from 'vitest'
import { companionTarget, gaze, initialTarget, isAvoidTarget, shouldFollow, tiltFromVelocity } from './geometry'
import { nextTip, restTip, tipFor } from './tips'

const vp = { w: 1000, h: 800 }

describe('gaze', () => {
  test('normalises offset by half the viewport and clamps', () => {
    expect(gaze({ x: 750, y: 400 }, { x: 500, y: 400 }, vp)).toEqual({ dx: 0.5, dy: 0 })
    expect(gaze({ x: 5000, y: -5000 }, { x: 500, y: 400 }, vp)).toEqual({ dx: 1, dy: -1 })
  })
})

describe('companionTarget', () => {
  test('sits below-right of the pointer', () => {
    expect(companionTarget({ x: 100, y: 100 }, vp, 72)).toEqual({ x: 140, y: 140 })
  })
  test('flips left/up near the right and bottom edges', () => {
    expect(companionTarget({ x: 950, y: 780 }, vp, 72)).toEqual({ x: 838, y: 668 })
  })
  test('stays inside the viewport margin', () => {
    const t = companionTarget({ x: 0, y: 0 }, { w: 100, h: 100 }, 72)
    expect(t.x).toBeGreaterThanOrEqual(8)
    expect(t.x + 72).toBeLessThanOrEqual(100)
  })
})

describe('tiltFromVelocity', () => {
  test('scales and clamps to ±10°', () => {
    expect(tiltFromVelocity(0)).toBe(0)
    expect(tiltFromVelocity(500)).toBeCloseTo(6)
    expect(tiltFromVelocity(5000)).toBe(10)
    expect(tiltFromVelocity(-5000)).toBe(-10)
  })
})

describe('shouldFollow', () => {
  test('always follows when not resting', () => {
    expect(shouldFollow({ x: 0, y: 0 }, { x: 1, y: 1 }, false)).toBe(true)
  })
  test('when resting, stays put until the pointer moves away', () => {
    expect(shouldFollow({ x: 100, y: 100 }, { x: 150, y: 150 }, true)).toBe(false)
    expect(shouldFollow({ x: 100, y: 100 }, { x: 400, y: 100 }, true)).toBe(true)
  })
})

describe('isAvoidTarget', () => {
  test('interactive elements are avoided, guide elements are not', () => {
    document.body.innerHTML = `<a href="#"><span id="in-link">x</span></a><p id="text">t</p><div data-guide><button id="guide-btn">g</button></div>`
    expect(isAvoidTarget(document.getElementById('in-link'))).toBe(true)
    expect(isAvoidTarget(document.getElementById('text'))).toBe(false)
    expect(isAvoidTarget(document.getElementById('guide-btn'))).toBe(false)
    expect(isAvoidTarget(null)).toBe(false)
  })
})

describe('tips', () => {
  test('section and project tips, with a project default', () => {
    expect(tipFor('projects')).toMatch(/freelance/i)
    expect(tipFor('project:stryve')).toMatch(/MediaPipe/)
    expect(tipFor('project:tool-suite')).toMatch(/architecture/i)
    expect(tipFor('nowhere')).toBeNull()
  })
  test('each context is shown once', () => {
    const shown = new Set<string>()
    expect(nextTip('skills', shown)).not.toBeNull()
    expect(nextTip('skills', shown)).toBeNull()
    expect(nextTip('nowhere', shown)).toBeNull()
  })
})

describe('restTip', () => {
  test('does not consume the tip while the companion is faded out', () => {
    const shown = new Set<string>()
    expect(restTip('experience', shown, false)).toBeNull()
    expect(shown.has('experience')).toBe(false)
    expect(restTip('experience', shown, true)).toMatch(/role/)
    expect(restTip('experience', shown, true)).toBeNull()
  })
})

describe('initialTarget', () => {
  test('follows a known pointer, otherwise parks bottom-right (never over the nav)', () => {
    expect(initialTarget({ x: 100, y: 100 }, vp, 72)).toEqual(companionTarget({ x: 100, y: 100 }, vp, 72))
    expect(initialTarget(null, vp, 72)).toEqual({ x: 1000 - 72 - 24, y: 800 - 72 - 24 })
  })
})
