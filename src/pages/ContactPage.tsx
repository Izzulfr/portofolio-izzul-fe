import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Check, LoaderCircle, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { FormField, useUserInvalidAria } from '@/components/ui/FormField'
import { LocalTime } from '@/components/ui/LocalTime'
import { Reveal } from '@/components/ui/Reveal'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ApiError, apiRequest } from '@/lib/api'
import { ease } from '@/lib/motion'
import { queries } from '@/lib/queries'
import { stripEmphasis } from '@/lib/utils'

interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
  extraInfo: string
}

const MESSAGE_MAX = 5000

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="success"
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease }}
      className="flex flex-col items-start rounded-[1.5rem] border border-line bg-surface p-8 md:p-12"
    >
      <span className="grid size-14 place-items-center rounded-full bg-accent text-on-accent">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
          />
        </svg>
      </span>
      <h2 className="mt-8 text-headline font-medium">Message sent. Thank you!</h2>
      <p className="mt-3 max-w-md text-ink-muted">
        It is in my inbox now. I usually reply within two working days, to the email address you gave.
      </p>
      <Button variant="secondary" className="mt-8" onClick={onReset}>
        Send another message
      </Button>
    </motion.div>
  )
}

function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [messageLength, setMessageLength] = useState(0)

  useUserInvalidAria(formRef)

  const mutation = useMutation({
    mutationFn: (input: ContactInput) => apiRequest('/contact', { method: 'POST', body: input }),
  })

  // Server-side errors mark the control invalid too, until the visitor edits it.
  useEffect(() => {
    const form = formRef.current
    if (!form) return
    for (const element of Array.from(form.elements)) {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.setCustomValidity(fieldErrors[element.name] ?? '')
      }
    }
  }, [fieldErrors])

  function clearFieldError(name: string) {
    if (!fieldErrors[name]) return
    setFieldErrors(({ [name]: _removed, ...rest }) => rest)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setFormError(null)
    setFieldErrors({})

    const input = Object.fromEntries(new FormData(form)) as unknown as ContactInput

    try {
      await mutation.mutateAsync(input)
      form.reset()
      setMessageLength(0)
      setSent(true)
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        setFieldErrors(error.fieldErrors)
        const firstInvalid = form.querySelector<HTMLElement>(`[name="${error.details[0]?.path}"]`)
        firstInvalid?.focus()
      } else {
        setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <SuccessPanel onReset={() => setSent(false)} />
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease }}
          className="rounded-[1.5rem] border border-line bg-surface p-6 shadow-soft sm:p-8 md:p-10"
          aria-describedby={formError ? 'contact-form-error' : undefined}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="contact-name" label="Name" error={fieldErrors.name} invalidMessage="Tell me your name.">
              {(control) => (
                <input
                  {...control}
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="field-input"
                  onInput={() => clearFieldError('name')}
                />
              )}
            </FormField>

            <FormField
              id="contact-email"
              label="Email"
              error={fieldErrors.email}
              invalidMessage="Enter an email address like you@example.com."
            >
              {(control) => (
                <input
                  {...control}
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  inputMode="email"
                  className="field-input"
                  onInput={() => clearFieldError('email')}
                />
              )}
            </FormField>

            <FormField
              id="contact-subject"
              label="Subject"
              optional
              error={fieldErrors.subject}
              className="sm:col-span-2"
            >
              {(control) => (
                <input
                  {...control}
                  name="subject"
                  type="text"
                  maxLength={160}
                  className="field-input"
                  onInput={() => clearFieldError('subject')}
                />
              )}
            </FormField>

            <FormField
              id="contact-message"
              label="Message"
              hint="What are you working on, and where could I help?"
              error={fieldErrors.message}
              invalidMessage="Write at least 10 characters."
              className="sm:col-span-2"
            >
              {(control) => (
                <div className="relative">
                  <textarea
                    {...control}
                    name="message"
                    required
                    minLength={10}
                    maxLength={MESSAGE_MAX}
                    rows={6}
                    className="field-input pb-8"
                    onInput={(event) => {
                      setMessageLength(event.currentTarget.value.length)
                      clearFieldError('message')
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-2.5 right-3.5 font-mono text-xs text-ink-subtle"
                  >
                    {messageLength}/{MESSAGE_MAX}
                  </span>
                </div>
              )}
            </FormField>
          </div>

          {/* Honeypot: invisible and unreachable for people, filled in by bots. */}
          <div aria-hidden {...{ inert: '' }} className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Leave this field empty
              <input name="extraInfo" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {formError && (
            <p id="contact-form-error" role="alert" className="mt-6 text-sm text-danger">
              {formError}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-muted">Your details are only used to reply to you.</p>
            <Button type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <LoaderCircle aria-hidden className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <Send
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5"
                  />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

export default function ContactPage() {
  const { data: site } = useQuery(queries.site())
  useDocumentMeta({ title: 'Contact', description: site ? stripEmphasis(site.settings.contactText) : undefined })

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={site?.settings.contactTitle ?? "Let's build something that *works*."}
        description={site?.settings.contactText}
      />

      <section aria-label="Ways to get in touch" className="container-page grid gap-14 pb-24 md:grid-cols-12 md:pb-36">
        <Reveal className="space-y-10 md:col-span-5 lg:col-span-4">
          {site?.profile.email && (
            <div>
              <p className="eyebrow">Email</p>
              <div className="mt-3 text-lg">
                <CopyButton value={site.profile.email} announce="Email address copied" />
              </div>
            </div>
          )}

          {site && site.socials.length > 0 && (
            <div>
              <p className="eyebrow">Elsewhere</p>
              <ul className="mt-3 space-y-1">
                {site.socials
                  .filter((social) => social.icon !== 'email')
                  .map((social) => (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target={social.url.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer noopener"
                        className="group/social flex items-center justify-between gap-4 border-b border-line py-3 transition-colors hover:border-ink"
                      >
                        <span className="flex items-center gap-3">
                          <SocialIcon icon={social.icon} className="size-[1.125rem]" />
                          {social.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 text-ink-subtle transition-transform duration-300 group-hover/social:-translate-y-0.5 group-hover/social:translate-x-0.5 group-hover/social:text-ink"
                        />
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div>
            <p className="eyebrow">Based in</p>
            <p className="mt-3">{site?.profile.location ?? 'Tangerang, Indonesia'}</p>
            <p className="text-ink-muted">
              It is <LocalTime /> here.
            </p>
          </div>

          {site?.profile.isAvailable && site.profile.availability && (
            <p className="inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-2 text-sm">
              <Check aria-hidden className="size-4 text-success" />
              {site.profile.availability}
            </p>
          )}
        </Reveal>

        <div className="md:col-span-7 lg:col-span-8">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
