/**
 * The one place the frontend talks to the CMS API.
 *
 * `VITE_API_URL` is inlined at build time. The default `/api/v1` expects this
 * site to forward /api to the backend (Vite proxy locally, a rewrite in production).
 */
export const API_BASE = (import.meta.env.VITE_API_URL?.trim() || '/api/v1').replace(/\/+$/, '')

export interface FieldIssue {
  path: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: FieldIssue[]

  constructor(status: number, code: string, message: string, details: FieldIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** First message per field, keyed by path ("title", "processSteps.0.title"). */
  get fieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const issue of this.details) errors[issue.path] ??= issue.message
    return errors
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    payload = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      body: payload,
      headers,
      signal,
      credentials: 'include',
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 204) return undefined as T

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = (data as { error?: { code?: string; message?: string; details?: FieldIssue[] } } | null)
      ?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `The server answered with an error (${response.status}).`,
      error?.details ?? [],
    )
  }

  return data as T
}

/** Unwraps the `{ data }` envelope every endpoint responds with. */
export async function getData<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await apiRequest<{ data: T }>(path, { signal })
  return response.data
}

export function toQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}
