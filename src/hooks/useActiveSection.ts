import { useEffect, useState } from 'react'

/**
 * Scrollspy: the active section is the last one whose top has passed `offset` px from the viewport top
 * (i.e. the one sitting under the fixed navbar). At the very bottom of the page the last section wins,
 * since short final sections can never reach the top on tall screens.
 */
export function useActiveSection<T extends string>(ids: readonly T[], initial: T, offset = 120) {
  const [active, setActive] = useState<T>(initial)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) {
        setActive(ids[ids.length - 1])
        return
      }
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= offset) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids, offset])

  return active
}
