import type { EmailAudience } from '@attentiveid/shared'

export interface AudienceChoice {
  mode: EmailAudience['mode']
  categories: string[]
  contacts: string[]
}

export const toAudience = (choice: AudienceChoice): EmailAudience | null => {
  if (choice.mode === 'all') return { mode: 'all' }
  const ids = choice.mode === 'categories' ? choice.categories : choice.contacts
  return ids.length ? { mode: choice.mode, ids } : null
}
