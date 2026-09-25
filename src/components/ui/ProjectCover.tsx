import { CornerDownRight } from 'lucide-react'
import type { ProjectSummary } from '@/lib/types'
import { cn, pad } from '@/lib/utils'
import { MediaImage } from './MediaImage'

interface ProjectCoverProps {
  project: Pick<ProjectSummary, 'title' | 'coverUrl' | 'coverAlt' | 'deliverables' | 'category'>
  priority?: boolean
  size?: 'card' | 'hero'
}

/**
 * A recording of the product when there is one, shown in a quiet browser frame.
 * Otherwise the cover draws what was delivered, as a small flow — which for an
 * analyst's work is the more honest picture anyway.
 */
export function ProjectCover({ project, priority, size = 'card' }: ProjectCoverProps) {
  if (project.coverUrl) {
    return (
      <div
        className={cn(
          'bg-grid flex size-full items-center justify-center bg-subtle [--grid-size:2.5rem]',
          size === 'hero' ? 'p-[5%]' : 'p-[7%]',
        )}
      >
        <div className="w-full overflow-hidden rounded-[0.875rem] border border-line bg-surface shadow-lifted transition-[translate] duration-700 ease-out-quint group-hover/card:-translate-y-1.5">
          <div aria-hidden className="flex h-6 items-center gap-1.5 border-b border-line px-3 md:h-7">
            <span className="size-2 rounded-full bg-line-strong/35" />
            <span className="size-2 rounded-full bg-line-strong/35" />
            <span className="size-2 rounded-full bg-line-strong/35" />
          </div>
          <div className="aspect-16/9">
            <MediaImage
              src={project.coverUrl}
              alt={project.coverAlt ?? `Preview of ${project.title}`}
              priority={priority}
              imageClassName="object-top"
            />
          </div>
        </div>
      </div>
    )
  }

  const steps = project.deliverables.length > 0 ? project.deliverables : ['Requirements', 'Delivery']

  return (
    <div
      role="img"
      aria-label={`Deliverables: ${steps.join(', ')}`}
      className={cn(
        'bg-grid relative flex size-full flex-col justify-center overflow-hidden bg-subtle px-[9%] py-[7%] [--grid-size:2.5rem]',
        size === 'hero' && 'items-center [--grid-size:3.5rem]',
      )}
    >
      <p aria-hidden className="eyebrow absolute left-[9%] top-[9%] text-ink-subtle">
        Deliverables
      </p>
      <ol aria-hidden className={cn('flex flex-col', size === 'hero' ? 'gap-4 md:gap-6' : 'gap-2.5 md:gap-3.5')}>
        {steps.map((step, index) => {
          const last = index === steps.length - 1
          return (
            <li
              key={`${step}-${index}`}
              className="flex items-center gap-2.5"
              style={{ paddingLeft: `${Math.min(index, 4) * (size === 'hero' ? 2.75 : 1.5)}rem` }}
            >
              {index > 0 ? (
                <CornerDownRight className="size-3.5 shrink-0 text-ink-subtle" strokeWidth={1.5} />
              ) : (
                <span className="w-3.5 shrink-0 font-mono text-[0.625rem] text-ink-subtle">{pad(1)}</span>
              )}
              <span
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap rounded-full border font-mono shadow-soft',
                  'transition-[translate,border-color] duration-500 ease-out-quint group-hover/card:translate-x-1.5',
                  size === 'hero'
                    ? 'px-4 py-2 text-sm md:px-6 md:py-3 md:text-lg'
                    : 'px-3 py-1.5 text-[0.6875rem] md:text-xs',
                  last ? 'border-ink bg-ink text-canvas' : 'border-line bg-surface text-ink',
                )}
                style={{ transitionDelay: `${index * 55}ms` }}
              >
                {last && <span className="size-1.5 rounded-full bg-accent" />}
                {step}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
