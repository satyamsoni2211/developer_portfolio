import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'

export function SpeechBubble({ text, className }: { text: string | null; className?: string }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          aria-hidden
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={springs.soft}
          className={cn(
            'glass pointer-events-none absolute w-max max-w-[240px] rounded-2xl border border-line px-4 py-2.5 text-sm leading-snug text-fg shadow-lg',
            className,
          )}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
