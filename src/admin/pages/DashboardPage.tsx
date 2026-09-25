import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, FileText, FolderKanban, Image, Inbox, Plus, Settings, UserRound, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { fadeUp, stagger } from '@/lib/motion'
import { cn, formatDate } from '@/lib/utils'
import { adminApi, type Overview } from '../api'
import { useCurrentUser } from '../auth'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { useMediaFiles } from '../components/MediaLibrary'

function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jakarta' }).format(new Date()))
  if (hour < 11) return 'Good morning'
  if (hour < 15) return 'Good afternoon'
  if (hour < 19) return 'Good evening'
  return 'Good night'
}

function StatCard({
  to,
  label,
  value,
  detail,
  icon: Icon,
  highlight = false,
}: {
  to: string
  label: string
  value: number | string
  detail?: string
  icon: LucideIcon
  highlight?: boolean
}) {
  return (
    <motion.li variants={fadeUp}>
      <Link
        to={to}
        className="group/stat flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-line-strong/50 hover:shadow-soft"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">{label}</span>
          <span
            className={cn(
              'grid size-8 place-items-center rounded-full transition-colors',
              highlight ? 'bg-accent text-on-accent' : 'bg-subtle text-ink-muted group-hover/stat:text-ink',
            )}
          >
            <Icon aria-hidden className="size-4" />
          </span>
        </div>
        <div>
          <p className="text-4xl font-medium tracking-[-0.04em] tabular-nums">{value}</p>
          {detail && <p className="mt-1 text-sm text-ink-muted">{detail}</p>}
        </div>
      </Link>
    </motion.li>
  )
}

const quickActions: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/admin/projects/new', label: 'New project', icon: FolderKanban },
  { to: '/admin/posts/new', label: 'New blog post', icon: FileText },
  { to: '/admin/profile', label: 'Edit profile', icon: UserRound },
  { to: '/admin/settings', label: 'Site settings', icon: Settings },
]

export function DashboardPage() {
  const user = useCurrentUser()
  const overview = useQuery({ queryKey: ['admin', 'overview'], queryFn: () => adminApi.get<Overview>('/overview') })
  const counts = overview.data?.counts
  const media = useMediaFiles()
  useDocumentMeta({ title: 'Dashboard · CMS', noindex: true })

  return (
    <>
      <AdminPageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0] ?? 'there'}`}
        description="Here is what is happening on your portfolio."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong/45 px-4 text-sm transition-colors hover:border-ink"
          >
            View site
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        }
      />

      {overview.isError ? (
        <ErrorState onRetry={() => void overview.refetch()} />
      ) : (
        <motion.ul
          variants={stagger(0.06)}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {counts ? (
            <>
              <StatCard
                to="/admin/projects"
                label="Projects"
                value={counts.projects}
                detail={counts.projectDrafts ? `${counts.projectDrafts} unpublished` : 'All published'}
                icon={FolderKanban}
              />
              <StatCard
                to="/admin/posts"
                label="Blog posts"
                value={counts.posts}
                detail={counts.postDrafts ? `${counts.postDrafts} drafts` : 'No drafts'}
                icon={FileText}
              />
              <StatCard
                to="/admin/messages"
                label="Unread messages"
                value={counts.unreadMessages}
                detail={`${counts.messages} in total`}
                icon={Inbox}
                highlight={counts.unreadMessages > 0}
              />
              <StatCard
                to="/admin/media"
                label="Media files"
                value={media.isPending ? '…' : media.files.length}
                detail="In the site’s /media folder"
                icon={Image}
              />
            </>
          ) : (
            Array.from({ length: 4 }, (_, index) => <li key={index} className="skeleton h-36 rounded-2xl" />)
          )}
        </motion.ul>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="recent-messages" className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="recent-messages" className="font-medium">
              Recent messages
            </h2>
            <Link to="/admin/messages" className="text-sm text-ink-muted transition-colors hover:text-ink">
              Open inbox
            </Link>
          </div>
          {overview.data && overview.data.recentMessages.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              No messages yet. They appear here when someone uses the contact form.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {overview.data?.recentMessages.map((message) => (
                <li key={message.id}>
                  <Link
                    to={`/admin/messages?id=${message.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-subtle/60"
                  >
                    <span
                      aria-hidden
                      className={cn('mt-2 size-2 shrink-0 rounded-full', message.isRead ? 'bg-transparent' : 'bg-accent')}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={cn('truncate', !message.isRead && 'font-medium')}>
                          {message.name}
                          {!message.isRead && <span className="sr-only"> (unread)</span>}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-ink-subtle">{formatDate(message.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-ink-muted">
                        {message.subject ? `${message.subject} — ` : ''}
                        {message.body}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="quick-actions" className="rounded-2xl border border-line bg-surface p-5">
          <h2 id="quick-actions" className="font-medium">
            Quick actions
          </h2>
          <ul className="mt-4 space-y-1">
            {quickActions.map((action) => (
              <li key={action.to}>
                <Link
                  to={action.to}
                  className="group/action flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors hover:bg-subtle"
                >
                  <action.icon aria-hidden className="size-4 text-ink-muted" strokeWidth={1.75} />
                  <span className="flex-1">{action.label}</span>
                  <Plus
                    aria-hidden
                    className="size-3.5 text-ink-subtle opacity-0 transition-opacity group-hover/action:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
