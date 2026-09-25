import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Image, Inbox, LayoutDashboard, LogOut, Menu, UserCog, X, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LogoMark } from '@/components/ui/Logo'
import { ease } from '@/lib/motion'
import { cn, initials } from '@/lib/utils'
import { adminApi, type Overview } from './api'
import { useAuth, useCurrentUser } from './auth'
import { collections, singletons } from './resources'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: number
}

function useNavigation(unread: number): { title?: string; items: NavItem[] }[] {
  const toItem = (config: { key: string; label: string; icon: LucideIcon }): NavItem => ({
    to: `/admin/${config.key}`,
    label: config.label,
    icon: config.icon,
  })

  return [
    { items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
    { title: 'Content', items: collections.filter((config) => config.group === 'Content').map(toItem) },
    {
      title: 'Site',
      items: [...singletons.map(toItem), ...collections.filter((config) => config.group === 'Site').map(toItem)],
    },
    {
      title: 'Library',
      items: [
        { to: '/admin/messages', label: 'Messages', icon: Inbox, badge: unread },
        { to: '/admin/media', label: 'Media', icon: Image },
      ],
    },
  ]
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth()
  const user = useCurrentUser()
  const overview = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => adminApi.get<Overview>('/overview'),
    refetchInterval: 60_000,
  })
  const groups = useNavigation(overview.data?.counts.unreadMessages ?? 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5">
        <Link to="/admin" onClick={onNavigate} className="group/logo flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-sm font-semibold tracking-[-0.01em]">
            Portfolio <span className="font-mono text-xs font-normal text-ink-subtle">CMS</span>
          </span>
        </Link>
        <ThemeToggle className="size-9" />
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-6">
        {groups.map((group, index) => (
          <div key={group.title ?? index} className={cn(index > 0 && 'mt-6')}>
            {group.title && <p className="eyebrow px-3 pb-2 text-[0.6875rem] text-ink-subtle">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                        isActive ? 'font-medium text-ink' : 'text-ink-muted hover:bg-subtle hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="admin-nav"
                            className="absolute inset-0 rounded-lg bg-subtle"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                          />
                        )}
                        <item.icon aria-hidden className="relative size-4 shrink-0" strokeWidth={1.75} />
                        <span className="relative flex-1 truncate">{item.label}</span>
                        {Boolean(item.badge) && (
                          <span className="relative rounded-full bg-accent px-1.5 py-px font-mono text-[0.6875rem] font-medium text-on-accent">
                            {item.badge}
                            <span className="sr-only"> unread</span>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
          View site
        </a>
        <NavLink
          to="/admin/account"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-subtle',
              isActive && 'bg-subtle',
            )
          }
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-canvas">
            {user ? initials(user.name) : <UserCog aria-hidden className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user?.name}</span>
            <span className="block truncate text-xs text-ink-muted">{user?.email}</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink-muted transition-colors hover:bg-subtle hover:text-danger"
        >
          <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const location = useLocation()
  const drawerRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    drawerRef.current?.close()
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/60 lg:block">
        <SidebarContent />
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
        <Link to="/admin" className="group/logo flex items-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-sm font-semibold">Portfolio CMS</span>
        </Link>
        <button
          type="button"
          onClick={() => drawerRef.current?.showModal()}
          className="grid size-10 place-items-center rounded-full hover:bg-subtle"
        >
          <Menu aria-hidden className="size-5" />
          <span className="sr-only">Open navigation</span>
        </button>
      </div>

      <dialog
        ref={drawerRef}
        aria-label="Admin navigation"
        onClick={(event) => {
          if (event.target === drawerRef.current) drawerRef.current?.close()
        }}
        className="sheet m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-line bg-surface p-0 text-ink lg:hidden"
      >
        <button
          type="button"
          onClick={() => drawerRef.current?.close()}
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full hover:bg-subtle"
        >
          <X aria-hidden className="size-4" />
          <span className="sr-only">Close navigation</span>
        </button>
        <SidebarContent onNavigate={() => drawerRef.current?.close()} />
      </dialog>

      <main id="admin-main" className="lg:pl-64">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
