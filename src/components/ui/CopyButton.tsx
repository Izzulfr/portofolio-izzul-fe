import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ease } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  /** Visible text; the value itself is shown when omitted. */
  children?: string
  className?: string
  announce?: string
}

/** Copies a value (usually the email address) and confirms it with a quick check mark. */
export function CopyButton({ value, children, className, announce = 'Copied to clipboard' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard blocked (insecure context, permissions): fall back to the mail app.
      if (value.includes('@')) window.location.href = `mailto:${value}`
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'group/copy inline-flex items-center gap-2.5 rounded-full text-left transition-colors',
        className,
      )}
    >
      <span className="font-medium">{children ?? value}</span>
      <span className="relative grid size-7 place-items-center rounded-full border border-current/20 transition-colors group-hover/copy:border-current/50">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'done' : 'copy'}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only">{copied ? '' : '(copy)'}</span>
      <span role="status" className="sr-only">
        {copied ? announce : ''}
      </span>
    </button>
  )
}
