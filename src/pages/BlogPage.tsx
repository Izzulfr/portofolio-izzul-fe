import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { PostList, PostListSkeleton } from '@/components/sections/PostList'
import { Button } from '@/components/ui/Button'
import { FilterChips } from '@/components/ui/Chip'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { queries } from '@/lib/queries'
import { cn } from '@/lib/utils'

const ALL = 'all'
const PAGE_SIZE = 8

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = searchParams.get('tag') ?? ALL
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery(
    queries.posts({ tag: tag === ALL ? undefined : tag, page, pageSize: PAGE_SIZE }),
  )

  useDocumentMeta({
    title: 'Blog',
    description: 'Articles by Izzul Faturrizky on business analysis, UAT, project coordination and IT service management.',
  })

  function update(next: { tag?: string; page?: number }) {
    const params: Record<string, string> = {}
    const nextTag = next.tag ?? tag
    const nextPage = next.page ?? 1
    if (nextTag !== ALL) params.tag = nextTag
    if (nextPage > 1) params.page = String(nextPage)
    setSearchParams(params, { preventScrollReset: true })
  }

  const tags = data?.meta.tags ?? []

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes on requirements, delivery and *service*."
        description="Practical writing about the parts of software work that happen before and after the code: analysis, documentation, testing and support."
      />

      <section aria-label="Articles" className="container-page pb-24 md:pb-36">
        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <>
            {tags.length > 0 && (
              <FilterChips
                label="Filter articles by topic"
                layoutId="blog-filter"
                value={tag}
                options={[{ value: ALL, label: 'All topics' }, ...tags.map((value) => ({ value, label: value }))]}
                onChange={(value) => update({ tag: value, page: 1 })}
              />
            )}

            <div className={cn('mt-12 transition-opacity duration-300', isPlaceholderData && 'opacity-50')}>
              {isPending ? (
                <PostListSkeleton rows={4} />
              ) : data.data.length === 0 ? (
                <EmptyState title="No articles yet">New writing will appear here as soon as it is published.</EmptyState>
              ) : (
                <PostList key={`${tag}-${page}`} posts={data.data} />
              )}
            </div>

            {data && data.meta.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-between gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => update({ page: page - 1 })}
                >
                  <ArrowLeft aria-hidden className="size-4" />
                  Newer
                </Button>
                <p className="font-mono text-sm text-ink-muted">
                  Page {data.meta.page} of {data.meta.totalPages}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => update({ page: page + 1 })}
                >
                  Older
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  )
}
