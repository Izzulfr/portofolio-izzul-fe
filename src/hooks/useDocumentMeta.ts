import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queries } from '@/lib/queries'
import { mediaUrl } from '@/lib/utils'

interface DocumentMeta {
  /** Page name; omitted on the home page, which uses the full site title. */
  title?: string
  description?: string | null
  image?: string | null
  noindex?: boolean
}

function setMeta(attribute: 'name' | 'property', key: string, content: string | null | undefined) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!content) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

/** Keeps <title> and the share metadata in step with the current page. */
export function useDocumentMeta({ title, description, image, noindex }: DocumentMeta) {
  const { data } = useQuery(queries.site())
  const siteTitle = data?.settings.siteTitle ?? 'Izzul Faturrizky — Software Builder'
  const owner = data?.profile.name ?? 'Izzul Faturrizky'
  const fallbackDescription = data?.settings.siteDescription
  const fallbackImage = data?.settings.ogImageUrl

  useEffect(() => {
    const fullTitle = title ? `${title} · ${owner}` : siteTitle
    const summary = description ?? fallbackDescription
    const shareImage = mediaUrl(image ?? fallbackImage)

    document.title = fullTitle
    setMeta('name', 'description', summary)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', summary)
    setMeta('property', 'og:image', shareImage ? new URL(shareImage, window.location.origin).href : null)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : null)
  }, [title, description, image, noindex, siteTitle, owner, fallbackDescription, fallbackImage])
}
