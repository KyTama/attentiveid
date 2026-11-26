import type { EmailCategory, EmailContact, EmailContactErrors, EmailContactInput, EmailImportPlan, EmailImportResult } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '@/features/auth/auth-context'

export class EmailRequestError extends Error {
  errors: EmailContactErrors
  constructor(message: string, errors: EmailContactErrors = {}) {
    super(message)
    this.errors = errors
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { ...getActiveAuthHeaders(), ...(typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}) },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new EmailRequestError(json?.message || `Permintaan gagal (${response.status})`, json?.errors)
  return json as T
}

const BASE = '/api/admin/email'
const send = <T>(path: string, method: string, body?: unknown) =>
  request<T>(`${BASE}${path}`, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

export interface EmailBook {
  contacts: EmailContact[]
  categories: EmailCategory[]
}

export const listContacts = async (archived: boolean) =>
  (await request<{ data: EmailBook }>(`${BASE}/contacts${archived ? '?archived=1' : ''}`)).data

export const saveContact = async (id: string | null, input: EmailContactInput) =>
  (await send<{ data: EmailContact }>(id ? `/contacts/${id}` : '/contacts', id ? 'PUT' : 'POST', input)).data

export const archiveContacts = (ids: string[], archived: boolean) => send('/contacts/archive', 'POST', { ids, archived })
export const deleteContacts = (ids: string[]) => send('/contacts/delete', 'POST', { ids })
export const addCategory = (name: string) => send('/categories', 'POST', { name })
export const renameCategory = (id: string, name: string) => send(`/categories/${id}`, 'PUT', { name })
export const deleteCategory = (id: string) => send(`/categories/${id}`, 'DELETE')

export const checkImport = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return (await request<{ data: { id: string; plan: EmailImportPlan } }>(`${BASE}/import`, { method: 'POST', body: form })).data
}

export const applyImport = async (id: string, include: string[]) =>
  (await send<{ data: EmailImportResult }>(`/import/${id}/apply`, 'POST', { include })).data

/** The download needs the sign-in header, so it is fetched first and then saved by the browser. */
export async function downloadContacts(): Promise<void> {
  const response = await fetch(`${BASE}/export`, { credentials: 'include', headers: { ...getActiveAuthHeaders() } })
  if (!response.ok) throw new EmailRequestError(`Gagal mengunduh (${response.status})`)
  const name = response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'kontak-email.xlsx'
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
