import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LandingPage } from './pages/LandingPage'

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return <LandingPage />
}

export default App
