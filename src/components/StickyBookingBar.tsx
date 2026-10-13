import { useEffect, useState } from 'react'
import { BOOKING_SECTION_ID } from '../booking/context'
import { useShop } from '../content/hooks'
import { useScrolledPast } from '../hooks/useScrolledPast'
import { Button } from './Button'
import styles from './StickyBookingBar.module.css'

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement && el.matches('input, select, textarea, [contenteditable="true"]')

/**
 * Phones and small tablets: Book / Call pinned to the bottom of the screen once the hero has scrolled away.
 * It steps aside while the booking form, contact section or footer is on screen (they have the same actions)
 * and while a form field has focus, so it never sits over the on-screen keyboard or the field being typed in.
 */
export function StickyBookingBar() {
  const shop = useShop()
  const pastHero = useScrolledPast('home', 0)
  const [targetInView, setTargetInView] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const targets = [document.getElementById(BOOKING_SECTION_ID), document.getElementById('contact'), document.querySelector('footer')]
    const inView = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target)
        else inView.delete(entry.target)
      }
      setTargetInView(inView.size > 0)
    })
    for (const el of targets) if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => setTyping(isField(e.target))
    const onFocusOut = (e: FocusEvent) => setTyping(isField(e.relatedTarget))
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  const visible = pastHero && !targetInView && !typing

  return (
    <div className={`${styles.bar} ${visible ? styles.visible : ''}`} inert={!visible} aria-hidden={!visible}>
      <Button href={`#${BOOKING_SECTION_ID}`} icon="calendar" className={styles.book}>
        Book Now
      </Button>
      <Button href={shop.phone.href} variant="secondary" icon="phone">
        Call
      </Button>
    </div>
  )
}
