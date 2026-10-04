import { useId, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { ArchNode, Architecture } from '@/data/types'
import { layoutGraph } from '@/lib/graph'

const KIND_CLASS: Record<ArchNode['kind'], string> = {
  client: 'fill-elevated stroke-line',
  service: 'fill-accent/10 stroke-accent',
  model: 'fill-[hsl(280_80%_60%/.12)] stroke-[hsl(280_70%_60%)]',
  store: 'fill-fg/[.04] stroke-line',
  device: 'fill-fg/[.04] stroke-line [stroke-dasharray:5_4]',
}

export function ArchitectureDiagram({ graph }: { graph: Architecture }) {
  const layout = useMemo(() => layoutGraph(graph), [graph])
  const reduce = useReducedMotion()
  const marker = `arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { nodeW, nodeH } = layout

  return (
    <div className="card overflow-x-auto p-4 sm:p-8">
      <svg
        role="img"
        aria-label={`Architecture: ${graph.nodes.map((n) => n.label).join(', ')}`}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="mx-auto block w-full min-w-[480px] max-w-3xl"
      >
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-muted" />
          </marker>
        </defs>
        {layout.edges.map((e, i) => (
          <g key={`${e.from}-${e.to}`}>
            <motion.path
              d={e.path}
              fill="none"
              strokeWidth={1.5}
              className="stroke-muted/70"
              markerEnd={`url(#${marker})`}
              markerStart={e.bidirectional ? `url(#${marker})` : undefined}
              initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.15 : 0.8, delay: reduce ? 0 : 0.25 + i * 0.08 }}
            />
            {e.label && (
              <text x={e.labelX} y={e.labelY} fontSize={11} className="fill-muted">
                {e.label}
              </text>
            )}
          </g>
        ))}
        {layout.nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduce ? 0 : i * 0.06 }}
          >
            <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={14} strokeWidth={1.25} className={KIND_CLASS[n.kind]} />
            <text x={n.x + nodeW / 2} y={n.y + (n.sub ? 25 : 34)} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-fg">
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x + nodeW / 2} y={n.y + 43} textAnchor="middle" fontSize={11} className="fill-muted">
                {n.sub}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
