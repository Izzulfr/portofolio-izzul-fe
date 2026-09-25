import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { LocalTime } from '@/components/ui/LocalTime'
import { ease } from '@/lib/motion'
import type { SiteData } from '@/lib/types'
import { ProcessFlow } from './ProcessFlow'

/** Cycles through the roles once, then rests on the first — movement that ends. */
function RoleTicker({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || roles.length < 2) return
    let step = 0
    const timer = setInterval(() => {
      step += 1
      setIndex(step % roles.length)
      if (step >= roles.length) clearInterval(timer)
    }, 2600)
    return () => clearInterval(timer)
  }, [roles.length, reduceMotion])

  if (roles.length === 0) return null

  return (
    <>
      <span className="sr-only">{roles.join(', ')}</span>
      <span aria-hidden className="relative inline-grid overflow-hidden align-bottom">
        {/* Every role sits in the same cell invisibly, so the line keeps its width. */}
        {roles.map((role) => (
          <span key={role} className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {role}
          </span>
        ))}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.55, ease }}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {roles[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}

function HeroSkeleton() {
  return (
    <div aria-hidden className="container-page pb-20 pt-32 md:pt-44">
      <div className="skeleton h-5 w-72 rounded-full" />
      <div className="mt-12 space-y-4">
        <div className="skeleton h-[clamp(2.5rem,6vw,6rem)] w-11/12 rounded-2xl" />
        <div className="skeleton h-[clamp(2.5rem,6vw,6rem)] w-9/12 rounded-2xl" />
        <div className="skeleton h-[clamp(2.5rem,6vw,6rem)] w-5/12 rounded-2xl" />
      </div>
      <div className="skeleton mt-12 h-20 max-w-xl rounded-2xl" />
    </div>
  )
}

export function Hero({ site }: { site?: SiteData }) {
  if (!site) return <HeroSkeleton />

  const { profile, settings } = site

  return (
    <section aria-label="Introduction" className="relative overflow-hidden">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]"
      />

      <div className="container-page relative pb-20 pt-32 md:pb-28 md:pt-44">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {profile.isAvailable && <span aria-hidden className="pulse-dot text-accent" />}
            <span className="font-medium text-ink">{profile.name}</span>
            <span aria-hidden className="text-ink-subtle">
              /
            </span>
            <span className="text-ink-muted">
              <RoleTicker roles={profile.roles.length ? profile.roles : [profile.headline]} />
            </span>
          </p>
          <p className="eyebrow">
            {profile.location && <span>{profile.location} · </span>}
            <LocalTime />
          </p>
        </motion.div>

        <AnimatedHeadline
          text={settings.heroTitle}
          accent
          delay={0.15}
          className="mt-12 max-w-[16ch] text-display font-medium md:mt-16"
        />

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <motion.p
            className="max-w-xl text-lead text-ink-muted md:col-span-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.55 }}
          >
            {settings.heroSubtitle}
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3 md:col-span-5 md:justify-end"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
          >
            <ButtonLink to="/projects" size="lg">
              View projects
              <ButtonArrow />
            </ButtonLink>
            <ButtonLink to="/contact" size="lg" variant="secondary">
              Get in touch
            </ButtonLink>
          </motion.div>
        </div>

        {settings.processSteps.length > 0 && (
          <ProcessFlow steps={settings.processSteps} className="mt-20 md:mt-28" />
        )}
      </div>
    </section>
  )
}
