import { useEffect, useState } from 'react'

/** True once the bottom of the element with `targetId` has scrolled above `offset` px from the viewport top. */
export function useScrolledPast(targetId: string, offset = 0) {
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = document.getElementById(targetId)
      if (el) setScrolledPast(el.getBoundingClientRect().bottom <= offset)
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
  }, [targetId, offset])

  return scrolledPast
}
