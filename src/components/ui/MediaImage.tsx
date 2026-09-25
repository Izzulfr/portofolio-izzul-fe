import { useEffect, useRef, useState } from 'react'
import { cn, mediaUrl } from '@/lib/utils'

interface MediaImageProps {
  src: string
  alt: string
  /** The page's largest image: fetch it early and never lazily. */
  priority?: boolean
  className?: string
  imageClassName?: string
}

/**
 * Images and GIFs load behind a shimmer and fade in once decoded, instead of
 * painting top to bottom. The box keeps its size from the parent, so nothing shifts.
 */
export function MediaImage({ src, alt, priority = false, className, imageClassName }: MediaImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(Boolean(ref.current?.complete && ref.current.naturalWidth))
  }, [src])

  // React 18 does not know `fetchPriority`; the lowercase attribute passes straight through.
  const priorityAttributes = priority ? ({ fetchpriority: 'high' } as Record<string, string>) : { loading: 'lazy' as const }

  return (
    <div className={cn('relative size-full overflow-hidden bg-subtle', className)}>
      <div
        aria-hidden
        className={cn('skeleton absolute inset-0 transition-opacity duration-500', loaded && 'opacity-0')}
      />
      <img
        ref={ref}
        src={mediaUrl(src)}
        alt={alt}
        decoding="async"
        {...priorityAttributes}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'relative size-full object-cover transition-[opacity,scale,filter] duration-700 ease-out-quint',
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.03] opacity-0 blur-md',
          imageClassName,
        )}
      />
    </div>
  )
}
