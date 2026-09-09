import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/common/PublicLayout'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PsychologistProfilePage } from './pages/PsychologistProfilePage'
import { PsychologistsPage } from './pages/PsychologistsPage'
import { PreviewLandingPage } from './pages/PreviewLandingPage'
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
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage loader={landingContentLoader} />} />
          <Route path="preview/landing" element={<PreviewLandingPage loader={previewLandingLoader} />} />
          <Route path="psychologists" element={<PsychologistsPage />} />
          <Route path="psychologists/:slug" element={<PsychologistProfilePage />} />
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
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
