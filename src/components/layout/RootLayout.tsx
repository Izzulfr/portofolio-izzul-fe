import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigation } from 'react-router'
import { queries } from '@/lib/queries'
import { AnimatedOutlet } from './AnimatedOutlet'
import { Footer } from './Footer'
import { Header } from './Header'
import { SmoothScroll } from './SmoothScroll'

/** Thin accent bar while a lazily loaded page is on its way. */
function NavigationProgress() {
  const navigation = useNavigation()

  return (
    <AnimatePresence>
      {navigation.state !== 'idle' && (
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.75, transition: { duration: 2.5, ease: [0.1, 0.7, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  )
}

export function RootLayout() {
  const { data: site } = useQuery(queries.site())

  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-ink px-4 py-2 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <NavigationProgress />
      <div className="flex min-h-dvh flex-col">
        <Header site={site} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <AnimatedOutlet />
        </main>
        <Footer site={site} />
      </div>
    </SmoothScroll>
  )
}
