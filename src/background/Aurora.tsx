import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useTheme } from '@/theme/ThemeProvider'
import { createAurora, type AuroraRenderer } from './auroraGl'
import { paletteFor, paletteGradient } from './palettes'

/**
 * Fixed northern-lights backdrop. WebGL when available (started after first paint), otherwise a
 * static CSS gradient in the same palette. Vivid on dark, a soft dawn wash on light.
 */
export function Aurora({ context }: { context: string }) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<AuroraRenderer | null>(null)
  const [webgl, setWebgl] = useState<'pending' | 'on' | 'off'>('pending')
  const palette = paletteFor(context)
  const dark = theme === 'dark'

  useEffect(() => {
    if (reduce) return
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    const start = () => {
      if (cancelled) return
      const r = createAurora(canvas, paletteFor(context), () => setWebgl('off'))
      rendererRef.current = r
      setWebgl(r ? 'on' : 'off')
    }
    const idle = window.setTimeout(start, 250)
    return () => {
      cancelled = true
      window.clearTimeout(idle)
      rendererRef.current?.destroy()
      rendererRef.current = null
    }
    // context is applied by the effect below; the renderer is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  useEffect(() => {
    rendererRef.current?.setPalette(palette)
  }, [palette])

  useEffect(() => {
    rendererRef.current?.setStars(dark)
  }, [dark, webgl])

  const showCanvas = !reduce && webgl !== 'off'
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        data-aurora="fallback"
        className="absolute inset-0 transition-opacity duration-700"
        style={{ backgroundImage: paletteGradient(palette), opacity: webgl === 'on' ? 0 : dark ? 0.9 : 0.55 }}
      />
      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full transition-opacity duration-1000"
          style={{ opacity: webgl === 'on' ? (dark ? 1 : 0.38) : 0 }}
        />
      )}
    </div>
  )
}
