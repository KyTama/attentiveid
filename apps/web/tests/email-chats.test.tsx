import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { EmailChat, EmailChatMessage, UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'

const staff = (role: UserDto['role']): UserDto => ({
  id: role, email: `${role}@example.test`, name: 'Staff', role, status: 'active',
  psychologistId: role === 'psychologist' ? 'p1' : null, lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
})
const chat = (id: string, over: Partial<EmailChat> = {}): EmailChat => ({
  contactId: id, email: `${id}@example.test`, name: id === 'ani' ? 'Ani Lestari' : '', categoryIds: ['c1'], archived: false, unsubscribed: false,
  lastTitle: 'Kabar November', lastStatus: 'sent', lastAt: '2026-11-26T02:00:00.000Z', count: 1, ...over,
})
const message = (id: string, over: Partial<EmailChatMessage> = {}): EmailChatMessage => ({
  id, campaignId: 'k', title: 'Kabar November', text: 'Halo Ani', files: ['brosur.pdf'], sentBy: 'admin@example.test', status: 'sent',
  at: '2026-11-26T02:00:00.000Z', openedAt: '2026-11-26T03:00:00.000Z', clickedAt: null, ...over,
})

function setup(path = '/dashboard/email/chats', role: UserDto['role'] = 'admin') {
  const calls: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ status: 'success', data }) })
    if (url.includes('/api/auth/')) return { ok: true, status: 200, json: async () => ({ status: 'success', accessToken: 'valid.token', user: staff(role) }) }
    if (!url.startsWith('/api/admin/email')) return { ok: false, status: 404, json: async () => ({}) }
    calls.push(url.replace('/api/admin/email', ''))
    if (url.endsWith('/chats')) return ok({ chats: [chat('ani'), chat('budi', { categoryIds: ['c2'], lastTitle: 'Undangan' })], categories: [{ id: 'c1', name: 'client', builtin: true, count: 1 }, { id: 'c2', name: 'business', builtin: true, count: 1 }] })
    return ok({ contact: { id: 'ani', email: 'ani@example.test', name: 'Ani Lestari', unsubscribed: true }, messages: [message('m1'), message('m2', { text: `${'panjang '.repeat(80)}TAMAT`, at: '2026-11-27T02:00:00.000Z', openedAt: null, status: 'failed', files: [] })] })
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

describe('e-mail conversations', () => {
  beforeEach(async () => { await i18n.changeLanguage('id') })
  afterEach(() => { vi.unstubAllGlobals() })

  it('lists name and address, filters by chip and search', async () => {
    const user = userEvent.setup()
    setup()
    expect(await screen.findByText('Ani Lestari')).toBeInTheDocument()
    expect(screen.getByText('ani@example.test')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'business' }))
    expect(screen.queryByText('Ani Lestari')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Semua' }))
    await user.type(screen.getByRole('searchbox', { name: 'Cari percakapan' }), 'undangan')
    expect(screen.queryByText('Ani Lestari')).not.toBeInTheDocument()
    expect(screen.getByText('Undangan')).toBeInTheDocument()
  })

  it('opens a conversation with date separators, state, attachments and folded long text', async () => {
    const user = userEvent.setup()
    const calls = setup()
    await user.click(await screen.findByRole('button', { name: /Ani Lestari/ }))
    const view = screen.getByRole('region', { name: 'Percakapan' })
    expect(await within(view).findByText('Halo Ani')).toBeInTheDocument()
    expect(calls).toContain('/chats/ani')
    expect(within(view).getByText('Berhenti berlangganan')).toBeInTheDocument()
    expect(within(view).getByText('brosur.pdf')).toBeInTheDocument()
    expect(within(view).getByText(/terkirim · dibuka/)).toBeInTheDocument()
    expect(within(view).getByText(/· gagal/)).toBeInTheDocument()
    expect(within(view).getAllByText(/^2[67] Nov 2026$/)).toHaveLength(2)
    expect(within(view).queryByText(/TAMAT/)).not.toBeInTheDocument()
    await user.click(within(view).getByRole('button', { name: 'Baca selengkapnya' }))
    expect(within(view).getByText(/TAMAT/)).toBeInTheDocument()
    await user.click(within(view).getByRole('button', { name: 'Kembali' }))
    expect(within(view).queryByText('Halo Ani')).not.toBeInTheDocument()
  })

  it('a psychologist gets nothing', async () => {
    const calls = setup('/dashboard/email/chats?id=ani', 'psychologist')
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(calls).toHaveLength(0)
  })
})
