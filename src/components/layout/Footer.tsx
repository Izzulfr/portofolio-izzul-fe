import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { LocalTime } from '@/components/ui/LocalTime'
import { SocialIcon } from '@/components/ui/SocialIcon'
import type { SiteData } from '@/lib/types'
import { FALLBACK_NAME, NAV_ITEMS } from './navigation'
import { scrollToPosition, useLenis } from './SmoothScroll'

export function Footer({ site }: { site?: SiteData }) {
  const lenis = useLenis()
  const name = site?.profile.name ?? FALLBACK_NAME
  const year = new Date().getFullYear()

  function backToTop() {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 })
    else scrollToPosition(null, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line">
      <div className="container-page grid gap-12 pb-10 pt-16 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-[-0.02em]">{name}</p>
          <p className="mt-2 max-w-xs text-ink-muted">
            {site?.profile.headline ?? 'Software Builder'}
            {site?.profile.location ? ` based in ${site.profile.location}.` : '.'}
          </p>
          {site?.profile.isAvailable && site.profile.availability && (
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line px-3.5 py-1.5 text-sm">
              <span aria-hidden className="size-2 rounded-full bg-accent" />
              {site.profile.availability}
            </p>
          )}
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="eyebrow">Pages</p>
          <ul className="mt-4 space-y-2.5">
            {[{ to: '/', label: 'Home' }, ...NAV_ITEMS].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-underline text-ink-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="eyebrow">Connect</p>
          <ul className="mt-4 space-y-2.5">
            {site?.socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.url}
                  target={social.url.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="group/social inline-flex items-center gap-2.5 text-ink-muted transition-colors hover:text-ink"
                >
                  <SocialIcon icon={social.icon} />
                  <span className="link-underline">{social.label}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-3.5 opacity-0 transition-[opacity,translate] duration-300 group-hover/social:-translate-y-0.5 group-hover/social:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow">Local time</p>
          <p className="mt-4 text-ink-muted">
            <LocalTime />
          </p>
          {site?.profile.location && <p className="text-ink-muted">{site.profile.location}</p>}
          <button
            type="button"
            onClick={backToTop}
            className="group/top mt-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Back to top
            <span className="grid size-7 place-items-center rounded-full border border-line transition-colors group-hover/top:border-ink">
              <ArrowUp
                aria-hidden
                className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5"
              />
            </span>
          </button>
        </div>
      </div>

      <div className="container-page">
        <div className="flex flex-col gap-2 border-t border-line py-6 text-sm text-ink-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {name}
          </p>
          {site?.settings.footerNote && <p>{site.settings.footerNote}</p>}
        </div>
      </div>

      <div aria-hidden className="container-page @container pointer-events-none select-none">
        <p className="translate-y-[22%] whitespace-nowrap text-[15.2cqi] font-semibold leading-[0.8] tracking-[-0.06em] text-ink/[0.045]">
          {name}
        </p>
      </div>
    </footer>
  )
}
