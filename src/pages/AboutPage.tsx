import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Download, MapPin } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLenis } from '@/components/layout/SmoothScroll'
import { ContactCta } from '@/components/sections/ContactCta'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { SkillGroups } from '@/components/sections/SkillGroups'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { MediaImage } from '@/components/ui/MediaImage'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { queries } from '@/lib/queries'
import { initials } from '@/lib/utils'

const Markdown = lazy(() => import('@/components/ui/Markdown'))

/** Scrolls to /about#section once the section has rendered. */
function useHashScroll(ready: boolean) {
  const { hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (!ready || !hash) return
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!target) return
      if (lenis) lenis.scrollTo(target, { offset: -96 })
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [ready, hash, lenis])
}

function Portrait({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <div className="relative aspect-4/5 overflow-hidden rounded-[1.5rem] border border-line bg-subtle">
      {avatarUrl ? (
        <MediaImage src={avatarUrl} alt={`Portrait of ${name}`} priority />
      ) : (
        <div className="bg-grid relative grid size-full place-items-center [--grid-size:2.25rem]">
          <span className="text-[clamp(5rem,14vw,9rem)] font-semibold tracking-[-0.06em] text-ink/90">
            {initials(name)}
            <span className="text-accent">.</span>
          </span>
        </div>
      )}
    </div>
  )
}

export default function AboutPage() {
  const site = useQuery(queries.site())
  const experiences = useQuery(queries.experiences())
  const skills = useQuery(queries.skills())
  const education = useQuery(queries.education())
  const certifications = useQuery(queries.certifications())
  const organizations = useQuery(queries.organizations())

  useDocumentMeta({ title: 'About', description: site.data?.profile.summary })
  useHashScroll(Boolean(experiences.data && skills.data))

  const profile = site.data?.profile

  return (
    <>
      <PageHeader eyebrow="About" title="Between the business and the *build*." />

      <section aria-label="Profile" className="container-page grid gap-12 pb-24 md:grid-cols-12 md:gap-16 md:pb-32">
        <Reveal className="md:col-span-5 lg:col-span-4">
          {profile ? (
            <>
              <Portrait name={profile.name} avatarUrl={profile.avatarUrl} />
              <dl className="mt-8 space-y-4 text-[0.9375rem]">
                {profile.location && (
                  <div className="flex items-center gap-3">
                    <dt className="sr-only">Location</dt>
                    <MapPin aria-hidden className="size-4 text-ink-subtle" />
                    <dd>{profile.location}</dd>
                  </div>
                )}
                {profile.email && (
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <CopyButton value={profile.email} announce="Email address copied" />
                    </dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <div aria-hidden className="skeleton aspect-4/5 rounded-[1.5rem]" />
          )}
        </Reveal>

        <div className="md:col-span-7 lg:col-span-8">
          {profile ? (
            <Reveal>
              <p className="text-headline font-medium">{profile.summary}</p>
              <Suspense fallback={<div aria-hidden className="skeleton mt-10 h-48 rounded-2xl" />}>
                <Markdown className="mt-10">{profile.bio}</Markdown>
              </Suspense>
              <div className="mt-10 flex flex-wrap gap-3">
                {profile.resumeUrl && (
                  <ButtonLink to={profile.resumeUrl}>
                    <Download aria-hidden className="size-4" />
                    Download CV
                  </ButtonLink>
                )}
                <ButtonLink to="/contact" variant="secondary">
                  Get in touch
                  <ButtonArrow />
                </ButtonLink>
              </div>
            </Reveal>
          ) : site.isError ? (
            <ErrorState onRetry={() => void site.refetch()} />
          ) : (
            <div aria-hidden className="space-y-4">
              <div className="skeleton h-9 w-full rounded-xl" />
              <div className="skeleton h-9 w-4/5 rounded-xl" />
              <div className="skeleton mt-8 h-40 rounded-2xl" />
            </div>
          )}
        </div>
      </section>

      <section id="experience" aria-labelledby="about-experience" className="scroll-mt-24 border-t border-line">
        <div className="container-page py-24 md:py-32">
          <SectionHeading id="about-experience" index="01" eyebrow="Experience" title="The roles behind the *work*." />
          <div className="mt-14 md:mt-20">
            {experiences.isError ? (
              <ErrorState onRetry={() => void experiences.refetch()} />
            ) : (
              experiences.data && <ExperienceTimeline items={experiences.data} />
            )}
          </div>
        </div>
      </section>

      <section id="skills" aria-labelledby="about-skills" className="scroll-mt-24 border-t border-line bg-surface/60">
        <div className="container-page py-24 md:py-32">
          <SectionHeading id="about-skills" index="02" eyebrow="Skills" title="Methods, tools and *languages*." />
          {skills.isError ? (
            <ErrorState className="mt-14" onRetry={() => void skills.refetch()} />
          ) : (
            skills.data && <SkillGroups groups={skills.data} className="mt-14 md:mt-20" />
          )}
        </div>
      </section>

      <section aria-labelledby="about-learning" className="border-t border-line">
        <div className="container-page py-24 md:py-32">
          <SectionHeading id="about-learning" index="03" eyebrow="Education" title="Always *learning*." />

          <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-2">
            <div>
              <h3 className="eyebrow">Degrees</h3>
              <ul className="mt-6 border-t border-line">
                {education.data?.map((item, index) => (
                  <Reveal as="li" key={item.id} delay={index * 0.06} className="border-b border-line py-7">
                    <p className="font-mono text-sm text-ink-muted">{item.period}</p>
                    <p className="mt-2 text-xl font-medium tracking-[-0.02em]">{item.degree}</p>
                    <p className="mt-1 text-ink-muted">
                      {item.institution}
                      {item.field && <span> · {item.field}</span>}
                    </p>
                    {item.description && <p className="mt-3 text-sm text-ink-muted">{item.description}</p>}
                  </Reveal>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="eyebrow">Certifications</h3>
              <ul className="mt-6 border-t border-line">
                {certifications.data?.map((item, index) => (
                  <Reveal
                    as="li"
                    key={item.id}
                    delay={index * 0.05}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-5"
                  >
                    <div>
                      <p className="font-medium">
                        {item.credentialUrl ? (
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="link-underline inline-flex items-center gap-1"
                          >
                            {item.name}
                            <ArrowUpRight aria-hidden className="size-3.5" />
                          </a>
                        ) : (
                          item.name
                        )}
                      </p>
                      {item.issuer && <p className="mt-1 text-sm text-ink-muted">{item.issuer}</p>}
                    </div>
                    {item.year && <p className="shrink-0 font-mono text-sm text-ink-muted">{item.year}</p>}
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {organizations.data && organizations.data.length > 0 && (
        <section aria-labelledby="about-organizations" className="border-t border-line">
          <div className="container-page py-24 md:py-32">
            <SectionHeading
              id="about-organizations"
              index="04"
              eyebrow="Organizations"
              title="Leading *outside* the office."
            />
            <ul className="mt-14 grid gap-x-10 gap-y-12 md:mt-20 md:grid-cols-3">
              {organizations.data.map((item, index) => (
                <Reveal as="li" key={item.id} delay={index * 0.08} className="border-t border-line pt-6">
                  <p className="font-mono text-sm text-ink-muted">{item.period}</p>
                  <p className="mt-3 text-xl font-medium tracking-[-0.02em]">{item.name}</p>
                  <p className="mt-1 text-accent-ink">{item.role}</p>
                  {item.description && <p className="mt-4 text-[0.9375rem] text-ink-muted">{item.description}</p>}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactCta />
    </>
  )
}
