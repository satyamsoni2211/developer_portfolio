import { useEffect, useId, type Ref } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'
import { assets, layout, MAX_PITCH, MAX_YAW, pct } from './characterLayout'

type Gaze = { gazeX: MotionValue<number>; gazeY: MotionValue<number> }

function Eyes({ gazeX, gazeY }: Gaze) {
  const { eyes: e, head } = layout
  const reduce = useReducedMotion()
  const ix = useTransform(gazeX, [-1, 1], [-e.travelX, e.travelX])
  const iy = useTransform(gazeY, [-1, 1], [-e.travelY, e.travelY])
  const lid = useMotionValue(0)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  useEffect(() => {
    if (reduce) return
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(() => {
        animate(lid, [0, 1, 0], { duration: 0.16, ease: 'easeInOut' })
        schedule()
      }, 3000 + Math.random() * 3000)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [lid, reduce])

  return (
    <svg viewBox={`0 0 ${head.w} ${head.h}`} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      {[e.left, e.right].map((c, i) => {
        const clip = `${uid}-eye-${i}`
        return (
          <g key={clip}>
            <clipPath id={clip}>
              <ellipse cx={c.cx} cy={c.cy} rx={e.rx} ry={e.ry} />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <ellipse cx={c.cx} cy={c.cy} rx={e.rx + 1} ry={e.ry + 1} fill={e.sclera} />
              <motion.g style={{ x: ix, y: iy }}>
                <circle cx={c.cx} cy={c.cy} r={e.irisR} fill={e.iris} />
                <circle cx={c.cx} cy={c.cy} r={e.irisR * 0.45} fill="#120c09" />
                <circle cx={c.cx + e.irisR * 0.35} cy={c.cy - e.irisR * 0.35} r={1.6} fill="#fff" opacity={0.85} />
              </motion.g>
              <motion.rect
                x={c.cx - e.rx - 1}
                y={c.cy - e.ry - 1}
                width={2 * e.rx + 2}
                height={2 * e.ry + 2}
                fill={e.skin}
                style={{ scaleY: lid, originY: 0, transformBox: 'fill-box' }}
              />
            </g>
            <path
              d={`M${c.cx - e.rx} ${c.cy + 1} Q${c.cx} ${c.cy - 2 * e.ry - 1} ${c.cx + e.rx} ${c.cy + 1}`}
              stroke={e.lid}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )
      })}
    </svg>
  )
}

type Props = Gaze & { headRef?: Ref<HTMLDivElement>; className?: string; sizes?: string; eager?: boolean }

export function Character({ gazeX, gazeY, headRef, className, sizes = '240px', eager = false }: Props) {
  const { frame, head, pivot } = layout
  const rotateY = useTransform(gazeX, [-1, 1], [-MAX_YAW, MAX_YAW])
  const rotateX = useTransform(gazeY, [-1, 1], [MAX_PITCH, -MAX_PITCH])
  const shiftX = useTransform(gazeX, [-1, 1], ['-2%', '2%'])
  const lean = useTransform(gazeX, [-1, 1], [-1.5, 1.5])

  return (
    <div className={cn('relative select-none', className)} style={{ aspectRatio: `${frame.w} / ${frame.h}` }}>
      <motion.div className="absolute inset-0" style={{ rotate: lean, originX: 0.5, originY: 1 }}>
        <div className="animate-breathe absolute inset-0">
          <img
            src={assets.body1x}
            srcSet={`${assets.body1x} 240w, ${assets.body2x} 480w`}
            sizes={sizes}
            width={240}
            height={646}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={eager ? 'high' : 'auto'}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="absolute"
            style={{
              left: pct(head.x, frame.w),
              top: pct(head.y, frame.h),
              width: pct(head.w, frame.w),
              height: pct(head.h, frame.h),
              perspective: 800,
            }}
          >
            <motion.div
              ref={headRef}
              className="absolute inset-0"
              style={{ rotateX, rotateY, x: shiftX, transformOrigin: `${pct(pivot.x, head.w)} ${pct(pivot.y, head.h)}` }}
            >
              <img
                src={assets.head1x}
                srcSet={`${assets.head1x} 1x, ${assets.head2x} 2x`}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={eager ? 'high' : 'auto'}
                className="absolute inset-0 h-full w-full"
              />
              <Eyes gazeX={gazeX} gazeY={gazeY} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
