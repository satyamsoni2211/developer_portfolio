import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'
import { Badge } from './Badge'
import { companionTarget, gaze, initialTarget, isAvoidTarget, nextPlacement, shouldFollow, tiltFromVelocity, type Point } from './geometry'
import { useGuide } from './GuideProvider'
import { SpeechBubble } from './SpeechBubble'
import { nextTip, restTip } from './tips'

const SIZE = 72
const viewport = () => ({ w: window.innerWidth, h: window.innerHeight })

function startPosition(head: DOMRect | null, pointer: Point | null): Point {
  if (head) return { x: head.left + head.width / 2 - SIZE / 2, y: Math.max(8, head.top) }
  if (pointer) return companionTarget(pointer, viewport(), SIZE)
  return { x: window.innerWidth - SIZE - 24, y: window.innerHeight - SIZE - 24 }
}

export function Companion() {
  const { context, openMenu, heroHeadRect, pointer, shownTips } = useGuide()
  const [start] = useState(() => startPosition(heroHeadRect.current, pointer.current))
  const tx = useMotionValue(start.x)
  const ty = useMotionValue(start.y)
  const x = useSpring(tx, springs.follow)
  const y = useSpring(ty, springs.follow)
  const vx = useVelocity(x)
  const tilt = useSpring(useTransform(vx, (v) => tiltFromVelocity(v)), springs.tilt)
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const sgx = useSpring(gx, springs.gaze)
  const sgy = useSpring(gy, springs.gaze)
  const opacity = useMotionValue(1)
  const pointerEvents = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'))

  const [tip, setTip] = useState<string | null>(null)
  const [placement, setPlacement] = useState({ below: false, left: false })
  const resting = useRef(false)
  const contextRef = useRef(context)

  useEffect(() => {
    contextRef.current = context
    if (!resting.current) return
    const timer = window.setTimeout(() => {
      const t = nextTip(context, shownTips.current)
      if (t) setTip(t)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [context, shownTips])

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), 6000)
    return () => window.clearTimeout(t)
  }, [tip])

  useEffect(() => {
    let idle: number | undefined
    let avoid = false
    let selecting = false
    let outside = false
    const fade = () => animate(opacity, avoid || selecting || outside ? 0 : 1, { duration: 0.2 })

    const goTo = (t: Point) => {
      tx.set(t.x)
      ty.set(t.y)
      setPlacement((prev) => nextPlacement(prev, { below: t.y < 140, left: t.x < 260 }))
    }
    const moveTo = (p: Point) => goTo(companionTarget(p, viewport(), SIZE))
    const first = initialTarget(pointer.current, viewport(), SIZE)
    goTo(first)
    // Also drive the springs directly: under StrictMode the re-run sets tx/ty to the value they
    // already hold, which emits no change, so the springs would never leave the spawn point.
    x.set(first.x)
    y.set(first.y)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (outside) {
        outside = false
        fade()
      }
      const p = { x: e.clientX, y: e.clientY }
      const center = { x: x.get() + SIZE / 2, y: y.get() + SIZE / 2 }
      const d = gaze(p, center, viewport())
      gx.set(d.dx)
      gy.set(d.dy)
      if (!shouldFollow(p, center, resting.current)) return
      if (resting.current) setTip(null)
      resting.current = false
      moveTo(p)
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        resting.current = true
        const t = restTip(contextRef.current, shownTips.current, !(avoid || selecting || outside))
        if (t) setTip(t)
      }, 1500)
    }
    const onOver = (e: PointerEvent) => {
      avoid = isAvoidTarget(e.target)
      fade()
    }
    const onSelection = () => {
      const s = document.getSelection()
      selecting = !!s && !s.isCollapsed && s.toString().trim().length > 0
      fade()
    }
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        outside = true
        fade()
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('selectionchange', onSelection)
    document.addEventListener('mouseout', onOut)
    return () => {
      window.clearTimeout(idle)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('selectionchange', onSelection)
      document.removeEventListener('mouseout', onOut)
    }
  }, [gx, gy, opacity, pointer, shownTips, tx, ty, x, y])

  return (
    <motion.div
      data-guide
      className="fixed left-0 top-0 z-50"
      style={{ x, y, rotate: tilt, opacity, pointerEvents }}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={springs.soft}
    >
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open guide"
        className="glass block h-[72px] w-[72px] overflow-hidden rounded-full border border-line shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Badge gazeX={sgx} gazeY={sgy} />
      </button>
      <SpeechBubble
        text={tip}
        className={cn(placement.below ? 'top-full mt-3' : 'bottom-full mb-3', placement.left ? 'left-0' : 'right-0')}
      />
    </motion.div>
  )
}
