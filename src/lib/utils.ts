import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Images and documents live in this site's public/media folder, so a stored path
 * such as /media/projects/cover.gif is served by the site itself. Absolute URLs
 * (an image hosted elsewhere) are used as they are.
 */
export function mediaUrl(url: string | null | undefined): string | undefined {
  return url ? url.trim() : undefined
}

export const isExternalUrl = (href: string | null | undefined) => Boolean(href && /^(https?:)?\/\//i.test(href))

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
}

export interface TextSegment {
  text: string
  emphasis: boolean
}

/** "Software that *ships*." → plain and emphasised segments, for the serif accent. */
export function parseEmphasis(input: string): TextSegment[] {
  return input
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('*') && part.endsWith('*') && part.length > 2
        ? { text: part.slice(1, -1), emphasis: true }
        : { text: part, emphasis: false },
    )
}

export const stripEmphasis = (input: string) => input.replace(/\*([^*]+)\*/g, '$1')

export const pad = (value: number) => String(value).padStart(2, '0')

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}
