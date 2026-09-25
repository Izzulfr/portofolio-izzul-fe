import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, Check, LoaderCircle, Trash } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/States'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { ApiError } from '@/lib/api'
import { adminApi, invalidatePublicContent } from '../api'
import { AdminPageHeader, StatusBadge } from '../components/AdminPageHeader'
import { ConfirmDialog } from '../components/Modal'
import { ResourceForm, toFormValues, toPayload, type FormValues } from '../components/ResourceForm'
import { UnsavedChangesGuard } from '../components/UnsavedChangesGuard'
import { findCollection, singletons, type CollectionConfig, type FieldConfig, type Row, type SingletonConfig } from '../resources'
import { AdminNotFound } from './AdminNotFound'

/** Form state with change tracking, server-error mapping and a Ctrl/⌘+S shortcut. */
function useEditor(fields: FieldConfig[], initial: Record<string, unknown>) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(fields, initial))
  const [saved, setSaved] = useState<FormValues>(values)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const dirty = JSON.stringify(values) !== JSON.stringify(saved)
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty

  function change(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!Object.keys(current).some((key) => key === name || key.startsWith(`${name}.`))) return current
      return Object.fromEntries(Object.entries(current).filter(([key]) => key !== name && !key.startsWith(`${name}.`)))
    })
  }

  function markSaved(row: Record<string, unknown>) {
    const next = toFormValues(fields, row)
    dirtyRef.current = false
    setValues(next)
    setSaved(next)
    setErrors({})
  }

  function handleError(error: Error) {
    if (error instanceof ApiError && error.details.length > 0) {
      setErrors(error.fieldErrors)
      toast.error('Some fields need attention.')
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-server-invalid="true"]')?.focus()
      })
    } else {
      toast.error(error.message)
    }
  }

  return { values, errors, dirty, dirtyRef, change, markSaved, handleError, payload: () => toPayload(fields, values) }
}

function useSaveShortcut(formId: string) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        document.querySelector<HTMLFormElement>(`#${CSS.escape(formId)}`)?.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [formId])
}

function SaveButton({ pending, dirty, form }: { pending: boolean; dirty: boolean; form: string }) {
  return (
    <Button type="submit" form={form} size="sm" disabled={pending || !dirty}>
      {pending ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : !dirty ? (
        <Check aria-hidden className="size-4" />
      ) : null}
      {pending ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
    </Button>
  )
}

function FormSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="skeleton h-[32rem] rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )
}

// ---------------------------------------------------------- collections

