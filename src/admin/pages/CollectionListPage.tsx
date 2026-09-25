import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ArrowUpRight, Pencil, Plus, Search, Trash } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ease } from '@/lib/motion'
import { cn, formatDate } from '@/lib/utils'
import { adminApi, invalidatePublicContent } from '../api'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { move } from '../components/ListInput'
import { ConfirmDialog } from '../components/Modal'
import { findCollection, type CollectionConfig, type ColumnConfig, type Row } from '../resources'
import { AdminNotFound } from './AdminNotFound'

function cellValue(row: Row, column: ColumnConfig) {
  const value = row[column.key]
  switch (column.kind) {
    case 'count':
      return Array.isArray(value) ? value.length : 0
    case 'flag':
      return value ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-ink">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Yes
        </span>
      ) : (
        <span className="text-ink-subtle">—</span>
      )
    case 'mono':
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDate(value)
      return value === null || value === undefined || value === '' ? '—' : String(value)
    default:
      return value === null || value === undefined ? '—' : String(value)
  }
}

function CollectionList({ config }: { config: CollectionConfig }) {
  const queryClient = useQueryClient()
  const queryKey = ['admin', config.key]
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null)
  useDocumentMeta({ title: `${config.label} · CMS`, noindex: true })

  const list = useQuery({ queryKey, queryFn: () => adminApi.get<Row[]>(`/${config.key}`) })

  const setRows = (updater: (rows: Row[]) => Row[]) =>
    queryClient.setQueryData<Row[]>(queryKey, (rows = []) => updater(rows))

  const togglePublish = useMutation({
    mutationFn: (row: Row) => adminApi.patch<Row>(`/${config.key}/${row.id}`, { isPublished: !row.isPublished }),
    onMutate(row) {
      setRows((rows) => rows.map((item) => (item.id === row.id ? { ...item, isPublished: !row.isPublished } : item)))
    },
    onSuccess(updated) {
      setRows((rows) => rows.map((item) => (item.id === updated.id ? updated : item)))
      void invalidatePublicContent(queryClient)
      toast.success(updated.isPublished ? 'Published' : 'Moved to drafts')
    },
    onError(error) {
      void queryClient.invalidateQueries({ queryKey })
      toast.error(error.message)
    },
  })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.post(`/${config.key}/reorder`, { ids }),
    onSuccess() {
      void invalidatePublicContent(queryClient)
    },
    onError(error) {
      void queryClient.invalidateQueries({ queryKey })
      toast.error(`Could not save the new order: ${error.message}`)
    },
  })

  const remove = useMutation({
    mutationFn: (row: Row) => adminApi.delete(`/${config.key}/${row.id}`),
    onSuccess(_, row) {
      setRows((rows) => rows.filter((item) => item.id !== row.id))
      setPendingDelete(null)
      void invalidatePublicContent(queryClient)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      toast.success(`${config.singular} deleted`)
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const rows = list.data ?? []
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) =>
      [config.titleKey, ...(config.subtitleKeys ?? [])].some((key) =>
        String(row[key] ?? '').toLowerCase().includes(needle),
      ),
    )
  }, [rows, search, config])

  const canReorder = config.sortable && !search.trim()

  function moveRow(index: number, direction: -1 | 1) {
    const next = move(rows, index, index + direction)
    setRows(() => next)
    reorder.mutate(next.map((row) => row.id))
  }

  const title = (row: Row) => String(row[config.titleKey] ?? 'Untitled')
  const subtitle = (row: Row) =>
    (config.subtitleKeys ?? [])
      .map((key) => row[key])
      .filter((value) => typeof value === 'string' && value)
      .join(' · ')

  return (
    <>
      <AdminPageHeader
        title={config.label}
        description={config.description}
        actions={
          <ButtonLink to={`/admin/${config.key}/new`} size="sm">
            <Plus aria-hidden className="size-4" />
            New {config.singular.toLowerCase()}
          </ButtonLink>
        }
      />

      {list.isError ? (
        <ErrorState onRetry={() => void list.refetch()} />
      ) : (
        <div className="rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3 sm:px-4">
            <label className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
              <span className="sr-only">Search {config.label.toLowerCase()}</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 size-4 text-ink-subtle" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search…"
                className="field-input min-h-0 py-2 pl-9 text-sm"
              />
            </label>
            <p className="font-mono text-xs text-ink-subtle">
              {filtered.length} of {rows.length}
              {config.sortable && search.trim() && ' · clear search to reorder'}
            </p>
          </div>

          {list.isPending ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState className="m-4" title={search ? 'Nothing matches that search' : `No ${config.label.toLowerCase()} yet`}>
              {!search && (
                <Link to={`/admin/${config.key}/new`} className="font-medium text-ink underline underline-offset-4">
                  Create the first one
                </Link>
              )}
            </EmptyState>
          ) : (
            <>
            <div
              aria-hidden
              className="hidden items-center gap-3 border-b border-line px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-subtle md:flex"
            >
              {config.sortable && <span className="w-6 shrink-0" />}
              <span className="flex-1">Name</span>
              {config.columns.map((column) => (
                <span key={column.key} className="w-28 shrink-0">
                  {column.label}
                </span>
              ))}
              <span className="w-[5.25rem] shrink-0 text-right">Status</span>
              <span className="w-[6.75rem] shrink-0" />
            </div>
            <ul className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {filtered.map((row) => {
                  const index = rows.findIndex((item) => item.id === row.id)
                  const publicPath = config.publicPath?.(row)
                  return (
                    <motion.li
                      key={row.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="group/row relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-subtle/50 sm:px-4"
                    >
                      {config.sortable && (
                        <div className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            disabled={!canReorder || index === 0 || reorder.isPending}
                            onClick={() => moveRow(index, -1)}
                            className="grid size-6 place-items-center rounded text-ink-subtle hover:bg-surface hover:text-ink disabled:opacity-25"
                          >
                            <ArrowUp aria-hidden className="size-3.5" />
                            <span className="sr-only">Move {title(row)} up</span>
                          </button>
                          <button
                            type="button"
                            disabled={!canReorder || index === rows.length - 1 || reorder.isPending}
                            onClick={() => moveRow(index, 1)}
                            className="grid size-6 place-items-center rounded text-ink-subtle hover:bg-surface hover:text-ink disabled:opacity-25"
                          >
                            <ArrowDown aria-hidden className="size-3.5" />
                            <span className="sr-only">Move {title(row)} down</span>
                          </button>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/admin/${config.key}/${row.id}`}
                          className="block truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                        >
                          {title(row)}
                        </Link>
                        {subtitle(row) && <p className="truncate text-sm text-ink-muted">{subtitle(row)}</p>}
                      </div>

                      {config.columns.map((column) => (
                        <div
                          key={column.key}
                          className={cn(
                            'hidden w-28 shrink-0 text-sm md:block',
                            column.kind === 'mono' && 'font-mono text-xs text-ink-muted',
                          )}
                        >
                          <span className="sr-only">{column.label}: </span>
                          {cellValue(row, column)}
                        </div>
                      ))}

                      <label className="relative z-10 flex shrink-0 items-center justify-end gap-2 text-xs text-ink-muted sm:w-[5.25rem]">
                        <span className="hidden sm:inline">{row.isPublished ? 'Live' : 'Draft'}</span>
                        <input
                          type="checkbox"
                          role="switch"
                          className="switch"
                          checked={Boolean(row.isPublished)}
                          onChange={() => togglePublish.mutate(row)}
                          aria-label={`Published: ${title(row)}`}
                        />
                      </label>

                      <div className="relative z-10 flex shrink-0 items-center justify-end sm:w-[6.75rem]">
                        {publicPath && (
                          <a
                            href={publicPath}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink sm:grid"
                          >
                            <ArrowUpRight aria-hidden className="size-4" />
                            <span className="sr-only">View {title(row)} on the site</span>
                          </a>
                        )}
                        <Link
                          to={`/admin/${config.key}/${row.id}`}
                          className="hidden size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink sm:grid"
                        >
                          <Pencil aria-hidden className="size-4" />
                          <span className="sr-only">Edit {title(row)}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(row)}
                          className="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-danger"
                        >
                          <Trash aria-hidden className="size-4" />
                          <span className="sr-only">Delete {title(row)}</span>
                        </button>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description={
          <p>
            “{pendingDelete ? title(pendingDelete) : ''}” will be removed permanently. To only hide it from the site,
            switch it to draft instead.
          </p>
        }
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      />
    </>
  )
}

export function CollectionListPage() {
  const { resource } = useParams()
  const config = findCollection(resource)
  if (!config) return <AdminNotFound />
  return <CollectionList key={config.key} config={config} />
}
