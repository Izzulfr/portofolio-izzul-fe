import type { Transition, Variants } from 'motion/react'

/** The house easing: quick to start, long and soft to settle. */
export const ease = [0.22, 1, 0.36, 1] as const

export const smooth: Transition = { duration: 0.8, ease }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: smooth },
}

export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delay } },
})

/** Reveal once, a little before the element is fully in view. */
export const inViewOnce = { once: true, margin: '0px 0px -10% 0px' } as const
