import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, FileText, GitBranch, HardDrive, LoaderCircle, Lock, Trash, Upload, type LucideIcon } from 'lucide-react'
import { useMemo, useState, type DragEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { FilterChips } from '@/components/ui/Chip'
import { ErrorState } from '@/components/ui/States'
import { ApiError } from '@/lib/api'
import { cn, mediaUrl } from '@/lib/utils'
import { adminApi, authRequest, invalidatePublicContent, type MediaFile, type MediaMeta } from '../api'
import { ConfirmDialog } from './Modal'

export const MEDIA_FOLDERS = ['projects', 'posts', 'profile', 'site', 'documents'] as const
export type MediaFolderName = (typeof MEDIA_FOLDERS)[number]

type MediaList = { data: MediaFile[]; meta: MediaMeta }

/**
 * Object URLs for files uploaded in this tab. With GitHub storage a new file is only
 * served once the site has redeployed; until then previews use the local copy.
 */
const localPreviews = new Map<string, string>()

export const previewUrl = (url: string) => localPreviews.get(url) ?? mediaUrl(url)

/**
 * The files in the site's public/media folder. Normally the API lists them; when it
 * cannot see the folder (read-only storage), the list the site published at build
 * time is used instead.
 */
export function useMediaFiles() {
  const library = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => adminApi.getWithMeta<MediaFile[], MediaMeta>('/media'),
  })
  const readOnly = library.data?.meta.driver === 'readonly'

  const manifest = useQuery({
    queryKey: ['admin', 'media', 'manifest'],
    queryFn: async () => {
      const response = await fetch('/media/manifest.json', { cache: 'no-store' })
      return response.ok ? ((await response.json()) as { files: MediaFile[] }).files : []
    },
    enabled: readOnly,
  })

  return {
    files: (readOnly ? manifest.data : library.data?.data) ?? [],
    meta: library.data?.meta,
    isPending: library.isPending || (readOnly && manifest.isPending),
    isError: library.isError,
    refetch: () => {
      void library.refetch()
      if (readOnly) void manifest.refetch()
    },
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const isImage = (file: MediaFile) => file.type.startsWith('image/')

function StorageNotice({ meta }: { meta: MediaMeta }) {
  const notices: Record<MediaMeta['driver'], { icon: LucideIcon; title: string; body: ReactNode }> = {
    filesystem: {
      icon: HardDrive,
      title: 'Saved into the site folder',
      body: (
        <>
          Uploads are written to <code className="font-mono text-xs">{meta.location}</code>. Commit and push the
          frontend to publish them.
        </>
      ),
    },
    github: {
      icon: GitBranch,
      title: 'Committed to GitHub',
      body: (
        <>
          Uploads are committed to <code className="font-mono text-xs">{meta.location}</code>. The site redeploys on its
          own, so a new file is live in about a minute.
        </>
      ),
    },
    readonly: {
      icon: Lock,
      title: 'Read-only',
      body: (
        <>
          This server cannot store files ({meta.location}). Add them to{' '}
          <code className="font-mono text-xs">portfolio-frontend/public/media</code>, commit and redeploy; they will be
          listed here.
        </>
      ),
    },
  }
  const { icon: Icon, title, body } = notices[meta.driver]

  return (
    <div className="flex gap-3 rounded-xl border border-line bg-subtle/60 p-4 text-sm">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-muted" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 leading-relaxed text-ink-muted">{body}</p>
      </div>
    </div>
  )
}

function MediaThumb({ file }: { file: MediaFile }) {
  const [failed, setFailed] = useState(false)
  const local = localPreviews.get(file.url)

  if (!isImage(file)) {
    return (
      <div className="grid size-full place-items-center">
        <FileText aria-hidden className="size-8 text-ink-subtle" />
      </div>
    )
  }

  if (failed && !local) {
    return (
      <div className="grid size-full place-items-center p-3 text-center text-xs leading-snug text-ink-muted">
        Not published yet — visible after the next deploy
      </div>
    )
  }

  return (
    <img
      src={local ?? mediaUrl(file.url)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-full object-cover transition-transform duration-500 group-hover/media:scale-[1.03]"
    />
  )
}

interface MediaLibraryProps {
  /** Picker mode: choosing a file (or uploading one) hands it back. */
  onSelect?: (file: MediaFile) => void
  accept?: 'image' | 'any'
  selectedUrl?: string | null
  defaultFolder?: MediaFolderName
}

export function MediaLibrary({ onSelect, accept = 'any', selectedUrl, defaultFolder = 'projects' }: MediaLibraryProps) {
  const queryClient = useQueryClient()
  const media = useMediaFiles()
  const [folderFilter, setFolderFilter] = useState<string>('all')
  const [uploadFolder, setUploadFolder] = useState<MediaFolderName>(defaultFolder)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ file: MediaFile; usage?: string } | null>(null)

  const upload = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: MediaFolderName }) => {
      const body = new FormData()
      body.append('folder', folder)
      body.append('file', file)
      const response = await authRequest<MediaList & { data: MediaFile }>('/admin/media', { method: 'POST', body })
      return { stored: response.data, meta: response.meta, local: URL.createObjectURL(file) }
    },
    onSuccess({ stored, meta, local }) {
      localPreviews.set(stored.url, local)
      queryClient.setQueryData<MediaList>(['admin', 'media'], (current) =>
        current
          ? {
              ...current,
              data: [...current.data.filter((file) => file.path !== stored.path), stored].sort((a, b) =>
                a.path.localeCompare(b.path),
              ),
            }
          : current,
      )
      toast.success(
        meta.driver === 'github'
          ? `Committed ${stored.name}. It goes live once the site redeploys.`
          : `Saved ${stored.name} to /media/${stored.folder}`,
      )
      onSelect?.(stored)
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const remove = useMutation({
    mutationFn: ({ file, force }: { file: MediaFile; force: boolean }) =>
      adminApi.delete(`/media?path=${encodeURIComponent(file.path)}${force ? '&force=true' : ''}`),
    onSuccess(_, { file }) {
      queryClient.setQueryData<MediaList>(['admin', 'media'], (current) =>
        current ? { ...current, data: current.data.filter((item) => item.path !== file.path) } : current,
      )
      void invalidatePublicContent(queryClient)
      setPendingDelete(null)
      toast.success(`Deleted ${file.name}`)
    },
    onError(error, { file }) {
      if (error instanceof ApiError && error.status === 409 && error.code === 'CONFLICT') {
        setPendingDelete({ file, usage: error.message })
      } else {
        setPendingDelete(null)
        toast.error(error.message)
      }
    },
  })

  const writable = Boolean(media.meta?.writable)
  const maxMb = media.meta?.maxUploadMb ?? 10

  function uploadFiles(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${maxMb} MB.`)
        continue
      }
      upload.mutate({ file, folder: uploadFolder })
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (writable) uploadFiles(event.dataTransfer.files)
  }

  async function copyPath(file: MediaFile) {
    await navigator.clipboard.writeText(file.url)
    setCopied(file.path)
    setTimeout(() => setCopied((current) => (current === file.path ? null : current)), 1500)
  }

  const visible = useMemo(
    () =>
      media.files.filter(
        (file) =>
          (accept === 'any' || isImage(file)) && (folderFilter === 'all' || file.folder === folderFilter),
      ),
    [media.files, accept, folderFilter],
  )

  const folderOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const file of media.files) {
      if (accept === 'image' && !isImage(file)) continue
      counts.set(file.folder || 'root', (counts.get(file.folder || 'root') ?? 0) + 1)
    }
    return [
      { value: 'all', label: 'All', count: [...counts.values()].reduce((sum, count) => sum + count, 0) },
      ...[...counts].map(([value, count]) => ({ value, label: value, count })),
    ]
  }, [media.files, accept])

  if (media.isError) return <ErrorState onRetry={media.refetch} />

  return (
    <div className="space-y-5">
      {media.meta && <StorageNotice meta={media.meta} />}

      {writable && (
        <div className="space-y-3">
          <label className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">Upload into</span>
            <select
              value={uploadFolder}
              onChange={(event) => setUploadFolder(event.target.value as MediaFolderName)}
              className="field-input min-h-0 w-auto py-1.5 pr-9 text-sm"
            >
              {MEDIA_FOLDERS.map((folder) => (
                <option key={folder} value={folder}>
                  /media/{folder}
                </option>
              ))}
            </select>
          </label>

          <label
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
              dragging ? 'border-accent bg-accent/5' : 'border-line-strong/50 hover:border-ink hover:bg-subtle/60',
            )}
          >
            {upload.isPending ? (
              <LoaderCircle aria-hidden className="size-6 animate-spin text-ink-muted" />
            ) : (
              <Upload aria-hidden className="size-6 text-ink-muted" />
            )}
            <span className="font-medium">{upload.isPending ? 'Uploading…' : 'Drop files here, or click to upload'}</span>
            <span className="text-sm text-ink-muted">
              JPG, PNG, WebP, AVIF, GIF{accept === 'any' ? ' or PDF' : ''} · up to {maxMb} MB
            </span>
            <input
              type="file"
              multiple
              accept={accept === 'image' ? 'image/jpeg,image/png,image/webp,image/avif,image/gif' : 'image/*,application/pdf'}
              className="sr-only"
              onChange={(event) => {
                uploadFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
        </div>
      )}

      {folderOptions.length > 2 && (
        <FilterChips
          label="Filter by folder"
          layoutId={onSelect ? 'media-folder-picker' : 'media-folder-page'}
          options={folderOptions}
          value={folderFilter}
          onChange={setFolderFilter}
        />
      )}

      {media.isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="skeleton aspect-4/3 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">No files here yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((file) => {
            const selected = selectedUrl === file.url
            const preview = (
              <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-line bg-subtle">
                <MediaThumb file={file} />
                {selected && (
                  <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-accent text-on-accent">
                    <Check aria-hidden className="size-4" />
                  </span>
                )}
              </div>
            )

            return (
              <li key={file.path} className="group/media min-w-0">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(file)}
                    aria-pressed={selected}
                    className={cn(
                      'block w-full rounded-xl text-left',
                      selected && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
                    )}
                  >
                    {preview}
                    <span className="sr-only">Choose {file.path}</span>
                  </button>
                ) : (
                  preview
                )}
                <p className="mt-2 truncate text-sm font-medium" title={file.url}>
                  {file.name}
                </p>
                <p className="truncate font-mono text-xs text-ink-subtle">
                  {file.folder ? `${file.folder}/ · ` : ''}
                  {formatSize(file.size)}
                </p>

                {!onSelect && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => void copyPath(file)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
                    >
                      {copied === file.path ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
                      {copied === file.path ? 'Copied' : 'Copy path'}
                    </button>
                    {writable && (
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ file })}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-ink-muted transition-colors hover:bg-subtle hover:text-danger"
                      >
                        <Trash aria-hidden className="size-3.5" />
                        Delete
                        <span className="sr-only"> {file.name}</span>
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.usage ? 'This file is in use' : 'Delete this file?'}
        description={
          pendingDelete?.usage ? (
            <>
              <p>{pendingDelete.usage}</p>
              <p className="mt-2">Deleting it will leave a broken image there.</p>
            </>
          ) : (
            <p>
              “{pendingDelete?.file.path}” will be removed from the site
              {media.meta?.driver === 'github' ? ' with a new commit' : ''}.
            </p>
          )
        }
        confirmLabel={pendingDelete?.usage ? 'Delete anyway' : 'Delete'}
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate({ file: pendingDelete.file, force: Boolean(pendingDelete.usage) })}
      />
    </div>
  )
}
