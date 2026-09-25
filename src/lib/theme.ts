import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function readPinned(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

let pinned = readPinned()

const systemTheme = (): Theme => (systemQuery.matches ? 'dark' : 'light')
const currentTheme = (): Theme => pinned ?? systemTheme()
const notify = () => listeners.forEach((listener) => listener())

// The OS can switch themes at any time; an unpinned page follows along.
systemQuery.addEventListener('change', notify)

function apply(next: Theme | null) {
  pinned = next
  const root = document.documentElement
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')

  if (next) {
    root.dataset.theme = next
    meta?.setAttribute('content', next)
  } else {
    delete root.dataset.theme
    meta?.setAttribute('content', 'light dark')
  }

  try {
    if (next) localStorage.setItem(STORAGE_KEY, next)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: the choice lasts for this page view only
  }

  notify()
}

/**
 * Two states only: follow the system, or pin the opposite of it. Toggling back
 * to the system's own theme clears the pin instead of pinning that theme.
 *
 * With View Transitions available, the new theme is revealed as a circle
 * growing from the toggle button.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
  const update = () => apply(next === systemTheme() ? null : next)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!origin || reduceMotion || !('startViewTransition' in document)) {
    update()
    return
  }

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )

  const transition = document.startViewTransition(update)
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
    .catch(() => {
      // Transition skipped (e.g. tab hidden): the theme is already applied.
    })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'light')
}
