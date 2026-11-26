import type { TeamMemberDto, TeamMemberInput } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '../auth/auth-context'

const apiBaseUrl = () => import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/** Public list; a failure just means the sections are not shown. */
export async function listTeam(): Promise<TeamMemberDto[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/content/team`)
    if (!response.ok) return []
    const json = await response.json()
    return Array.isArray(json.members) ? json.members : []
  } catch {
    return []
  }
}

async function admin(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBaseUrl()}/api/admin/team${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...getActiveAuthHeaders(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = json?.errors ? Object.values(json.errors).join(' ') : ''
    throw new Error([json?.message || `Permintaan gagal (${response.status})`, details].join(' ').trim())
  }
  return json
}

export const listAllTeam = async (): Promise<TeamMemberDto[]> => (await admin('')).members ?? []
export const saveTeamMember = (input: TeamMemberInput, id?: string) =>
  admin(id ? `/${id}` : '', { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) })
export const removeTeamMember = (id: string) => admin(`/${id}`, { method: 'DELETE' })
