import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { UserDto } from '@attentiveid/shared'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { AuthProvider } from '../src/features/auth/auth-context'

const staff = (role: 'admin' | 'psychologist'): UserDto => ({
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

const row = (over: Record<string, unknown>) => ({
  id: 'w3', code: 'AT-MHCU-2026-003', instrument: 'mhcu', name: 'Nadia Putri', age: 27, email: 'nadia@example.com', phone: '0812', level: 3,
  status: 'new', researchConsent: true, psychologistId: null, paymentStatus: 'UNPAID', waveNo: 3, createdAt: '2026-09-25T09:00:00Z',
  paymentSubmittedAt: null, paymentFor: null, track: 'lanjutan', ...over,
})

const LIST = [row({}), row({ id: 'z1', code: 'AT-MHCU-2026-009', name: 'Dimas Hidayat', email: 'dimas@example.com', paymentStatus: 'PAID', waveNo: 1, level: 4 })]

const detailOf = (over: Record<string, unknown> = {}) => ({
  ...row({}),
  lang: 'id', sex: 'Perempuan', guardian: false, consentVersion: 'v1', answers: {},
  scores: { mhi: 54.2, di: 38.5, wi: 46.4, bhi: 55, levelName: { id: 'Perlu Perhatian', en: 'Needs Attention' }, mhiBand: { id: 'Perlu Dipantau', en: 'Needs Monitoring' }, reasons: [], domains: [], ati: { total: 75 } },
  durationSec: 1, reviewerNote: null, reviewedAt: null, releasedAt: null, sheetSyncedAt: null, sheetError: null, resultEmailSentAt: null,
  psychologistId: null, participantId: 'person-1', noteTemplate: null, noteCustom: null, noteFinal: false, noteUpdatedAt: null,
  paymentPackage: null, paymentAmount: null, paymentRef: null, adminAlertAt: null, reportSentAt: null, ...over,
})

const HISTORY = {
  participantNo: 7, nSessions: 3, spanDays: 56, current: 'w3',
  waves: [
    { id: 'w1', code: 'AT-MHCU-2026-001', waveNo: 1, date: '2026-07-31', mhi: 46.1, di: 40.4, wi: 33.9, bhi: 43.3, level: 3, deltaMhi: null, daysSincePrev: null },
    { id: 'w2', code: 'AT-MHCU-2026-002', waveNo: 2, date: '2026-08-28', mhi: 54.1, di: 34.6, wi: 48.2, bhi: 43.3, level: 3, deltaMhi: 8, daysSincePrev: 28 },
    { id: 'w3', code: 'AT-MHCU-2026-003', waveNo: 3, date: '2026-09-25', mhi: 61.4, di: 28.9, wi: 58.9, bhi: 46.7, level: 2, deltaMhi: 7.3, daysSincePrev: 28 },
  ],
}

const OVERVIEW = {
  sessions: 29, participants: 13, returning: 6, levels: [2, 6, 15, 3, 3], meanMhi: 59.8, meanChange: 6.8,
  months: [{ m: '2026-10', n: 7, mhi: 61.1 }, { m: '2026-11', n: 12, mhi: 62.5 }],
  unpaid: 4, awaitingConfirmation: 2, notesToFinish: 5, readyNotReleased: 3, notAssigned: 8,
}

const SETTINGS = {
  pricing: { single: { normal: 297000, promo: 227000 }, package3: { normal: 885000, promo: 647000 }, promoUntil: '2027-04-30' },
  alertLevel: 4, alertEmail: 'contact@attentiveid.com', autoAssign: true, autoSend: false,
}

const INVITES = [
  { id: 'INV0002', track: 'free', psychologistId: 'p1', psychologistName: 'Dr. Satu, M.Psi.', clientName: 'Fajar', clientEmail: 'fajar@example.com', note: null, status: 'OPEN', createdAt: '2026-11-21T01:00:00Z', url: 'https://site/assessments/mhcu?invite=abc' },
  { id: 'INV0001', track: 'asesmen', psychologistId: 'p1', psychologistName: 'Dr. Satu, M.Psi.', clientName: 'Maya', clientEmail: null, note: 'uji', status: 'USED', createdAt: '2026-11-20T01:00:00Z', url: 'https://site/x' },
]

interface Call { method: string; url: string; body: unknown }
interface World {
  history?: unknown
  overview?: unknown
  detail?: Record<string, unknown>
  settingsError?: string
  inviteError?: string
}

function setup(path: string, role: 'admin' | 'psychologist' = 'admin', world: World = {}) {
  const calls: Call[] = []
  let settings = structuredClone(SETTINGS)
  let invites = structuredClone(INVITES)
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ status: 'success', data }) })
      const fail = (status: number, message: string) => ({ ok: false, status, json: async () => ({ status: 'error', message }) })
      if (url.includes('/api/auth/')) return { ok: true, status: 200, json: async () => ({ status: 'success', accessToken: 'valid.token', user: staff(role) }) }
      calls.push({ method, url, body })
      if (url.endsWith('/assessment-lists/mhcu')) return ok(LIST)
      if (url.endsWith('/assessment-psychologists')) return ok([{ id: 'p1', name: 'Dr. Satu, M.Psi.' }, { id: 'p2', name: 'Dr. Dua' }])
      if (url.endsWith('/mhcu/overview')) return world.overview === null ? fail(503, 'down') : ok(world.overview ?? OVERVIEW)
      if (url.endsWith('/mhcu/settings')) {
        if (method === 'PUT') {
          if (world.settingsError) return fail(400, world.settingsError)
          settings = body
          return ok(settings)
        }
        return ok(settings)
      }
      if (url.endsWith('/mhcu/invites')) {
        if (method === 'POST') {
          if (world.inviteError) return fail(400, world.inviteError)
          const invite = { id: 'INV0003', track: body.track, psychologistId: body.psychologistId, psychologistName: 'Dr. Satu, M.Psi.', clientName: body.clientName ?? null, clientEmail: body.clientEmail ?? null, note: null, status: 'OPEN', createdAt: '2026-11-22T01:00:00Z', url: 'https://site/assessments/mhcu?invite=new' }
          invites = [invite, ...invites]
          return ok({ invite, url: invite.url, invites })
        }
        return ok(invites)
      }
      if (/\/mhcu\/invites\/[^/]+$/.test(url) && method === 'DELETE') {
        invites = invites.map((i) => (url.endsWith(i.id) ? { ...i, status: 'CANCELLED' } : i))
        return ok(invites)
      }
      if (url.endsWith('/history')) return world.history === null ? fail(503, 'down') : ok(world.history ?? HISTORY)
      if (url.endsWith('/resend-result')) return ok({ sent: true })
      if (/\/api\/admin\/assessments\/[^/]+$/.test(url)) {
        const id = decodeURIComponent(url.split('/').pop() as string)
        return ok({ ...detailOf(world.detail ?? {}), id })
      }
      return fail(404, 'Tidak ada.')
    }),
  )
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
  return calls
}

