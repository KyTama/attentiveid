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

export const uploadLandingImage = async (
  file: File,
  metadata?: {
    sectionKey?: string
    itemPosition?: number
    slug?: string
    name?: string
    altId?: string
    altEn?: string
    width?: number
    height?: number
  },
  options?: { headers?: Record<string, string> }
): Promise<{
  status: string
  message: string
  media: {
    id: string
    reference: string
    width: number
    height: number
    alt: { id: string; en: string }
  }
}> => {
  const formData = new FormData()
  formData.append('file', file)
  if (metadata?.sectionKey) formData.append('sectionKey', metadata.sectionKey)
  if (metadata?.itemPosition !== undefined && metadata?.itemPosition !== null) {
    formData.append('itemPosition', String(metadata.itemPosition))
  }
  if (metadata?.slug) formData.append('slug', metadata.slug)
  if (metadata?.name) formData.append('name', metadata.name)
  if (metadata?.altId) formData.append('altId', metadata.altId)
  if (metadata?.altEn) formData.append('altEn', metadata.altEn)
  if (metadata?.width) formData.append('width', String(metadata.width))
  if (metadata?.height) formData.append('height', String(metadata.height))

  const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const customHeaders = options?.headers || {}
  const headers: Record<string, string> = { ...customHeaders }
  delete headers['Content-Type']

  const response = await fetch(`${baseUrl}/api/admin/landing/upload-image`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const errorJson = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(errorJson?.message || `Failed to upload landing image (${response.status})`)
  }

  return response.json()
}
