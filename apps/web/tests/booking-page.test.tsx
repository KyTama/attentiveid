import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { BookingPsychologistCatalogItem } from '@attentiveid/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../src/i18n'
import { AppRoutes } from '../src/App'

const MOCK_PSYCHOLOGISTS: BookingPsychologistCatalogItem[] = [
  {
    id: 'psych-syazka-uuid',
    slug: 'syazka',
    name: 'Syazka Kirani Narindra',
    nickname: 'Syazka',
    credential: 'M.Psi., Psikolog',
    tier: 'senior',
    primaryBranch: 'tbi',
    acceptingNewClients: true,
    featured: true,
    featuredOrder: 1,
    experienceYears: 6,
    supportArea: 'adultClinical',
    specializations: {
      id: ['Karir & Burnout', 'Kecemasan'],
      en: ['Career & Burnout', 'Anxiety'],
    },
    shortBio: {
      id: 'Psikolog klinis dewasa.',
      en: 'Adult clinical psychologist.',
    },
    media: {
      url: '/images/psychologists/syazka.webp',
      width: 600,
      height: 750,
      alt: { id: 'Syazka Kirani Narindra', en: 'Syazka Kirani Narindra' },
    },
    consultationDuration: '±60 menit / sesi',
    onlineRate: 398000,
    offlineRate: 498000,
    availableOnline: true,
    availableTbi: true,
    availableBsd: false,
    availableMalang: false,
    scheduleMon: '10:00 - 17:00 Online (TBI)',
    scheduleTue: '10:00 - 17:00 Online (TBI)',
    scheduleWed: '10:00 - 17:00 Online (TBI)',
    scheduleThu: '10:00 - 17:00 Online (TBI)',
    scheduleFri: '10:00 - 17:00 Online (TBI)',
    scheduleSat: '10:00 - 17:00 Online (TBI)',
    scheduleSun: '10:00 - 17:00 Online (TBI)',
  },
  {
    id: 'psych-gita-uuid',
    slug: 'gita',
    name: 'Gita Purnama',
    nickname: 'Gita',
    credential: 'M.Psi., Psikolog',
    tier: 'mid',
    primaryBranch: 'childAdolescent' as unknown as 'bsd',
    acceptingNewClients: true,
    featured: true,
    featuredOrder: 2,
    experienceYears: 4,
    supportArea: 'childAdolescent',
    specializations: {
      id: ['Tumbuh Kembang Anak'],
      en: ['Child Development'],
    },
    consultationDuration: '±60 menit / sesi',
    onlineRate: 350000,
    offlineRate: 450000,
    availableOnline: true,
    availableTbi: false,
    availableBsd: true,
    availableMalang: false,
    scheduleMon: '09:00 - 16:00 Online (BSD)',
    scheduleTue: '09:00 - 16:00 Online (BSD)',
    scheduleWed: '09:00 - 16:00 Online (BSD)',
    scheduleThu: '09:00 - 16:00 Online (BSD)',
    scheduleFri: '09:00 - 16:00 Online (BSD)',
    scheduleSat: 'Off',
    scheduleSun: 'Off',
  },
]

