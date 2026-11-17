import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ServicesAdminOverviewResponse } from '@attentiveid/shared'
import i18n from '../src/i18n'
import { AppRoutes } from '../src/App'
import { AuthProvider } from '../src/features/auth/auth-context'
import { ServiceDemoPage } from '../src/pages/ServiceDemoPage'
import { ServicesCmsPage } from '../src/pages/dashboard/ServicesCmsPage'

const MOCK_OVERVIEW: ServicesAdminOverviewResponse = {
  status: 'success',
  settings: {
    marginThreshold: 30,
    assumptions: {
      feePsikologPerJam: 500000,
      gatewayPct: 3,
      iklanTesPct: 20,
      iklanExpertPct: 10,
      feeHaykal: 0,
    },
  },
  stats: {
    totalServices: 53,
    byStatus: { published: 26, draft: 5, inactive: 21, archived: 1 },
    internalVisibilityCount: 9,
    lowMarginCount: 1,
    openIssuesCount: 2,
    avgCompletenessPct: 86,
  },
  categories: [
    { id: 'c1', slug: 'asesmen', position: 1, isFree: false, name: 'Asesmen Psikologi', nameId: 'Asesmen Psikologi', nameEn: 'Psychological Assessment' },
  ],
  subgroups: [],
  services: [
    {
      id: 's1',
      slug: 'aaa50',
      categoryId: 'c1',
      categorySlug: 'asesmen',
      categoryName: 'Asesmen Psikologi',
      subgroupId: null,
      subgroupSlug: null,
      subgroupName: null,
      serviceType: 'layanan',
      pricingModel: 'fixed_variant',
      appliesNewClientFee: false,
      isAssessment: true,
      isFeaturedSpotlight: false,
      position: 50,
      externalUrl: null,
      defaultConcernId: null,
      defaultClientCategory: null,
      audiences: ['Dewasa'],
      status: 'draft',
      visibility: 'internal',
      nameId: 'AAA-50 + ACT',
      nameEn: 'AAA-50 + ACT',
      fullNameId: null,
      fullNameEn: null,
      badgeId: null,
      badgeEn: null,
      shortSummaryId: 'Internal assessment package',
      shortSummaryEn: null,
      benefitId: 'Evaluasi klinis',
      benefitEn: null,
      introductionId: null,
      introductionEn: null,
      targetAudienceId: null,
      targetAudienceEn: null,
      whatIsMeasuredId: null,
      whatIsMeasuredEn: null,
      durationInfoId: null,
      durationInfoEn: null,
      locationInfoId: null,
      locationInfoEn: null,
      resultsExplanationId: null,
      resultsExplanationEn: null,
      scientificBasisId: null,
      scientificBasisEn: null,
      processStepsId: [],
      processStepsEn: [],
      termsId: [],
      termsEn: [],
      cardImageUrl: null,
      linkedPsychologistSlugs: ['haykal'],
      variants: [
        {
          id: 'v1',
          slug: 'v-aaa50',
          position: 0,
          status: 'draft',
          visibility: 'internal',
          nameId: 'Paket Standar',
          nameEn: 'Standard Package',
          descriptionId: null,
          descriptionEn: null,
          unitLabelId: 'per orang',
          unitLabelEn: null,
          ageRangeLabelId: null,
          ageRangeLabelEn: null,
          durationLabelId: null,
          durationLabelEn: null,
          modalities: ['online'],
          branch: null,
          priceOnRequest: false,
          publicPriceAmount: 1000000,
          publicPriceMax: 1000000,
          publicEffectiveDate: '2026-11-01',
        },
      ],
      completenessPct: 58,
      completenessChecks: [],
      openIssuesCount: 1,
      lowestMarginPct: 22.5,
      lowestPriceAmount: 1000000,
    },
  ],
  ledgerRows: [
    {
      key: 'v1:general',
      serviceId: 's1',
      serviceSlug: 'aaa50',
      serviceName: 'AAA-50 + ACT',
      categoryName: 'Asesmen Psikologi',
      serviceStatus: 'draft',
      visibility: 'internal',
      variantId: 'v1',
      variantSlug: 'v-aaa50',
      variantName: 'Paket Standar',
      variantStatus: 'draft',
      unitLabel: 'per orang',
      psychologistId: null,
      psychologistSlug: null,
      psychologistName: 'Dr. Haykal',
      berlakuPrice: 1000000,
      berlakuPriceMax: 1000000,
      priceSource: 'service_public_prices',
      feeAmount: 700000,
      directCostAmount: 75000,
      margin: { gross: 225000, pct: 22.5 },
      promoAmount: null,
      promoProgramName: null,
      promoMargin: null,
      usulanAmounts: [1200000],
      historisCount: 1,
    },
  ],
  costRecords: [],
  programs: [],
  issues: [
    {
      id: 'i1',
      code: 'di-01',
      issueType: 'Perlu Verifikasi',
      title: 'Verifikasi tarif AAA-50',
      detail: 'Cek kesesuaian margin internal.',
      status: 'Terbuka',
      resolution: null,
      refs: [],
      createdAt: '2026-11-10T00:00:00Z',
      resolvedAt: null,
    },
  ],
  psychologists: [],
  auditLogs: [],
}

