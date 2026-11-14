import type { SciBriefAdminDto, SciBriefField, SciBriefInput, SciBriefPublicDto } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '../auth/auth-context'

const apiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/** Where visitors send their "I'd like the full brief" request. */
export const SCI_BRIEF_REQUEST_EMAIL = import.meta.env.VITE_SCI_BRIEF_EMAIL || 'contact@attentiveid.com'
export const SCI_BRIEF_REQUEST_WHATSAPP = import.meta.env.VITE_FREE_SESSION_WA_NUMBER || '6285156410912'

export const sciBriefPreviewUrl = (brief: Pick<SciBriefPublicDto, 'previewUrl'>) =>
  brief.previewUrl ? `${apiBaseUrl()}${brief.previewUrl}` : null

// ---- Public ---------------------------------------------------------------

export async function listSciBriefs(): Promise<SciBriefPublicDto[] | null> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/content/sci-briefs`)
    if (!response.ok) return null
    const json = await response.json()
    return Array.isArray(json.briefs) ? json.briefs : null
  } catch {
    return null
  }
}

export type SciBriefLookup =
  | { status: 'found'; brief: SciBriefPublicDto }
  | { status: 'notFound' }
  | { status: 'error' }

export async function getSciBrief(slug: string): Promise<SciBriefLookup> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/content/sci-briefs/${encodeURIComponent(slug)}`)
    if (response.status === 404) return { status: 'notFound' }
    if (!response.ok) return { status: 'error' }
    const json = await response.json()
    return json.brief ? { status: 'found', brief: json.brief } : { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}

// ---- Portal (admin) -------------------------------------------------------

export class SciBriefApiError extends Error {
  fieldErrors: Partial<Record<SciBriefField, string>>

  constructor(message: string, fieldErrors: Partial<Record<SciBriefField, string>> = {}) {
    super(message)
    this.fieldErrors = fieldErrors
  }
}

const authHeaders = (extra?: Record<string, string>) => ({ ...getActiveAuthHeaders(), ...extra })

async function ensureOk(response: Response, fallback: string) {
  if (response.ok) return response
  const json = await response.json().catch(() => ({}))
  throw new SciBriefApiError(json?.message || `${fallback} (${response.status})`, json?.errors ?? {})
}

export async function listAdminSciBriefs(): Promise<SciBriefAdminDto[]> {
  const response = await ensureOk(
    await fetch('/api/admin/sci-briefs', { headers: authHeaders(), credentials: 'include' }),
    'Gagal memuat Sci-Brief',
  )
  return (await response.json()).briefs ?? []
}

export async function saveAdminSciBrief(id: string | undefined, input: Partial<SciBriefInput>): Promise<SciBriefAdminDto> {
  const response = await ensureOk(
    await fetch(id ? `/api/admin/sci-briefs/${id}` : '/api/admin/sci-briefs', {
      method: id ? 'PUT' : 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(input),
    }),
    'Gagal menyimpan Sci-Brief',
  )
  return (await response.json()).brief
}

export async function deleteAdminSciBrief(id: string): Promise<void> {
  await ensureOk(
    await fetch(`/api/admin/sci-briefs/${id}`, { method: 'DELETE', headers: authHeaders(), credentials: 'include' }),
    'Gagal menghapus Sci-Brief',
  )
}

export async function uploadAdminSciBriefDocument(id: string, file: File): Promise<SciBriefAdminDto> {
  const form = new FormData()
  form.append('file', file)
  const response = await ensureOk(
    await fetch(`/api/admin/sci-briefs/${id}/document`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: form,
    }),
    'Gagal mengunggah dokumen',
  )
  return (await response.json()).brief
}

/** Downloads the full (private) PDF using the signed-in admin session. */
export async function downloadAdminSciBriefDocument(id: string, fileName: string): Promise<void> {
  const response = await ensureOk(
    await fetch(`/api/admin/sci-briefs/${id}/document`, { headers: authHeaders(), credentials: 'include' }),
    'Gagal mengunduh dokumen',
  )
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'sci-brief.pdf'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
