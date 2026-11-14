import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'

const admin: UserDto = {
  id: 'admin-1',
  email: 'admin@attentive.id',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  psychologistId: null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
}

const existing = {
  id: 'b1',
  slug: 'being-liked',
  title: { id: 'Menjadi Disukai', en: 'Being Liked' },
  summary: { id: 'Ringkasan', en: 'Summary' },
  periodMonth: '2026-09',
  releaseAt: '2099-01-01T00:00:00.000Z',
  totalPages: 8,
  previewPages: 3,
  status: 'published',
  documentName: 'brief.pdf',
  hasDocument: true,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

const json = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body })

describe('Sci-Brief portal page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists briefs (a future release shows as scheduled) and saves a new draft', async () => {
    const calls: { url: string; method: string; body?: string }[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        calls.push({ url, method, body: typeof init?.body === 'string' ? init.body : undefined })
        if (url.includes('/api/auth')) return json({ status: 'success', accessToken: 'valid.token', user: admin })
        if (url === '/api/admin/sci-briefs' && method === 'POST') return json({ status: 'success', brief: { ...existing, id: 'b2' } }, 201)
        if (url === '/api/admin/sci-briefs') return json({ status: 'success', briefs: [existing] })
        return json({ status: 'success' })
      }),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard/sci-brief']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    const row = (await screen.findByText('Menjadi Disukai')).closest('tr') as HTMLElement
    expect(within(row).getByText('Terjadwal')).toBeDefined()
    expect(within(row).getByText(/8 hlm/)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /sci-brief baru/i }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/judul \(bahasa indonesia\)/i), { target: { value: 'Brief Baru' } })
    fireEvent.change(within(dialog).getByLabelText(/deskripsi singkat \(indonesia\)/i), { target: { value: 'Isi singkat' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Simpan' }))

    await waitFor(() => expect(calls.some((call) => call.method === 'POST' && call.url === '/api/admin/sci-briefs')).toBe(true))
    const post = calls.find((call) => call.method === 'POST' && call.url === '/api/admin/sci-briefs')!
    const payload = JSON.parse(post.body as string)
    expect(payload).toMatchObject({ titleId: 'Brief Baru', slug: 'brief-baru', status: 'draft', previewPages: 3 })
    expect(new Date(payload.releaseAt).toString()).not.toBe('Invalid Date')
  })
})
