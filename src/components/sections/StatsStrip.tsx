import { Counter } from '@/components/ui/Counter'
import { Reveal } from '@/components/ui/Reveal'
import type { Stat } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StatsStrip({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null

  return (
    <section aria-label="Highlights" className="container-page">
      <dl className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal
            key={stat.id}
            delay={index * 0.08}
            y={16}
            className={cn(
              'flex flex-col-reverse justify-end gap-3 py-9 md:py-12',
              index % 2 === 1 && 'border-l border-line pl-5 md:pl-8',
              index >= 2 && 'border-t border-line lg:border-t-0',
              index === 2 && 'lg:border-l lg:pl-8',
              index > 3 && 'lg:border-t',
            )}
          >
            <dt className="max-w-[16rem] text-sm leading-snug text-ink-muted">{stat.label}</dt>
            <dd className="text-title font-medium">
              <Counter value={stat.value} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
