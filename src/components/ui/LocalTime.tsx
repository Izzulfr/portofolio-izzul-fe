import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
})

/** The owner's local time in Tangerang (WIB), ticking once a minute. */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Align updates with the start of each minute.
    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(
      () => {
        setNow(new Date())
        interval = setInterval(() => setNow(new Date()), 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <time dateTime={now.toISOString()} className={className}>
      <span className="tabular-nums">{format.format(now)}</span> WIB
    </time>
  )
}
