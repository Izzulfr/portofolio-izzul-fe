import { ArrowUpRight } from 'lucide-react'
import { Tag } from '@/components/ui/Chip'
import { Reveal } from '@/components/ui/Reveal'
import type { Experience } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Work history with a spine that draws itself as it scrolls into view
 * (scroll-driven CSS where supported; a static line elsewhere).
 */
export function ExperienceTimeline({ items, compact = false }: { items: Experience[]; compact?: boolean }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="timeline-line absolute bottom-6 left-[4px] top-2.5 w-px bg-line-strong/40 md:left-[calc(12rem+1.5rem+4px)]"
      />
      <ol className="space-y-12 md:space-y-16">
        {items.map((item, index) => (
          <Reveal
            as="li"
            key={item.id}
            delay={Math.min(index, 3) * 0.06}
            className="relative grid gap-3 pl-8 md:grid-cols-[12rem_1fr] md:gap-12 md:pl-0"
          >
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-2 size-[9px] rounded-full ring-4 ring-canvas md:left-[calc(12rem+1.5rem)]',
                item.isCurrent ? 'bg-accent' : 'bg-line-strong',
              )}
            />

            <div className="md:pt-0.5">
              <p className="font-mono text-sm text-ink-muted">{item.period}</p>
              {item.isCurrent && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-accent-ink">
                  <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                  Current
                </p>
              )}
            </div>

            <div className="md:pl-6">
              <h3 className={cn('font-medium tracking-[-0.02em]', compact ? 'text-xl' : 'text-headline')}>
                {item.role}
              </h3>
              <p className="mt-1.5 text-ink-muted">
                {item.companyUrl ? (
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline inline-flex items-center gap-1 text-ink"
                  >
                    {item.company}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-ink">{item.company}</span>
                )}
                {[item.employmentType, item.location].filter(Boolean).map((detail) => (
                  <span key={detail}> · {detail}</span>
                ))}
              </p>

              {!compact && item.summary && <p className="mt-4 max-w-2xl text-ink-muted">{item.summary}</p>}

              {!compact && item.highlights.length > 0 && (
                <ul className="mt-5 max-w-3xl space-y-2.5">
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="relative pl-5 text-[0.9375rem] leading-relaxed text-ink-muted">
                      <span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-line-strong" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}

              {!compact && item.tags.length > 0 && (
                <ul aria-label="Skills used" className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag}>
                      <Tag>{tag}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
