import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { ease } from '@/lib/motion'
import type { ProcessStep } from '@/lib/types'
import { pad } from '@/lib/utils'

const LINE_DELAY = 0.9
const LINE_DURATION = 1.3

/**
 * "How I work" as a line that draws itself, with each step arriving as the
 * line reaches it. Horizontal on wide screens, vertical on phones.
 */
export function ProcessFlow({ steps, className }: { steps: ProcessStep[]; className?: string }) {
  return (
    <div className={className}>
      <motion.p
        className="eyebrow flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: LINE_DELAY - 0.2 }}
      >
        <span className="text-accent-ink">How I work</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </motion.p>

      <div className="relative mt-8 md:mt-10">
        <motion.span
          aria-hidden
          className="absolute bottom-3 left-[7px] top-3 w-px origin-top bg-line-strong/45 md:hidden"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: LINE_DURATION, ease, delay: LINE_DELAY }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-x-0 top-[7px] hidden h-px origin-left bg-line-strong/45 md:block"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: LINE_DURATION, ease, delay: LINE_DELAY }}
        />

        <ol
          className="relative grid gap-8 md:grid-cols-[repeat(var(--steps),minmax(0,1fr))] md:gap-6"
          style={{ '--steps': steps.length } as CSSProperties}
        >
          {steps.map((step, index) => (
            <motion.li
              key={`${step.title}-${index}`}
              className="group/step relative pl-9 md:pl-0 md:pt-9"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease,
                delay: LINE_DELAY + (LINE_DURATION * (index + 0.5)) / steps.length,
              }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-0.5 grid size-[15px] place-items-center rounded-full border border-line-strong/60 bg-canvas transition-colors duration-300 group-hover/step:border-accent md:top-0"
              >
                <span className="size-[5px] rounded-full bg-ink-subtle transition-[background-color,scale] duration-300 group-hover/step:scale-150 group-hover/step:bg-accent" />
              </span>
              <p className="font-mono text-xs text-ink-subtle">{pad(index + 1)}</p>
              <h3 className="mt-1.5 font-medium tracking-[-0.01em]">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  )
}
