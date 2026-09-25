import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Static label for tags, tools and deliverables. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-[0.8125rem] leading-5 text-ink-muted transition-colors hover:border-line-strong/60 hover:text-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}

interface FilterChipsProps<T extends string> {
  label: string
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
  /** Unique per page, so the sliding highlight never jumps between groups. */
  layoutId: string
}

/** A row of toggle buttons with a highlight that slides to the active one. */
export function FilterChips<T extends string>({ label, options, value, onChange, layoutId }: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-300',
              active ? 'border-ink text-canvas' : 'border-line text-ink-muted hover:border-line-strong/60 hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && (
              <span className={cn('relative font-mono text-xs', active ? 'text-canvas/60' : 'text-ink-subtle')}>
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
