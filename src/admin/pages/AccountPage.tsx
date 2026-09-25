import { useMutation } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ApiError } from '@/lib/api'
import { authRequest, setSession, type AdminUser } from '../api'
import { useAuth, useCurrentUser } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'

function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const capture = (error: Error) => {
    if (error instanceof ApiError && error.details.length) {
      setErrors(error.fieldErrors)
      toast.error('Some fields need attention.')
    } else {
      toast.error(error.message)
    }
  }
  return { errors, setErrors, capture }
}

function DetailsForm() {
  const user = useCurrentUser()
  const { updateUser } = useAuth()
  const { errors, setErrors, capture } = useFieldErrors()

  const save = useMutation({
    mutationFn: (body: { name: string; email: string }) =>
      authRequest<{ data: AdminUser }>('/auth/me', { method: 'PATCH', body }).then((response) => response.data),
    onSuccess(updated) {
      updateUser(updated)
      setErrors({})
      toast.success('Account details saved')
    },
    onError: capture,
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    save.mutate({ name: String(form.get('name')), email: String(form.get('email')) })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <h2 className="font-medium">Sign-in details</h2>
      <p className="mt-1 text-sm text-ink-muted">The name and email you use to access the CMS.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField id="account-name" label="Name" error={errors.name}>
          {(control) => (
            <input {...control} name="name" defaultValue={user?.name} autoComplete="name" className="field-input" />
          )}
        </FormField>
        <FormField id="account-email" label="Email" error={errors.email}>
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              defaultValue={user?.email}
              autoComplete="username"
              className="field-input"
            />
          )}
        </FormField>
      </div>
      <Button type="submit" size="sm" className="mt-6" disabled={save.isPending}>
        {save.isPending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        Save details
      </Button>
    </form>
  )
}

function PasswordForm() {
  const { errors, setErrors, capture } = useFieldErrors()

  const save = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      authRequest<{ data: { accessToken: string; expiresIn: number; user: AdminUser } }>('/auth/password', {
        method: 'PATCH',
        body,
      }).then((response) => response.data),
    onSuccess(session) {
      setSession(session)
      setErrors({})
      toast.success('Password changed. Other devices were signed out.')
    },
    onError: capture,
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const newPassword = String(form.get('newPassword'))
    if (newPassword !== String(form.get('confirmPassword'))) {
      setErrors({ confirmPassword: 'The two new passwords do not match.' })
      return
    }
    save.mutate(
      { currentPassword: String(form.get('currentPassword')), newPassword },
      { onSuccess: () => formElement.reset() },
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <h2 className="font-medium">Change password</h2>
      <p className="mt-1 text-sm text-ink-muted">Use at least 10 characters. Every other session is signed out.</p>
      <div className="mt-6 grid gap-5">
        <FormField id="current-password" label="Current password" error={errors.currentPassword}>
          {(control) => (
            <input
              {...control}
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="field-input"
            />
          )}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="new-password" label="New password" error={errors.newPassword}>
            {(control) => (
              <input
                {...control}
                name="newPassword"
                type="password"
                minLength={10}
                autoComplete="new-password"
                className="field-input"
              />
            )}
          </FormField>
          <FormField id="confirm-password" label="Repeat new password" error={errors.confirmPassword}>
            {(control) => (
              <input
                {...control}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="field-input"
              />
            )}
          </FormField>
        </div>
      </div>
      <Button type="submit" size="sm" className="mt-6" disabled={save.isPending}>
        {save.isPending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        Change password
      </Button>
    </form>
  )
}

export function AccountPage() {
  useDocumentMeta({ title: 'Account · CMS', noindex: true })

  return (
    <>
      <AdminPageHeader title="Account" description="Your sign-in details and password." />
      <div className="grid max-w-3xl gap-6">
        <DetailsForm />
        <PasswordForm />
      </div>
    </>
  )
}
