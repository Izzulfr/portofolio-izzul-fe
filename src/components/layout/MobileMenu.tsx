import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { SocialIcon } from '@/components/ui/SocialIcon'
import type { SiteData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './navigation'
import { useLenis } from './SmoothScroll'
import { ThemeToggle } from './ThemeToggle'

/** Full-screen menu on a native modal <dialog>: focus containment and Esc come for free. */
export function MobileMenu({ site, name }: { site?: SiteData; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const lenis = useLenis()

  const close = () => dialogRef.current?.close()

  useEffect(() => {
    close()
  }, [pathname])

  function openMenu() {
    dialogRef.current?.showModal()
    setOpen(true)
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
  }

  function onClose() {
    setOpen(false)
    lenis?.start()
    document.documentElement.style.overflow = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-subtle md:hidden"
      >
        <Menu aria-hidden className="size-5" strokeWidth={1.75} />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        onClose={onClose}
        aria-label="Site menu"
        className="sheet m-0 h-dvh max-h-none w-full max-w-none bg-canvas p-0 text-ink"
      >
        <div className="container-page flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <Link to="/" onClick={close} className="text-[0.9375rem] font-semibold tracking-tight">
              {name}
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                autoFocus
                onClick={close}
                className="grid size-10 place-items-center rounded-full transition-colors hover:bg-subtle"
              >
                <X aria-hidden className="size-5" strokeWidth={1.75} />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
          </div>

          <nav aria-label="Mobile" className="mt-8">
            <ul>
              {[{ to: '/', label: 'Home' }, ...NAV_ITEMS].map((item, index) => (
                <li key={item.to} className="menu-item" style={{ '--i': index } as CSSProperties}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        'flex items-baseline gap-4 border-b border-line py-4 text-[2.5rem] font-medium leading-none tracking-[-0.04em]',
                        isActive ? 'text-ink' : 'text-ink-muted',
                      )
                    }
                  >
                    <span className="font-mono text-xs tracking-normal text-ink-subtle">0{index}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu-item mt-auto space-y-3 pb-10 pt-8" style={{ '--i': 6 } as CSSProperties}>
            {site?.profile.email && (
              <a href={`mailto:${site.profile.email}`} className="block text-lg font-medium">
                {site.profile.email}
              </a>
            )}
            <ul className="flex flex-wrap gap-2">
              {site?.socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target={social.url.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm"
                  >
                    <SocialIcon icon={social.icon} />
                    {social.label}
                    <ArrowUpRight aria-hidden className="size-3.5 text-ink-subtle" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  )
}
