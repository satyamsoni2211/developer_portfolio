import type { CSSProperties, ReactNode } from 'react'
import type { CoverVariant } from '@/data/types'
import { cn } from '@/lib/utils'

const HUES: Record<CoverVariant, number> = {
  gear: 25, pose: 150, pitch: 95, graph: 265, brackets: 200, layers: 320, pipeline: 185, grid: 230, certificate: 45,
}

function Figure({ x, arm, accent }: { x: number; arm: number; accent?: boolean }) {
  const joint = accent ? 'fill-accent' : 'fill-current'
  return (
    <g className={accent ? 'stroke-accent' : undefined}>
      <circle cx={x} cy={62} r={13} />
      <path d={`M${x} 75 L${x} 140 M${x} 92 L${x - 38} ${92 + arm} M${x} 92 L${x + 38} ${92 - arm} M${x} 140 L${x - 26} 196 M${x} 140 L${x + 26} 196`} />
      {[[x, 92], [x - 38, 92 + arm], [x + 38, 92 - arm], [x, 140], [x - 26, 196], [x + 26, 196]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.5} className={joint} stroke="none" />
      ))}
    </g>
  )
}

const ART: Record<CoverVariant, ReactNode> = {
  gear: (
    <g>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={193} y={50} width={14} height={18} rx={3} transform={`rotate(${i * 30} 200 125)`} />
      ))}
      <circle cx={200} cy={125} r={58} />
      <circle cx={200} cy={125} r={20} />
      <rect x={222} y={66} width={74} height={56} rx={4} strokeDasharray="6 5" className="stroke-accent" />
      <rect x={222} y={48} width={74} height={18} rx={4} className="fill-accent stroke-accent" />
      <text x={259} y={61} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-white" stroke="none">
        defect 0.97
      </text>
    </g>
  ),
  pose: (
    <g>
      <Figure x={150} arm={-18} />
      <Figure x={250} arm={-10} accent />
      <path d="M180 220 L220 220" strokeDasharray="3 6" />
    </g>
  ),
  pitch: (
    <g>
      <polygon points="150,232 250,232 224,42 176,42" />
      <path d="M160 205 L240 205 M178 60 L222 60" />
      <path d="M190 42 L190 22 M200 42 L200 22 M210 42 L210 22" />
      <path d="M340 26 Q235 36 206 150 Q201 176 196 218" strokeDasharray="1 9" strokeWidth={4} className="stroke-accent" />
      <circle cx={206} cy={150} r={7} className="fill-accent stroke-accent" />
    </g>
  ),
  graph: (
    <g>
      {[[200, 125, 110, 70], [200, 125, 300, 70], [200, 125, 110, 185], [200, 125, 300, 185], [110, 70, 300, 70], [300, 185, 110, 185]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {[[110, 70], [300, 70], [110, 185], [300, 185]].map(([cx, cy]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={14} className="fill-bg" />
      ))}
      <circle cx={200} cy={125} r={24} className="fill-accent stroke-accent" />
    </g>
  ),
  brackets: (
    <g>
      <path d="M150 70 L95 125 L150 180 M250 70 L305 125 L250 180" strokeWidth={6} />
      <path d="M222 60 L178 190" strokeWidth={6} className="stroke-accent" />
    </g>
  ),
  layers: (
    <g>
      {[150, 120, 90].map((y, i) => (
        <path key={y} d={`M200 ${y - 30} L290 ${y} L200 ${y + 30} L110 ${y} Z`} className={i === 2 ? 'stroke-accent' : undefined} />
      ))}
    </g>
  ),
  pipeline: (
    <g>
      {[70, 175, 280].map((x, i) => (
        <rect key={x} x={x - 32} y={100} width={64} height={50} rx={12} className={i === 1 ? 'stroke-accent' : undefined} />
      ))}
      <path d="M102 125 L143 125 M207 125 L248 125" />
      {[118, 130, 224, 236].map((x) => (
        <circle key={x} cx={x} cy={125} r={3} className="fill-accent stroke-accent" />
      ))}
    </g>
  ),
  grid: (
    <g>
      {[0, 1, 2].flatMap((c) =>
        [0, 1].map((r) => (
          <rect
            key={`${c}${r}`}
            x={110 + c * 64}
            y={70 + r * 64}
            width={52}
            height={52}
            rx={12}
            className={c === 1 && r === 0 ? 'fill-accent/20 stroke-accent' : undefined}
          />
        )),
      )}
    </g>
  ),
  certificate: (
    <g>
      <rect x={120} y={55} width={160} height={120} rx={10} />
      <path d="M145 90 L255 90 M145 112 L230 112" />
      <circle cx={245} cy={160} r={24} className="fill-bg stroke-accent" />
      <path d="M235 160 L243 168 L257 152" className="stroke-accent" strokeWidth={3} />
      <path d="M95 200 A 110 110 0 0 0 305 200" strokeDasharray="4 8" />
    </g>
  ),
}

export function ProjectCover({ variant, slug, className }: { variant: CoverVariant; slug: string; className?: string }) {
  const hue = HUES[variant]
  const style = {
    viewTransitionName: `cover-${slug}`,
    backgroundImage: `radial-gradient(120% 120% at 0% 0%, hsl(${hue} 90% 60% / .26), transparent 60%), radial-gradient(120% 120% at 100% 100%, hsl(${hue + 50} 90% 60% / .2), transparent 55%)`,
  } as CSSProperties
  return (
    <div className={cn('relative overflow-hidden bg-fg/[.02]', className)} style={style}>
      <svg
        viewBox="0 0 400 250"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full text-fg/70 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      >
        {ART[variant]}
      </svg>
    </div>
  )
}