const panelOf = async () => {
  const panel = await screen.findByRole('complementary', { name: /detail hasil/i })
  await within(panel).findByRole('heading', { name: /nadia putri/i })
  return panel
}

describe('MHCU dashboard: history, summary, deliveries', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => vi.unstubAllGlobals())

  it('draws the history chart and lists every check-up of the person, the open one marked', async () => {
    setup('/dashboard/assessments/mhcu/w3')
    const panel = await panelOf()
    const chart = await within(panel).findByRole('img', { name: /grafik mhi per pemeriksaan/i })
    expect(chart.querySelectorAll('circle').length).toBeGreaterThanOrEqual(3)
    expect(within(chart).getByText('T1 07-31')).toBeInTheDocument()
    expect(within(chart).getByRole('button', { name: /T3 09-25: MHI 61,4 \(dibuka\)/ })).toBeInTheDocument()
    const table = within(panel).getByRole('table', { name: /semua pemeriksaan peserta ini/i })
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(within(table).getByText('+7,3')).toBeInTheDocument()
    expect(within(table).getByText('46,1')).toBeInTheDocument()
    expect(table.querySelector('[aria-current="true"]')).toHaveTextContent('T3')
    expect(within(panel).getByText(/P00007 · 3 pemeriksaan · 56 hari/)).toBeInTheDocument()
  })

  it('opens another check-up from the table or a dot of the chart', async () => {
    const calls = setup('/dashboard/assessments/mhcu/w3')
    const u = userEvent.setup()
    const panel = await panelOf()
    await u.click(await within(panel).findByRole('button', { name: /buka pemeriksaan T1/i }))
    await waitFor(() => expect(calls.some((c) => c.url.endsWith('/api/admin/assessments/w1'))).toBe(true))
    const chart = await within(await panelOf()).findByRole('img', { name: /grafik mhi/i })
    await u.click(within(chart).getByRole('button', { name: /T2 08-28/ }))
    await waitFor(() => expect(calls.some((c) => c.url.endsWith('/api/admin/assessments/w2'))).toBe(true))
  })

  it('says so when the history cannot be loaded, and keeps the rest of the panel', async () => {
    setup('/dashboard/assessments/mhcu/w3', 'admin', { history: null })
    const panel = await panelOf()
    expect(await within(panel).findByText(/riwayat peserta belum bisa dimuat/i)).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: /simpan catatan/i })).toBeInTheDocument()
  })

  it('shows the e-mail summary from the stored scores: number, level text, scale and position', async () => {
    setup('/dashboard/assessments/mhcu/w3')
    const panel = await panelOf()
    const summary = within(panel).getByRole('region', { name: /ringkasan seperti di email/i })
    expect(within(summary).getByText('Level 3 dari 5: Perlu Perhatian')).toBeInTheDocument()
    expect(within(summary).getAllByText('54,2').length).toBeGreaterThan(0)
    const scale = within(summary).getByRole('list')
    expect(within(scale).getAllByRole('listitem')).toHaveLength(5)
    const current = scale.querySelector('[aria-current="true"]')
    expect(current).toHaveTextContent('3')
    expect(current).toHaveTextContent('Perlu Perhatian')
    expect(within(summary).getByText('0–40')).toBeInTheDocument()
    expect(within(summary).getByText('Perlu Perhatian Serius', { exact: false, selector: 'span.hidden' })).toBeInTheDocument()
  })

  it('lists what was sent, with dates or "belum"', async () => {
    setup('/dashboard/assessments/mhcu/w3', 'admin', { detail: { resultEmailSentAt: '2026-09-25T09:01:00Z', paymentSubmittedAt: '2026-09-26T03:00:00Z', level: 5, adminAlertAt: null } })
    const panel = await panelOf()
    const list = within(panel).getByRole('region', { name: /pengiriman/i })
    expect(within(list).getByText('Email hasil ke peserta').nextSibling).not.toHaveTextContent('belum')
    expect(within(list).getByText('Bukti transfer masuk').nextSibling).not.toHaveTextContent('belum')
    expect(within(list).getByText(/Peringatan ke contact@/).nextSibling).toHaveTextContent('belum')
    expect(within(list).getByText('Laporan lengkap dirilis').nextSibling).toHaveTextContent('belum')
  })

  it('does not ask for an alert below level 4', async () => {
    setup('/dashboard/assessments/mhcu/w3', 'admin', { detail: { level: 2 } })
    const panel = await panelOf()
    expect(within(panel).getByText('tidak diperlukan')).toBeInTheDocument()
  })

  it('sends the result e-mail again after a confirmation (admin)', async () => {
    const calls = setup('/dashboard/assessments/mhcu/w3')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const u = userEvent.setup()
    const panel = await panelOf()
    await u.click(within(panel).getByRole('button', { name: /kirim ulang email hasil/i }))
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('nadia@example.com'))
    await within(panel).findByText('Email hasil dikirim ulang.')
    expect(calls.some((c) => c.method === 'POST' && c.url.endsWith('/w3/resend-result'))).toBe(true)
  })

  it('does not send when the confirmation is declined', async () => {
    const calls = setup('/dashboard/assessments/mhcu/w3')
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const u = userEvent.setup()
    const panel = await panelOf()
    await u.click(within(panel).getByRole('button', { name: /kirim ulang email hasil/i }))
    expect(calls.some((c) => c.url.endsWith('/resend-result'))).toBe(false)
  })

  it('a psychologist sees the deliveries but cannot send the e-mail again', async () => {
    setup('/dashboard/assessments/mhcu/w3', 'psychologist')
    const panel = await panelOf()
    expect(within(panel).getByRole('region', { name: /pengiriman/i })).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: /kirim ulang email hasil/i })).not.toBeInTheDocument()
  })

  it('shows the track, and the remaining package credits when the API gives them', async () => {
    setup('/dashboard/assessments/mhcu/w3', 'admin', { detail: { track: 'paket', creditsRemaining: 2 } })
    const panel = await panelOf()
    expect(within(panel).getAllByText('Paket').length).toBeGreaterThan(0)
    expect(within(panel).getByText(/Sisa kuota paket: 2/)).toBeInTheDocument()
  })

  it('shows the track chip in the list', async () => {
    setup('/dashboard/assessments/mhcu')
    expect((await screen.findAllByText('Lanjutan')).length).toBeGreaterThan(0)
  })
})

