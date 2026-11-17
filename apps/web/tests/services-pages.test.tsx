import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicServiceCatalogResponse, PublicServiceDetail } from '@attentiveid/shared'
import i18n from '../src/i18n'
import { AppRoutes } from '../src/App'

const MOCK_CATALOG: PublicServiceCatalogResponse = {
  locale: 'id',
  categories: [
    { id: 'cat-asesmen', slug: 'asesmen', position: 0, isFree: false, name: 'Asesmen Psikologi' },
    { id: 'cat-konseling', slug: 'konseling', position: 1, isFree: false, name: 'Konseling/Terapi' },
    { id: 'cat-tambahan', slug: 'tambahan', position: 2, isFree: false, name: 'Layanan Tambahan' },
  ],
  subgroups: [
    { id: 'sg-utama', categoryId: 'cat-asesmen', slug: 'utama', position: 0, name: 'Paket & tes utama', note: null },
  ],
  activePrograms: [
    {
      id: 'prog-1',
      slug: 'edisi-nov-2026-apr-2027',
      name: 'Promo edisi November 2026 sampai April 2027',
      badge: 'Promo',
      programType: 'harga',
      startsOn: '2026-11-01',
      endsOn: '2027-04-30',
    },
  ],
  services: [
    {
      id: 'svc-acm',
      slug: 'acm-y48',
      categoryId: 'cat-asesmen',
      categorySlug: 'asesmen',
      categoryName: 'Asesmen Psikologi',
      subgroupId: 'sg-utama',
      subgroupSlug: 'utama',
      subgroupName: 'Paket & tes utama',
      serviceType: 'layanan',
      pricingModel: 'fixed_variant',
      appliesNewClientFee: false,
      isAssessment: true,
      isFeaturedSpotlight: true,
      position: 0,
      name: 'Tes Minat Karier (ACM-Y48)',
      badge: 'Promo',
      shortSummary: 'Asesmen minat karier enam tipe.',
      benefit: 'Memetakan minat kerja.',
      audiences: ['Dewasa'],
      modalities: ['online'],
      hasMalangBranch: false,
      priceRange: {
        minAmount: 1_085_000,
        maxAmount: 1_085_000,
        isRange: false,
        variesByProvider: false,
        promoAmount: 485_000,
        promoBadge: 'Promo',
        promoNote: 'Termasuk sesi 1 jam bersama pakar Dr. Haykal.',
        programSlug: 'edisi-nov-2026-apr-2027',
      },
      cardMedia: {
        url: '/media/services/cards/r-minat.webp',
        width: 800,
        height: 450,
        alt: 'Ilustrasi Tes Minat Karier',
      },
      variants: [
        {
          id: 'var-acm',
          slug: 'v-acm-y48',
          position: 0,
          name: 'Paket Standar',
          description: null,
          unitLabel: 'per orang',
          ageRangeLabel: null,
          durationLabel: '45 menit',
          modalities: ['online'],
          branch: null,
          priceOnRequest: false,
          pricing: {
            minAmount: 1_085_000,
            maxAmount: 1_085_000,
            isRange: false,
            variesByProvider: false,
            promoAmount: 485_000,
            promoBadge: 'Promo',
            promoNote: 'Termasuk sesi 1 jam bersama pakar Dr. Haykal.',
            programSlug: 'edisi-nov-2026-apr-2027',
          },
        },
      ],
      bookingPreset: {
        bookable: true,
        bookingPath: '/booking?service=acm-y48',
        externalUrl: null,
        defaultConcernId: 'career',
        defaultClientCategory: 'individual',
        requiresInitialCounseling: false,
      },
    },
    {
      id: 'svc-iq',
      slug: 'tes-iq',
      categoryId: 'cat-asesmen',
      categorySlug: 'asesmen',
      categoryName: 'Asesmen Psikologi',
      subgroupId: 'sg-utama',
      subgroupSlug: 'utama',
      subgroupName: 'Paket & tes utama',
      serviceType: 'layanan',
      pricingModel: 'fixed_variant',
      appliesNewClientFee: false,
      isAssessment: true,
      isFeaturedSpotlight: false,
      position: 1,
      name: 'Tes IQ Individual (Wechsler)',
      badge: null,
      shortSummary: 'Tes kecerdasan individual standar Wechsler.',
      benefit: 'Mengukur profil kemampuan kognitif.',
      audiences: ['Anak', 'Dewasa'],
      modalities: ['offline'],
      hasMalangBranch: false,
      priceRange: {
        minAmount: 2_485_000,
        maxAmount: 2_485_000,
        isRange: false,
        variesByProvider: false,
        promoAmount: 2_100_000,
        promoBadge: 'Promo',
        promoNote: null,
        programSlug: 'edisi-nov-2026-apr-2027',
      },
      cardMedia: null,
      variants: [
        {
          id: 'var-iq',
          slug: 'v-iq-2026',
          position: 0,
          name: 'Tes + Laporan + Konsultasi',
          description: null,
          unitLabel: 'per orang',
          ageRangeLabel: '4+ tahun',
          durationLabel: '90 menit',
          modalities: ['offline'],
          branch: null,
          priceOnRequest: false,
          pricing: {
            minAmount: 2_485_000,
            maxAmount: 2_485_000,
            isRange: false,
            variesByProvider: false,
            promoAmount: 2_100_000,
            promoBadge: 'Promo',
            promoNote: null,
            programSlug: 'edisi-nov-2026-apr-2027',
          },
        },
      ],
      bookingPreset: {
        bookable: true,
        bookingPath: '/booking?service=tes-iq',
        externalUrl: null,
        defaultConcernId: 'academic',
        defaultClientCategory: 'individual',
        requiresInitialCounseling: false,
      },
    },
    {
      id: 'svc-addon',
      slug: 'addon-weekend',
      categoryId: 'cat-tambahan',
      categorySlug: 'tambahan',
      categoryName: 'Layanan Tambahan',
      subgroupId: null,
      subgroupSlug: null,
      subgroupName: null,
      serviceType: 'addon',
      pricingModel: 'fixed_variant',
      appliesNewClientFee: false,
      isAssessment: false,
      isFeaturedSpotlight: false,
      position: 2,
      name: 'Biaya Akhir Pekan atau Libur Nasional',
      badge: null,
      shortSummary: 'Tambahan akhir pekan.',
      benefit: null,
      audiences: [],
      modalities: ['offline'],
      hasMalangBranch: false,
      priceRange: {
        minAmount: 50_000,
        maxAmount: 50_000,
        isRange: false,
        variesByProvider: false,
        promoAmount: null,
        promoBadge: null,
        promoNote: null,
        programSlug: null,
      },
      cardMedia: null,
      variants: [],
      bookingPreset: {
        bookable: false,
        bookingPath: null,
        externalUrl: null,
        defaultConcernId: 'other',
        defaultClientCategory: 'individual',
        requiresInitialCounseling: false,
      },
    },
  ],
}

