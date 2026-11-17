import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Building2,
  MapPin,
  Monitor,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import type {
  PublicServiceCatalogResponse,
  ServiceModality,
  SuperadminPreviewCatalogResponse,
  SuperadminPreviewServiceSummary,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useOptionalAuth } from '@/features/auth/auth-context'
import { fetchSuperadminPreviewCatalog } from '@/features/services-admin/api'
import { ServiceAssistantModal } from '@/features/services/components/ServiceAssistantModal'
import { ServiceTopbar } from '@/features/services/components/ServiceTopbar'
import {
  fetchPublicServicesCatalog,
  formatIdr,
  formatServicePriceDisplay,
} from '@/features/services/service'

export function ServicesPage() {
  const { i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useOptionalAuth()
  const isSuperadmin = auth?.user?.role === 'superadmin'
  const internalPreviewMode = isSuperadmin && searchParams.get('preview') === 'internal'

  const locale: 'id' | 'en' = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'id'
  const isEn = locale === 'en'

  const [catalogState, setCatalogState] = useState<{
    key: string
    catalog: PublicServiceCatalogResponse | SuperadminPreviewCatalogResponse | null
    error: string | null
  } | null>(null)

  const currentKey = `${locale}:${internalPreviewMode ? 'internal' : 'public'}`
  const loading = catalogState === null || catalogState.key !== currentKey
  const catalog = catalogState?.key === currentKey ? catalogState.catalog : null
  const error = catalogState?.key === currentKey ? catalogState.error : null

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('all')
  const [selectedModality, setSelectedModality] = useState<ServiceModality | 'all'>('all')
  const [malangOnly, setMalangOnly] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [assistantOpen, setAssistantOpen] = useState(() => searchParams.get('assistant') === '1')

  useEffect(() => {
    document.title = isEn
      ? 'Psychological Services & Assessments | Attentive.id'
      : 'Katalog Layanan & Asesmen Psikologi | Attentive.id'
  }, [isEn])

  useEffect(() => {
    let cancelled = false
    const loader = internalPreviewMode
      ? fetchSuperadminPreviewCatalog(locale)
      : fetchPublicServicesCatalog(locale)
    loader
      .then((res) => {
        if (!cancelled) {
          setCatalogState({ key: currentKey, catalog: res, error: null })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalogState({
            key: currentKey,
            catalog: null,
            error: err instanceof Error ? err.message : 'Failed to load services catalog',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [locale, internalPreviewMode, currentKey])

  const handleToggleInternalPreview = () => {
    const next = new URLSearchParams(searchParams)
    if (internalPreviewMode) {
      next.delete('preview')
    } else {
      next.set('preview', 'internal')
    }
    setSearchParams(next, { replace: true })
  }

  const handleLocaleChange = (nextLocale: 'id' | 'en') => {
    void i18n.changeLanguage(nextLocale)
  }

  // Hide type === 'addon' in public mode; show all 53 in Superadmin Internal Demo mode.
  const mainServices = useMemo(
    () =>
      (catalog?.services ?? []).filter((service) =>
        internalPreviewMode ? true : service.serviceType === 'layanan',
      ),
    [catalog, internalPreviewMode],
  )

  const visibleCategories = useMemo(() => {
    if (!catalog) return []
    const usedSlugs = new Set(mainServices.map((s) => s.categorySlug))
    return catalog.categories.filter((c) => usedSlugs.has(c.slug))
  }, [catalog, mainServices])

  const visibleSubgroups = useMemo(() => {
    if (!catalog) return []
    const relevantServices =
      selectedCategory === 'all'
        ? mainServices
        : mainServices.filter((s) => s.categorySlug === selectedCategory)
    const usedSubgroups = new Set(relevantServices.map((s) => s.subgroupSlug).filter(Boolean))
    return catalog.subgroups.filter((sg) => usedSubgroups.has(sg.slug))
  }, [catalog, mainServices, selectedCategory])

  const audienceOptions = useMemo(() => {
    const set = new Set<string>()
    for (const svc of mainServices) {
      for (const aud of svc.audiences) set.add(aud)
    }
    return [...set]
  }, [mainServices])

  const spotlightServices = useMemo(
    () =>
      mainServices.filter(
        (svc) => svc.priceRange.promoAmount !== null && (svc.isFeaturedSpotlight || svc.isAssessment),
      ),
    [mainServices],
  )

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return mainServices.filter((svc) => {
      if (selectedCategory !== 'all' && svc.categorySlug !== selectedCategory) return false
      if (selectedSubgroup !== 'all' && svc.subgroupSlug !== selectedSubgroup) return false
      if (selectedModality !== 'all' && !svc.modalities.includes(selectedModality)) return false
      if (malangOnly && !svc.hasMalangBranch) return false
      if (selectedAudience !== 'all' && !svc.audiences.includes(selectedAudience)) return false
      if (q) {
        const hay = [
          svc.name,
          svc.shortSummary ?? '',
          svc.benefit ?? '',
          svc.categoryName,
          svc.subgroupName ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [
    mainServices,
    selectedCategory,
    selectedSubgroup,
    selectedModality,
    malangOnly,
    selectedAudience,
    searchQuery,
  ])

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#142b51] flex flex-col">
      <ServiceTopbar
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onOpenAssistant={() => setAssistantOpen(true)}
        activeRoute="catalog"
        showInternalToggle={isSuperadmin}
        internalPreviewMode={internalPreviewMode}
        onToggleInternalPreview={handleToggleInternalPreview}
      />

      {internalPreviewMode && (
        <div className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-950">
          Mode Demo Internal Aktif — Menampilkan {mainServices.length} layanan (termasuk Draft/Nonaktif/Internal) beserta Fee & Margin internal (khusus Superadmin).{' '}
          <Link to="/dashboard/services" className="underline ml-1">
            Kelola di Dashboard Internal &rarr;
          </Link>
        </div>
      )}

      {/* Editorial Hero Band */}
      <section className="border-b border-[#ebe6d9] bg-gradient-to-b from-[#142b51] via-[#142b51] to-[#1a3561] text-[#f5edd4]">
        <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:py-12">
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6a74d]/40 bg-[#d6a74d]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f5edd4]">
                <Tag className="h-3 w-3 text-[#d6a74d]" aria-hidden="true" />
                {isEn ? 'Attentive Psychology Bureau' : 'Biro Psikologi Attentive'}
              </span>
              <h1
                data-route-heading
                tabIndex={-1}
                className="mt-3 text-2xl font-extrabold tracking-tight text-white outline-none sm:text-4xl"
              >
                {isEn
                  ? 'Psychological Services & Assessments Menu'
                  : 'Menu Layanan & Asesmen Psikologi'}
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#f5edd4]/85 sm:text-base">
                {isEn
                  ? 'Explore individual counseling, child & educational support, cognitive & personality assessments, and research consultation with transparent pricing.'
                  : 'Jelajahi layanan konseling individu, pendampingan anak & pendidikan, asesmen kognitif dan kepribadian, hingga konsultasi riset dengan tarif yang jelas.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[#f5edd4]/15 bg-[#0d1f3d]/70 p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d6a74d]">
                    {isEn ? 'Not sure where to start?' : 'Bingung memilih layanan?'}
                  </p>
                  <p className="mt-0.5 text-xs text-[#f5edd4]/80">
                    {isEn
                      ? 'Answer 2–3 quick questions to find the best match.'
                      : 'Jawab 2–3 pertanyaan singkat untuk menemukan layanan yang pas.'}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setAssistantOpen(true)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={INTERACTIVE_SPRING}
                  className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#d6a74d] px-3.5 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? 'Help Me Choose' : 'Bantu Pilih'}</span>
                </motion.button>
              </div>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f5edd4]/55"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={isEn ? 'Search services' : 'Cari layanan'}
                  placeholder={
                    isEn
                      ? 'Search IQ test, counseling, ADHD, couple...'
                      : 'Cari tes IQ, konseling, ADHD, pasangan...'
                  }
                  className="w-full rounded-xl border border-[#f5edd4]/20 bg-[#142b51]/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#f5edd4]/50 focus:border-[#d6a74d] focus:outline-none focus:ring-2 focus:ring-[#d6a74d]/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-64 animate-pulse rounded-2xl border border-[#ebe6d9] bg-white p-5"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-900"
          >
            <p className="font-bold">{isEn ? 'Unable to load services' : 'Gagal memuat katalog layanan'}</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && catalog && (
          <>
            {/* Promo Spotlight Banner */}
            {catalog.activePrograms.length > 0 && spotlightServices.length > 0 && (
              <section
                aria-labelledby="promo-spotlight-heading"
                className="mb-8 rounded-2xl border border-[#d6a74d]/45 bg-gradient-to-r from-[#fffaf0] via-[#fdf5e2] to-[#fffaf0] p-5 shadow-2xs"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d6a74d] px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#142b51]">
                      {catalog.activePrograms[0]?.badge || 'Promo'}
                    </span>
                    <h2 id="promo-spotlight-heading" className="mt-1.5 text-lg font-extrabold text-[#142b51]">
                      {catalog.activePrograms[0]?.name}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-[#8c6a22]">
                    {catalog.activePrograms[0]?.startsOn} — {catalog.activePrograms[0]?.endsOn}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {spotlightServices.slice(0, 4).map((svc) => {
                    const priceDisplay = formatServicePriceDisplay(
                      svc.priceRange,
                      svc.pricingModel,
                      locale,
                    )
                    return (
                      <Link
                        key={svc.id}
                        to={`/services/${svc.slug}`}
                        className="group flex flex-col justify-between rounded-xl border border-[#ead8ae] bg-white p-3.5 transition-colors hover:border-[#d6a74d]"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#8c6a22]">{svc.subgroupName || svc.categoryName}</div>
                          <div className="mt-0.5 text-sm font-bold text-[#142b51] group-hover:underline">
                            {svc.name}
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-2 tabular-nums">
                          <span className="text-sm font-extrabold text-[#142b51]">
                            {priceDisplay.primary}
                          </span>
                          {priceDisplay.strikeThrough && (
                            <span className="text-xs text-[#7a869c] line-through">
                              {priceDisplay.strikeThrough}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Free Cognitive Demo & AAA-50 Try-It Banner */}
            <section
              aria-label={isEn ? 'Interactive Cognitive Demo' : 'Demo Tugas Kognitif Gratis'}
              className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#142b51]/15 bg-white p-5 shadow-2xs sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#142b51] text-[#d6a74d]">
                  <Brain className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-[#e4f2ea] px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#2c7a57]">
                    {isEn ? 'Free Interactive Try-It' : 'Coba Gratis · ~30 Detik'}
                  </span>
                  <h2 className="mt-1 text-base font-extrabold text-[#142b51]">
                    {isEn
                      ? 'Try Attentive Cognitive Tasks (CPT, SST, N-Back, Go/No-Go) & AAA-50'
                      : 'Coba Tugas Kognitif Lengkap & Kuesioner AAA-50'}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#4b5b78]">
                    {isEn
                      ? 'Experience 4 interactive practice tasks and inspect simulated sample report panels—zero account or tracking required.'
                      : 'Coba 4 latihan tugas kognitif interaktif, lihat contoh hasil laporan, atau langsung isi kuesioner AAA-50 secara aman tanpa penyimpanan data.'}
                  </p>
                </div>
              </div>
              <Link
                to="/services/demo"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#d6a74d] px-4 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
              >
                <span>{isEn ? 'Try Cognitive Demo' : 'Coba Demo Gratis'}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </section>

            {/* Category & Filter Controls */}
            <div className="mb-6 space-y-3">
              <div
                role="tablist"
                aria-label={isEn ? 'Service categories' : 'Kategori layanan'}
                className="flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === 'all'}
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedSubgroup('all')
                  }}
                  className={`min-h-10 cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                    selectedCategory === 'all'
                      ? 'border-[#142b51] bg-[#142b51] text-[#f5edd4]'
                      : 'border-[#dedede] bg-white text-[#142b51] hover:border-[#142b51]/40'
                  }`}
                >
                  {isEn ? 'All Services' : 'Semua Layanan'} ({mainServices.length})
                </button>
                {visibleCategories.map((cat) => {
                  const active = selectedCategory === cat.slug
                  const count = mainServices.filter((s) => s.categorySlug === cat.slug).length
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setSelectedSubgroup('all')
                      }}
                      className={`min-h-10 cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                        active
                          ? 'border-[#142b51] bg-[#142b51] text-[#f5edd4]'
                          : 'border-[#dedede] bg-white text-[#142b51] hover:border-[#142b51]/40'
                      }`}
                    >
                      {cat.name} (<span className="tabular-nums">{count}</span>)
                    </button>
                  )
                })}
              </div>

              {/* Assessment Subgroup Pills */}
              {visibleSubgroups.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-bold text-[#4b5b78]">
                    {isEn ? 'Group:' : 'Kelompok:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubgroup('all')}
                    className={`min-h-8 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      selectedSubgroup === 'all'
                        ? 'bg-[#d6a74d] text-[#142b51]'
                        : 'bg-[#f5edd4]/70 text-[#4b5b78] hover:bg-[#f5edd4]'
                    }`}
                  >
                    {isEn ? 'All' : 'Semua'}
                  </button>
                  {visibleSubgroups.map((sg) => (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => setSelectedSubgroup(sg.slug)}
                      className={`min-h-8 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        selectedSubgroup === sg.slug
                          ? 'bg-[#d6a74d] text-[#142b51]'
                          : 'bg-[#f5edd4]/70 text-[#4b5b78] hover:bg-[#f5edd4]'
                      }`}
                    >
                      {sg.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Modality, Branch & Audience Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ebe6d9] bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['all', isEn ? 'All Formats' : 'Semua Format'],
                      ['online', 'Online'],
                      ['offline', 'Offline'],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSelectedModality(val)
                        if (val === 'online') setMalangOnly(false)
                      }}
                      className={`inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
                        selectedModality === val
                          ? 'border-[#142b51] bg-[#142b51] text-white'
                          : 'border-[#dedede] bg-[#fbf8f2] text-[#4b5b78] hover:border-[#142b51]/30'
                      }`}
                    >
                      {val === 'online' && <Monitor className="h-3.5 w-3.5" aria-hidden="true" />}
                      {val === 'offline' && <Building2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      <span>{label}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const next = !malangOnly
                      setMalangOnly(next)
                      if (next && selectedModality === 'online') setSelectedModality('all')
                    }}
                    className={`inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${
                      malangOnly
                        ? 'border-[#d6a74d] bg-[#d6a74d] text-[#142b51]'
                        : 'border-[#dedede] bg-[#fbf8f2] text-[#4b5b78] hover:border-[#d6a74d]'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEn ? 'Malang Branch' : 'Cabang Malang'}</span>
                  </button>
                </div>

                {audienceOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <label htmlFor="audience-filter" className="text-xs font-bold text-[#4b5b78]">
                      {isEn ? 'For:' : 'Untuk:'}
                    </label>
                    <select
                      id="audience-filter"
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="min-h-8 rounded-lg border border-[#dedede] bg-[#fbf8f2] px-2.5 py-1 text-xs font-semibold text-[#142b51]"
                    >
                      <option value="all">{isEn ? 'All Audiences' : 'Semua Audiens'}</option>
                      {audienceOptions.map((aud) => (
                        <option key={aud} value={aud}>
                          {aud}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Main Catalog Grid */}
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-[#ebe6d9] bg-white p-8 text-center">
                <p className="text-sm font-bold text-[#142b51]">
                  {isEn
                    ? 'No services match your current filters.'
                    : 'Tidak ada layanan yang cocok dengan filter saat ini.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedSubgroup('all')
                    setSelectedModality('all')
                    setMalangOnly(false)
                    setSelectedAudience('all')
                    setSearchQuery('')
                  }}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center rounded-xl bg-[#d6a74d] px-4 py-2 text-xs font-bold text-[#142b51]"
                >
                  {isEn ? 'Reset Filters' : 'Reset Filter'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((svc) => {
                  const priceDisplay = formatServicePriceDisplay(
                    svc.priceRange,
                    svc.pricingModel,
                    locale,
                  )
                  const internalMeta =
                    'internalMeta' in svc
                      ? (svc as SuperadminPreviewServiceSummary).internalMeta
                      : null
                  const detailHref = internalPreviewMode
                    ? `/services/${svc.slug}?preview=internal`
                    : `/services/${svc.slug}`
                  return (
                    <motion.article
                      key={svc.id}
                      whileHover={{ y: -2 }}
                      transition={INTERACTIVE_SPRING}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#dedede] bg-white shadow-[0_6px_18px_rgba(20,43,81,0.06)]"
                    >
                      <Link to={detailHref} className="flex flex-1 flex-col">
                        {svc.cardMedia ? (
                          <div className="aspect-[16/10] w-full overflow-hidden bg-[#f5edd4]/50">
                            <img
                              src={svc.cardMedia.url}
                              alt={svc.cardMedia.alt}
                              width={svc.cardMedia.width}
                              height={svc.cardMedia.height}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-[#142b51] to-[#1f3f73] px-5 text-center">
                            <span className="text-sm font-bold text-[#f5edd4]">{svc.categoryName}</span>
                          </div>
                        )}

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#f5edd4] px-2.5 py-0.5 text-[10.5px] font-bold text-[#8c6a22]">
                              {svc.subgroupName || svc.categoryName}
                            </span>
                            {(svc.priceRange.promoBadge || svc.badge) && (
                              <span className="rounded-full bg-[#d6a74d] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[#142b51]">
                                {svc.priceRange.promoBadge || svc.badge}
                              </span>
                            )}
                            {svc.hasMalangBranch && (
                              <span className="rounded-full bg-[#e4f2ea] px-2.5 py-0.5 text-[10.5px] font-bold text-[#2c7a57]">
                                Malang
                              </span>
                            )}
                            {internalMeta && (
                              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">
                                {internalMeta.status} · {internalMeta.visibility}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2.5 text-base font-extrabold leading-snug text-[#142b51]">
                            {svc.name}
                          </h3>
                          {(svc.shortSummary || svc.benefit) && (
                            <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-[#4b5b78]">
                              {svc.shortSummary || svc.benefit}
                            </p>
                          )}

                          {internalMeta && (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] tabular-nums text-amber-950">
                              <div className="flex items-center justify-between gap-2">
                                <span>
                                  Fee:{' '}
                                  <strong>
                                    {internalMeta.lowestFeeAmount !== null
                                      ? formatIdr(internalMeta.lowestFeeAmount)
                                      : '—'}
                                  </strong>
                                </span>
                                <span>
                                  Margin:{' '}
                                  <strong>
                                    {internalMeta.lowestMarginPct !== null
                                      ? `${internalMeta.lowestMarginPct.toFixed(1)}%`
                                      : '—'}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#ebe6d9] pt-3.5">
                            <div className="tabular-nums">
                              <div className="text-sm font-extrabold text-[#142b51]">
                                {priceDisplay.primary}
                              </div>
                              {priceDisplay.strikeThrough && (
                                <div className="text-xs text-[#7a869c] line-through">
                                  {priceDisplay.strikeThrough}
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8c6a22]">
                              <span>{isEn ? 'View Details' : 'Lihat Detail'}</span>
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[#ebe6d9] bg-white py-6 text-xs text-[#4b5b78]">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-3 px-4 sm:flex-row sm:items-center sm:px-6">
          <span>
            © {new Date().getFullYear()} Biro Psikologi Attentive — Tanjung Barat, BSD & Malang
          </span>
          <div className="flex items-center gap-4 font-semibold text-[#142b51]">
            <Link to="/" className="hover:underline">
              {isEn ? 'Home' : 'Beranda'}
            </Link>
            <Link to="/psychologists" className="hover:underline">
              {isEn ? 'Our Psychologists' : 'Daftar Psikolog'}
            </Link>
            <Link to="/booking" className="hover:underline">
              {isEn ? 'Direct Booking' : 'Booking Langsung'}
            </Link>
          </div>
        </div>
      </footer>

      <ServiceAssistantModal
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        services={mainServices}
        locale={locale}
      />
    </div>
  )
}
