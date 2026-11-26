import type { EmailCategory, EmailContact, EmailContactErrors, EmailContactInput } from '@attentiveid/shared'
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
