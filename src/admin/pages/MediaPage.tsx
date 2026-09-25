import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { MediaLibrary } from '../components/MediaLibrary'

export function MediaPage() {
  useDocumentMeta({ title: 'Media · CMS', noindex: true })

  return (
    <>
      <AdminPageHeader
        title="Media"
        description="Images, GIFs and documents in the site’s public/media folder, served by the site itself."
      />
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <MediaLibrary />
      </div>
    </>
  )
}