const DETAIL_ACM: PublicServiceDetail = {
  ...MOCK_CATALOG.services[0]!,
  fullName: 'Attentive Career Map Y48',
  introduction: 'Asesmen minat karier enam tipe berbasis RIASEC.',
  targetAudience: 'Mahasiswa dan pekerja.',
  whatIsMeasured: 'Enam tipe minat karier.',
  durationInfo: '45 menit',
  locationInfo: 'Online',
  processSteps: ['Isi tes online', 'Terima laporan & sesi pakar'],
  terms: ['Hasil maksimal 3 hari kerja'],
  resultsExplanation: 'Persentil dibandingkan norma.',
  scientificBasis: 'Holland RIASEC.',
  citationSummary: null,
  reportPreviews: [
    {
      url: '/media/services/reports/gambar-3.webp',
      width: 510,
      height: 415,
      alt: 'Tes Minat: peta enam tipe',
    },
  ],
  eligiblePsychologists: [
    {
      id: 'psych-haykal',
      slug: 'haykal',
      name: 'Dr. Haykal Hafizul Arifin',
      nickname: 'Haykal',
      credential: 'S.Psi., M.Si.',
      tier: 'consultant',
      primaryBranch: 'tbi',
      experienceYears: 12,
      onlineRate: null,
      offlineRate: null,
      availableOnline: false,
      availableTbi: false,
      availableBsd: false,
      availableMalang: false,
      note: 'Sesi 1 jam bersama pakar untuk paket dengan sesi.',
      media: {
        url: '/media/psychologists/haykal.webp',
        width: 600,
        height: 750,
        alt: 'Foto profil Dr. Haykal',
      },
    },
  ],
  deliverables: [{ id: 'del-1', position: 0, variantSlugs: ['v-acm-y48'], text: 'Laporan PDF 6 tipe minat' }],
  faqs: [{ id: 'faq-1', position: 0, question: 'Berapa lama pengerjaan?', answer: 'Sekitar 30-45 menit.' }],
  references: [
    {
      id: 'ref-1',
      code: 'r1',
      citationText: 'Holland, J. L. (1997). Making vocational choices.',
      doiUrl: 'https://doi.org/10.1000/test-doi',
    },
  ],
  assessmentDetails: {
    purpose: 'Memetakan arah karier.',
    aspects: 'Realistic, Investigative, Artistic, Social, Enterprising, Conventional',
    ageRange: '16+ tahun',
    method: 'Kuesioner daring',
    preparation: 'Koneksi internet stabil',
    outputFormat: 'Laporan PDF + sesi interpretasi',
    dimensions: ['RIASEC'],
    reportType: 'Profil individu',
    interpretation: 'Sesi 1 jam',
    recommendations: 'Rekomendasi jurusan & karier',
    turnaround: '3 hari kerja',
  },
}

