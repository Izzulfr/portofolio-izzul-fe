import type { QueryClient } from '@tanstack/react-query'
import { ApiError, apiRequest, type RequestOptions } from '@/lib/api'

export interface AdminUser {
  id: string
  email: string
  name: string
}

interface Session {
  accessToken: string
  expiresIn: number
  user: AdminUser
}

// The access token lives in memory only. The long-lived refresh token is an
// httpOnly cookie that script on this page can neither read nor steal.
let accessToken: string | null = null
let expiresAt = 0
let refreshing: Promise<Session | null> | null = null
const expiredListeners = new Set<() => void>()

export function setSession(session: Session | null) {
  accessToken = session?.accessToken ?? null
  expiresAt = session ? Date.now() + session.expiresIn * 1000 : 0
}

/** Called when the session can no longer be renewed and the editor must sign in again. */
export function onSessionExpired(listener: () => void) {
  expiredListeners.add(listener)
  return () => {
    expiredListeners.delete(listener)
  }
}

/** Exchanges the refresh cookie for a new access token. Parallel callers share one request. */
export function refreshSession(): Promise<Session | null> {
  refreshing ??= apiRequest<{ data: Session }>('/auth/refresh', { method: 'POST' })
    .then((response) => {
      setSession(response.data)
      return response.data
    })
    .catch(() => {
      setSession(null)
      return null
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

export async function signIn(email: string, password: string) {
  const response = await apiRequest<{ data: Session }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  setSession(response.data)
  return response.data
}

export async function signOut() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } finally {
    setSession(null)
  }
}

/** Authenticated request: renews the token shortly before it expires, and once more on a 401. */
export async function authRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!accessToken || Date.now() > expiresAt - 30_000) await refreshSession()

  const send = () =>
    apiRequest<T>(path, {
      ...options,
      headers: { ...options.headers, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    })

  try {
    return await send()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (await refreshSession()) return send()
      expiredListeners.forEach((listener) => listener())
    }
    throw error
  }
}

export const adminApi = {
  get: <T>(path: string) => authRequest<{ data: T }>(`/admin${path}`).then((response) => response.data),
  getWithMeta: <T, M>(path: string) => authRequest<{ data: T; meta: M }>(`/admin${path}`),
  post: <T>(path: string, body?: unknown) =>
    authRequest<{ data: T } | undefined>(`/admin${path}`, { method: 'POST', body }).then((response) => response?.data as T),
  put: <T>(path: string, body: unknown) =>
    authRequest<{ data: T }>(`/admin${path}`, { method: 'PUT', body }).then((response) => response.data),
  patch: <T>(path: string, body: unknown) =>
    authRequest<{ data: T }>(`/admin${path}`, { method: 'PATCH', body }).then((response) => response.data),
  delete: (path: string) => authRequest<void>(`/admin${path}`, { method: 'DELETE' }),
}

/** After any edit, the public pages cached in this tab should show the new content. */
export function invalidatePublicContent(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'admin' })
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  isRead: boolean
  createdAt: string
}

/** A file in the site's public/media folder. */
export interface MediaFile {
  /** Relative to /media, e.g. "projects/cover.gif". */
  path: string
  /** The value content fields store, e.g. "/media/projects/cover.gif". */
  url: string
  folder: string
  name: string
  size: number
  type: string
}

export interface MediaMeta {
  /** filesystem: a local checkout · github: commits to the repo · readonly: no uploads. */
  driver: 'filesystem' | 'github' | 'readonly'
  writable: boolean
  location: string
  folders: string[]
  maxUploadMb: number
}

export interface Overview {
  counts: {
    projects: number
    projectDrafts: number
    posts: number
    postDrafts: number
    experiences: number
    messages: number
    unreadMessages: number
  }
  recentMessages: Message[]
}
