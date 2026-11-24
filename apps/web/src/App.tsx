import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import { FreeSessionPage } from './pages/FreeSessionPage'
import { LetThereBeLightPage } from './pages/LetThereBeLightPage'
import { PageViewTracker } from './components/common/PageViewTracker'
import { BrowserTabManager } from './components/common/BrowserTabManager'
import { FeaturedProductsCmsPage } from './pages/dashboard/FeaturedProductsCmsPage'
import { SharePreviewsCmsPage } from './pages/dashboard/SharePreviewsCmsPage'
import { OurServicesPage } from './pages/OurServicesPage'
import { AssessmentsPage } from './pages/AssessmentsPage'
import { AssessmentPaymentPage } from './pages/AssessmentPaymentPage'
import { AssessmentsCmsPage } from './pages/dashboard/AssessmentsCmsPage'
import { MhcuDashboardPage } from './pages/dashboard/MhcuDashboardPage'
import { FormsHubPage } from './pages/dashboard/FormsHubPage'
import { MhcuWikiPage } from './pages/dashboard/MhcuWikiPage'
import { MhcuInvitesPage } from './pages/dashboard/MhcuInvitesPage'
import { MhcuSettingsPage } from './pages/dashboard/MhcuSettingsPage'
import { AccountSettingsPage } from './pages/dashboard/AccountSettingsPage'
import { TrafficMonitorPage } from './pages/dashboard/TrafficMonitorPage'
import { PrayersCmsPage } from './pages/dashboard/PrayersCmsPage'
import { QrGeneratorPage } from './pages/dashboard/QrGeneratorPage'
import { SiteSettingsPage } from './pages/dashboard/SiteSettingsPage'
import { SciBriefPage } from './pages/SciBriefPage'
import { SciBriefDetailPage } from './pages/SciBriefDetailPage'
import { BookingPage } from './pages/BookingPage'
import { captureAttribution } from './features/booking/attribution'
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage'
import { LandingCmsPage } from './pages/dashboard/LandingCmsPage'
import { TestimonialsCmsPage } from './pages/dashboard/TestimonialsCmsPage'
import { PsychologistsCmsPage } from './pages/dashboard/PsychologistsCmsPage'
import { ArticlesCmsPage } from './pages/dashboard/ArticlesCmsPage'
import { PsychologistProfileSelfPage } from './pages/dashboard/PsychologistProfileSelfPage'
import { UsersManagementPage } from './pages/dashboard/UsersManagementPage'
import { FreeSessionCmsPage } from './pages/dashboard/FreeSessionCmsPage'
import { BookingsCmsPage } from './pages/dashboard/BookingsCmsPage'
import { SciBriefCmsPage } from './pages/dashboard/SciBriefCmsPage'
import { ExperimentalFormsPage } from './pages/dashboard/ExperimentalPages'
import { SystemMapPage } from './pages/dashboard/SystemMapPage'
import { EXPERIMENTAL_EMAILS } from './features/experimental/access'
import type { LandingContentLoader } from './features/content/service'

/** Sends the browser to a standalone HTML page in /public (a full page load, outside the single-page app). */
function StaticFormRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}

export function AppRoutes({
  landingContentLoader,
  previewLandingLoader,
}: {
  landingContentLoader?: LandingContentLoader
  previewLandingLoader?: LandingContentLoader
} = {}) {
  return (
    <MotionConfig reducedMotion="user">
      <PageViewTracker />
      <BrowserTabManager />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage loader={landingContentLoader} />} />
          <Route path="preview/landing" element={<PreviewLandingPage loader={previewLandingLoader} />} />
          <Route path="psychologists" element={<PsychologistsPage />} />
          <Route path="psychologists/:slug" element={<PsychologistProfilePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          <Route path="free-session" element={<FreeSessionPage />} />
          <Route path="our-services" element={<OurServicesPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="assessments/payment" element={<AssessmentPaymentPage />} />
          {/* The form itself is a standalone page the web server serves; this keeps the address working in development. */}
          <Route path="assessments/mhcu" element={<StaticFormRedirect to="/assessments-static/mhcu.html" />} />
          <Route path="assessments/goal-compass" element={<StaticFormRedirect to="/assessments-static/gsc.html" />} />
          <Route path="assessments/goal-compass/konselor" element={<StaticFormRedirect to={`/assessments-static/gsc-konselor.html${window.location.hash}`} />} />
          <Route path="let-there-be-light" element={<LetThereBeLightPage />} />
          <Route path="sci-brief" element={<SciBriefPage />} />
          <Route path="sci-brief/:slug" element={<SciBriefDetailPage />} />
        </Route>

        {/* Native Consultation Booking Wizard (No Public Navbar/Footer Chrome) */}
        <Route path="/booking" element={<BookingPage />} />

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
            path="testimonials"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TestimonialsCmsPage />
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
            path="bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BookingsCmsPage />
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
            path="sci-brief"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SciBriefCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="featured-products"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FeaturedProductsCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="site-settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SiteSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="share-previews"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SharePreviewsCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="traffic"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TrafficMonitorPage />
              </ProtectedRoute>
            }
          />
          <Route path="experimental/traffic" element={<Navigate to="/dashboard/traffic" replace />} />
          <Route path="account" element={<AccountSettingsPage />} />
          <Route
            path="assessments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <AssessmentsCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="forms"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <FormsHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assessments/gsc"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <AssessmentsCmsPage initialInstrument="gsc" />
              </ProtectedRoute>
            }
          />
          <Route
            path="wiki/mhcu"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <MhcuWikiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assessments/mhcu/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MhcuSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="assessments/mhcu/invites"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MhcuInvitesPage />
              </ProtectedRoute>
            }
          />
          {['assessments/mhcu', 'assessments/mhcu/:id'].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                  <MhcuDashboardPage />
                </ProtectedRoute>
              }
            />
          ))}
          <Route
            path="prayers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PrayersCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="qr-generator"
            element={
              <ProtectedRoute allowedRoles={['admin', 'psychologist']}>
                <QrGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route path="experimental/qr-generator" element={<Navigate to="/dashboard/qr-generator" replace />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="free-session"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={EXPERIMENTAL_EMAILS}>
                <FreeSessionCmsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="experimental/system-map"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={EXPERIMENTAL_EMAILS}>
                <SystemMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="experimental/forms"
            element={
              <ProtectedRoute allowedRoles={['admin']} allowedEmails={EXPERIMENTAL_EMAILS}>
                <ExperimentalFormsPage />
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
    captureAttribution()
  }, [])

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
