import { useQuery } from '@tanstack/react-query'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Emphasis } from '@/components/ui/Emphasis'
import { Reveal } from '@/components/ui/Reveal'
import { queries } from '@/lib/queries'

/** Closing call to action: an inverted panel in either theme. */
export function ContactCta() {
  const { data: site } = useQuery(queries.site())
  if (!site) return null

  const { settings, profile } = site

  return (
    <section aria-labelledby="contact-cta-title" className="container-page pb-24 pt-6 md:pb-32 md:pt-10">
      <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-canvas sm:px-10 md:px-16 md:py-24">
        <div
          aria-hidden
          className="bg-grid absolute inset-0 -z-10 [--grid-line:color-mix(in_oklab,var(--canvas)_7%,transparent)] [mask-image:radial-gradient(ellipse_70%_90%_at_100%_0%,black,transparent)]"
        />
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-accent/25 blur-[100px]" />

        <p className="eyebrow flex items-center gap-3 text-canvas/60">
          <span className="size-1.5 rounded-full bg-accent" />
          Contact
        </p>
        <h2 id="contact-cta-title" className="mt-6 max-w-4xl text-title font-medium">
          <Emphasis text={settings.contactTitle} />
        </h2>
        <p className="mt-6 max-w-xl text-lead text-canvas/70">{settings.contactText}</p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink to="/contact" variant="accent" size="lg">
            Send a message
            <ButtonArrow />
          </ButtonLink>
          {profile.email && (
            <CopyButton value={profile.email} announce="Email address copied" className="text-canvas/80 hover:text-canvas" />
          )}
        </div>
      </Reveal>
    </section>
  )
}
