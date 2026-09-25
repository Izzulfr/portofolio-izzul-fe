import { motion } from 'motion/react'
import { ButtonArrow, ButtonLink } from '@/components/ui/Button'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ease } from '@/lib/motion'

export default function NotFoundPage() {
  useDocumentMeta({ title: 'Page not found', noindex: true })

  return (
    <section className="container-page relative flex min-h-[80dvh] flex-col justify-center overflow-hidden pb-20 pt-32">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
      />
      <motion.p
        aria-hidden
        className="relative select-none text-[clamp(7rem,28vw,20rem)] font-semibold leading-[0.8] tracking-[-0.07em] text-ink/[0.08]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease }}
      >
        404
      </motion.p>
      <motion.div
        className="relative mt-8 max-w-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.15 }}
      >
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 text-title font-medium">This page is not in the plan.</h1>
        <p className="mt-5 text-lead text-ink-muted">
          The link may be old, or the page may have moved. Everything that exists is one click away.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to="/">
            Back home
            <ButtonArrow />
          </ButtonLink>
          <ButtonLink to="/projects" variant="secondary">
            See projects
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  )
}