describe('/booking page', () => {
  const fetchMock = vi.fn()

  beforeEach(async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    delete window.fbq
    await i18n.changeLanguage('id')

    fetchMock.mockReset()
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/public/booking/psychologists')) {
        return new Response(
          JSON.stringify({ ok: true, data: MOCK_PSYCHOLOGISTS }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/api/public/booking/submit') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              id: 'booking-uuid-1',
              bookingCode: 'ATT-261115-ABCD',
              status: 'pending',
              baseRate: 398000,
              assessmentFee: 150000,
              totalRate: 548000,
              crisisFlagTriggered: true,
              whatsappRouting: {
                adminRegion: 'TBI',
                whatsappNumber: '6285156410912',
              },
              createdAt: '2026-11-15T00:00:00Z',
            },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(JSON.stringify({ ok: false }), { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    delete window.fbq
    await i18n.changeLanguage('en')
  })

  it('completes the 6-step new client wizard with crisis triage, fee breakdown, and Meta Pixel Lead dedup', async () => {
    const user = userEvent.setup()
    const fbqMock = vi.fn()
    window.fbq = fbqMock

    render(
      <MemoryRouter initialEntries={['/booking']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    // Step 1: Status + contact + timezone
    await user.click(screen.getByRole('radio', { name: /belum, ini pertama kali/i }))
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Budi Santoso')
    await user.type(screen.getByLabelText(/nomor whatsapp aktif/i), '081234567890')
    await user.type(screen.getByLabelText(/alamat email/i), 'budi@example.com')
    await user.selectOptions(screen.getByLabelText(/negara tempat tinggal/i), 'indonesia')
    await user.selectOptions(screen.getByLabelText(/kota \/ wilayah tempat tinggal/i), 'id-wib')
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 2: Needs + live crisis safeguard banner
    await user.type(await screen.findByLabelText(/usia/i), '27')
    await user.selectOptions(screen.getByLabelText(/^gender/i), 'male')
    await user.selectOptions(screen.getByLabelText(/kategori kebutuhan utama/i), 'career_burnout')
    await user.type(
      screen.getByLabelText(/apa yang sedang ingin kamu bicarakan/i),
      'Belakangan saya sering terpikir ingin mengakhiri hidup',
    )

    expect(
      await screen.findByText(/kamu tidak sendirian — bantuan darurat tersedia 24\/7/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/119 ext 8/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 3: Session mode + self-pick matched psychologist + assessment fee notice
    await user.click(await screen.findByRole('radio', { name: /^online/i }))
    await user.click(screen.getByRole('radio', { name: /saya tetap ingin memilih psikolog sendiri/i }))

    expect(await screen.findByText(/rp 150\.000/i)).toBeInTheDocument()
    const matchBadges = await screen.findAllByText(/cocok dengan kebutuhanmu/i)
    expect(matchBadges.length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: /syazka kirani narindra/i }))
    await user.click(await screen.findByRole('button', { name: /pilih psikolog ini/i }))
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 4: Date + time selection
    await screen.findByRole('heading', { name: /kapan kamu ingin bertemu psikolog/i })
    const dateTrigger = document.getElementById('schedule-1-date')
    expect(dateTrigger).not.toBeNull()
    const dateContainer = dateTrigger!.parentElement!
    await user.click(dateTrigger!)

    let enabledDays = Array.from(dateContainer.querySelectorAll('button')).filter(
      (btn) => !btn.disabled && /^\d{1,2}$/.test(btn.textContent?.trim() ?? ''),
    )
    if (enabledDays.length === 0) {
      await user.click(within(dateContainer).getByRole('button', { name: /bulan berikutnya/i }))
      enabledDays = Array.from(dateContainer.querySelectorAll('button')).filter(
        (btn) => !btn.disabled && /^\d{1,2}$/.test(btn.textContent?.trim() ?? ''),
      )
    }
    expect(enabledDays.length).toBeGreaterThan(0)
    await user.click(enabledDays[0]!)

    const timeTrigger = document.getElementById('schedule-1-time')
    expect(timeTrigger).not.toBeNull()
    const timeContainer = timeTrigger!.parentElement!
    await user.click(timeTrigger!)
    await user.click(within(timeContainer).getAllByRole('button', { name: '10', exact: true })[0]!)
    await user.click(within(timeContainer).getAllByRole('button', { name: '00', exact: true })[0]!)
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 5: Terms & Conditions
    await user.click(await screen.findByRole('checkbox', { name: /saya telah membaca dan menyetujui/i }))
    await user.click(screen.getByRole('button', { name: /review booking/i }))

    // Step 6: Fee breakdown + Marketing source + Submit
    expect(await screen.findByText('Rp 398.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 548.000')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Instagram (@attentive.id)', exact: true }))
    await user.click(screen.getByRole('button', { name: /kirim booking/i }))

    // Step 7: Confirmation + WhatsApp link + Meta Pixel Lead event
    expect(await screen.findByText('ATT-261115-ABCD')).toBeInTheDocument()
    const waLink = screen.getByRole('link', { name: /konfirmasi via whatsapp admin/i })
    expect(waLink).toHaveAttribute('href', expect.stringContaining('https://wa.me/6285156410912'))
    expect(fbqMock).toHaveBeenCalledTimes(1)
    expect(fbqMock).toHaveBeenCalledWith('track', 'Lead', {}, { eventID: 'booking-uuid-1' })
  }, 15000)

  it('skips step 2 for returning clients', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/booking']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('radio', { name: /sudah pernah/i }))
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Citra Dewi')
    await user.type(screen.getByLabelText(/nomor whatsapp aktif/i), '081299988877')
    await user.type(screen.getByLabelText(/alamat email/i), 'citra@example.com')
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    expect(
      await screen.findByRole('heading', { name: /pilih cara konsultasi yang paling nyaman/i }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/kategori kebutuhan utama/i)).not.toBeInTheDocument()
  })

  it('redirects legacy /?intake=true&concern=career_burnout to /booking and supports ?psychologist= prefill', async () => {
    render(
      <MemoryRouter initialEntries={['/?intake=true&concern=career_burnout']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /yuk, mulai proses booking/i }),
      ).toBeInTheDocument()
    })

    const prefillRender = render(
      <MemoryRouter initialEntries={['/booking?psychologist=syazka']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/public/booking/psychologists'))
    })
    prefillRender.unmount()
  })
})
