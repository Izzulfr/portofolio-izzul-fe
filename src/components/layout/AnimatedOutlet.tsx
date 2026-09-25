import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType, useOutlet } from 'react-router'
import { ease } from '@/lib/motion'
import { scrollToPosition, useLenis } from './SmoothScroll'

/**
 * The outlet as it was when this page mounted. Without freezing it, the page
 * that is animating out would already render the next route's content.
 */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

/** Cross-fades between routes and restores scroll the way a real page load would. */
export function AnimatedOutlet() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const lenis = useLenis()
  const positions = useRef(new Map<string, number>())
  const displayedKey = useRef(location.key)

  // Remember where each history entry was scrolled to, for back and forward.
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => positions.current.set(displayedKey.current, window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  function onExitComplete() {
    displayedKey.current = location.key
    const restored = navigationType === 'POP' ? (positions.current.get(location.key) ?? 0) : 0
    scrollToPosition(lenis, location.hash ? 0 : restored)
    // Move focus to the new page, so keyboard and screen reader users start there.
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      >
        <FrozenOutlet />
      </motion.div>
    </AnimatePresence>
  )
}
