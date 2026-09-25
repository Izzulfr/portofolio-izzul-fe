import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Emphasis } from './Emphasis'
import { Reveal } from './Reveal'

interface SectionHeadingProps {
  index?: string
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
  id?: string
  className?: string
}

export function SectionHeading({ index, eyebrow, title, description, action, id, className }: SectionHeadingProps) {
  return (
    <div className={cn('grid gap-8 md:grid-cols-12 md:items-end', className)}>
      <Reveal className="md:col-span-8">
        <p className="eyebrow flex items-center gap-3">
          {index && <span className="text-accent-ink">{index}</span>}
          <span aria-hidden className="h-px w-8 bg-line-strong/50" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-5 text-title font-medium">
          <Emphasis text={title} />
        </h2>
        {description && <p className="mt-5 max-w-2xl text-lead text-ink-muted">{description}</p>}
      </Reveal>
      {action && (
        <Reveal delay={0.1} className="md:col-span-4 md:justify-self-end">
          {action}
        </Reveal>
      )}
    </div>
  )
}
