import { cn } from '@/lib/utils'

/** The "IF" monogram: two strokes and a dot of accent. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn('size-8 shrink-0', className)}>
      <rect width="64" height="64" rx="15" className="fill-ink" />
      <g className="fill-canvas">
        <rect x="16" y="16" width="7" height="32" rx="1.5" />
        <rect x="29" y="16" width="7" height="32" rx="1.5" />
        <rect x="29" y="16" width="19" height="7" rx="1.5" />
        <rect x="29" y="29" width="13" height="7" rx="1.5" />
      </g>
      <circle
        cx="45"
        cy="44.5"
        r="4.5"
        className="origin-[45px_44.5px] fill-accent transition-transform duration-500 ease-out-quint group-hover/logo:scale-125"
      />
    </svg>
  )
}
