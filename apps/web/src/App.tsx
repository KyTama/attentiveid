import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/common/PublicLayout'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PsychologistProfilePage } from './pages/PsychologistProfilePage'
import { PsychologistsPage } from './pages/PsychologistsPage'

export function AppRoutes() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
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
