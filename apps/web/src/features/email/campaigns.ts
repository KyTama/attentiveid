import type {
  EmailAudience, EmailAudiencePreview, EmailCampaign, EmailCategory, EmailChat, EmailChatMessage, EmailContact, EmailCampaignFile, EmailLanguage, EmailRecipientRow, EmailSendingState,
} from '@attentiveid/shared'
import { request } from './service'

const BASE = '/api/admin/email'
type Data<T> = { data: T }
const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })

export interface DraftInput {
  title: string
  html: string
  lang: EmailLanguage
}

export interface CampaignDetail {
  campaign: EmailCampaign
  recipients: EmailRecipientRow[]
  offset: number
  pageSize: number
}

export const listCampaigns = async () =>
  (await request<Data<{ campaigns: EmailCampaign[]; sending: EmailSendingState }>>(`${BASE}/campaigns`)).data
export const getCampaign = async (id: string, offset = 0) =>
  (await request<Data<CampaignDetail>>(`${BASE}/campaigns/${id}?offset=${offset}`)).data
export const saveDraft = async (id: string | null, draft: DraftInput) =>
  (await request<Data<EmailCampaign>>(id ? `${BASE}/campaigns/${id}` : `${BASE}/campaigns`, json(id ? 'PUT' : 'POST', draft))).data
export const deleteDraft = (id: string) => request(`${BASE}/campaigns/${id}`, json('DELETE'))
export const addFile = async (id: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return (await request<Data<EmailCampaignFile>>(`${BASE}/campaigns/${id}/files`, { method: 'POST', body: form })).data
}
export const removeFile = (id: string, fileId: string) => request(`${BASE}/campaigns/${id}/files/${fileId}`, json('DELETE'))
export const previewDraft = async (draft: DraftInput) =>
  (await request<Data<{ subject: string; html: string }>>(`${BASE}/preview`, json('POST', draft))).data
export const countAudience = async (audience: EmailAudience) =>
  (await request<Data<EmailAudiencePreview>>(`${BASE}/audience`, json('POST', { audience }))).data
export const sendTest = async (id: string) => (await request<Data<{ to: string }>>(`${BASE}/campaigns/${id}/test`, json('POST'))).data
export const sendCampaign = (id: string, audience: EmailAudience, expected: number) =>
  request(`${BASE}/campaigns/${id}/send`, json('POST', { audience, expected }))
export const controlCampaign = (id: string, action: 'pause' | 'resume' | 'cancel') => request(`${BASE}/campaigns/${id}/${action}`, json('POST'))
export const listChats = async () => (await request<Data<{ chats: EmailChat[]; categories: EmailCategory[] }>>(`${BASE}/chats`)).data
export const getChat = async (contactId: string) =>
  (await request<Data<{ contact: EmailContact; messages: EmailChatMessage[] }>>(`${BASE}/chats/${contactId}`)).data
