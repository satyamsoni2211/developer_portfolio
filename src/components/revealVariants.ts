import type { Variants } from 'motion/react'
import { springs } from '@/theme/motion'

/** Pure builder, exported for tests. `filter` is cleared after the blur-in so cards stay glass. */
export function itemVariants(reduce: boolean, delay = 0, pop = false): Variants {
  if (reduce) {
    return { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.15, delay } } }
  }
  if (pop) {
    return {
      hidden: { opacity: 0, y: 48, scale: 0.9, filter: 'blur(10px)' },
      shown: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { ...springs.pop, delay }, transitionEnd: { filter: 'none' } },
    }
  }
  return {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...springs.reveal, delay }, transitionEnd: { filter: 'none' } },
  }
}
