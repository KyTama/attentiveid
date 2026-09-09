import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { LandingContentMutation } from '@attentiveid/shared'
import { LandingContentContext } from './landing-content-context'

export function LandingContentProvider({ children, content }: { children: ReactNode; content: LandingContentMutation }) {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'id' || i18n.language === 'id' ? 'id' : 'en'

  return (
    <LandingContentContext.Provider value={{ content, locale }}>
      {children}
    </LandingContentContext.Provider>
  )
}
