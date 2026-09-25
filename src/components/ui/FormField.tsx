import { CircleAlert } from 'lucide-react'
import { useEffect, type ReactNode, type RefObject } from 'react'
import { cn } from '@/lib/utils'

export interface ControlProps {
  id: string
  'aria-describedby'?: string
  'aria-errormessage': string
  'aria-invalid'?: true
  'data-server-invalid'?: 'true'
}

interface FormFieldProps {
  id: string
  label: string
  hint?: string
  optional?: boolean
  /** An error from the server; shown immediately. */
  error?: string
  /** Shown by CSS once the browser considers the field :user-invalid. */
  invalidMessage?: string
  className?: string
  children: (control: ControlProps) => ReactNode
}

/**
 * Label, hint above the control (so autocomplete popovers never cover it), and
 * an error below. Client-side errors wait for :user-invalid; server errors show at once.
 */
export function FormField({ id, label, hint, optional, error, invalidMessage, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = `${id}-error`
  const message = error ?? invalidMessage

  return (
    <div className={cn('field', className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-subtle">(optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      <div className="mt-2">
        {children({
          id,
          'aria-describedby': hintId,
          'aria-errormessage': errorId,
          ...(error ? { 'aria-invalid': true as const, 'data-server-invalid': 'true' as const } : {}),
        })}
      </div>
      {message && (
        <p id={errorId} className="field-error" data-visible={error ? 'true' : undefined}>
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          <span>{message}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Keeps aria-invalid in step with the visual :user-invalid state, so screen
 * readers hear about an error exactly when sighted users see it.
 */
export function useUserInvalidAria(formRef: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const sync = (event: Event) => {
      const control = event.target
      if (
        !(control instanceof HTMLInputElement) &&
        !(control instanceof HTMLTextAreaElement) &&
        !(control instanceof HTMLSelectElement)
      ) {
        return
      }
      if (event.type === 'input' && control.getAttribute('aria-invalid') !== 'true') return
      if (control.dataset.serverInvalid === 'true') return

      try {
        if (control.matches(':user-invalid')) control.setAttribute('aria-invalid', 'true')
        else control.removeAttribute('aria-invalid')
      } catch {
        // :user-invalid unsupported: leave the attribute alone
      }
    }

    form.addEventListener('blur', sync, true)
    form.addEventListener('focus', sync, true)
    form.addEventListener('invalid', sync, true)
    form.addEventListener('input', sync)
    return () => {
      form.removeEventListener('blur', sync, true)
      form.removeEventListener('focus', sync, true)
      form.removeEventListener('invalid', sync, true)
      form.removeEventListener('input', sync)
    }
  }, [formRef])
}
