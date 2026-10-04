import type { ArchNode, Architecture } from '@/data/types'

export type GraphOptions = { nodeW: number; nodeH: number; gapX: number; gapY: number; pad: number }
export type PlacedNode = ArchNode & { x: number; y: number; layer: number }
export type PlacedEdge = {
  from: string
  to: string
  label?: string
  bidirectional?: boolean
  path: string
  labelX: number
  labelY: number
}
export type GraphLayout = { width: number; height: number; nodeW: number; nodeH: number; nodes: PlacedNode[]; edges: PlacedEdge[] }

const DEFAULTS: GraphOptions = { nodeW: 168, nodeH: 58, gapX: 24, gapY: 72, pad: 8 }

export function layoutGraph(arch: Architecture, opts: Partial<GraphOptions> = {}): GraphLayout {
  const { nodeW, nodeH, gapX, gapY, pad } = { ...DEFAULTS, ...opts }
  const ids = new Set(arch.nodes.map((n) => n.id))
  for (const e of arch.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) throw new Error(`Unknown node in edge ${e.from} → ${e.to}`)
  }

  // Longest-path layering via relaxation; more than N passes means a cycle.
  const layer = new Map(arch.nodes.map((n) => [n.id, 0]))
  for (let pass = 0; ; pass++) {
    if (pass > arch.nodes.length) throw new Error('Architecture graph has a cycle')
    let changed = false
    for (const e of arch.edges) {
      const next = layer.get(e.from)! + 1
      if (next > layer.get(e.to)!) {
        layer.set(e.to, next)
        changed = true
      }
    }
    if (!changed) break
  }

  const layers: ArchNode[][] = []
  for (const n of arch.nodes) (layers[layer.get(n.id)!] ??= []).push(n)
  const widest = Math.max(...layers.map((l) => l.length))
  const width = widest * nodeW + (widest - 1) * gapX + 2 * pad
  const height = layers.length * nodeH + (layers.length - 1) * gapY + 2 * pad

  const nodes: PlacedNode[] = layers.flatMap((row, li) => {
    const rowW = row.length * nodeW + (row.length - 1) * gapX
    const x0 = (width - rowW) / 2
    return row.map((n, i) => ({ ...n, layer: li, x: x0 + i * (nodeW + gapX), y: pad + li * (nodeH + gapY) }))
  })
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const outgoing = new Map<string, number>()
  const edges: PlacedEdge[] = arch.edges.map((e) => {
    const s = byId.get(e.from)!
    const t = byId.get(e.to)!
    const siblings = arch.edges.filter((x) => x.from === e.from).length
    const k = outgoing.get(e.from) ?? 0
    outgoing.set(e.from, k + 1)
    const x1 = s.x + nodeW / 2 + (k - (siblings - 1) / 2) * 14
    const y1 = s.y + nodeH
    const x2 = t.x + nodeW / 2
    const y2 = t.y
    const dy = (y2 - y1) / 2
    const path = `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`
    return { ...e, path, labelX: (x1 + x2) / 2 + 6, labelY: (y1 + y2) / 2 + 4 }
  })

  return { width, height, nodeW, nodeH, nodes, edges }
}
