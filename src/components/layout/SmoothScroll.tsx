import Lenis from 'lenis'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const LenisContext = createContext<Lenis | null>(null)

/**
 * Eased wheel scrolling for the public site. Touch devices keep native scrolling,
 * and anyone who prefers reduced motion gets plain browser scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let instance: Lenis | null = null

    const sync = () => {
      if (reduceMotion.matches) {
        instance?.destroy()
        instance = null
      } else if (!instance) {
        instance = new Lenis({ autoRaf: true, lerp: 0.11 })
      }
      setLenis(instance)
    }

    sync()
    reduceMotion.addEventListener('change', sync)
    return () => {
      reduceMotion.removeEventListener('change', sync)
      instance?.destroy()
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)

export function scrollToPosition(lenis: Lenis | null, top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
  else window.scrollTo({ top, behavior: 'instant' })
}
