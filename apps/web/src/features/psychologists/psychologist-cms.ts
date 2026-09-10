import type { FullPsychologistMutation } from '@attentiveid/shared'

export interface PsychologistAdminFilter {
  status?: string
  search?: string
  supportArea?: string
  limit?: number
  offset?: number
}

const defaultHeaders = {
  'Content-Type': 'application/json',
}

export const listAdminPsychologists = async (filter: PsychologistAdminFilter = {}): Promise<{
  status: string
  psychologists: any[]
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
    headers: defaultHeaders,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch psychologists (${response.status})`)
  }

  return response.json()
}

export const getAdminPsychologistById = async (id: string): Promise<any> => {
  const response = await fetch(`/api/admin/psychologists/${id}`, {
    method: 'GET',
    headers: defaultHeaders,
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
  data: FullPsychologistMutation
): Promise<any> => {
  const url = id ? `/api/admin/psychologists/${id}` : '/api/admin/psychologists'
  const method = id ? 'PUT' : 'POST'

  const response = await fetch(url, {
    method,
    headers: defaultHeaders,
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
  status: 'draft' | 'active' | 'inactive' | 'archived'
): Promise<any> => {
  const response = await fetch(`/api/admin/psychologists/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
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
