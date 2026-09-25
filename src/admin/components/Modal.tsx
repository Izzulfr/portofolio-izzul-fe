import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'w-[min(28rem,calc(100vw-2rem))]', md: 'w-[min(40rem,calc(100vw-2rem))]', lg: 'w-[min(64rem,calc(100vw-2rem))]' }

/**
 * Native modal <dialog>: the rest of the page becomes inert, Esc closes it, and
 * focus returns to the trigger — no focus-trap code needed.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // A click that lands on the <dialog> itself is a click on the backdrop.
        if (event.target === ref.current) onClose()
      }}
      className={cn('modal sheet', widths[size])}
    >
      {open && (
        <div className="flex max-h-[inherit] flex-col">
          <header className="flex items-start justify-between gap-6 border-b border-line px-6 py-5">
            <div>
              <h2 id={titleId} className="text-lg font-medium tracking-[-0.015em]">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <X aria-hidden className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} autoFocus>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={pending}
            className="bg-danger text-white hover:bg-danger/90 dark:text-canvas"
          >
            {pending && <LoaderCircle aria-hidden className="size-3.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-muted">{description}</div>
    </Modal>
  )
}
