import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { springs } from '@/theme/motion'
import { Badge } from './Badge'
import { useGuide } from './GuideProvider'
import { SpeechBubble } from './SpeechBubble'
import { nextTip } from './tips'

export function Docked() {
  const { context, openMenu, shownTips } = useGuide()
  const reduce = useReducedMotion()
  const hop = useMotionValue(0)
  const gx = useMotionValue(-0.5)
  const gy = useMotionValue(-0.4)
  const [tip, setTip] = useState<string | null>(null)

  useEffect(() => {
    if (!reduce) animate(hop, [0, -10, 0], { duration: 0.45, ease: 'easeOut' })
    const show = window.setTimeout(() => {
      const t = nextTip(context, shownTips.current)
      if (t) setTip(t)
    }, 800)
    return () => window.clearTimeout(show)
  }, [context, hop, reduce, shownTips])

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), 5000)
    return () => window.clearTimeout(t)
  }, [tip])

  return (
    <motion.div
      data-guide
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50"
      style={{ y: hop }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={springs.soft}
    >
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open guide"
        className="glass block h-16 w-16 overflow-hidden rounded-full border border-line shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Badge gazeX={gx} gazeY={gy} />
      </button>
      <SpeechBubble text={tip} className="bottom-full right-0 mb-3" />
    </motion.div>
  )
}
