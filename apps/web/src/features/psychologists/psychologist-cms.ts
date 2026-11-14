import type { FullPsychologistMutation } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '../auth/auth-context'

export interface PsychologistAdminFilter {
  status?: string
  search?: string
  supportArea?: string
  limit?: number
  offset?: number
  headers?: Record<string, string>
}

const buildHeaders = (customHeaders?: Record<string, string>): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...getActiveAuthHeaders(),
  ...customHeaders,
})

export interface AdminPsychologistItem extends FullPsychologistMutation {
  id: string
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export const listAdminPsychologists = async (filter: PsychologistAdminFilter = {}): Promise<{
  status: string
  psychologists: AdminPsychologistItem[]
  total: number
}> => {
  const params = new URLSearchParams()
  if (filter.status && filter.status !== 'all') params.set('status', filter.status)
  if (filter.search?.trim()) params.set('search', filter.search.trim())
  if (filter.supportArea && filter.supportArea !== 'all') params.set('supportArea', filter.supportArea)
  if (filter.limit) params.set('limit', String(filter.limit))
  if (filter.offset) params.set('offset', String(filter.offset))

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`/api/admin/psychologists${queryString}`, {
    method: 'GET',
    headers: buildHeaders(filter.headers),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch psychologists (${response.status})`)
  }

  return response.json()
}

export const getAdminPsychologistById = async (
  id: string,
  options?: { headers?: Record<string, string> }
): Promise<AdminPsychologistItem> => {
  const response = await fetch(`/api/admin/psychologists/${id}`, {
    method: 'GET',
    headers: buildHeaders(options?.headers),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch psychologist profile (${response.status})`)
  }

  const json = await response.json()
  return json.psychologist
}

export const saveAdminPsychologist = async (
  id: string | undefined,
  data: FullPsychologistMutation,
  options?: { headers?: Record<string, string> }
): Promise<AdminPsychologistItem> => {
  const url = id ? `/api/admin/psychologists/${id}` : '/api/admin/psychologists'
  const method = id ? 'PUT' : 'POST'

  const response = await fetch(url, {
    method,
    headers: buildHeaders(options?.headers),
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}))
    throw new Error(errorJson?.message || `Failed to save psychologist (${response.status})`)
  }

  const json = await response.json()
  return json.psychologist
}

export const updatePsychologistStatus = async (
  id: string,
  status: 'draft' | 'active' | 'inactive' | 'archived',
  options?: { headers?: Record<string, string> }
): Promise<AdminPsychologistItem> => {
  const response = await fetch(`/api/admin/psychologists/${id}/status`, {
    method: 'PATCH',
    headers: buildHeaders(options?.headers),
    credentials: 'include',
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}))
    throw new Error(errorJson?.message || `Failed to update status (${response.status})`)
  }

  const json = await response.json()
  return json.psychologist
}

export const reorderFeaturedPsychologists = async (
  ids: string[],
  options?: { headers?: Record<string, string> }
): Promise<{ id: string; featuredOrder: number }[]> => {
  const response = await fetch('/api/admin/psychologists/featured-order', {
    method: 'PUT',
    headers: buildHeaders(options?.headers),
    credentials: 'include',
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}))
    throw new Error(errorJson?.message || `Failed to reorder featured (${response.status})`)
  }

  const json = await response.json()
  return json.order
}

export const uploadPsychologistPhoto = async (
  file: File,
  metadata?: {
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
  if (metadata?.slug) formData.append('slug', metadata.slug)
  if (metadata?.name) formData.append('name', metadata.name)
  if (metadata?.altId) formData.append('altId', metadata.altId)
  if (metadata?.altEn) formData.append('altEn', metadata.altEn)
  if (metadata?.width) formData.append('width', String(metadata.width))
  if (metadata?.height) formData.append('height', String(metadata.height))

  const authHeaders = getActiveAuthHeaders()
  const customHeaders = options?.headers || {}
  const headers: Record<string, string> = { ...authHeaders, ...customHeaders }
  delete headers['Content-Type']

  const response = await fetch('/api/admin/psychologists/upload-photo', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}))
    throw new Error(errorJson?.message || `Failed to upload photo (${response.status})`)
  }

  return response.json()
}
