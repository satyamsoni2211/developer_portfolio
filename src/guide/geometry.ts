export type Point = { x: number; y: number }
export type Viewport = { w: number; h: number }

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Direction from `origin` to `pointer`, normalised by half the viewport, each axis in [-1, 1]. */
export function gaze(pointer: Point, origin: Point, vp: Viewport): { dx: number; dy: number } {
  return {
    dx: clamp((pointer.x - origin.x) / (vp.w / 2), -1, 1),
    dy: clamp((pointer.y - origin.y) / (vp.h / 2), -1, 1),
  }
}

/** Top-left position for the companion: below-right of the pointer, flipped near edges, kept on screen. */
export function companionTarget(pointer: Point, vp: Viewport, size: number, offset = 40, margin = 8): Point {
  let x = pointer.x + offset
  let y = pointer.y + offset
  if (x + size > vp.w - margin) x = pointer.x - offset - size
  if (y + size > vp.h - margin) y = pointer.y - offset - size
  return { x: clamp(x, margin, vp.w - size - margin), y: clamp(y, margin, vp.h - size - margin) }
}

/** Where the companion heads when it appears: beside the pointer if known, else the bottom-right corner. */
export function initialTarget(pointer: Point | null, vp: Viewport, size: number, inset = 24): Point {
  return pointer ? companionTarget(pointer, vp, size) : { x: vp.w - size - inset, y: vp.h - size - inset }
}

/** Lean in the direction of travel. `vx` in px/s. */
export function tiltFromVelocity(vx: number, max = 10, k = 0.012): number {
  return clamp(vx * k, -max, max)
}

/** While resting, the companion stays put so it can be clicked — until the pointer moves away. */
export function shouldFollow(pointer: Point, center: Point, resting: boolean, radius = 160): boolean {
  if (!resting) return true
  return Math.hypot(pointer.x - center.x, pointer.y - center.y) > radius
}

const AVOID = 'a, button, input, textarea, select, label, summary, [data-guide-avoid]'

export function isAvoidTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false
  if (el.closest('[data-guide]')) return false
  return el.closest(AVOID) !== null
}

export type Placement = { below: boolean; left: boolean }

/** Returns `prev` when nothing changed so React bails out of re-rendering on pointer moves. */
export function nextPlacement(prev: Placement, next: Placement): Placement {
  return prev.below === next.below && prev.left === next.left ? prev : next
}
