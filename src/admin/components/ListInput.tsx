import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

/** Up, down and remove controls shared by list-like inputs. */
export function RowControls({
  index,
  count,
  label,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  label: string
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
}) {
  const button =
    'grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-30'

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className={button} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp aria-hidden className="size-3.5" />
        <span className="sr-only">Move {label} up</span>
      </button>
      <button type="button" className={button} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown aria-hidden className="size-3.5" />
        <span className="sr-only">Move {label} down</span>
      </button>
      <button type="button" className={`${button} hover:text-danger`} onClick={() => onRemove(index)}>
        <Trash aria-hidden className="size-3.5" />
        <span className="sr-only">Remove {label}</span>
      </button>
    </div>
  )
}

export function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (item !== undefined) next.splice(to, 0, item)
  return next
}

export function AddRowButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      <Plus aria-hidden className="size-3.5" />
      {children}
    </Button>
  )
}

interface ListInputProps {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  itemLabel?: string
}

/** Longer sentences, one per row — e.g. the highlights of a role. */
export function ListInput({ id, value, onChange, itemLabel = 'item' }: ListInputProps) {
  function update(index: number, text: string) {
    onChange(value.map((item, position) => (position === index ? text : item)))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ol className="space-y-2">
          {value.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-3 w-5 shrink-0 text-right font-mono text-xs text-ink-subtle">{index + 1}</span>
              <textarea
                id={index === 0 ? id : undefined}
                aria-label={`${itemLabel} ${index + 1}`}
                value={item}
                rows={2}
                onChange={(event) => update(index, event.target.value)}
                className="field-input min-h-0 flex-1 resize-y text-[0.9375rem] [field-sizing:content]"
              />
              <div className="pt-1.5">
                <RowControls
                  index={index}
                  count={value.length}
                  label={`${itemLabel} ${index + 1}`}
                  onMove={(from, to) => onChange(move(value, from, to))}
                  onRemove={(position) => onChange(value.filter((_, current) => current !== position))}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
      <AddRowButton onClick={() => onChange([...value, ''])}>Add {itemLabel}</AddRowButton>
    </div>
  )
}
