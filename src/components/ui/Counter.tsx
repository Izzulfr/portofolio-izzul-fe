import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const NUMBER = /^(\D*)(\d+)(.*)$/

/**
 * Counts "5+" up from "0+" when it scrolls into view. The final value is laid
 * out invisibly underneath, so the number never changes width while counting.
 */
export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(() => {
    const match = NUMBER.exec(value)
    return match ? `${match[1]}0${match[3]}` : value
  })

  useEffect(() => {
    const match = NUMBER.exec(value)
    if (!match || !inView) return

    if (reduceMotion) {
      setDisplay(value)
      return
    }

    const [, prefix, digits, suffix] = match
    const controls = animate(0, Number(digits), {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(`${prefix}${Math.round(latest)}${suffix}`),
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  return (
    <span ref={ref} className="inline-grid tabular-nums">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span aria-hidden className="col-start-1 row-start-1">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
