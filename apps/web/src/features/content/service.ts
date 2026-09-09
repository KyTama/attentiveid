import { validateLandingContentMutation, type LandingContentMutation } from '@attentiveid/shared'
import { consumePreviewCapability } from './preview-bootstrap'

export type LandingContentResult =
  | { status: 'success'; content: LandingContentMutation }
  | { status: 'unavailable' }

export type LandingContentLoader = () => Promise<LandingContentResult>

const requestDefaults: RequestInit = {
  cache: 'no-store',
  credentials: 'include',
  referrerPolicy: 'no-referrer',
}

const readContent = async (response: Response): Promise<LandingContentResult> => {
  if (!response.ok) return { status: 'unavailable' }
  try {
    const envelope = await response.json() as { landing?: { content?: unknown } }
    return validateLandingContentMutation(envelope.landing?.content)
      ? { status: 'success', content: envelope.landing.content }
      : { status: 'unavailable' }
  } catch {
    return { status: 'unavailable' }
  }
}

export const loadPublishedLandingContent: LandingContentLoader = async () => {
  try {
    return await readContent(await fetch('/api/content/landing', {
      ...requestDefaults,
      method: 'GET',
    }))
  } catch {
    return { status: 'unavailable' }
  }
}

export const loadPreviewLandingContent: LandingContentLoader = async () => {
  let capability = consumePreviewCapability()
  try {
    if (capability !== null) {
      const exchange = await fetch('/api/preview/landing/session', {
        ...requestDefaults,
        body: JSON.stringify({ capability }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      capability = null
      if (!exchange.ok) return { status: 'unavailable' }
    }

    return await readContent(await fetch('/api/preview/landing', {
      ...requestDefaults,
      method: 'GET',
    }))
  } catch {
    return { status: 'unavailable' }
  } finally {
    capability = null
  }
}
