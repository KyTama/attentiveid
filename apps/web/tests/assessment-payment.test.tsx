import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../src/App'
import i18n from '../src/i18n'
import { buildPaymentWhatsAppMessage, buildPaymentWhatsAppUrl, formatRupiah } from '../src/features/assessments/payment'

const single = { key: 'single' as const, labelId: 'Laporan Lengkap MHCU (1x pemeriksaan)', labelEn: 'Full MHCU report (1 check-up)', amount: 227_000, normal: 297_000 }

describe('WhatsApp confirmation message', () => {
  it('is in Bahasa by default and holds the name, what was paid for, the result ID and a request to confirm', () => {
    const message = buildPaymentWhatsAppMessage({ name: 'Rina Pratiwi', code: 'AT-MHCU-2026-100', option: single })
    expect(message).toContain('Halo Attentive')
    expect(message).toContain('Nama: Rina Pratiwi')
    expect(message).toContain('Pembayaran untuk: Laporan Lengkap MHCU (1x pemeriksaan) (Rp 227.000)')
    expect(message).toContain('ID Hasil: AT-MHCU-2026-100')
    expect(message).toContain('Mohon bantu konfirmasi pembayaran saya')
  })

  it('switches to English only when asked, and builds a wa.me link with the encoded text', () => {
    expect(buildPaymentWhatsAppMessage({ name: 'Rina', code: 'X', option: single, lang: 'en' })).toContain('Please confirm my payment')
    const url = buildPaymentWhatsAppUrl({ whatsapp: '6285156410912', name: 'Rina', code: 'AT-MHCU-2026-100', option: single })
    expect(url.startsWith('https://wa.me/6285156410912?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('ID Hasil: AT-MHCU-2026-100')
    expect(formatRupiah(1234567)).toBe('Rp 1.234.567')
  })
})

describe('payment page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (String(url).includes('payment-info') && String(url).includes('t=good')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              status: 'success',
              data: {
                code: 'AT-MHCU-2026-100',
                name: 'Rina Pratiwi',
                lang: 'id',
                submitted: false,
                account: { bank: 'BCA', number: '4500499562', holder: 'Atensi Kini Group PT' },
                whatsapp: '6285156410912',
                options: [single, { key: 'package3', labelId: 'Paket 3x', labelEn: 'Package of 3', amount: 647_000, normal: 885_000 }],
              },
            }),
          })
        }
        return Promise.resolve({ ok: false, status: 404, json: async () => ({ message: 'Tautan tidak valid.' }) })
      }),
    )
  })
  afterEach(() => vi.restoreAllMocks())

  const open = (query: string) =>
    render(
      <MemoryRouter initialEntries={[`/assessments/payment${query}`]}>
        <AppRoutes />
      </MemoryRouter>,
    )

  it('shows the bank account, the options, the proof upload and the Save & Reach Us button, in Bahasa by default', async () => {
    open('?id=AT-MHCU-2026-100&t=good')
    expect(await screen.findByText('4500499562')).toBeTruthy()
    expect(screen.getByText('Atensi Kini Group PT')).toBeTruthy()
    expect(screen.getByText('Rek. BCA')).toBeTruthy()
    expect(screen.getAllByText('Rp 227.000').length).toBeGreaterThan(0)
    expect(screen.getByText('Simpan & Hubungi Kami')).toBeTruthy()
    expect(screen.getByText(/Unggah bukti transfer/)).toBeTruthy()
  })

  it('refuses an invalid link without showing any payment details', async () => {
    open('?id=AT-MHCU-2026-100&t=bad')
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(screen.queryByText('4500499562')).toBeNull()
  })
})

describe('payment page: bad link in English', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: 'Tautan tidak valid.' }) }))
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows the error in English when the link asks for English', async () => {
    render(
      <MemoryRouter initialEntries={['/assessments/payment?id=X&t=bad&lang=en']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('This link is not valid'))
  })
})