function CollectionEditor({ config, initial }: { config: CollectionConfig; initial: Row | null }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const formId = useId().replace(/:/g, '')
  const editor = useEditor(config.fields, initial ?? config.defaults)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isNew = !initial

  useSaveShortcut(formId)
  const titleValue = String(editor.values[config.titleKey] ?? '')
  useDocumentMeta({ title: `${isNew ? `New ${config.singular.toLowerCase()}` : titleValue} · CMS`, noindex: true })

  const save = useMutation({
    mutationFn: (payload: FormValues) =>
      isNew
        ? adminApi.post<Row>(`/${config.key}`, payload)
        : adminApi.patch<Row>(`/${config.key}/${initial.id}`, payload),
    onSuccess(row) {
      editor.markSaved(row)
      queryClient.setQueryData(['admin', config.key, row.id], row)
      void queryClient.invalidateQueries({ queryKey: ['admin', config.key], exact: true })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      void invalidatePublicContent(queryClient)
      toast.success(isNew ? `${config.singular} created` : 'Changes saved')
      if (isNew) navigate(`/admin/${config.key}/${row.id}`, { replace: true })
    },
    onError: editor.handleError,
  })

  const remove = useMutation({
    mutationFn: () => adminApi.delete(`/${config.key}/${initial?.id}`),
    onSuccess() {
      editor.dirtyRef.current = false
      void queryClient.invalidateQueries({ queryKey: ['admin', config.key] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
      void invalidatePublicContent(queryClient)
      toast.success(`${config.singular} deleted`)
      navigate(`/admin/${config.key}`, { replace: true })
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate(editor.payload())
  }

  const published = Boolean(editor.values.isPublished)
  const publicPath = initial ? config.publicPath?.(initial) : null

  return (
    <>
      <AdminPageHeader
        sticky
        back={{ to: `/admin/${config.key}`, label: config.label }}
        title={titleValue || (isNew ? `New ${config.singular.toLowerCase()}` : 'Untitled')}
        meta={
          <>
            {'isPublished' in editor.values && <StatusBadge published={published} />}
            {editor.dirty && <span className="text-xs text-ink-muted">Unsaved changes</span>}
          </>
        }
        actions={
          <>
            {publicPath && (
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                View
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            )}
            {!isNew && (
              <Button variant="ghost" size="sm" className="hover:text-danger" onClick={() => setConfirmDelete(true)}>
                <Trash aria-hidden className="size-4" />
                Delete
              </Button>
            )}
            <SaveButton pending={save.isPending} dirty={editor.dirty || isNew} form={formId} />
          </>
        }
      />

      <form id={formId} onSubmit={onSubmit} noValidate className="mt-6">
        <ResourceForm
          formId={formId}
          fields={config.fields}
          values={editor.values}
          errors={editor.errors}
          onChange={editor.change}
        />
      </form>

      <UnsavedChangesGuard dirtyRef={editor.dirtyRef} dirty={editor.dirty} />
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description={<p>“{titleValue}” will be removed permanently.</p>}
        pending={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
      />
    </>
  )
}

export function CollectionEditPage() {
  const { resource, id } = useParams()
  const config = findCollection(resource)
  const isNew = !id || id === 'new'

  const item = useQuery({
    queryKey: ['admin', resource, id],
    queryFn: () => adminApi.get<Row>(`/${resource}/${id}`),
    enabled: Boolean(config) && !isNew,
  })

  if (!config) return <AdminNotFound />
  if (isNew) return <CollectionEditor key="new" config={config} initial={null} />
  if (item.isError) {
    return item.error instanceof ApiError && item.error.status === 404 ? (
      <AdminNotFound />
    ) : (
      <ErrorState onRetry={() => void item.refetch()} />
    )
  }
  if (item.isPending) return <FormSkeleton />
  return <CollectionEditor key={item.data.id} config={config} initial={item.data} />
}

// ----------------------------------------------------------- singletons

function SingletonEditor({ config, initial }: { config: SingletonConfig; initial: Record<string, unknown> }) {
  const queryClient = useQueryClient()
  const formId = useId().replace(/:/g, '')
  const editor = useEditor(config.fields, initial)

  useSaveShortcut(formId)
  useDocumentMeta({ title: `${config.label} · CMS`, noindex: true })

  const save = useMutation({
    mutationFn: (payload: FormValues) => adminApi.put<Record<string, unknown>>(`/${config.key}`, payload),
    onSuccess(row) {
      editor.markSaved(row)
      queryClient.setQueryData(['admin', config.key], row)
      void invalidatePublicContent(queryClient)
      toast.success('Changes saved')
    },
    onError: editor.handleError,
  })

  return (
    <>
      <AdminPageHeader
        sticky
        title={config.label}
        description={config.description}
        meta={editor.dirty && <span className="text-xs text-ink-muted">Unsaved changes</span>}
        actions={
          <>
            <a
              href={config.publicPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              View
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
            <SaveButton pending={save.isPending} dirty={editor.dirty} form={formId} />
          </>
        }
      />
      <form
        id={formId}
        noValidate
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate(editor.payload())
        }}
      >
        <ResourceForm
          formId={formId}
          fields={config.fields}
          values={editor.values}
          errors={editor.errors}
          onChange={editor.change}
        />
      </form>
      <UnsavedChangesGuard dirtyRef={editor.dirtyRef} dirty={editor.dirty} />
    </>
  )
}

export function SingletonPage({ singletonKey }: { singletonKey: SingletonConfig['key'] }) {
  const config = singletons.find((item) => item.key === singletonKey)!
  const query = useQuery({
    queryKey: ['admin', config.key],
    queryFn: () => adminApi.get<Record<string, unknown>>(`/${config.key}`),
  })

  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />
  if (query.isPending) return <FormSkeleton />
  return <SingletonEditor key={config.key} config={config} initial={query.data} />
}
