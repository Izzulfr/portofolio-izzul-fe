import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { ease, inViewOnce } from '@/lib/motion'

const tags = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  article: motion.article,
  header: motion.header,
  p: motion.p,
} as const

interface RevealProps {
  children: ReactNode
  as?: keyof typeof tags
  className?: string
  style?: CSSProperties
  delay?: number
  /** Distance travelled upwards while fading in, in pixels. */
  y?: number
  id?: string
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ children, as = 'div', className, style, delay = 0, y = 28, id }: RevealProps) {
  const Component = tags[as] as typeof motion.div

  return (
    <Component
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inViewOnce}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </Component>
  )
}
