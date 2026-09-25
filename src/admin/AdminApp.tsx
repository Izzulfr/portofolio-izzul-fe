import { Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import { useTheme } from '@/lib/theme'
import { AdminLayout } from './AdminLayout'
import { AuthProvider, RequireAuth } from './auth'
import { AccountPage } from './pages/AccountPage'
import { AdminNotFound } from './pages/AdminNotFound'
import { CollectionListPage } from './pages/CollectionListPage'
import { DashboardPage } from './pages/DashboardPage'
import { CollectionEditPage, SingletonPage } from './pages/EditorPages'
import { LoginPage } from './pages/LoginPage'
import { MediaPage } from './pages/MediaPage'
import { MessagesPage } from './pages/MessagesPage'

/** The CMS, loaded as its own bundle under /admin. */
export default function AdminApp() {
  const theme = useTheme()

  return (
    <AuthProvider>
      <Toaster
        theme={theme}
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: '!rounded-xl !border-line !bg-surface !text-ink !shadow-lifted !font-sans',
            description: '!text-ink-muted',
          },
        }}
      />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<SingletonPage singletonKey="profile" />} />
            <Route path="settings" element={<SingletonPage singletonKey="settings" />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path=":resource" element={<CollectionListPage />} />
            <Route path=":resource/new" element={<CollectionEditPage />} />
            <Route path=":resource/:id" element={<CollectionEditPage />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
