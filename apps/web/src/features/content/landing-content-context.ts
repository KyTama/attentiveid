import { createContext, useContext } from 'react'
import type { LandingContentMutation } from '@attentiveid/shared'

type LandingSection = LandingContentMutation['sections'][number]
type LandingSectionKey = LandingSection['key']
type LandingSectionFor<Key extends LandingSectionKey> = Extract<LandingSection, { key: Key }>

export interface LandingContentContextValue {
  content: LandingContentMutation
  locale: 'id' | 'en'
}

export const LandingContentContext = createContext<LandingContentContextValue | null>(null)

export const useLandingContent = () => useContext(LandingContentContext)

export const useLandingSection = <Key extends LandingSectionKey>(key: Key) => {
  const managed = useLandingContent()
  if (!managed) return null
  const section = managed.content.sections.find((candidate) => candidate.key === key) as LandingSectionFor<Key> | undefined
  return section ? { locale: managed.locale, section } : null
}
