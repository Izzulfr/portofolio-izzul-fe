import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { LogoMark } from '@/components/ui/Logo'
import { ApiError } from '@/lib/api'
import { ease } from '@/lib/motion'
import { AdminSplash, useAuth } from '../auth'

export function LoginPage() {
  const { state, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = (location.state as { from?: string; expired?: boolean } | null) ?? {}
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useDocumentMeta({ title: 'Sign in · CMS', noindex: true })

  if (state.status === 'loading') return <AdminSplash />
  if (state.status === 'authenticated') return <Navigate to={redirect.from ?? '/admin'} replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    try {
      await login(String(form.get('email')), String(form.get('password')))
      navigate(redirect.from ?? '/admin', { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Could not sign in. Check your connection and try again.',
      )
      setPending(false)
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-canvas px-4 py-12">
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative w-full max-w-sm"
      >
        <div className="rounded-[1.5rem] border border-line bg-surface p-7 shadow-lifted sm:p-8">
          <LogoMark className="size-10" />
          <h1 className="mt-6 text-2xl font-medium tracking-[-0.025em]">Sign in to the CMS</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Manage everything on the portfolio from here.</p>

          {redirect.expired && !error && (
            <p role="status" className="mt-5 rounded-xl bg-subtle px-3.5 py-2.5 text-sm text-ink-muted">
              Your session ended. Sign in again to continue where you left off.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <FormField id="login-email" label="Email">
              {(control) => (
                <input
                  {...control}
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  className="field-input"
                />
              )}
            </FormField>

            <FormField id="login-password" label="Password">
              {(control) => (
                <div className="relative">
                  <input
                    {...control}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="field-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                    <span className="sr-only">Show password</span>
                  </button>
                </div>
              )}
            </FormField>

            {error && (
              <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <Link
          to="/"
          className="group/back mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
          Back to the site
        </Link>
      </motion.div>
    </div>
  )
}
