import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'
import { NAV_KEYWORDS, searchNav } from '../src/features/dashboard/nav-search'

const user = (role: 'admin' | 'psychologist'): UserDto => ({
  id: `user-${role}`,
  email: `${role}@attentive.id`,
  name: role === 'admin' ? 'Admin User' : 'Psikolog User',
  role,
  status: 'active',
  psychologistId: role === 'psychologist' ? 'p1' : null,
  lastLoginAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

const listItem = (over: Record<string, unknown>) => ({
  id: '1', code: 'AT-MHCU-2026-001', instrument: 'mhcu', name: 'Nadia Putri', age: 27, email: 'nadia@example.com', phone: '0812', level: 2,
  status: 'new', researchConsent: true, psychologistId: null, paymentStatus: 'UNPAID', waveNo: 1, createdAt: '2026-11-20T09:00:00Z', ...over,
})

const LIST = [
  listItem({ paymentSubmittedAt: '2026-11-21T03:00:00Z', paymentFor: 'package3' }),
  listItem({ id: '2', code: 'AT-MHCU-2026-002', name: 'Dimas Hidayat', email: 'dimas@example.com', level: 4, psychologistId: 'p1', paymentStatus: 'PAID', waveNo: 3 }),
]

const detailOf = (over: Record<string, unknown> = {}) => ({
  ...listItem({}),
  lang: 'id', track: 'mandiri', sex: 'Perempuan', guardian: false, consentVersion: 'v1', answers: {},
  scores: {
    mhi: 54.2, di: 38.5, wi: 46.4, bhi: 55, level: 3,
    levelName: { id: 'Perlu Perhatian', en: 'Needs Attention' }, mhiBand: { id: 'Perlu Dipantau', en: 'Needs Monitoring' },
    diCategory: { id: 'Sedang', en: 'Moderate' }, ati: { total: 75, category: { id: 'Tinggi', en: 'High' } },
    reasons: [{ id: '8 domain di atas ambang', en: '8 domains at or above threshold' }],
    domains: [{ id: 'Depresi', en: 'Depression', score: 2, flagged: true }, { id: 'Mania', en: 'Mania', score: 1, flagged: false }],
  },
  durationSec: 600, reviewerNote: null, reviewedAt: null, releasedAt: null, sheetSyncedAt: null, sheetError: null,
  resultEmailSentAt: null, paymentFor: null, paymentSubmittedAt: null,
  psychologistId: null, participantId: null, waveNo: 1, noteTemplate: null, noteCustom: null, noteFinal: false, noteUpdatedAt: null,
  paymentStatus: 'UNPAID', paymentPackage: null, paymentAmount: null, paymentRef: null,
  ...over,
})

interface Call { method: string; url: string; body: unknown }

function setup(role: 'admin' | 'psychologist' = 'admin', detail: Record<string, unknown> = detailOf()) {
  const calls: Call[] = []
  let current = detail
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      const ok = (json: unknown) => ({ ok: true, status: 200, json: async () => json })
      if (url.includes('/api/auth/')) return ok({ status: 'success', accessToken: 'valid.token', user: user(role) })
      calls.push({ method, url, body })
      if (url.endsWith('/api/admin/assessment-lists/mhcu')) return ok({ status: 'success', data: LIST })
      if (url.endsWith('/api/admin/assessment-psychologists')) return ok({ status: 'success', data: [{ id: 'p1', name: 'Dr. Satu' }, { id: 'p2', name: 'Dr. Dua' }] })
      if (method === 'PUT' && url.endsWith('/psychologist')) { current = { ...current, psychologistId: body.psychologistId }; return ok({ status: 'success', data: current }) }
      if (method === 'PUT' && url.endsWith('/note')) { current = { ...current, noteTemplate: body.template, noteCustom: body.custom, noteFinal: body.final }; return ok({ status: 'success', data: current }) }
      if (method === 'PUT' && url.endsWith('/payment')) { current = { ...current, paymentStatus: body.status, paymentAmount: body.amount, paymentRef: body.ref }; return ok({ status: 'success', data: current }) }
      if (method === 'POST' && url.endsWith('/release-report')) { current = { ...current, status: 'released' }; return ok({ status: 'success', data: { released: true, emailed: true } }) }
      if (/\/api\/admin\/assessments\/[^/]+$/.test(url)) return ok({ status: 'success', data: current })
      return { ok: false, status: 404, json: async () => ({ message: 'Tidak ada.' }) }
    }),
  )
  render(
    <MemoryRouter initialEntries={['/dashboard/assessments/mhcu']}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
  return calls
}

const openFirst = async () => {
  const u = userEvent.setup()
  await u.click((await screen.findAllByRole('button', { name: /nadia putri/i }))[0] as HTMLElement)
  const panel = await screen.findByRole('complementary', { name: /detail hasil/i })
  await within(panel).findByRole('heading', { name: /nadia putri/i })
  return { u, panel }
}