describe('MHCU dashboard: overview tiles', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows the numbers of the overview call, the mean change signed, and the monthly bars', async () => {
    setup('/dashboard/assessments/mhcu')
    const section = await screen.findByRole('region', { name: 'Ringkasan' })
    expect(await within(section).findByText('29')).toBeInTheDocument()
    expect(within(section).getByText('13')).toBeInTheDocument()
    expect(within(section).getByText('59,8')).toBeInTheDocument()
    expect(within(section).getByText('+6,8')).toHaveClass('text-emerald-700')
    expect(within(section).getByRole('button', { name: 'Bukti transfer masuk: 2' })).toBeInTheDocument()
    expect(within(section).getByText('Catatan belum final').previousSibling).toHaveTextContent('5')
    expect(within(section).getByText('Siap kirim, belum dirilis').previousSibling).toHaveTextContent('3')
    expect(within(section).getByRole('img', { name: /L1: 2, L2: 6, L3: 15, L4: 3, L5: 3/ })).toBeInTheDocument()
    const months = within(section).getByRole('list', { name: 'Sesi per bulan' })
    expect(within(months).getAllByRole('listitem')).toHaveLength(2)
    expect(within(months).getByText('Nov 26')).toBeInTheDocument()
  })

  it('a negative mean change is red', async () => {
    setup('/dashboard/assessments/mhcu', 'admin', { overview: { ...OVERVIEW, meanChange: -3.2 } })
    const section = await screen.findByRole('region', { name: 'Ringkasan' })
    expect(await within(section).findByText('-3,2')).toHaveClass('text-rose-700')
  })

  it('a tile applies its filter to the list', async () => {
    setup('/dashboard/assessments/mhcu')
    const u = userEvent.setup()
    const section = await screen.findByRole('region', { name: 'Ringkasan' })
    await screen.findAllByText('Dimas Hidayat')
    await u.click(within(section).getByRole('button', { name: 'Belum bayar: 4' }))
    expect(screen.queryAllByText('Dimas Hidayat')).toHaveLength(0)
    expect(screen.getAllByText('Nadia Putri').length).toBeGreaterThan(0)
  })

  it('falls back to counts from the list when the overview call fails', async () => {
    setup('/dashboard/assessments/mhcu', 'admin', { overview: null })
    expect(await screen.findByText(/ringkasan lengkap belum bisa dimuat/i)).toBeInTheDocument()
    const section = screen.getByRole('region', { name: 'Ringkasan' })
    await waitFor(() => expect(within(section).getByText('Sesi').previousSibling).toHaveTextContent('2'))
    expect(within(section).getByText('Rata-rata MHI').previousSibling).toHaveTextContent('–')
  })
})

