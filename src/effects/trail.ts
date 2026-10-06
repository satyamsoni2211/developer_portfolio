export type Spark = { x: number; y: number; vx: number; vy: number; age: number; ttl: number; size: number; hue: number }

export const MAX_SPARKS = 140
const MIN_MOVE = 2 // px; below this the pointer is only jittering
const DRAG = 2.5 // per second

/** Sheds sparks behind a pointer that just moved by (dx, dy) to (x, y). Mutates `sparks`. */
export function emit(sparks: Spark[], x: number, y: number, dx: number, dy: number, rand: () => number = Math.random): void {
  const dist = Math.hypot(dx, dy)
  if (dist < MIN_MOVE) return
  const ux = dx / dist
  const uy = dy / dist
  const count = Math.min(4, 1 + Math.floor(dist / 14))
  for (let i = 0; i < count; i++) {
    const back = rand() * dist // somewhere along the segment just travelled
    const speed = 30 + rand() * 70
    const spread = (rand() - 0.5) * 60
    sparks.push({
      x: x - ux * back,
      y: y - uy * back,
      vx: -ux * speed - uy * spread,
      vy: -uy * speed + ux * spread,
      age: 0,
      ttl: 0.45 + rand() * 0.45,
      size: 0.8 + rand() * 1.6,
      hue: Math.floor(rand() * 4),
    })
  }
  if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS)
}

/** Advances every spark by `dt` seconds and drops the expired ones. Mutates `sparks`. */
export function step(sparks: Spark[], dt: number): void {
  const keep = Math.exp(-DRAG * dt)
  let alive = 0
  for (const s of sparks) {
    s.age += dt
    if (s.age >= s.ttl) continue
    s.x += s.vx * dt
    s.y += s.vy * dt
    s.vx *= keep
    s.vy *= keep
    sparks[alive++] = s
  }
  sparks.length = alive
}
