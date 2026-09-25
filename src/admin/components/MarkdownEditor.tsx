import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Quote } from 'lucide-react'
import { lazy, Suspense, useRef, useState } from 'react'
import type { ControlProps } from '@/components/ui/FormField'
import { cn } from '@/lib/utils'

const Markdown = lazy(() => import('@/components/ui/Markdown'))

interface MarkdownEditorProps extends Partial<ControlProps> {
  id: string
  value: string
  onChange: (value: string) => void
}

/** A plain textarea with formatting shortcuts and a live preview. */
export function MarkdownEditor({ id, value, onChange, ...aria }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  function replaceSelection(transform: (selected: string) => { text: string; select?: [number, number] }) {
    const textarea = ref.current
    if (!textarea) return
    const { selectionStart: start, selectionEnd: end } = textarea
    const { text, select } = transform(value.slice(start, end))
    onChange(value.slice(0, start) + text + value.slice(end))
    requestAnimationFrame(() => {
      textarea.focus()
      const [from, to] = select ?? [text.length, text.length]
      textarea.setSelectionRange(start + from, start + to)
    })
  }

  const wrap = (marker: string, placeholder: string) =>
    replaceSelection((selected) => {
      const inner = selected || placeholder
      return { text: `${marker}${inner}${marker}`, select: [marker.length, marker.length + inner.length] }
    })

  const prefixLines = (prefix: (index: number) => string) =>
    replaceSelection((selected) => {
      const lines = (selected || 'List item').split('\n')
      const text = lines.map((line, index) => `${prefix(index)}${line}`).join('\n')
      return { text }
    })

  const actions = [
    { label: 'Heading', icon: Heading2, run: () => prefixLines(() => '## ') },
    { label: 'Bold', icon: Bold, run: () => wrap('**', 'bold text') },
    { label: 'Italic', icon: Italic, run: () => wrap('_', 'italic text') },
    {
      label: 'Link',
      icon: Link2,
      run: () =>
        replaceSelection((selected) => {
          const label = selected || 'link text'
          return { text: `[${label}](https://)`, select: [label.length + 3, label.length + 11] }
        }),
    },
    { label: 'Bulleted list', icon: List, run: () => prefixLines(() => '- ') },
    { label: 'Numbered list', icon: ListOrdered, run: () => prefixLines((index) => `${index + 1}. `) },
    { label: 'Quote', icon: Quote, run: () => prefixLines(() => '> ') },
    { label: 'Inline code', icon: Code, run: () => wrap('`', 'code') },
  ]

  const words = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-surface focus-within:border-accent focus-within:outline-2 focus-within:outline-accent">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subtle/60 px-2 py-1.5">
        <div role="tablist" aria-label="Editor mode" className="flex gap-1">
          {(['write', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={tab === mode}
              onClick={() => setTab(mode)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm capitalize transition-colors',
                tab === mode ? 'bg-surface font-medium text-ink shadow-soft' : 'text-ink-muted hover:text-ink',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        {tab === 'write' && (
          <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5">
            {actions.map(({ label, icon: Icon, run }) => (
              <button
                key={label}
                type="button"
                onClick={run}
                title={label}
                className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <Icon aria-hidden className="size-4" />
                <span className="sr-only">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          {...aria}
          id={id}
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={16}
          spellCheck
          className="block min-h-[18rem] w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none"
        />
      ) : (
        <div className="min-h-[18rem] px-5 py-4">
          <Suspense fallback={<div className="skeleton h-40 rounded-xl" />}>
            <Markdown className="text-[0.9375rem]">{value || '_Nothing to preview yet._'}</Markdown>
          </Suspense>
        </div>
      )}

      <p className="border-t border-line px-4 py-2 font-mono text-xs text-ink-subtle">
        {words} words · about {Math.max(1, Math.ceil(words / 220))} min read
      </p>
    </div>
  )
}
