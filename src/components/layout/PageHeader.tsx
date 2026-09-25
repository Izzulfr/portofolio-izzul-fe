import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline'
import { ease } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string | null
  children?: ReactNode
  className?: string
}

/** Opening block for inner pages: a large animated title over a faint blueprint grid. */
export function PageHeader({ eyebrow, title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn('relative overflow-hidden', className)}>
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_80%_at_20%_0%,black,transparent)]"
      />
      <div className="container-page relative pb-14 pt-32 md:pb-20 md:pt-44">
        <motion.p
          className="eyebrow flex items-center gap-3"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {eyebrow}
        </motion.p>
        <AnimatedHeadline
          text={title}
          className="mt-6 max-w-5xl text-[clamp(2.5rem,1.35rem+4.6vw,5.75rem)] font-medium leading-[1] tracking-[-0.045em]"
        />
        {description && (
          <motion.p
            className="mt-8 max-w-2xl text-lead text-ink-muted"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
          >
            {description}
          </motion.p>
        )}
        {children}
      </div>
    </header>
  )
}
