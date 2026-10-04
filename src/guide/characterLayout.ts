import body1x from '@/assets/character/body-1x.webp'
import body2x from '@/assets/character/body-2x.webp'
import head1x from '@/assets/character/head-1x.webp'
import head2x from '@/assets/character/head-2x.webp'
import layoutJson from '@/assets/character/layout.json'

type Box = { x: number; y: number; w: number; h: number }
type Eye = { cx: number; cy: number }

export type CharacterLayout = {
  frame: { w: number; h: number }
  head: Box
  badge: Box
  pivot: { x: number; y: number }
  eyes: {
    left: Eye
    right: Eye
    rx: number
    ry: number
    irisR: number
    travelX: number
    travelY: number
    skin: string
    sclera: string
    iris: string
    lid: string
  }
}

export const layout = layoutJson as CharacterLayout
export const assets = { body1x, body2x, head1x, head2x }
export const MAX_YAW = 12
export const MAX_PITCH = 8

export const pct = (part: number, whole: number) => `${(part / whole) * 100}%`
