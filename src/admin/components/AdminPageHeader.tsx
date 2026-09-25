import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  description?: string
  back?: { to: string; label: string }
  actions?: ReactNode
  meta?: ReactNode
  sticky?: boolean
}

export function AdminPageHeader({ title, description, back, actions, meta, sticky = false }: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between',
        sticky &&
          'sticky top-14 z-20 -mx-4 border-b border-line bg-canvas/85 px-4 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10',
      )}
    >
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            className="group/back mb-3 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-medium tracking-[-0.025em] sm:text-[1.75rem]">{title}</h1>
          {meta}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function StatusBadge({ published, draftLabel = 'Draft' }: { published: boolean; draftLabel?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        published ? 'border-success/30 text-success' : 'border-line-strong/50 text-ink-muted',
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', published ? 'bg-success' : 'bg-ink-subtle')} />
      {published ? 'Published' : draftLabel}
    </span>
  )
}
