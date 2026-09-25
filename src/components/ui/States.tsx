import { CircleAlert, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export function ErrorState({
  title = 'This part did not load',
  message = 'The content service did not answer. It may be waking up — try again in a moment.',
  onRetry,
  className,
}: {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6 md:p-8', className)}
    >
      <CircleAlert aria-hidden className="size-5 text-danger" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-dashed border-line-strong/50 p-8 text-center md:p-12', className)}>
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm text-ink-muted">{children}</div>}
    </div>
  )
}