describe('MHCU dashboard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists the results with the cohort tiles', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: /dasbor mhcu/i })).toBeInTheDocument()
    expect((await screen.findAllByText('Nadia Putri')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dimas Hidayat').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/T3/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Belum bayar').length).toBeGreaterThan(0)
    expect(screen.getByRole('img', { name: /L1: 0, L2: 1, L3: 0, L4: 1, L5: 0/ })).toBeInTheDocument()
  })

  it('shows who is waiting to be confirmed: badge, tile count and a filter', async () => {
    setup()
    const u = userEvent.setup()
    await screen.findAllByText('Nadia Putri')
    // one badge in the card list and one in the table (both are in the page; CSS decides which one is seen)
    expect(screen.getAllByText('Bukti transfer masuk').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('button', { name: 'Bukti transfer masuk: 1' })).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: 'Bukti transfer masuk: 1' }))
    expect(screen.queryAllByText('Dimas Hidayat')).toHaveLength(0)
    expect(screen.getAllByText('Nadia Putri').length).toBeGreaterThan(0)
  })

  it('tells in the detail panel when the proof was sent and what the person chose', async () => {
    setup('admin', detailOf({ paymentSubmittedAt: '2026-11-21T03:00:00Z', paymentFor: 'package3' }))
    const { panel } = await openFirst()
    const banner = within(panel).getAllByRole('status').find((el) => /bukti transfer masuk/i.test(el.textContent ?? ''))
    expect(banner).toHaveTextContent(/memilih paket 3x/i)
    expect(banner).toHaveTextContent(/ubah status menjadi paid/i)
  })

  it('has no proof banner once the payment is confirmed', async () => {
    setup('admin', detailOf({ paymentSubmittedAt: '2026-11-21T03:00:00Z', paymentFor: 'single', paymentStatus: 'PAID' }))
    const { panel } = await openFirst()
    expect(within(panel).queryByText(/memilih laporan 1x/i)).not.toBeInTheDocument()
  })

  it('on a phone the filters wait behind one button and show how many are active', async () => {
    setup()
    const u = userEvent.setup()
    await screen.findAllByText('Nadia Putri')
    const toggle = screen.getByRole('button', { name: /^filter/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await u.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await u.selectOptions(screen.getByRole('combobox', { name: /level/i }), '4')
    expect(toggle).toHaveTextContent('1')
    await u.click(screen.getByRole('button', { name: /hapus filter/i }))
    expect(screen.getAllByText('Nadia Putri').length).toBeGreaterThan(0)
  })

  it('has a way back to the list from the open result (phone)', async () => {
    setup()
    const { u, panel } = await openFirst()
    await u.click(within(panel).getByRole('button', { name: /daftar hasil/i }))
    await waitFor(() => expect(screen.queryByRole('complementary', { name: /detail hasil/i })).not.toBeInTheDocument())
  })

  it('searches and filters the list', async () => {
    setup()
    const u = userEvent.setup()
    await screen.findAllByText('Nadia Putri')
    await u.type(screen.getByRole('searchbox'), 'dimas')
    expect(screen.queryAllByText('Nadia Putri')).toHaveLength(0)
    expect(screen.getAllByText('Dimas Hidayat').length).toBeGreaterThan(0)
    await u.clear(screen.getByRole('searchbox'))
    await u.selectOptions(screen.getByRole('combobox', { name: /pembayaran/i }), 'UNPAID')
    expect(screen.getAllByText('Nadia Putri').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Dimas Hidayat')).toHaveLength(0)
    await u.selectOptions(screen.getByRole('combobox', { name: /pembayaran/i }), 'FREE')
    expect(screen.getByText(/tidak ada hasil yang cocok/i)).toBeInTheDocument()
  })

  it('opens one result beside the list with scores, triggers and areas', async () => {
    setup()
    const { panel } = await openFirst()
    expect(within(panel).getAllByText('54,2').length).toBeGreaterThan(0)
    expect(within(panel).getByText('8 domain di atas ambang')).toBeInTheDocument()
    expect(within(panel).getByText('Depresi *')).toBeInTheDocument()
    expect(within(panel).getByText('Mania')).toBeInTheDocument()
  })

  it('assigns a psychologist (admin)', async () => {
    const calls = setup()
    const { u, panel } = await openFirst()
    await u.selectOptions(within(panel).getByRole('combobox', { name: /pilih psikolog/i }), 'p2')
    await u.click(within(panel).getByRole('button', { name: /simpan psikolog/i }))
    await within(panel).findByText(/psikolog disimpan/i)
    expect(calls.find((c) => c.url.endsWith('/psychologist'))).toMatchObject({ method: 'PUT', body: { psychologistId: 'p2' } })
  })

  it('saves the note: the standard text is sent as "no edit", the own addition and the final flag as typed', async () => {
    const calls = setup()
    const { u, panel } = await openFirst()
    const save = within(panel).getByRole('button', { name: /simpan catatan/i })
    expect(save).toBeDisabled()
    await u.type(within(panel).getByLabelText(/catatan khusus psikolog/i), 'Tidur teratur.')
    expect(within(panel).getByText(/belum disimpan/i)).toBeInTheDocument()
    await u.click(within(panel).getByRole('checkbox', { name: /catatan final/i }))
    await u.click(save)
    await within(panel).findByText(/catatan disimpan/i)
    expect(calls.find((c) => c.url.endsWith('/note'))?.body).toEqual({ template: null, custom: 'Tidur teratur.', final: true })
    expect(within(panel).getByRole('button', { name: /simpan catatan/i })).toBeDisabled()
  })

  it('stops the own addition at 500 characters', async () => {
    setup()
    const { panel } = await openFirst()
    expect(within(panel).getByLabelText(/catatan khusus psikolog/i)).toHaveAttribute('maxlength', '500')
    expect(within(panel).getByText(/500 karakter tersisa/i)).toBeInTheDocument()
  })

  it('refuses a payment amount that is not a number, and saves a valid one', async () => {
    const calls = setup()
    const { u, panel } = await openFirst()
    await u.selectOptions(within(panel).getByLabelText(/^status/i), 'PAID')
    await u.type(within(panel).getByLabelText(/nominal/i), 'dua ratus')
    await u.click(within(panel).getByRole('button', { name: /simpan pembayaran/i }))
    expect(within(panel).getByText(/isi angka rupiah/i)).toBeInTheDocument()
    expect(calls.some((c) => c.url.endsWith('/payment'))).toBe(false)
    await u.clear(within(panel).getByLabelText(/nominal/i))
    await u.type(within(panel).getByLabelText(/nominal/i), '227.000')
    await u.type(within(panel).getByLabelText(/referensi pembayaran/i), 'BCA 12345')
    await u.click(within(panel).getByRole('button', { name: /simpan pembayaran/i }))
    await within(panel).findByText(/pembayaran disimpan/i)
    expect(calls.find((c) => c.url.endsWith('/payment'))?.body).toEqual({ status: 'PAID', package: null, amount: 227000, ref: 'BCA 12345' })
  })

  it('does not offer the release while the note is not final or the payment is not confirmed', async () => {
    setup()
    const { panel } = await openFirst()
    expect(within(panel).getByRole('button', { name: /rilis laporan/i })).toBeDisabled()
    expect(within(panel).getByText(/catatan psikolog belum ditandai final/i)).toBeInTheDocument()
  })

  it('releases the report once the note is final and the payment confirmed', async () => {
    const calls = setup('admin', detailOf({ noteFinal: true, paymentStatus: 'PAID' }))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { u, panel } = await openFirst()
    const release = within(panel).getByRole('button', { name: /rilis laporan/i })
    expect(release).toBeEnabled()
    await u.click(release)
    await within(panel).findByText(/laporan dirilis dan tautannya sudah dikirim/i)
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/release-report'))).toBe(true)
    await waitFor(() => expect(within(panel).getByRole('button', { name: /rilis laporan/i })).toBeDisabled())
    expect(within(panel).getByText(/sudah dirilis/i)).toBeInTheDocument()
  })

  it('does not release when the confirmation is declined', async () => {
    const calls = setup('admin', detailOf({ noteFinal: true, paymentStatus: 'PAID' }))
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { u, panel } = await openFirst()
    await u.click(within(panel).getByRole('button', { name: /rilis laporan/i }))
    expect(calls.some((c) => c.url.endsWith('/release-report'))).toBe(false)
  })

  it('shows an alert for a level 4-5 result', async () => {
    setup('admin', detailOf({ level: 5 }))
    const { panel } = await openFirst()
    expect(within(panel).getByRole('alert')).toHaveTextContent(/perlu perhatian/i)
  })

  it('a psychologist can write the note but cannot assign, set payment or release', async () => {
    const calls = setup('psychologist')
    const { panel } = await openFirst()
    expect(within(panel).getByRole('button', { name: /simpan catatan/i })).toBeInTheDocument()
    expect(within(panel).queryByRole('combobox', { name: /pilih psikolog/i })).not.toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: /simpan pembayaran/i })).not.toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: /rilis laporan/i })).not.toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: /laporan psikolog \(internal\)/i })).toBeInTheDocument()
    // the psychologist list is an admin endpoint and is not requested
    expect(calls.some((c) => c.url.endsWith('/assessment-psychologists'))).toBe(false)
  })

  it('shows the message of the server when a save fails', async () => {
    setup()
    const { u, panel } = await openFirst()
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 409, json: async () => ({ message: 'Perubahan belum tersimpan.' }) })))
    await u.type(within(panel).getByLabelText(/catatan khusus psikolog/i), 'x')
    await u.click(within(panel).getByRole('button', { name: /simpan catatan/i }))
    expect(await within(panel).findByRole('alert')).toHaveTextContent('Perubahan belum tersimpan.')
  })

  it('is found by the portal menu search', () => {
    expect(NAV_KEYWORDS['/dashboard/assessments/mhcu']).toBeTruthy()
    const item = { to: '/dashboard/assessments/mhcu', label: 'Dasbor MHCU', trail: [], keywords: NAV_KEYWORDS['/dashboard/assessments/mhcu'] ?? '' }
    for (const term of ['pembayaran', 'payment', 'rilis laporan', 'psychologist']) expect(searchNav([item], term)).toHaveLength(1)
  })
})
