import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Link2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router'
import { AnimatedHeadline } from '@/components/ui/AnimatedHeadline'
import Markdown from '@/components/ui/Markdown'
import { MediaImage } from '@/components/ui/MediaImage'
import { Reveal } from '@/components/ui/Reveal'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ApiError } from '@/lib/api'
import { ease } from '@/lib/motion'
import { queries } from '@/lib/queries'
import type { Neighbour } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import NotFoundPage from './NotFoundPage'

/** Scroll-linked bar at the top of the viewport. Pure CSS where scroll timelines exist. */
function ReadingProgress() {
  return createPortal(
    <div aria-hidden className="reading-progress fixed inset-x-0 top-0 z-[60] h-0.5 bg-accent" />,
    document.body,
  )
}

function CopyLink() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true), () => {})}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm transition-colors hover:border-ink"
    >
      <Link2 aria-hidden className="size-4" />
      <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
    </button>
  )
}

function Neighbours({ previous, next }: { previous: Neighbour | null; next: Neighbour | null }) {
  if (!previous && !next) return null

  const card =
    'group/nav flex flex-col gap-3 rounded-2xl border border-line p-6 transition-[border-color,background-color] duration-300 hover:border-ink hover:bg-surface md:p-8'

  return (
    <nav aria-label="More articles" className="grid gap-4 md:grid-cols-2">
      {next ? (
        <Link to={`/blog/${next.slug}`} className={card}>
          <span className="eyebrow inline-flex items-center gap-2">
            <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover/nav:-translate-x-0.5" />
            Newer
          </span>
          <span className="text-lg font-medium tracking-[-0.015em]">{next.title}</span>
        </Link>
      ) : (
        <span className="hidden md:block" />
      )}
      {previous && (
        <Link to={`/blog/${previous.slug}`} className={`${card} md:items-end md:text-right`}>
          <span className="eyebrow inline-flex items-center gap-2">
            Older
            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover/nav:translate-x-0.5" />
          </span>
          <span className="text-lg font-medium tracking-[-0.015em]">{previous.title}</span>
        </Link>
      )}
    </nav>
  )
}

export default function PostPage() {
  const { slug = '' } = useParams()
  const { data, isPending, isError, error, refetch } = useQuery(queries.post(slug))
  const post = data?.post

  useDocumentMeta({ title: post?.title, description: post?.excerpt, image: post?.coverUrl })

  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <NotFoundPage />
    return (
      <div className="container-page pb-24 pt-40">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isPending || !post) {
    return (
      <div aria-hidden className="container-page max-w-4xl pb-24 pt-32 md:pt-44">
        <div className="skeleton h-4 w-40 rounded-full" />
        <div className="skeleton mt-8 h-14 w-full rounded-2xl" />
        <div className="skeleton mt-4 h-14 w-2/3 rounded-2xl" />
        <div className="skeleton mt-14 h-72 rounded-2xl" />
      </div>
    )
  }

  return (
    <article>
      <ReadingProgress />

      <header className="container-page max-w-4xl pt-28 md:pt-40">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
          <Link to="/blog" className="group/back eyebrow inline-flex items-center gap-2 transition-colors hover:text-ink">
            <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover/back:-translate-x-0.5" />
            All articles
          </Link>
        </motion.div>

        <p className="mt-10 font-mono text-sm text-ink-muted">
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          <span className="text-ink-subtle"> · {post.readingMinutes} min read</span>
        </p>

        <AnimatedHeadline
          text={post.title}
          className="mt-5 text-[clamp(2.25rem,1.4rem+3.4vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.04em]"
        />

        <motion.p
          className="mt-8 text-lead text-ink-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
        >
          {post.excerpt}
        </motion.p>

        {post.tags.length > 0 && (
          <ul aria-label="Topics" className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex rounded-full border border-line px-3 py-1 text-[0.8125rem] text-ink-muted transition-colors hover:border-ink hover:text-ink"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {post.coverUrl && (
        <Reveal className="container-page mt-14 max-w-4xl">
          <div className="aspect-16/9 overflow-hidden rounded-[1.5rem] border border-line">
            <MediaImage src={post.coverUrl} alt="" priority />
          </div>
        </Reveal>
      )}

      <Reveal className="container-page max-w-4xl py-16 md:py-20">
        <Markdown className="max-w-3xl">{post.content}</Markdown>
      </Reveal>

      <footer className="container-page max-w-4xl space-y-10 pb-24 md:pb-32">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="text-sm text-ink-muted">Thanks for reading.</p>
          <CopyLink />
        </div>
        <Neighbours previous={data.previous} next={data.next} />
      </footer>
    </article>
  )
}
