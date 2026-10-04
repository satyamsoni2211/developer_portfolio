import { describe, expect, test } from 'vitest'
import { projects } from '@/data/projects'
import { layoutGraph } from './graph'

const defect = projects.find((p) => p.slug === 'defect-detection')!.architecture!

describe('layoutGraph', () => {
  test('assigns longest-path layers', () => {
    const { nodes } = layoutGraph(defect)
    const layer = Object.fromEntries(nodes.map((n) => [n.id, n.layer]))
    expect(layer).toEqual({ dash: 0, backend: 1, camsvc: 2, yolo: 2, db: 2, cams: 3 })
  })

  test('sizes the canvas to the widest layer', () => {
    const g = layoutGraph(defect, { nodeW: 100, nodeH: 40, gapX: 10, gapY: 50, pad: 5 })
    expect(g.width).toBe(3 * 100 + 2 * 10 + 2 * 5)
    expect(g.height).toBe(4 * 40 + 3 * 50 + 2 * 5)
  })

  test('nodes in a layer share y and do not overlap', () => {
    const { nodes, nodeW } = layoutGraph(defect)
    const row = nodes.filter((n) => n.layer === 2).sort((a, b) => a.x - b.x)
    expect(new Set(row.map((n) => n.y)).size).toBe(1)
    for (let i = 1; i < row.length; i++) expect(row[i].x - row[i - 1].x).toBeGreaterThanOrEqual(nodeW)
  })

  test('edges go from source bottom to target top', () => {
    const g = layoutGraph(defect)
    const e = g.edges.find((x) => x.from === 'dash')!
    const src = g.nodes.find((n) => n.id === 'dash')!
    expect(e.path.startsWith(`M${src.x + g.nodeW / 2} ${src.y + g.nodeH}`)).toBe(true)
  })

  test('throws on unknown node ids and cycles', () => {
    expect(() => layoutGraph({ nodes: [{ id: 'a', label: 'A', kind: 'service' }], edges: [{ from: 'a', to: 'zzz' }] })).toThrow(/unknown/i)
    expect(() =>
      layoutGraph({
        nodes: [{ id: 'a', label: 'A', kind: 'service' }, { id: 'b', label: 'B', kind: 'service' }],
        edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
      }),
    ).toThrow(/cycle/i)
  })

  test('every project architecture lays out', () => {
    for (const p of projects) if (p.architecture) expect(() => layoutGraph(p.architecture!)).not.toThrow()
  })
})
