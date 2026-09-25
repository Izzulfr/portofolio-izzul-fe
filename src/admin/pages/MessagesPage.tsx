import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCheck, Mail, MailOpen, Reply, Trash } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { FilterChips } from '@/components/ui/Chip'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ease } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { adminApi, type Message } from '../api'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ConfirmDialog } from '../components/Modal'

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

function relative(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days < 7 ? `${days}d ago` : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value))
}

export function MessagesPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null)
  const selectedId = searchParams.get('id')

  useDocumentMeta({ title: 'Messages · CMS', noindex: true })

  const queryKey = ['admin', 'messages', filter]
  const inbox = useQuery({
    queryKey,
    queryFn: () => adminApi.getWithMeta<Message[], { unread: number }>(`/messages?status=${filter}`),
  })

  const refreshCounts = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] })
  }

  const markRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => adminApi.patch<Message>(`/messages/${id}`, { isRead }),
    onMutate({ id, isRead }) {
      queryClient.setQueryData<{ data: Message[]; meta: { unread: number } }>(queryKey, (current) =>
        current && {
          ...current,
          data: current.data.map((message) => (message.id === id ? { ...message, isRead } : message)),
        },
      )
    },
    onSettled: refreshCounts,
  })

  const markAllRead = useMutation({
    mutationFn: () => adminApi.post('/messages/read-all'),
    onSuccess() {
      toast.success('Everything is marked as read')
      refreshCounts()
    },
  })

  const remove = useMutation({
    mutationFn: (message: Message) => adminApi.delete(`/messages/${message.id}`),
    onSuccess() {
      setPendingDelete(null)
      setSearchParams({}, { replace: true })
      toast.success('Message deleted')
      refreshCounts()
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const messages = inbox.data?.data ?? []
  const selected = messages.find((message) => message.id === selectedId) ?? null

  // Opening an unread message marks it as read.
  useEffect(() => {
    if (selected && !selected.isRead && !markRead.isPending) markRead.mutate({ id: selected.id, isRead: true })
    // Only when a different message is opened, not on every refetch.
  }, [selected?.id])

  const open = (id: string | null) => setSearchParams(id ? { id } : {}, { replace: true })

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Everything sent through the contact form."
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={!inbox.data?.meta.unread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck aria-hidden className="size-4" />
            Mark all as read
          </Button>
        }
      />

      {inbox.isError ? (
        <ErrorState onRetry={() => void inbox.refetch()} />
      ) : (
        <div className="grid min-h-[32rem] overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className={cn('border-line lg:border-r', selected && 'hidden lg:block')}>
            <div className="border-b border-line p-3">
              <FilterChips
                label="Filter messages"
                layoutId="messages-filter"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'unread', label: 'Unread', count: inbox.data?.meta.unread ?? 0 },
                ]}
              />
            </div>

            {inbox.isPending ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <Mail aria-hidden className="size-6 text-ink-subtle" />
                <p className="text-sm text-ink-muted">
                  {filter === 'unread' ? 'You are all caught up.' : 'No messages yet.'}
                </p>
              </div>
            ) : (
              <ul className="max-h-[40rem] divide-y divide-line overflow-y-auto">
                {messages.map((message) => (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => open(message.id)}
                      aria-current={message.id === selectedId ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                        message.id === selectedId ? 'bg-subtle' : 'hover:bg-subtle/50',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn('mt-2 size-2 shrink-0 rounded-full', message.isRead ? 'bg-transparent' : 'bg-accent')}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cn('truncate text-sm', !message.isRead && 'font-semibold')}>
                            {message.name}
                            {!message.isRead && <span className="sr-only"> (unread)</span>}
                          </span>
                          <span className="shrink-0 font-mono text-[0.6875rem] text-ink-subtle">
                            {relative(message.createdAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-ink-muted">
                          {message.subject || message.body}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cn(!selected && 'hidden lg:block')}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.article
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex h-full flex-col"
                >
                  <header className="border-b border-line p-5 sm:p-6">
                    <button
                      type="button"
                      onClick={() => open(null)}
                      className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink lg:hidden"
                    >
                      <ArrowLeft aria-hidden className="size-3.5" />
                      All messages
                    </button>
                    <h2 className="text-xl font-medium tracking-[-0.02em]">{selected.subject || 'No subject'}</h2>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{selected.name}</span>{' '}
                      <a href={`mailto:${selected.email}`} className="text-ink-muted underline-offset-4 hover:underline">
                        &lt;{selected.email}&gt;
                      </a>
                    </p>
                    <p className="mt-1 font-mono text-xs text-ink-subtle">{dateTime.format(new Date(selected.createdAt))}</p>
                  </header>

                  <div className="flex-1 whitespace-pre-wrap p-5 leading-relaxed sm:p-6">{selected.body}</div>

                  <footer className="flex flex-wrap gap-2 border-t border-line p-4 sm:px-6">
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Your message'}`)}`}
                      className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-colors hover:bg-ink/85"
                    >
                      <Reply aria-hidden className="size-4" />
                      Reply by email
                    </a>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markRead.mutate({ id: selected.id, isRead: !selected.isRead })}
                    >
                      {selected.isRead ? <Mail aria-hidden className="size-4" /> : <MailOpen aria-hidden className="size-4" />}
                      {selected.isRead ? 'Mark as unread' : 'Mark as read'}
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-danger" onClick={() => setPendingDelete(selected)}>
                      <Trash aria-hidden className="size-4" />
                      Delete
                    </Button>
                  </footer>
                </motion.article>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid h-full place-items-center p-10 text-center"
                >
                  <div>
                    <MailOpen aria-hidden className="mx-auto size-7 text-ink-subtle" />
                    <p className="mt-3 text-sm text-ink-muted">Select a message to read it.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description={<p>The message from {pendingDelete?.name} will be removed permanently.</p>}
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </>
  )
}
