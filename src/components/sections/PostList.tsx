import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { fadeUp, inViewOnce, stagger } from '@/lib/motion'
import { queries } from '@/lib/queries'
import type { PostSummary } from '@/lib/types'
import { formatDate } from '@/lib/utils'

function PostRow({ post }: { post: PostSummary }) {
  const queryClient = useQueryClient()
  const prefetch = () => void queryClient.prefetchQuery(queries.post(post.slug))

  return (
    <motion.li variants={fadeUp} className="border-b border-line">
      <article
        onMouseEnter={prefetch}
        className="group/post relative grid gap-3 py-8 before:absolute before:-inset-x-3 before:inset-y-2 before:rounded-2xl before:bg-subtle before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-10 md:py-10 md:before:-inset-x-5"
      >
        <p className="relative font-mono text-sm text-ink-muted">
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          <span className="text-ink-subtle"> · {post.readingMinutes} min</span>
        </p>

        <div className="relative">
          <h3 className="text-headline font-medium transition-transform duration-500 ease-out-quint group-hover/post:translate-x-1.5">
            <Link
              to={`/blog/${post.slug}`}
              onFocus={prefetch}
              className="outline-none after:absolute after:-inset-x-3 after:-inset-y-6 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-accent md:after:-inset-x-5"
            >
              {post.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-ink-muted">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">
              {post.tags.join(' / ')}
            </p>
          )}
        </div>

        <span
          aria-hidden
          className="relative hidden size-11 place-items-center rounded-full border border-line text-ink-muted transition-[background-color,border-color,color,rotate] duration-500 ease-out-quint group-hover/post:-rotate-45 group-hover/post:border-ink group-hover/post:bg-ink group-hover/post:text-canvas md:grid"
        >
          <ArrowRight className="size-5" />
        </span>
      </article>
    </motion.li>
  )
}

export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <motion.ul
      className="border-t border-line"
      variants={stagger(0.07)}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
    >
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </motion.ul>
  )
}

export function PostListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden className="border-t border-line">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid gap-3 border-b border-line py-9 md:grid-cols-[11rem_1fr] md:gap-10">
          <div className="skeleton h-4 w-28 rounded-full" />
          <div>
            <div className="skeleton h-7 w-3/4 rounded-lg" />
            <div className="skeleton mt-3 h-4 w-full max-w-xl rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
