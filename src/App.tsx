import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router/dom'
import { queryClient } from '@/lib/queries'
import { router } from '@/router'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Visitors who prefer reduced motion keep fades but lose movement. */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </QueryClientProvider>
  )
}
