import { ButtonLink } from '@/components/ui/Button'

export function AdminNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong/50 px-6 py-16 text-center">
      <p className="font-mono text-sm text-ink-subtle">404</p>
      <h1 className="mt-2 text-2xl font-medium tracking-[-0.02em]">This section does not exist</h1>
      <p className="mt-2 text-ink-muted">It may have been renamed. Pick a section from the menu.</p>
      <ButtonLink to="/admin" size="sm" variant="secondary" className="mt-6">
        Back to the dashboard
      </ButtonLink>
    </div>
  )
}
