import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'

const TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
}

export interface ManifestFile {
  path: string
  url: string
  folder: string
  name: string
  size: number
  type: string
}

async function scan(root: string): Promise<ManifestFile[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true }).catch(() => [])
  const files: ManifestFile[] = []

  for (const entry of entries) {
    const type = TYPES[path.extname(entry.name).toLowerCase()]
    if (!entry.isFile() || !type || entry.name.startsWith('.')) continue

    const absolute = path.join(entry.parentPath, entry.name)
    const relative = path.relative(root, absolute).split(path.sep).join('/')
    const segments = relative.split('/')
    const { size } = await stat(absolute)

    files.push({
      path: relative,
      url: `/media/${segments.map(encodeURIComponent).join('/')}`,
      folder: segments.length > 1 ? (segments[0] ?? '') : '',
      name: segments.at(-1) ?? relative,
      size,
      type,
    })
  }

  return files.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Publishes /media/manifest.json — every file in public/media — so the CMS can list
 * the site's images even when its API is not allowed to write any.
 */
export function mediaManifest(): Plugin {
  let mediaRoot = ''

  return {
    name: 'media-manifest',

    configResolved(config) {
      mediaRoot = path.join(config.publicDir, 'media')
    },

    configureServer(server) {
      // In development the folder is scanned on every request, so new files show up at once.
      server.middlewares.use('/media/manifest.json', (_request, response) => {
        void scan(mediaRoot).then((files) => {
          response.setHeader('Content-Type', 'application/json')
          response.setHeader('Cache-Control', 'no-store')
          response.end(JSON.stringify({ files }))
        })
      })
    },

    async generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'media/manifest.json',
        source: JSON.stringify({ files: await scan(mediaRoot) }),
      })
    },
  }
}
