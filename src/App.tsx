import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BarbersPage } from './pages/BarbersPage'
import { HomePage } from './pages/HomePage'
import { SiteLayout } from './pages/SiteLayout'

// The admin panel is a separate chunk: visitors never download it
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="admin-boot" role="status" aria-label="Loading admin" />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<SiteLayout />}>
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