const DETAIL_IQ: PublicServiceDetail = {
  ...MOCK_CATALOG.services[1]!,
  fullName: null,
  introduction: 'Asesmen IQ Wechsler.',
  targetAudience: 'Anak dan dewasa.',
  whatIsMeasured: 'Kemampuan intelektual.',
  durationInfo: '90 menit',
  locationInfo: 'Offline di cabang Attentive',
  processSteps: [],
  terms: [],
  resultsExplanation: null,
  scientificBasis: null,
  citationSummary: null,
  reportPreviews: [],
  eligiblePsychologists: [],
  deliverables: [],
  faqs: [],
  references: [],
  assessmentDetails: null,
}

describe('Standalone /services catalog, detail, chooser & /booking bridge', () => {
  const fetchMock = vi.fn()

  beforeEach(async () => {
    window.localStorage.clear()
    await i18n.changeLanguage('id')
    fetchMock.mockReset()
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/content/services/acm-y48')) {
        return new Response(JSON.stringify({ status: 'found', service: DETAIL_ACM }), { status: 200 })
      }
      if (url.includes('/api/content/services/tes-iq')) {
        return new Response(JSON.stringify({ status: 'found', service: DETAIL_IQ }), { status: 200 })
      }
      if (url.includes('/api/content/services')) {
        return new Response(JSON.stringify({ status: 'found', catalog: MOCK_CATALOG }), { status: 200 })
      }
      if (url.includes('/api/public/booking/psychologists')) {
        return new Response(JSON.stringify({ status: 'success', data: [] }), { status: 200 })
      }
      if (url.includes('/api/public/booking/submit') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            status: 'success',
            data: {
              id: 'booking-svc-1',
              bookingCode: 'ATT-2611-SVC01',
              submittedAt: '2026-11-16T03:00:00.000Z',
              baseRate: 2_100_000,
              assessmentFee: 0,
              totalRate: 2_100_000,
              whatsappRouting: { target: 'pusat', whatsappNumber: '6285156410912' },
            },
          }),
          { status: 201 },
        )
      }
      return new Response('{}', { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders standalone /services without landing chrome, hides addon cards, and handles crisis guard in assistant', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/services']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /menu layanan & asesmen psikologi/i })).toBeInTheDocument()
    // Standalone topbar without landing SiteHeader's "Our Science" dropdown
    expect(screen.queryByRole('button', { name: /our science|riset kami/i })).not.toBeInTheDocument()
    // Add-ons must be hidden from primary cards
    expect(screen.queryByText(/Biaya Akhir Pekan/i)).not.toBeInTheDocument()
    // Spotlight & cards render
    expect(screen.getAllByText(/Tes Minat Karier \(ACM-Y48\)/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Tes IQ Individual \(Wechsler\)/i).length).toBeGreaterThan(0)

    // Open ServiceAssistantModal
    await user.click(screen.getAllByRole('button', { name: /bantu pilih/i })[0]!)
    const dialog = await screen.findByRole('dialog')
    const searchInput = within(dialog).getByLabelText(/cari atau ceritakan singkat kebutuhan anda/i)

    await user.type(searchInput, 'saya ingin bunuh diri')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/119|112/)
    expect(within(dialog).queryByText(/Tes Minat Karier/i)).not.toBeInTheDocument()
  })

  it('renders /services/acm-y48 with haykal, DOI reference, FAQ, lightbox, and /booking prefill link', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/services/acm-y48']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /Tes Minat Karier \(ACM-Y48\)/i })).toBeInTheDocument()
    expect(screen.getByText(/Dr\. Haykal Hafizul Arifin/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /doi/i })).toHaveAttribute('href', 'https://doi.org/10.1000/test-doi')

    // New-client fee notice must NOT show on fixed_variant service
    expect(screen.queryByText(/biaya pendaftaran & asesmen awal/i)).not.toBeInTheDocument()

    // Select Dr. Haykal and verify /booking link params
    await user.click(screen.getByRole('button', { name: /Dr\. Haykal Hafizul Arifin/i }))
    const bookLink = screen.getByRole('link', { name: /lanjut ke booking/i })
    expect(bookLink).toHaveAttribute('href', '/booking?service=acm-y48&variant=v-acm-y48&psychologist=haykal&mode=online')
  })

  it('bridges fixed_variant tes-iq into /booking without new-client fee and auto-skips psychologist choice', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/booking?service=tes-iq&variant=v-iq-2026&mode=offline&location=tbi']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Layanan Terpilih/i)).toBeInTheDocument()
    expect(screen.getByText(/Tes IQ Individual \(Wechsler\) — Tes \+ Laporan \+ Konsultasi/i)).toBeInTheDocument()

    // Step 1
    await user.click(screen.getByRole('radio', { name: /belum, ini pertama kali/i }))
    await user.type(screen.getByLabelText(/nama lengkap/i), 'Andi Wijaya')
    await user.type(screen.getByLabelText(/nomor whatsapp/i), '081234567890')
    await user.type(screen.getByLabelText(/alamat email/i), 'andi@example.com')
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 2
    await user.type(await screen.findByLabelText(/usia/i), '22')
    await user.selectOptions(screen.getByLabelText(/^gender/i), 'male')
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 3: fixed_variant without providers shows team notice and no psychologist choice radios
    expect(await screen.findByText(/Ditangani oleh Tim Psikolog & Asesor Attentive/i)).toBeInTheDocument()
    expect(screen.queryByText(/Saya tetap ingin memilih psikolog sendiri/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 4: Schedule
    await screen.findByRole('heading', { name: /kapan kamu ingin bertemu psikolog/i })
    const dateTrigger = document.getElementById('schedule-1-date')!
    const dateContainer = dateTrigger.parentElement!
    await user.click(dateTrigger)
    let enabledDays = Array.from(dateContainer.querySelectorAll('button')).filter(
      (btn) => !btn.disabled && /^\d{1,2}$/.test(btn.textContent?.trim() ?? ''),
    )
    if (enabledDays.length === 0) {
      await user.click(within(dateContainer).getByRole('button', { name: /bulan berikutnya/i }))
      enabledDays = Array.from(dateContainer.querySelectorAll('button')).filter(
        (btn) => !btn.disabled && /^\d{1,2}$/.test(btn.textContent?.trim() ?? ''),
      )
    }
    await user.click(enabledDays[0]!)
    const timeTrigger = document.getElementById('schedule-1-time')!
    const timeContainer = timeTrigger.parentElement!
    await user.click(timeTrigger)
    await user.click(within(timeContainer).getAllByRole('button', { name: '10', exact: true })[0]!)
    await user.click(within(timeContainer).getAllByRole('button', { name: '00', exact: true })[0]!)
    await user.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 5: Terms
    await user.click(await screen.findByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /review booking/i }))

    // Step 6: Review shows fixed service rate without Rp 150.000 assessment fee
    expect(await screen.findByText(/Tarif Layanan/i)).toBeInTheDocument()
    expect(screen.queryByText(/Biaya Asesmen Awal/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/Rp 2\.100\.000/).length).toBeGreaterThanOrEqual(2)

    await user.click(screen.getByRole('button', { name: 'Instagram', exact: true }))
    await user.click(screen.getByRole('button', { name: /kirim booking/i }))

    await waitFor(() => {
      expect(screen.getByText(/ATT-2611-SVC01/)).toBeInTheDocument()
    })

    const submitCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/api/public/booking/submit'))
    expect(submitCall).toBeDefined()
    const payload = JSON.parse(String((submitCall?.[1] as RequestInit).body))
    expect(payload.serviceSlug).toBe('tes-iq')
    expect(payload.variantSlug).toBe('v-iq-2026')
    expect(payload.psychologistChoice).toBe('recommended')
  }, 15000)
})
