import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// eslint-disable-next-line react-refresh/only-export-components
export function formatMetric(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }

export function CountUp({ value, prefix = '', suffix = '', decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const text = (n: number) => `${prefix}${formatMetric(n, decimals)}${suffix}`

  useLayoutEffect(() => {
    if (!reduce && ref.current) ref.current.textContent = text(0)
    // run once on mount: start from zero before the first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduce) {
      el.textContent = text(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = text(v)
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, prefix, suffix, decimals])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {text(value)}
    </span>
  )
}
