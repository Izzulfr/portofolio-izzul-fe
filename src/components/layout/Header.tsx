import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'
import { ease } from '@/lib/motion'
import type { SiteData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'
import { FALLBACK_NAME, NAV_ITEMS } from './navigation'
import { ThemeToggle } from './ThemeToggle'

export function Header({ site }: { site?: SiteData }) {
  const name = site?.profile.name ?? FALLBACK_NAME
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  // Tuck the bar away while reading down the page; bring it back on the way up.
  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(current > 8)
    setHidden((wasHidden) => {
      if (current < 120) return false
      if (current > previous + 6) return true
      if (current < previous - 6) return false
      return wasHidden
    })
  })

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.45, ease }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          'border-b transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled
            ? 'border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6 md:h-18">
          <Link to="/" className="group/logo flex items-center gap-3" aria-label={`${name} — home`}>
            <LogoMark className="size-8" />
            <span className="hidden text-[0.9375rem] font-semibold tracking-[-0.02em] sm:block">{name}</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center" onMouseLeave={() => setHovered(null)}>
              {NAV_ITEMS.map((item) => (
                <li key={item.to} onMouseEnter={() => setHovered(item.to)}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'relative flex h-10 items-center px-4 text-sm transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {hovered === item.to && (
                          <motion.span
                            layoutId="nav-hover"
                            className="absolute inset-0 rounded-full bg-subtle"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                          />
                        )}
                        <span className="relative">{item.label}</span>
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
                            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <ButtonLink to="/contact" size="sm" className="hidden md:inline-flex">
              Let&apos;s talk
              <ButtonArrow />
            </ButtonLink>
            <MobileMenu site={site} name={name} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
