import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { EmailCampaign, UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'
import { htmlToPlain, textToHtml } from '../src/features/email/body'

const staff = (role: UserDto['role']): UserDto => ({
  id: role, email: `${role}@example.test`, name: 'Staff', role, status: 'active',
  psychologistId: role === 'psychologist' ? 'p1' : null, lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
})
const counts = { total: 0, queued: 0, sent: 0, failed: 0, skipped: 0, unknown: 0, opened: 0, clicked: 0 }
const campaign = (over: Partial<EmailCampaign> = {}): EmailCampaign => ({
  id: 'k1', title: 'Kabar November', html: '<p>Halo</p>', lang: 'id', status: 'draft', pausedReason: null, audience: null,
  createdBy: 'admin@example.test', sentBy: '', createdAt: '2026-11-26T01:00:00Z', updatedAt: '2026-11-26T01:00:00Z', queuedAt: null, finishedAt: null, files: [], counts, ...over,
})
const SENT = campaign({ id: 'k2', title: 'Undangan', status: 'paused', pausedReason: 'daily_limit', sentBy: 'admin@example.test', queuedAt: '2026-11-26T02:00:00Z', counts: { ...counts, total: 2, sent: 1, queued: 1, opened: 1 } })
const row = { id: 'r1', email: 'ani@example.test', name: 'Ani', status: 'sent', error: '', sentAt: '2026-11-26T02:01:00Z', openedAt: '2026-11-26T03:00:00Z', openCount: 2, clickedAt: null, clickCount: 0 }
const contact = (id: string, unsubscribed = false) => ({ id, email: `${id}@example.test`, name: id, phone: '', categoryIds: ['c1'], source: 'manual', archivedAt: null, unsubscribed, createdAt: '', updatedAt: '' })

interface Call { method: string; path: string; body: unknown }

function setup(path = '/dashboard/email/send', options: { enabled?: boolean; role?: UserDto['role'] } = {}) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ status: 'success', data }) })
    if (url.includes('/api/auth/')) return { ok: true, status: 200, json: async () => ({ status: 'success', accessToken: 'valid.token', user: staff(options.role ?? 'admin') }) }
    if (!url.startsWith('/api/admin/email')) return { ok: false, status: 404, json: async () => ({}) }
    const short = url.replace('/api/admin/email', '')
    if (method !== 'GET') calls.push({ method, path: short, body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined })
    if (short === '/campaigns' && method === 'GET') return ok({ campaigns: [SENT, campaign()], sending: { enabled: options.enabled ?? true, sentLast24h: 3, dailyLimit: 500 } })
    if (short.startsWith('/contacts')) return ok({ contacts: [contact('ani'), contact('budi', true)], categories: [{ id: 'c1', name: 'client', builtin: true, count: 2 }] })
    if (short === '/campaigns/k2?offset=0') return ok({ campaign: SENT, recipients: [row], offset: 0, pageSize: 500 })
    if (short === '/campaigns/new1?offset=0') return ok({ campaign: campaign({ id: 'new1', status: 'queued' }), recipients: [], offset: 0, pageSize: 500 })
    if (short === '/audience') return ok({ count: 1, archived: 0, unsubscribed: 1 })
    if (short === '/preview') return ok({ subject: 'Judul uji', html: '<p>isi</p>' })
    if (short.endsWith('/test')) return ok({ to: 'admin@example.test', version: 'v-tested' })
    if (short === '/campaigns' || short === '/campaigns/new1') return ok(campaign({ id: 'new1', html: JSON.parse(String(init?.body)).html }))
    return ok({})
  }))
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
  return calls
}

