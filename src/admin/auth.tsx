import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { LogoMark } from '@/components/ui/Logo'
import { onSessionExpired, refreshSession, signIn, signOut, type AdminUser } from './api'

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AdminUser }
  | { status: 'anonymous'; expired?: boolean }

interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: AdminUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    // A refresh cookie from an earlier visit restores the session without a password.
    void refreshSession().then((session) => {
      if (!active) return
      setState(session ? { status: 'authenticated', user: session.user } : { status: 'anonymous' })
    })

    const unsubscribe = onSessionExpired(() => {
      queryClient.removeQueries({ queryKey: ['admin'] })
      setState({ status: 'anonymous', expired: true })
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      async login(email, password) {
        const session = await signIn(email, password)
        setState({ status: 'authenticated', user: session.user })
      },
      async logout() {
        await signOut().catch(() => {})
        queryClient.removeQueries({ queryKey: ['admin'] })
        setState({ status: 'anonymous' })
      },
      updateUser(user) {
        setState({ status: 'authenticated', user })
      },
    }),
    [state, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

export function AdminSplash() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-10 animate-pulse" />
        <span className="sr-only">Checking your session…</span>
      </div>
    </div>
  )
}

/** Only renders nested admin routes for a signed-in editor. */
export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') return <AdminSplash />
  if (state.status === 'anonymous') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: `${location.pathname}${location.search}`, expired: state.expired }}
      />
    )
  }
  return <Outlet />
}

export function useCurrentUser() {
  const { state } = useAuth()
  return state.status === 'authenticated' ? state.user : null
}
