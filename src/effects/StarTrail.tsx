import { useEffect, useRef } from 'react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { useTheme } from '@/theme/ThemeProvider'
import { emit, step, type Spark } from './trail'

type Point = { x: number; y: number; t: number }

const TAIL_MS = 220 // how long the comet's tail lingers
const DARK = { head: '255, 255, 255', sparks: ['255, 255, 255', '43, 255, 136', '0, 212, 200', '138, 75, 255'] }
const LIGHT = { head: '0, 85, 170', sparks: ['0, 113, 227', '138, 75, 255', '0, 150, 140', '214, 51, 170'] }

/** Shooting-star trail behind the mouse. Mouse/pen only; absent for touch and reduced motion. */
export function StarTrail() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  if (!fine || reduce) return null
  return <TrailCanvas />
}

function TrailCanvas() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const darkRef = useRef(theme === 'dark')

  useEffect(() => {
    darkRef.current = theme === 'dark'
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') ?? null
    const sparks: Spark[] = []
    let tail: Point[] = []
    let raf = 0
    let lastFrame = 0
    let prev: { x: number; y: number } | null = null

    const resize = () => {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(document.documentElement.clientWidth * dpr)
      canvas.height = Math.round(document.documentElement.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      if (!canvas || !ctx) return
      const dt = Math.max(0, Math.min(0.05, (now - lastFrame) / 1000))
      lastFrame = now
      step(sparks, dt)
      tail = tail.filter((p) => now - p.t < TAIL_MS)

      const colours = darkRef.current ? DARK : LIGHT
      ctx.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight)
      ctx.globalCompositeOperation = darkRef.current ? 'lighter' : 'source-over'
      ctx.lineCap = 'round'

      // Tail: tapered and fading toward its oldest point.
      for (let i = 1; i < tail.length; i++) {
        const f = i / tail.length
        ctx.strokeStyle = `rgba(${colours.head}, ${f * f * 0.85})`
        ctx.lineWidth = 0.5 + f * 3
        ctx.beginPath()
        ctx.moveTo(tail[i - 1].x, tail[i - 1].y)
        ctx.lineTo(tail[i].x, tail[i].y)
        ctx.stroke()
      }

      // Head: a soft glow at the newest point.
      const head = tail[tail.length - 1]
      if (head && tail.length > 1) {
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12)
        glow.addColorStop(0, `rgba(${colours.head}, 0.9)`)
        glow.addColorStop(1, `rgba(${colours.head}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const s of sparks) {
        const life = 1 - s.age / s.ttl
        ctx.fillStyle = `rgba(${colours.sparks[s.hue]}, ${life * 0.9})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (0.4 + life * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }

      if (sparks.length > 0 || tail.length > 0) raf = requestAnimationFrame(draw)
      else {
        raf = 0
        prev = null
        ctx.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight)
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!ctx || e.pointerType === 'touch') return
      const now = performance.now()
      if (prev) emit(sparks, e.clientX, e.clientY, e.clientX - prev.x, e.clientY - prev.y)
      prev = { x: e.clientX, y: e.clientY }
      tail.push({ x: e.clientX, y: e.clientY, t: now })
      if (!raf) {
        lastFrame = now
        raf = requestAnimationFrame(draw)
      }
    }

    const onLeave = () => {
      prev = null
    }

    resize()
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] h-full w-full" />
}
