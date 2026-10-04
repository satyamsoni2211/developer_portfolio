import { Fragment } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { springs } from '@/theme/motion'

type Props = { text: string; as?: 'h1' | 'h2'; id?: string; className?: string }

const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

/**
 * Heading whose words slide up from behind a mask. The heading is what gets observed: the words
 * start translated out of their overflow-hidden masks, so an observer on them would see them as
 * clipped forever and never reveal them.
 */
export function SplitHeading({ text, as = 'h2', id, className }: Props) {
  const reduce = useReducedMotion()
  const Tag = as === 'h1' ? motion.h1 : motion.h2
  const words = text.split(' ')
  const container: Variants = { hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.045 } } }
  const word: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.15 } } }
    : { hidden: { y: '110%' }, shown: { y: '0%', transition: springs.reveal } }

  return (
    <Tag id={id} className={className} aria-label={text} variants={container} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
