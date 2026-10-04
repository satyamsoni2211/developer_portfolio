import type { ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { cn } from '@/lib/utils'

type Rect = { left: number; top: number; width: number; height: number }

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const round = (v: number) => Math.round(v * 100) / 100 + 0 // +0 normalises -0

/** Pointer position over a card → tilt (degrees) and glare position (%). */
// eslint-disable-next-line react-refresh/only-export-components
export function tiltFromPointer(x: number, y: number, rect: Rect, max = 6) {
  const fx = clamp01((x - rect.left) / rect.width)
  const fy = clamp01((y - rect.top) / rect.height)
  return {
    rotateX: round((0.5 - fy) * 2 * max),
    rotateY: round((fx - 0.5) * 2 * max),
    glareX: round(fx * 100),
    glareY: round(fy * 100),
  }
}

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 }

/** 3D tilt toward the cursor with a moving glare and a hover lift. Inert on touch / reduced motion. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const fine = useMediaQuery('(pointer: fine)')
  const reduce = useReducedMotion()
  const enabled = fine && !reduce
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, SPRING)
  const rotateY = useSpring(ry, SPRING)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glareOpacity = useSpring(0, SPRING)
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,.16), transparent 45%)`

  if (!enabled) return <div className={cn('h-full', className)}>{children}</div>

  return (
    <motion.div
      className={cn('relative h-full', className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onPointerMove={(e) => {
        const t = tiltFromPointer(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())
        rx.set(t.rotateX)
        ry.set(t.rotateY)
        gx.set(t.glareX)
        gy.set(t.glareY)
        glareOpacity.set(1)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
        glareOpacity.set(0)
      }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{ backgroundImage: glare, opacity: glareOpacity }}
      />
    </motion.div>
  )
}
