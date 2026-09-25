import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button, buttonClass } from '@/components/ui/Button'

/** Last line of defence when a route throws while rendering or loading its code. */
export default function RouteError() {
  const error = useRouteError()
  const chunkFailed = error instanceof Error && /dynamically imported module|Failed to fetch/i.test(error.message)

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : chunkFailed
      ? 'A new version of the site was published while this page was open.'
      : 'Something unexpected broke on this page.'

  return (
    <main className="container-page flex min-h-dvh flex-col justify-center py-24">
      <p className="eyebrow">Error</p>
      <h1 className="mt-4 text-title font-medium">That did not go to plan.</h1>
      <p className="mt-5 max-w-xl text-lead text-ink-muted">{message}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={() => window.location.reload()}>Reload the page</Button>
        <a href="/" className={buttonClass('secondary')}>
          Go home
        </a>
      </div>
    </main>
  )
}
