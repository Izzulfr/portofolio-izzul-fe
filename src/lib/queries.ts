import { keepPreviousData, QueryClient, queryOptions } from '@tanstack/react-query'
import { ApiError, apiRequest, getData, toQueryString } from './api'
import type {
  Certification,
  Education,
  Experience,
  Organization,
  PostListResponse,
  PostResponse,
  ProjectResponse,
  ProjectSummary,
  SiteData,
  SkillGroup,
} from './types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      // A 404 will still be a 404 on the next try; network hiccups and a
      // sleeping free-tier API deserve another attempt.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
})

export const queries = {
  site: () =>
    queryOptions({
      queryKey: ['site'],
      queryFn: ({ signal }) => getData<SiteData>('/site', signal),
      staleTime: 5 * 60_000,
    }),

  projects: (filters: { featured?: boolean } = {}) =>
    queryOptions({
      queryKey: ['projects', filters],
      queryFn: ({ signal }) =>
        getData<ProjectSummary[]>(`/projects${toQueryString({ featured: filters.featured })}`, signal),
    }),

  project: (slug: string) =>
    queryOptions({
      queryKey: ['project', slug],
      queryFn: ({ signal }) => getData<ProjectResponse>(`/projects/${encodeURIComponent(slug)}`, signal),
    }),

  experiences: () =>
    queryOptions({
      queryKey: ['experiences'],
      queryFn: ({ signal }) => getData<Experience[]>('/experiences', signal),
    }),

  skills: () =>
    queryOptions({
      queryKey: ['skills'],
      queryFn: ({ signal }) => getData<SkillGroup[]>('/skills', signal),
    }),

  education: () =>
    queryOptions({
      queryKey: ['education'],
      queryFn: ({ signal }) => getData<Education[]>('/education', signal),
    }),

  certifications: () =>
    queryOptions({
      queryKey: ['certifications'],
      queryFn: ({ signal }) => getData<Certification[]>('/certifications', signal),
    }),

  organizations: () =>
    queryOptions({
      queryKey: ['organizations'],
      queryFn: ({ signal }) => getData<Organization[]>('/organizations', signal),
    }),

  posts: (params: { tag?: string; page?: number; pageSize?: number } = {}) =>
    queryOptions({
      queryKey: ['posts', params],
      queryFn: ({ signal }) =>
        apiRequest<PostListResponse>(`/posts${toQueryString(params)}`, { signal }),
      placeholderData: keepPreviousData,
    }),

  post: (slug: string) =>
    queryOptions({
      queryKey: ['post', slug],
      queryFn: ({ signal }) => getData<PostResponse>(`/posts/${encodeURIComponent(slug)}`, signal),
    }),
}
