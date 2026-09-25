import { useEffect, type RefObject } from 'react'
import { useBlocker } from 'react-router'
import { ConfirmDialog } from './Modal'

/**
 * Asks before leaving a form with unsaved edits — for in-app navigation with a
 * dialog, and for closing or reloading the tab with the browser's own prompt.
 * A ref (not a prop) is read, so a save can mark the form clean right before navigating.
 */
export function UnsavedChangesGuard({ dirtyRef, dirty }: { dirtyRef: RefObject<boolean>; dirty: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      Boolean(dirtyRef.current) && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title="Leave without saving?"
      description="You have changes that have not been saved. They will be lost if you leave this page."
      confirmLabel="Discard changes"
      onCancel={() => blocker.reset?.()}
      onConfirm={() => blocker.proceed?.()}
    />
  )
}