describe('Phase 2 Cognitive Demos & AAA-50 + Phase 3 Superadmin Ops', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('id')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders /services/demo with 4 cognitive tasks and in-memory AAA-50 questionnaire', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/services/demo']}>
        <ServiceDemoPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /coba tugas kognitif lengkap/i })).toBeInTheDocument()
    expect(screen.getByText('Tugas Huruf X')).toBeInTheDocument()
    expect(screen.getByText('Tugas Panah & Rem')).toBeInTheDocument()
    expect(screen.getByText('Tugas Ingat Huruf')).toBeInTheDocument()
    expect(screen.getByText('Tugas Lingkaran & Kotak')).toBeInTheDocument()

    // Brand gold topbar logo must not have whitewash inversion filter
    const logoImg = screen.getByAltText('Attentive.id')
    expect(logoImg.className).not.toContain('brightness-0')
    expect(logoImg.className).not.toContain('invert')

    // Launch AAA-50 modal, start, proceed to Part A question 1, pick an option
    await user.click(screen.getByRole('button', { name: /isi kuesioner/i }))
    expect(screen.getByRole('dialog', { name: /kuesioner aaa-50/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /mulai kuesioner/i }))
    await user.click(screen.getByRole('button', { name: /mulai bagian ini/i }))
    expect(screen.getByText(/1 dari 50/i)).toBeInTheDocument()

    // Ensure AAA-50 does not write answers into sessionStorage or localStorage
    expect(window.sessionStorage.getItem('apd-aaa50')).toBeNull()
  })

  it('blocks admin role from /dashboard/services (403) while allowing superadmin', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.includes('/api/auth/refresh')) {
        return new Response(
          JSON.stringify({
            status: 'success',
            accessToken: 'admin-jwt',
            user: {
              id: 'u-admin',
              email: 'admin@attentive.id',
              name: 'Admin Biasa',
              role: 'admin',
              status: 'active',
              psychologistId: null,
              lastLoginAt: null,
              createdAt: '2026-09-01T00:00:00Z',
              updatedAt: '2026-09-01T00:00:00Z',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    })

    render(
      <MemoryRouter initialEntries={['/dashboard/services']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText(/403 -/i)).toBeInTheDocument()
  })

  it('renders ServicesCmsPage with 53-product overview, low margin alerts, ledger tab, and issues', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.url
      if (url.includes('/api/admin/services/overview')) {
        return new Response(JSON.stringify(MOCK_OVERVIEW), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    })

    render(
      <MemoryRouter initialEntries={['/dashboard/services']}>
        <ServicesCmsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /produk, tarif & margin internal/i })).toBeInTheDocument()
    expect(screen.getByText('53')).toBeInTheDocument()
    expect(screen.getByText('22.5%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /buka mode demo internal/i })).toHaveAttribute(
      'href',
      '/services?preview=internal',
    )

    await user.click(screen.getByRole('button', { name: /katalog produk \(53\)/i }))
    expect(screen.getByText('AAA-50 + ACT')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /harga, fee & margin/i }))
    expect(screen.getByText('Dr. Haykal')).toBeInTheDocument()
    expect(fireEvent.click(screen.getByRole('button', { name: /data issues \(2\)/i }))).toBe(true)
    expect(screen.getByText('Verifikasi tarif AAA-50')).toBeInTheDocument()
  })
})