describe('MHCU settings page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows the saved settings with thousand points', async () => {
    setup('/dashboard/assessments/mhcu/settings')
    expect(await screen.findByRole('heading', { name: 'Pengaturan MHCU' })).toBeInTheDocument()
    await screen.findByRole('button', { name: 'Simpan pengaturan' })
    const prices = screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value)
    expect(prices).toEqual(expect.arrayContaining(['297.000', '227.000', '885.000', '647.000']))
    expect(screen.getByLabelText(/promo berlaku sampai/i)).toHaveValue('2027-04-30')
    expect(screen.getByLabelText(/kirim peringatan mulai level/i)).toHaveValue('4')
    expect(screen.getByRole('switch', { name: /tugaskan psikolog otomatis/i })).toBeChecked()
    expect(screen.getByRole('switch', { name: /rilis laporan otomatis/i })).not.toBeChecked()
    expect(screen.getByText('Pilih psikolog otomatis saat pembayaran dikonfirmasi.')).toBeInTheDocument()
    expect(screen.getByText(/Rilis laporan otomatis bila pembayaran terkonfirmasi, psikolog ditugaskan dan catatan final\./)).toBeInTheDocument()
  })

  it('saving needs a change, shows the dirty state, regroups digits and sends whole rupiah', async () => {
    const calls = setup('/dashboard/assessments/mhcu/settings')
    const u = userEvent.setup()
    const save = await screen.findByRole('button', { name: 'Simpan pengaturan' })
    expect(save).toBeDisabled()
    const promo = screen.getAllByRole('textbox').find((el) => (el as HTMLInputElement).value === '227.000') as HTMLInputElement
    await u.clear(promo)
    await u.type(promo, '199000')
    expect(promo).toHaveValue('199.000')
    expect(screen.getByText('Belum disimpan')).toBeInTheDocument()
    await u.click(screen.getByRole('switch', { name: /rilis laporan otomatis/i }))
    await u.selectOptions(screen.getByLabelText(/kirim peringatan mulai level/i), '5')
    await u.click(save)
    await screen.findByText('Pengaturan disimpan.')
    const put = calls.find((c) => c.method === 'PUT' && c.url.endsWith('/mhcu/settings'))
    expect(put?.body).toEqual({
      pricing: { single: { normal: 297000, promo: 199000 }, package3: { normal: 885000, promo: 647000 }, promoUntil: '2027-04-30' },
      alertLevel: 5,
      alertEmail: 'contact@attentiveid.com',
      autoAssign: true,
      autoSend: true,
    })
    expect(screen.getByRole('button', { name: 'Simpan pengaturan' })).toBeDisabled()
  })

  it('does not send a promo price above the normal price', async () => {
    const calls = setup('/dashboard/assessments/mhcu/settings')
    const u = userEvent.setup()
    await screen.findByRole('button', { name: 'Simpan pengaturan' })
    const promo = screen.getAllByRole('textbox').find((el) => (el as HTMLInputElement).value === '227.000') as HTMLInputElement
    await u.clear(promo)
    await u.type(promo, '999000')
    await u.click(screen.getByRole('button', { name: 'Simpan pengaturan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/promo 1x tidak boleh lebih tinggi/i)
    expect(calls.some((c) => c.method === 'PUT')).toBe(false)
  })

  it('shows the message of the server as given', async () => {
    setup('/dashboard/assessments/mhcu/settings', 'admin', { settingsError: 'Tanggal promo harus di masa depan.' })
    const u = userEvent.setup()
    await screen.findByRole('button', { name: 'Simpan pengaturan' })
    await u.click(screen.getByRole('switch', { name: /rilis laporan otomatis/i }))
    await u.click(screen.getByRole('button', { name: 'Simpan pengaturan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Tanggal promo harus di masa depan.')
    // still dirty: nothing was lost
    expect(screen.getByText('Belum disimpan')).toBeInTheDocument()
  })

  it('discards changes', async () => {
    setup('/dashboard/assessments/mhcu/settings')
    const u = userEvent.setup()
    await screen.findByRole('button', { name: 'Simpan pengaturan' })
    await u.click(screen.getByRole('switch', { name: /tugaskan psikolog otomatis/i }))
    expect(screen.getByRole('switch', { name: /tugaskan psikolog otomatis/i })).not.toBeChecked()
    await u.click(screen.getByRole('button', { name: /batalkan perubahan/i }))
    expect(screen.getByRole('switch', { name: /tugaskan psikolog otomatis/i })).toBeChecked()
  })

  it('is for admins only', async () => {
    setup('/dashboard/assessments/mhcu/settings', 'psychologist')
    await screen.findByText(/selamat datang|psikolog user/i)
    expect(screen.queryByRole('heading', { name: 'Pengaturan MHCU' })).not.toBeInTheDocument()
  })
})

describe('MHCU invitation links page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => vi.unstubAllGlobals())

  it('lists the invitations with their status and offers copy and cancel for open ones only', async () => {
    setup('/dashboard/assessments/mhcu/invites')
    const list = await screen.findByRole('region', { name: 'Daftar undangan' })
    expect(await within(list).findAllByRole('listitem')).toHaveLength(2)
    const open = within(list).getAllByRole('listitem')[0] as HTMLElement
    expect(within(open).getByText('Terbuka')).toBeInTheDocument()
    expect(within(open).getByRole('button', { name: /salin tautan/i })).toBeInTheDocument()
    expect(within(open).getByRole('button', { name: 'Batalkan' })).toBeInTheDocument()
    const used = within(list).getAllByRole('listitem')[1] as HTMLElement
    expect(within(used).getByText('Dipakai')).toBeInTheDocument()
    expect(within(used).queryByRole('button')).not.toBeInTheDocument()
  })

  it('creates a link, shows it to copy, and refreshes the list', async () => {
    const calls = setup('/dashboard/assessments/mhcu/invites')
    const u = userEvent.setup()
    await screen.findByRole('region', { name: 'Daftar undangan' })
    await waitFor(() => expect(screen.getByLabelText('Psikolog')).toHaveValue('p1'))
    await u.type(screen.getByLabelText(/nama klien/i), 'Contoh Klien')
    await u.type(screen.getByLabelText(/email klien/i), 'klien@example.com')
    await u.click(screen.getByRole('button', { name: 'Buat tautan' }))
    expect(await screen.findByDisplayValue('https://site/assessments/mhcu?invite=new')).toBeInTheDocument()
    expect(screen.getByText(/Tautan hanya bisa dipakai satu kali|hanya bisa dipakai satu kali/)).toBeInTheDocument()
    const post = calls.find((c) => c.method === 'POST' && c.url.endsWith('/mhcu/invites'))
    expect(post?.body).toEqual({ track: 'asesmen', psychologistId: 'p1', clientName: 'Contoh Klien', clientEmail: 'klien@example.com' })
    expect(within(screen.getByRole('region', { name: 'Daftar undangan' })).getAllByRole('listitem')).toHaveLength(3)
  })

  it('refuses a client e-mail that is not an address', async () => {
    const calls = setup('/dashboard/assessments/mhcu/invites')
    const u = userEvent.setup()
    await screen.findByRole('region', { name: 'Daftar undangan' })
    await u.type(screen.getByLabelText(/email klien/i), 'bukan-email')
    await u.click(screen.getByRole('button', { name: 'Buat tautan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/email klien tidak valid/i)
    expect(calls.some((c) => c.method === 'POST')).toBe(false)
  })

  it('shows the message of the server when creating fails', async () => {
    setup('/dashboard/assessments/mhcu/invites', 'admin', { inviteError: 'Psikolog tidak aktif.' })
    const u = userEvent.setup()
    await screen.findByRole('region', { name: 'Daftar undangan' })
    await u.click(screen.getByRole('button', { name: 'Buat tautan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Psikolog tidak aktif.')
  })

  it('cancels an open invitation after a confirmation', async () => {
    const calls = setup('/dashboard/assessments/mhcu/invites')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const u = userEvent.setup()
    const list = await screen.findByRole('region', { name: 'Daftar undangan' })
    await within(list).findAllByRole('listitem')
    await u.click(within(within(list).getAllByRole('listitem')[0] as HTMLElement).getByRole('button', { name: 'Batalkan' }))
    await screen.findByText('Undangan dibatalkan.')
    expect(calls.some((c) => c.method === 'DELETE' && c.url.endsWith('/invites/INV0002'))).toBe(true)
    expect(within(list).getByText('Dibatalkan')).toBeInTheDocument()
  })

  it('does not cancel when the confirmation is declined', async () => {
    const calls = setup('/dashboard/assessments/mhcu/invites')
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const u = userEvent.setup()
    const list = await screen.findByRole('region', { name: 'Daftar undangan' })
    await within(list).findAllByRole('listitem')
    await u.click(within(within(list).getAllByRole('listitem')[0] as HTMLElement).getByRole('button', { name: 'Batalkan' }))
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false)
  })

  it('is for admins only', async () => {
    setup('/dashboard/assessments/mhcu/invites', 'psychologist')
    await screen.findByText(/selamat datang|psikolog user/i)
    expect(screen.queryByRole('heading', { name: 'Tautan undangan' })).not.toBeInTheDocument()
  })

  it('keeps the header light: the invitation and settings pages are reached from the side menu, not from here', async () => {
    setup('/dashboard/assessments/mhcu')
    expect(await screen.findByRole('button', { name: 'Muat ulang' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Tautan undangan' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pengaturan' })).not.toBeInTheDocument()
  })
})
