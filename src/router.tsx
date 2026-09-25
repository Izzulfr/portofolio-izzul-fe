import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import AboutPage from '@/pages/AboutPage'
import BlogPage from '@/pages/BlogPage'
import ContactPage from '@/pages/ContactPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProjectsPage from '@/pages/ProjectsPage'
import RouteError from '@/pages/RouteError'

/** Shown while the code for a directly opened, lazily loaded page arrives. */
function PageLoader() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center">
      <span aria-hidden className="size-2 animate-ping rounded-full bg-accent" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    HydrateFallback: PageLoader,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      {
        // Pages that render markdown load it (and themselves) on demand.
        path: 'projects/:slug',
        lazy: () => import('@/pages/ProjectDetailPage').then((module) => ({ Component: module.default })),
      },
      { path: 'about', element: <AboutPage /> },
      { path: 'blog', element: <BlogPage /> },
      {
        path: 'blog/:slug',
        lazy: () => import('@/pages/PostPage').then((module) => ({ Component: module.default })),
      },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // The CMS is its own bundle: visitors never download it.
    path: 'admin/*',
    errorElement: <RouteError />,
    HydrateFallback: PageLoader,
    lazy: () => import('@/admin/AdminApp').then((module) => ({ Component: module.default })),
  },
])
