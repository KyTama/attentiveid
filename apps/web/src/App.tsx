import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/auth-context'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicLayout } from './components/common/PublicLayout'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PsychologistProfilePage } from './pages/PsychologistProfilePage'
import { PsychologistsPage } from './pages/PsychologistsPage'
import { PreviewLandingPage } from './pages/PreviewLandingPage'
import { ArticlesPage } from './pages/ArticlesPage'
import { ArticleDetailPage } from './pages/ArticleDetailPage'
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage'
import { LandingCmsPage } from './pages/dashboard/LandingCmsPage'
import { PsychologistsCmsPage } from './pages/dashboard/PsychologistsCmsPage'
import { ArticlesCmsPage } from './pages/dashboard/ArticlesCmsPage'
import { PsychologistProfileSelfPage } from './pages/dashboard/PsychologistProfileSelfPage'
import { UsersManagementPage } from './pages/dashboard/UsersManagementPage'
import type { LandingContentLoader } from './features/content/service'

export function AppRoutes({
  landingContentLoader,
  previewLandingLoader,
}: {
  landingContentLoader?: LandingContentLoader
  previewLandingLoader?: LandingContentLoader
} = {}) {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage loader={landingContentLoader} />} />
          <Route path="preview/landing" element={<PreviewLandingPage loader={previewLandingLoader} />} />
          <Route path="psychologists" element={<PsychologistsPage />} />
          <Route path="psychologists/:slug" element={<PsychologistProfilePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
        </Route>

        {/* Obscured Staff Authentication Gate (Decommissioned /login) */}
        <Route path="portal-gate" element={<LoginPage />} />
        <Route path="login" element={<NotFoundPage />} />

        {/* Protected Master Dashboard Portal Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route
            path="landing"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LandingCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="psychologists"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PsychologistsCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="articles"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <ArticlesCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <PsychologistProfileSelfPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MotionConfig>
  )
}

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
