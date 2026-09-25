import type { ReactNode } from 'react'
import { FormField, type ControlProps } from '@/components/ui/FormField'
import { cn } from '@/lib/utils'
import type { FieldConfig } from '../resources'
import { AddRowButton, ListInput, move, RowControls } from './ListInput'
import { MarkdownEditor } from './MarkdownEditor'
import { MediaInput } from './MediaInput'
import { TagsInput } from './TagsInput'

export type FormValues = Record<string, unknown>

// ------------------------------------------------------ value conversion

function toLocalDateTime(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

/** API row → values the inputs can hold (no nulls, dates as datetime-local strings). */
export function toFormValues(fields: FieldConfig[], row: Record<string, unknown>): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    const raw = row[field.name]
    switch (field.type) {
      case 'switch':
        values[field.name] = Boolean(raw)
        break
      case 'tags':
      case 'list':
        values[field.name] = Array.isArray(raw) ? raw : []
        break
      case 'repeater':
        values[field.name] = Array.isArray(raw) ? raw : []
        break
      case 'datetime':
        values[field.name] = toLocalDateTime(raw)
        break
      default:
        values[field.name] = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : ''
    }
  }
  return values
}

/** Form values → request body. Empty optional strings are sent as empty and cleared by the API. */
export function toPayload(fields: FieldConfig[], values: FormValues): FormValues {
  const payload: FormValues = {}
  for (const field of fields) {
    const value = values[field.name]
    if (field.type === 'datetime') {
      payload[field.name] = typeof value === 'string' && value ? new Date(value).toISOString() : null
    } else if (field.type === 'list' && Array.isArray(value)) {
      payload[field.name] = value.map((item) => String(item).trim()).filter(Boolean)
    } else {
      payload[field.name] = value
    }
  }
  return payload
}

// -------------------------------------------------------------- inputs

interface FieldInputProps {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  control: ControlProps
  errors: Record<string, string>
}

function RepeaterInput({ field, value, onChange, errors }: Omit<FieldInputProps, 'control'>) {
  const items = (Array.isArray(value) ? value : []) as Record<string, string>[]
  const itemFields = field.itemFields ?? []
  const label = field.itemLabel ?? 'item'

  function update(index: number, name: string, text: string) {
    onChange(items.map((item, position) => (position === index ? { ...item, [name]: text } : item)))
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <fieldset key={index} className="rounded-xl border border-line bg-canvas/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <legend className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
              {label} {index + 1}
            </legend>
            <RowControls
              index={index}
              count={items.length}
              label={`${label} ${index + 1}`}
              onMove={(from, to) => onChange(move(items, from, to))}
              onRemove={(position) => onChange(items.filter((_, current) => current !== position))}
            />
          </div>
          <div className="mt-3 grid gap-4">
            {itemFields.map((itemField) => {
              const path = `${field.name}.${index}.${itemField.name}`
              return (
                <FormField key={itemField.name} id={path} label={itemField.label} error={errors[path]}>
                  {(control) =>
                    itemField.type === 'textarea' ? (
                      <textarea
                        {...control}
                        value={item[itemField.name] ?? ''}
                        rows={itemField.rows ?? 2}
                        maxLength={itemField.maxLength}
                        onChange={(event) => update(index, itemField.name, event.target.value)}
                        className="field-input min-h-0"
                      />
                    ) : (
                      <input
                        {...control}
                        value={item[itemField.name] ?? ''}
                        maxLength={itemField.maxLength}
                        onChange={(event) => update(index, itemField.name, event.target.value)}
                        className="field-input"
                      />
                    )
                  }
                </FormField>
              )
            })}
          </div>
        </fieldset>
      ))}
      <AddRowButton
        onClick={() => onChange([...items, Object.fromEntries(itemFields.map((itemField) => [itemField.name, '']))])}
      >
        Add {label}
      </AddRowButton>
    </div>
  )
}

function FieldInput({ field, value, onChange, control, errors }: FieldInputProps) {
  const text = typeof value === 'string' ? value : ''

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          {...control}
          value={text}
          rows={field.rows ?? 4}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="field-input min-h-0"
        />
      )
    case 'markdown':
      return <MarkdownEditor {...control} value={text} onChange={onChange} />
    case 'tags':
      return <TagsInput {...control} value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} />
    case 'list':
      return <ListInput id={control.id} value={(value as string[]) ?? []} onChange={onChange} itemLabel={field.itemLabel} />
    case 'repeater':
      return <RepeaterInput field={field} value={value} onChange={onChange} errors={errors} />
    case 'media':
      return <MediaInput {...control} value={text} onChange={onChange} accept={field.accept} folder={field.folder} />
    case 'select':
      return (
        <select {...control} value={text} onChange={(event) => onChange(event.target.value)} className="field-input">
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    case 'datetime':
      return (
        <input
          {...control}
          type="datetime-local"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="field-input"
        />
      )
    default: {
      const listId = field.suggestions ? `${control.id}-suggestions` : undefined
      return (
        <>
          <input
            {...control}
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
            value={text}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            list={listId}
            spellCheck={field.type === 'text'}
            onChange={(event) => onChange(event.target.value)}
            className={cn('field-input', field.type === 'slug' && 'font-mono text-sm')}
          />
          {field.suggestions && (
            <datalist id={listId}>
              {field.suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}
        </>
      )
    }
  }
}

// ---------------------------------------------------------------- form

interface ResourceFormProps {
  formId: string
  fields: FieldConfig[]
  values: FormValues
  errors: Record<string, string>
  onChange: (name: string, value: unknown) => void
  /** Extra content at the top of the side column (e.g. status). */
  sideHeader?: ReactNode
}

export function ResourceForm({ formId, fields, values, errors, onChange, sideHeader }: ResourceFormProps) {
  const mainFields = fields.filter((field) => !field.side)
  const sideFields = fields.filter((field) => field.side)

  const renderField = (field: FieldConfig) => {
    const id = `${formId}-${field.name}`

    if (field.type === 'switch') {
      return (
        <div key={field.name} className="field">
          <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">{field.label}</span>
              {field.hint && <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">{field.hint}</span>}
            </span>
            <input
              id={id}
              type="checkbox"
              role="switch"
              checked={Boolean(values[field.name])}
              onChange={(event) => onChange(field.name, event.target.checked)}
              className="switch mt-0.5"
            />
          </label>
          {errors[field.name] && <p className="field-error" data-visible="true">{errors[field.name]}</p>}
        </div>
      )
    }

    return (
      <FormField
        key={field.name}
        id={id}
        label={field.required ? `${field.label} *` : field.label}
        hint={field.hint}
        error={errors[field.name]}
        className={cn(!field.side && (field.wide || ['markdown', 'list', 'repeater', 'tags'].includes(field.type)) && 'sm:col-span-2')}
      >
        {(control) => (
          <FieldInput
            field={field}
            value={values[field.name]}
            onChange={(value) => onChange(field.name, value)}
            control={control}
            errors={errors}
          />
        )}
      </FormField>
    )
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-7">
        {mainFields.map(renderField)}
      </div>
      {(sideFields.length > 0 || sideHeader) && (
        <aside className="space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-6 xl:sticky xl:top-24">
          {sideHeader}
          {sideFields.map(renderField)}
        </aside>
      )}
    </div>
  )
}
