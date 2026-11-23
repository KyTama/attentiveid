import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'

const single = { key: 'single', labelId: 'Laporan Lengkap MHCU (1x pemeriksaan)', labelEn: 'Full MHCU report (1 check-up)', amount: 227_000, normal: 297_000 }
const pack = { key: 'package3', labelId: 'Paket 3x', labelEn: 'Package of 3', amount: 647_000, normal: 885_000 }

const base = {
  state: 'locked', paymentStatus: 'UNPAID', psychologist: null, waveNo: 1, creditsRemaining: 0, priceDue: null, package: null,
  code: 'AT-MHCU-2026-120', name: 'Andini Rahmawati', lang: 'id', submitted: false, mhi: 78.3, level: 1, levelName: { id: 'Baik', en: 'Good' },
  track: 'mandiri', account: { bank: 'BCA', number: '4500499562', holder: 'Atensi Kini Group PT' }, whatsapp: '6285156410912', options: [single, pack],
}

interface Seen { method: string; url: string }

function open(data: Record<string, unknown>, query = '') {
  const seen: Seen[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      seen.push({ method: init?.method ?? 'GET', url: String(url) })
      if (init?.method === 'POST') return { ok: true, status: 201, json: async () => ({ status: 'success' }) }
      return { ok: true, status: 200, json: async () => ({ status: 'success', data: { ...base, ...data } }) }
    }),
  )
  render(
    <MemoryRouter initialEntries={[`/assessments/payment?id=AT-MHCU-2026-120&t=tok123${query}`]}>
      <AppRoutes />
    </MemoryRouter>,
  )
  return seen
}

const eyebrow = (container: HTMLElement) => container.querySelector('.eyebrow')?.textContent ?? ''

