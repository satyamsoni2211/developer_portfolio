export const EASE = [0.2, 0.8, 0.2, 1] as const

export const springs = {
  reveal: { type: 'spring', stiffness: 90, damping: 20, mass: 0.9 },
  soft: { type: 'spring', stiffness: 260, damping: 30 },
  gaze: { stiffness: 120, damping: 18 },
  follow: { stiffness: 150, damping: 20, mass: 0.8 },
  tilt: { stiffness: 200, damping: 25 },
} as const