describe('bulk send page', () => {
  beforeEach(async () => { await i18n.changeLanguage('id') })
  afterEach(() => { vi.unstubAllGlobals() })

  it('lists sends and drafts with who and the daily use', async () => {
    setup()
    expect(await screen.findByText('Undangan')).toBeInTheDocument()
    expect(screen.getByText('Terkirim 24 jam terakhir: 3 dari 500.')).toBeInTheDocument()
    expect(screen.getByText(/Dijeda · .*WIB · admin@example\.test · 1\/2 terkirim/)).toBeInTheDocument()
  })

  it('a psychologist gets nothing', async () => {
    const calls = setup('/dashboard/email/send', { role: 'psychologist' })
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(screen.queryByText('Undangan')).not.toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })

  it('the log shows each person, why it paused, and can resume', async () => {
    const calls = setup('/dashboard/email/send?id=k2')
    expect(await screen.findByText(/batas harian/)).toBeInTheDocument()
    expect(screen.getByText(/dibuka 2x/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }))
    await waitFor(() => expect(calls).toEqual([{ method: 'POST', path: '/campaigns/k2/resume', body: undefined }]))
  })

  it('writing: Send needs a test and a count; the confirm waits five seconds and sends once', async () => {
    const user = userEvent.setup()
    const calls = setup('/dashboard/email/send?new=1')
    await user.type(await screen.findByLabelText('Judul (baris subjek e-mail)'), 'Kabar')
    await user.type(screen.getByRole('textbox', { name: 'Isi e-mail' }), 'Halo')
    await user.click(screen.getByRole('checkbox', { name: 'client' }))
    expect(await screen.findByText('1 penerima')).toBeInTheDocument()
    expect(screen.getByText(/tidak termasuk 1 yang berhenti/)).toBeInTheDocument()
    const send = screen.getByRole('button', { name: 'Kirim' })
    expect(send).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Kirim uji ke saya' }))
    expect(await screen.findByText('E-mail uji dikirim ke admin@example.test.')).toBeInTheDocument()
    expect(send).toBeEnabled()
    // Changing the text asks for a new test.
    await user.type(screen.getByRole('textbox', { name: 'Isi e-mail' }), '!')
    expect(send).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Kirim uji ke saya' }))
    await waitFor(() => expect(send).toBeEnabled())
    await user.click(send)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Ya, kirim (5)' })).toBeDisabled()
    expect(calls.some((c) => c.path.endsWith('/send'))).toBe(false)
    await user.click(await within(dialog).findByRole('button', { name: 'Ya, kirim' }, { timeout: 8000 }))
    await waitFor(() => expect(calls.filter((c) => c.path === '/campaigns/new1/send')).toEqual([{ method: 'POST', path: '/campaigns/new1/send', body: { version: 'v-tested', audience: { mode: 'categories', ids: ['c1'] }, expected: 1 } }]))
    // One draft was made, then updated: never a second one.
    expect(calls.filter((c) => c.method === 'POST' && c.path === '/campaigns')).toHaveLength(1)
    expect(await screen.findByText(/Sedang dikirim/)).toBeInTheDocument()
  }, 30000)

  it('with sending switched off nothing can be sent; the preview is sandboxed; unsubscribed people cannot be ticked', async () => {
    const user = userEvent.setup()
    setup('/dashboard/email/send?new=1', { enabled: false })
    await user.type(await screen.findByLabelText('Judul (baris subjek e-mail)'), 'Kabar')
    await user.type(screen.getByRole('textbox', { name: 'Isi e-mail' }), 'Halo')
    expect(screen.getByRole('button', { name: 'Kirim uji ke saya' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: 'Orang tertentu' }))
    expect(screen.getByRole('checkbox', { name: /budi/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Pratinjau' }))
    const frame = await screen.findByTitle('Pratinjau e-mail')
    expect(frame).toHaveAttribute('sandbox', '')
    expect(frame).toHaveAttribute('srcdoc', '<p>isi</p>')
  })
})

describe('plain text body', () => {
  it('becomes safe paragraphs with links and opens again as the same text', () => {
    const text = 'Halo {{name}},\n\nBaca https://attentiveid.com/a?x=1&y=2.\nSalam <3'
    const html = textToHtml(text)
    expect(html).toContain('<a href="https://attentiveid.com/a?x=1&amp;y=2">')
    expect(html).toContain('Salam &lt;3')
    expect(htmlToPlain(html)).toBe(text)
    expect(htmlToPlain('<p>ditulis sebagai HTML</p>')).toBeNull()
    expect(textToHtml('  ')).toBe('')
  })
})
