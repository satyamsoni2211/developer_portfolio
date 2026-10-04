import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { springs } from '@/theme/motion'

const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

function useItemVariants(delay = 0, pop = false): Variants {
  const reduce = useReducedMotion()
  if (reduce) {
    return { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.15, delay } } }
  }
  if (pop) {
    return {
      hidden: { opacity: 0, y: 48, scale: 0.9, filter: 'blur(10px)' },
      shown: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { ...springs.pop, delay } },
    }
  }
  return {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...springs.reveal, delay } },
  }
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const variants = useItemVariants(delay)
  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      {children}
    </motion.div>
  )
}

const groupVariants: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.08 } } }

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul' | 'ol'
}) {
  const Component = as === 'ul' ? motion.ul : as === 'ol' ? motion.ol : motion.div
  return (
    <Component className={className} variants={groupVariants} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      {children}
    </Component>
  )
}

export function RevealItem({
  children,
  className,
  as = 'div',
  pop = false,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
  pop?: boolean
}) {
  const variants = useItemVariants(0, pop)
  const Component = as === 'li' ? motion.li : motion.div
  return (
    <Component className={className} variants={variants}>
      {children}
    </Component>
  )
}