describe('report-access page per track and state', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('mandiri, still to buy: the page of today (options, payment details, upload)', async () => {
    open({})
    expect(await screen.findByText('Dapatkan laporan lengkap')).toBeInTheDocument()
    expect(document.querySelector('.eyebrow')?.textContent).toBe('Laporan lengkap belum dibeli')
    expect(screen.getByText('Rek. BCA')).toBeInTheDocument()
    expect(screen.getByText('Simpan & Hubungi Kami')).toBeInTheDocument()
    expect(screen.getByText('Ditugaskan setelah pembelian')).toBeInTheDocument()
  })

  it('a proof already sent (also after a reload): "bukti transfer diterima, menunggu konfirmasi", no buying, no upload', async () => {
    open({ submitted: true })
    expect(await screen.findByText('Laporan sedang disiapkan')).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Bukti transfer diterima, menunggu konfirmasi')
    expect(screen.queryByText('Simpan & Hubungi Kami')).not.toBeInTheDocument()
    expect(screen.queryByText('Laporan lengkap belum dibeli')).not.toBeInTheDocument()
  })

  it('says it in English too', async () => {
    open({ submitted: true }, '&lang=en')
    expect(await screen.findByText('Your report is being prepared')).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Proof of transfer received, awaiting confirmation')
  })

  it('right after the upload the eyebrow changes without a reload', async () => {
    const seen = open({})
    vi.spyOn(window, 'open').mockReturnValue(null)
    const u = userEvent.setup()
    await screen.findByText('Dapatkan laporan lengkap')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await u.upload(input, new File(['x'], 'bukti.png', { type: 'image/png' }))
    await u.click(screen.getByText('Simpan & Hubungi Kami'))
    await waitFor(() => expect(eyebrow(document.body)).toBe('Bukti transfer diterima, menunggu konfirmasi'))
    expect(seen.some((s) => s.method === 'POST' && s.url.endsWith('/api/public/assessments/payment'))).toBe(true)
  })

  it('lanjutan, waiting for payment: the price asked by the psychologist, no options, no upload', async () => {
    open({ track: 'lanjutan', priceDue: 200_000, psychologist: 'Syazka Kirani Narindra, M.Psi., Psikolog.', waveNo: 5 })
    expect(await screen.findByText('Akses laporan lengkap')).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Menunggu pembayaran')
    expect(screen.getByText('Rp 200.000')).toBeInTheDocument()
    expect(screen.getByText('Syazka Kirani Narindra, M.Psi., Psikolog.')).toBeInTheDocument()
    expect(screen.getByText('2 halaman (hasil + perkembangan)')).toBeInTheDocument()
    expect(screen.getByText(/Silakan hubungi Admin Attentive melalui WhatsApp/)).toBeInTheDocument()
    expect(screen.queryByText('Simpan & Hubungi Kami')).not.toBeInTheDocument()
    expect(screen.queryByText('Beli 1x')).not.toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Hubungi admin via WhatsApp' })
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('AT-MHCU-2026-120')
  })

  it('lanjutan without an agreed price says "Sesuai kesepakatan" (English: "As agreed")', async () => {
    open({ track: 'lanjutan', priceDue: null })
    expect(await screen.findByText('Sesuai kesepakatan')).toBeInTheDocument()
  })

  it('lanjutan in English', async () => {
    open({ track: 'lanjutan', priceDue: null }, '&lang=en')
    expect(await screen.findByText('As agreed')).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Awaiting payment')
    expect(screen.getByRole('link', { name: 'Contact admin on WhatsApp' })).toBeInTheDocument()
  })

  it.each([
    ['asesmen', 'Laporan lengkap sudah termasuk dalam asesmen awal Anda.'],
    ['free', 'Laporan lengkap ini gratis sebagai bagian dari free session Anda.'],
    ['paket', 'Pemeriksaan ini memakai kuota paket 3x Anda (sisa 2).'],
  ])('%s, locked: the track sentence and "Menunggu psikolog meninjau", no prices, no upload', async (track, sentence) => {
    open({ track, creditsRemaining: 2 })
    expect(await screen.findByText('Laporan sedang disiapkan')).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Menunggu psikolog meninjau')
    expect(document.querySelector('.muted')?.textContent).toContain(sentence)
    expect(document.body.textContent).not.toContain('Rp ')
    expect(screen.queryByText('Simpan & Hubungi Kami')).not.toBeInTheDocument()
    expect(screen.queryByText('Beli 1x')).not.toBeInTheDocument()
    expect(document.querySelector('input[type="file"]')).toBeNull()
    expect(screen.getByText('Akan ditugaskan')).toBeInTheDocument()
  })

  it('the track sentences in English', async () => {
    open({ track: 'paket', creditsRemaining: 1, state: 'pending' }, '&lang=en')
    expect(await screen.findByText(/This check-up uses a credit from your package of 3 \(1 left\)\./)).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Being reviewed by your psychologist')
  })

  it('mandiri, payment confirmed by the admin (no proof): "Pembayaran Anda sudah kami terima."', async () => {
    open({ state: 'pending', paymentStatus: 'PAID', psychologist: 'Dr. Satu' })
    expect(await screen.findByText(/Pembayaran Anda sudah kami terima\./)).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Sedang ditinjau psikolog')
    expect(screen.getByText('Dr. Satu')).toBeInTheDocument()
  })

  it('mandiri, proof sent and then confirmed: the confirmed view, not "awaiting confirmation" again', async () => {
    open({ state: 'pending', paymentStatus: 'PAID', submitted: true })
    expect(await screen.findByText(/Pembayaran Anda sudah kami terima\./)).toBeInTheDocument()
    expect(eyebrow(document.body)).toBe('Sedang ditinjau psikolog')
  })

  it('released: a button opens the report with the code and the token of the link, and the hint says it can be saved as PDF', async () => {
    open({ state: 'ready', psychologist: 'Dr. Satu', track: 'lanjutan' })
    const button = await screen.findByRole('link', { name: 'Buka laporan' })
    expect(button).toHaveAttribute('href', '/api/public/assessments/report?id=AT-MHCU-2026-120&t=tok123')
    expect(button).toHaveAttribute('target', '_blank')
    expect(eyebrow(document.body)).toBe('Siap dibuka')
    expect(screen.getByText(/Simpan sebagai PDF/)).toBeInTheDocument()
    expect(document.querySelector('.doc .lock')).toBeNull()
  })

  it('released, in English', async () => {
    open({ state: 'ready' }, '&lang=en')
    expect(await screen.findByRole('link', { name: 'Open the report' })).toBeInTheDocument()
    expect(screen.getByText(/choose Print, then Save as PDF/)).toBeInTheDocument()
  })

  it('a locked page still shows the lock on the document picture', async () => {
    open({})
    await screen.findByText('Dapatkan laporan lengkap')
    expect(document.querySelector('.doc .lock')).not.toBeNull()
  })

  it('an old answer without state and track still gives today\'s page', async () => {
    open({ state: undefined, track: undefined, psychologist: undefined, waveNo: undefined })
    expect(await screen.findByText('Dapatkan laporan lengkap')).toBeInTheDocument()
  })

  it('keeps the crisis note on every state', async () => {
    open({ state: 'ready' })
    await screen.findByRole('link', { name: 'Buka laporan' })
    expect(document.querySelector('.note')?.textContent).toContain('119')
  })
})
