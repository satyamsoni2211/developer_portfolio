import type { MotionValue } from 'motion/react'
import { Character } from './Character'
import { layout } from './characterLayout'

/** Head-and-shoulders crop of the full character inside a circle. */
export function Badge({ gazeX, gazeY }: { gazeX: MotionValue<number>; gazeY: MotionValue<number> }) {
  const { frame, badge } = layout
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full bg-accent/10">
      <div
        className="absolute"
        style={{
          width: `${(frame.w / badge.w) * 100}%`,
          left: `${(-badge.x / badge.w) * 100}%`,
          top: `${(-badge.y / badge.h) * 100}%`,
        }}
      >
        <Character gazeX={gazeX} gazeY={gazeY} sizes="128px" />
      </div>
    </div>
  )
}
