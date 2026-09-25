import { FileText, ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ControlProps } from '@/components/ui/FormField'
import { MediaLibrary, previewUrl, type MediaFolderName } from './MediaLibrary'
import { Modal } from './Modal'

interface MediaInputProps extends Partial<ControlProps> {
  id: string
  value: string
  onChange: (value: string) => void
  accept?: 'image' | 'any'
  /** Where files uploaded from this field are stored. */
  folder?: MediaFolderName
}

const looksLikeImage = (url: string) => /\.(gif|jpe?g|png|webp|avif|svg)(\?.*)?$/i.test(url)

/** Pick a file from the site's /media folder, upload one on the spot, or paste any URL. */
export function MediaInput({ id, value, onChange, accept = 'image', folder = 'projects', ...aria }: MediaInputProps) {
  const [open, setOpen] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => setPreviewFailed(false), [value])

  return (
    <div className="space-y-2">
      {value ? (
        <div className="overflow-hidden rounded-xl border border-line bg-subtle">
          {looksLikeImage(value) ? (
            previewFailed ? (
              <p className="grid aspect-4/3 place-items-center p-4 text-center text-xs text-ink-muted">
                No preview yet — the file appears once the site is redeployed.
              </p>
            ) : (
              <img
                src={previewUrl(value)}
                alt=""
                onError={() => setPreviewFailed(true)}
                className="aspect-4/3 w-full object-cover"
              />
            )
          ) : (
            <a
              href={previewUrl(value)}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 px-4 py-5 text-sm hover:underline"
            >
              <FileText aria-hidden className="size-5 text-ink-muted" />
              <span className="truncate">{value.split('/').pop()}</span>
            </a>
          )}
          <div className="flex gap-1 border-t border-line bg-surface p-1.5">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setOpen(true)}>
              Replace
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 hover:text-danger" onClick={() => onChange('')}>
              <X aria-hidden className="size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line-strong/50 px-4 py-6 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <ImagePlus aria-hidden className="size-5" />
          Choose from /media
        </button>
      )}

      <input
        {...aria}
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/media/… or https://"
        className="field-input min-h-0 py-2 font-mono text-xs"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Media"
        description={`Choose a file from the site's /media folder, or upload one into /media/${folder}.`}
        size="lg"
      >
        <MediaLibrary
          accept={accept}
          selectedUrl={value}
          defaultFolder={folder}
          onSelect={(file) => {
            onChange(file.url)
            setOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
