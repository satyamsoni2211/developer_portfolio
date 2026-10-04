import { useEffect, useState } from 'react'

/** Id of the section crossing the middle of the viewport. `key` re-subscribes (e.g. pathname). */
export function useActiveSection(ids: readonly string[], key: string): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // ids is a module constant; re-run only when the page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}
