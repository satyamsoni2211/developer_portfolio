import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { safeGet, safeSet } from '@/lib/storage'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { springs } from '@/theme/motion'
import { Character } from './Character'
import { gaze } from './geometry'
import { useGuide } from './GuideProvider'
import { TIPS } from './tips'
import { SpeechBubble } from './SpeechBubble'

export function HeroCharacter() {
  const g = useGuide()
  const { setHeroVisible, heroHeadRect: heroHeadRectRef, shownTips: shownTipsRef, hidden } = g
  const wrapRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { amount: 0.25, initial: true })
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const sx = useSpring(gx, springs.gaze)
  const sy = useSpring(gy, springs.gaze)
  const [tip, setTip] = useState<string | null>(null)

  useEffect(() => {
    if (!inView && headRef.current) heroHeadRectRef.current = headRef.current.getBoundingClientRect()
    setHeroVisible(inView)
  }, [inView, setHeroVisible, heroHeadRectRef])

  useEffect(() => () => setHeroVisible(false), [setHeroVisible])

  useEffect(() => {
    if (reduce || !finePointer) return
    const onMove = (e: PointerEvent) => {
      const head = headRef.current?.getBoundingClientRect()
      if (!head) return
      const d = gaze({ x: e.clientX, y: e.clientY }, { x: head.left + head.width / 2, y: head.top + head.height / 2 }, { w: window.innerWidth, h: window.innerHeight })
      gx.set(d.dx)
      gy.set(d.dy)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, finePointer, gx, gy])

  useEffect(() => {
    if (hidden || safeGet('guide-greeted', 'session')) return
    const show = window.setTimeout(() => {
      setTip(TIPS.hero)
      shownTipsRef.current.add('hero')
      safeSet('guide-greeted', '1', 'session')
    }, 900)
    const hide = window.setTimeout(() => setTip(null), 6900)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [hidden, shownTipsRef])

  return (
    <div ref={wrapRef} className="relative h-[360px] lg:h-[min(72vh,640px)]" style={{ aspectRatio: '750 / 2020' }}>
      <Character gazeX={sx} gazeY={sy} headRef={headRef} eager sizes="(min-width: 1024px) 240px, 134px" className="h-full" />
      <SpeechBubble text={tip} className="right-[62%] top-[2%]" />
    </div>
  )
}
