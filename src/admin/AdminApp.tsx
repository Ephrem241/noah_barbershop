import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AuthGate } from './AuthGate'
import { AdminsPage } from './pages/AdminsPage'
import { BarberEditorPage } from './pages/BarberEditorPage'
import { BarbersPage } from './pages/BarbersPage'
import { DashboardPage } from './pages/DashboardPage'
import { GalleryPage } from './pages/GalleryPage'
import { RequestsPage } from './pages/RequestsPage'
import { ServicesPage } from './pages/ServicesPage'
import { SettingsPage } from './pages/SettingsPage'
import { TestimonialsPage } from './pages/TestimonialsPage'
import { FeedbackProvider } from './ui/FeedbackProvider'

export default function AdminApp() {
  // The admin shares index.html with the public site; keep its pages out of search results
  useEffect(() => {
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' })
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  return (
    <FeedbackProvider>
      <AuthGate>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="barbers" element={<BarbersPage />} />
            <Route path="barbers/:id" element={<BarberEditorPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AuthGate>
    </FeedbackProvider>
  )
}
