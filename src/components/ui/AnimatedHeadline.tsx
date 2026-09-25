import { motion } from 'motion/react'
import { ease } from '@/lib/motion'
import { cn, parseEmphasis, stripEmphasis } from '@/lib/utils'
import { emphasisClass } from './Emphasis'

interface AnimatedHeadlineProps {
  text: string
  as?: 'h1' | 'h2'
  className?: string
  /** Colour the *emphasised* word with the accent. */
  accent?: boolean
  delay?: number
}

/**
 * Each word rises out of its own clipping mask, one after another. Screen readers
 * get the plain sentence once; the animated copy is hidden from them.
 */
export function AnimatedHeadline({ text, as = 'h1', className, accent = false, delay = 0.05 }: AnimatedHeadlineProps) {
  const Heading = as
  const words = parseEmphasis(text).flatMap((segment) =>
    segment.text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((word) => ({ word, emphasis: segment.emphasis })),
  )

  return (
    <Heading className={className}>
      <span className="sr-only">{stripEmphasis(text)}</span>
      <motion.span
        aria-hidden
        className="block"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
      >
        {words.map(({ word, emphasis }, index) =>
          /^\s+$/.test(word) ? (
            ' '
          ) : (
            <span
              key={index}
              className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] pr-[0.04em] align-bottom"
            >
              <motion.span
                className={cn('inline-block', emphasis && emphasisClass, emphasis && accent && 'text-accent-ink')}
                variants={{
                  hidden: { y: '105%', rotate: 2 },
                  visible: { y: '0%', rotate: 0, transition: { duration: 1, ease } },
                }}
              >
                {word}
              </motion.span>
            </span>
          ),
        )}
      </motion.span>
    </Heading>
  )
}
