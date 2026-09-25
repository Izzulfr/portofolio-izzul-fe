import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import remarkGfm from 'remark-gfm'
import { cn, isExternalUrl, mediaUrl } from '@/lib/utils'

const components: Components = {
  a({ href, children, node: _node, ...props }) {
    if (!href || isExternalUrl(href) || /^(mailto:|tel:|#)/i.test(href)) {
      const external = isExternalUrl(href)
      return (
        <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...props}>
          {children}
        </a>
      )
    }
    return (
      <Link to={href} {...(props as Omit<ComponentPropsWithoutRef<'a'>, 'href'>)}>
        {children}
      </Link>
    )
  },
  img({ src, alt, node: _node, ...props }) {
    return (
      <img
        {...props}
        src={typeof src === 'string' ? mediaUrl(src) : undefined}
        alt={alt ?? ''}
        loading="lazy"
        decoding="async"
        className="rounded-xl border border-line"
      />
    )
  },
  table({ node: _node, ...props }) {
    return (
      <div className="-mx-1 overflow-x-auto px-1">
        <table {...props} />
      </div>
    )
  },
}

/** Markdown from the CMS. Raw HTML is not rendered, and unsafe URLs are dropped. */
export default function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('prose prose-site max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
