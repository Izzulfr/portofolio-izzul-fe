import { Fragment } from 'react'
import { cn, parseEmphasis } from '@/lib/utils'

export const emphasisClass = 'font-serif font-normal italic tracking-[-0.01em] text-[1.06em] leading-none'

/** Renders "*word*" in the serif italic used for a single emphasised word per heading. */
export function Emphasis({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <>
      {parseEmphasis(text).map((segment, index) =>
        segment.emphasis ? (
          <em key={index} className={cn(emphasisClass, accent && 'text-accent-ink')}>
            {segment.text}
          </em>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  )
}
