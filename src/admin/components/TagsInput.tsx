import { X } from 'lucide-react'
import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import type { ControlProps } from '@/components/ui/FormField'

interface TagsInputProps extends Partial<ControlProps> {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

/** Short values as removable chips. Enter or comma adds; Backspace on empty removes the last. */
export function TagsInput({ id, value, onChange, placeholder = 'Type and press Enter', ...aria }: TagsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')

  function add(raw: string) {
    const next = [...value]
    for (const item of raw.split(',').map((part) => part.trim())) {
      if (item && !next.some((existing) => existing.toLowerCase() === item.toLowerCase())) next.push(item)
    }
    onChange(next)
    setDraft('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.key === 'Enter' || event.key === ',') && draft.trim()) {
      event.preventDefault()
      add(draft)
    } else if (event.key === 'Enter') {
      event.preventDefault()
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text')
    if (text.includes(',') || text.includes('\n')) {
      event.preventDefault()
      add(text.replace(/\n/g, ','))
    }
  }

  return (
    <div
      className="field-input flex min-h-[2.875rem] cursor-text flex-wrap items-center gap-1.5 py-1.5 focus-within:border-accent focus-within:outline-2 focus-within:outline-accent"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-subtle py-0.5 pl-2.5 pr-1 text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, position) => position !== index))}
            className="grid size-5 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink hover:text-canvas"
          >
            <X aria-hidden className="size-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </span>
      ))}
      <input
        {...aria}
        id={id}
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-[0.9375rem] outline-none"
      />
    </div>
  )
}
