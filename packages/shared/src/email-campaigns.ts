/**
 * Bulk e-mail of the portal's Email menu. In the screens "Subject" means who receives (the audience); "title" is the
 * e-mail's subject line.
 */

export const EMAIL_DAILY_LIMIT = 500
export const EMAIL_TITLE_MAX = 200
export const EMAIL_BODY_MAX = 200_000
export const EMAIL_FILE_MAX_COUNT = 5
export const EMAIL_FILE_MAX_BYTES = 7 * 1024 * 1024
export const EMAIL_FILES_MAX_TOTAL = 10 * 1024 * 1024
export const EMAIL_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'docx', 'xlsx', 'pptx', 'txt'] as const

export type EmailLanguage = 'id' | 'en'
export type EmailCampaignStatus = 'draft' | 'queued' | 'paused' | 'done' | 'cancelled'
export type EmailPauseReason = 'manual' | 'daily_limit' | 'sign_in' | 'rejected' | 'switched_off'
export type EmailRecipientStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'skipped' | 'unknown'

export type EmailAudience =
  | { mode: 'all' }
  | { mode: 'categories'; ids: string[] }
  | { mode: 'contacts'; ids: string[] }

export interface EmailAudiencePreview {
  /** Contacts that will get the e-mail. */
  count: number
  /** Matched but left out, and why. */
  archived: number
  unsubscribed: number
}

export interface EmailCampaignFile {
  id: string
  name: string
  size: number
}

export interface EmailCampaignCounts {
  total: number
  queued: number
  sent: number
  failed: number
  skipped: number
  unknown: number
  opened: number
  clicked: number
}

export interface EmailCampaign {
  id: string
  title: string
  html: string
  lang: EmailLanguage
  status: EmailCampaignStatus
  pausedReason: EmailPauseReason | null
  audience: EmailAudience | null
  createdBy: string
  sentBy: string
  createdAt: string
  /** Changes with every edit of the draft or its attachments; a send names the version that was tested. */
  updatedAt: string
  queuedAt: string | null
  finishedAt: string | null
  files: EmailCampaignFile[]
  counts: EmailCampaignCounts
}

export interface EmailRecipientRow {
  id: string
  email: string
  name: string
  status: EmailRecipientStatus
  /** A short code, never a server message with addresses in it. */
  error: string
  sentAt: string | null
  openedAt: string | null
  openCount: number
  clickedAt: string | null
  clickCount: number
}

export interface EmailSendingState {
  /** False until the server is allowed to send (setting EMAIL_BULK_ENABLED) and has a mail account. */
  enabled: boolean
  sentLast24h: number
  dailyLimit: number
}

/* ------------------------------------------------------------ conversations: what the site sent to one contact */

export interface EmailChat {
  contactId: string
  email: string
  name: string
  categoryIds: string[]
  archived: boolean
  unsubscribed: boolean
  lastTitle: string
  lastStatus: EmailRecipientStatus
  lastAt: string
  count: number
  /** Replies from this person nobody has opened yet. */
  unread: number
}

/** The longest reply written in the portal. */
export const EMAIL_REPLY_MAX = 5000

export interface EmailChatMessage {
  id: string
  /** 'in' is the person's own e-mail to us. */
  direction: 'out' | 'in'
  /** Sent to many from Bulk send, or a single e-mail of the conversation. */
  kind: 'bulk' | 'reply'
  campaignId: string
  title: string
  /** The body as plain text, with the person's name filled in. */
  text: string
  files: string[]
  sentBy: string
  status: EmailRecipientStatus
  at: string
  openedAt: string | null
  clickedAt: string | null
}
