import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CopyPlus,
  Download,
  ExternalLink,
  Eye,
  FileWarning,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  InternalCostKind,
  InternalDataIssueRecord,
  InternalLedgerRow,
  InternalPriceStatus,
  InternalProductItem,
  InternalProgramRecord,
  InternalPsychologistMatrixRow,
  ServiceLifecycleStatus,
  ServiceProgramStatus,
  ServiceProgramType,
  ServicesAdminOverviewResponse,
  ServiceVisibility,
} from '@attentiveid/shared'
import {
  downloadAdminServicesCsv,
  duplicateAdminService,
  fetchServicesAdminOverview,
  saveAdminInternalCost,
  saveAdminProgram,
  saveAdminService,
  updateAdminDataIssue,
  updateAdminProgramStatus,
  updateAdminPsychologistMatrix,
} from '@/features/services-admin/api'
import { ServiceEditorDrawer } from '@/features/services-admin/components/ServiceEditorDrawer'

type OpsTab = 'overview' | 'catalog' | 'ledger' | 'programs' | 'psychologists' | 'issues'

const formatRp = (val: number | null | undefined) =>
  typeof val === 'number' && Number.isFinite(val) ? `Rp ${Math.round(val).toLocaleString('id-ID')}` : '—'

const STATUS_BADGE: Record<ServiceLifecycleStatus, string> = {
  published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  draft: 'bg-amber-50 text-amber-800 border-amber-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  archived: 'bg-rose-50 text-rose-800 border-rose-200',
}

export function ServicesCmsPage() {
  const [data, setData] = useState<ServicesAdminOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<OpsTab>('overview')

  // Catalog filters
  const [catalogSearch, setCatalogSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceLifecycleStatus | 'all'>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<ServiceVisibility | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Ledger filters
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'low_margin' | 'usulan' | 'missing_fee'>('all')

  // Issue filters
  const [issueStatusFilter, setIssueStatusFilter] = useState<'all' | 'Terbuka' | 'Selesai'>('Terbuka')
  const [issueSearch, setIssueSearch] = useState('')

  // Modals / Drawers
  const [editorState, setEditorState] = useState<{ open: boolean; service: InternalProductItem | null; isNew: boolean }>({
    open: false,
    service: null,
    isNew: false,
  })
  const [costModalRow, setCostModalRow] = useState<InternalLedgerRow | null>(null)
  const [costKind, setCostKind] = useState<InternalCostKind>('fee')
  const [costStatus, setCostStatus] = useState<InternalPriceStatus>('berlaku')
  const [costAmount, setCostAmount] = useState('')
  const [costNote, setCostNote] = useState('')
  const [costSaving, setCostSaving] = useState(false)

  const [programModalOpen, setProgramModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<InternalProgramRecord | null>(null)
  const [progSlug, setProgSlug] = useState('')
  const [progName, setProgName] = useState('')
  const [progBadge, setProgBadge] = useState('')
  const [progStartsOn, setProgStartsOn] = useState('2026-11-01')
  const [progEndsOn, setProgEndsOn] = useState('2027-04-30')
  const [progType, setProgType] = useState<ServiceProgramType>('harga')
  const [progStatus, setProgStatus] = useState<ServiceProgramStatus>('draft')
  const [progPrices, setProgPrices] = useState<Record<string, string>>({})

  const [psychEditing, setPsychEditing] = useState<InternalPsychologistMatrixRow | null>(null)
  const [psychOnlineRate, setPsychOnlineRate] = useState('')
  const [psychOfflineRate, setPsychOfflineRate] = useState('')
  const [psychServices, setPsychServices] = useState<string[]>([])
  const [psychFlags, setPsychFlags] = useState({
    availableOnline: false,
    availableTbi: false,
    availableBsd: false,
    availableMalang: false,
    acceptingNewClients: true,
  })

  const [resolvingIssue, setResolvingIssue] = useState<InternalDataIssueRecord | null>(null)
  const [issueResolutionNote, setIssueResolutionNote] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const overview = await fetchServicesAdminOverview()
      setData(overview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard layanan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredCatalog = useMemo(() => {
    if (!data) return []
    const q = catalogSearch.trim().toLowerCase()
    return data.services.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (visibilityFilter !== 'all' && s.visibility !== visibilityFilter) return false
      if (categoryFilter !== 'all' && s.categorySlug !== categoryFilter) return false
      if (q && !`${s.nameId} ${s.slug} ${s.categoryName}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, catalogSearch, statusFilter, visibilityFilter, categoryFilter])

  const filteredLedger = useMemo(() => {
    if (!data) return []
    const q = ledgerSearch.trim().toLowerCase()
    const threshold = data.settings.marginThreshold
    return data.ledgerRows.filter((row) => {
      if (ledgerFilter === 'low_margin' && (row.margin === null || row.margin.pct >= threshold)) return false
      if (ledgerFilter === 'usulan' && row.usulanAmounts.length === 0) return false
      if (ledgerFilter === 'missing_fee' && row.feeAmount !== null) return false
      if (
        q &&
        !`${row.serviceName} ${row.variantName} ${row.psychologistName} ${row.serviceSlug}`
          .toLowerCase()
          .includes(q)
      ) {
        return false
      }
      return true
    })
  }, [data, ledgerSearch, ledgerFilter])

  const filteredIssues = useMemo(() => {
    if (!data) return []
    const q = issueSearch.trim().toLowerCase()
    return data.issues.filter((i) => {
      if (issueStatusFilter !== 'all' && i.status !== issueStatusFilter) return false
      if (q && !`${i.code} ${i.title} ${i.detail}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, issueStatusFilter, issueSearch])

  const openCostEditor = (row: InternalLedgerRow, kind: InternalCostKind, status: InternalPriceStatus) => {
    setCostModalRow(row)
    setCostKind(kind)
    setCostStatus(status)
    const initialAmount =
      kind === 'fee'
        ? row.feeAmount
        : kind === 'biaya'
          ? row.directCostAmount
          : row.usulanAmounts[0] ?? row.berlakuPrice
    setCostAmount(initialAmount !== null ? String(initialAmount) : '')
    setCostNote('')
  }

  const submitCostModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!costModalRow) return
    setCostSaving(true)
    try {
      await saveAdminInternalCost(costModalRow.serviceId, {
        variantId: costModalRow.variantId,
        psychologistId: costModalRow.psychologistId,
        recordKind: costKind,
        recordStatus: costStatus,
        amount: costAmount.trim() === '' ? null : Number(costAmount),
        note: costNote.trim() || null,
        promoteToBerlaku: costStatus === 'berlaku',
      })
      setCostModalRow(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan biaya')
    } finally {
      setCostSaving(false)
    }
  }

  const openProgramModal = (prog: InternalProgramRecord | null) => {
    setEditingProgram(prog)
    setProgSlug(prog?.slug ?? '')
    setProgName(prog?.nameId ?? '')
    setProgBadge(prog?.badgeId ?? '')
    setProgStartsOn(prog?.startsOn ?? '2026-11-01')
    setProgEndsOn(prog?.endsOn ?? '2027-04-30')
    setProgType(prog?.programType ?? 'harga')
    setProgStatus(prog?.status ?? 'draft')
    const map: Record<string, string> = {}
    if (prog) {
      for (const pp of prog.prices) map[pp.variantId] = String(pp.promoAmount)
    }
    setProgPrices(map)
    setProgramModalOpen(true)
  }

  const submitProgramModal = async (e: React.FormEvent) => {
    e.preventDefault()
    const prices = Object.entries(progPrices)
      .filter(([, val]) => val.trim() !== '' && Number.isFinite(Number(val)))
      .map(([variantId, val]) => ({ variantId, promoAmount: Math.max(0, Math.round(Number(val))) }))
    await saveAdminProgram({
      ...(editingProgram ? { id: editingProgram.id } : {}),
      slug: progSlug.trim(),
      programType: progType,
      status: progStatus,
      startsOn: progStartsOn,
      endsOn: progEndsOn,
      nameId: progName.trim(),
      badgeId: progBadge.trim() || null,
      prices,
    })
    setProgramModalOpen(false)
    await loadData()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h2 className="text-lg font-bold">Gagal memuat Operations Produk & Keuangan</h2>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void loadData()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white"
        >
          <RefreshCw className="size-4" /> Coba Lagi
        </button>
      </div>
    )
  }

  const lowMarginRows = data.ledgerRows.filter(
    (r) => r.margin !== null && r.margin.pct < data.settings.marginThreshold,
  )
  const lowestCompleteness = [...data.services]
    .sort((a, b) => a.completenessPct - b.completenessPct)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
            <ShieldCheck className="size-3.5 stroke-[1.75]" />
            <span>Superadmin Only · Physical Cost Isolation Active</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
            Produk, Tarif & Margin Internal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola ke-{data.stats.totalServices} layanan (termasuk Draft/Internal), tabel terisolasi Fee & Biaya, Program Diskon, Matriks Psikolog, dan Data Issues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/services?preview=internal"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
          >
            <Eye className="size-4 stroke-[1.75]" />
            <span>Buka Mode Demo Internal (/services)</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => void downloadAdminServicesCsv()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="size-4 stroke-[1.75]" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorState({ open: true, service: null, isNew: true })}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800"
          >
            <Plus className="size-4 stroke-[1.75]" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav aria-label="Navigasi internal produk" className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
        {(
          [
            ['overview', 'Overview & Alert', BarChart3],
            ['catalog', `Katalog Produk (${data.stats.totalServices})`, Layers],
            ['ledger', `Harga, Fee & Margin (${data.ledgerRows.length})`, TrendingUp],
            ['programs', `Program Diskon (${data.programs.length})`, Tag],
            ['psychologists', `Matriks Psikolog (${data.psychologists.length})`, Users],
            ['issues', `Data Issues (${data.stats.openIssuesCount})`, FileWarning],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="size-4 stroke-[1.75]" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Total Katalog Produk</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">
                {data.stats.totalServices}
              </p>
              <p className="mt-2 text-xs text-slate-600 tabular-nums">
                {data.stats.byStatus.published} Published · {data.stats.byStatus.draft} Draft ·{' '}
                {data.stats.byStatus.inactive} Nonaktif · {data.stats.byStatus.archived} Archived
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">
                Margin di Bawah Ambang ({data.settings.marginThreshold}%)
              </p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-rose-700">
                {data.stats.lowMarginCount}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Varian/scope yang perlu review harga atau fee
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Data Issues Terbuka</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-amber-700">
                {data.stats.openIssuesCount}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Item verifikasi tarif/konten dari rate card
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">Rata-rata Kelengkapan</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-teal-700">
                {data.stats.avgCompletenessPct}%
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Dari 12 indikator konten, tarif, fee, dan media
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Low Margin Table */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <AlertTriangle className="size-4 text-rose-600 stroke-[1.75]" />
                  <span>Margin &lt; {data.settings.marginThreshold}%</span>
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setLedgerFilter('low_margin')
                    setActiveTab('ledger')
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Lihat di Ledger
                </button>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {lowMarginRows.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">
                    Semua varian dengan fee terdefinisi memiliki margin &ge; {data.settings.marginThreshold}%.
                  </p>
                ) : (
                  lowMarginRows.slice(0, 8).map((row) => (
                    <div key={row.key} className="flex items-center justify-between py-2.5 text-xs">
                      <div className="min-w-0 pr-3">
                        <p className="truncate font-bold text-slate-900">
                          {row.serviceName} — {row.variantName}
                        </p>
                        <p className="truncate text-slate-500">{row.psychologistName}</p>
                      </div>
                      <div className="shrink-0 text-right tabular-nums">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 font-extrabold text-rose-800">
                          {row.margin?.pct.toFixed(1)}%
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {formatRp(row.margin?.gross)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Lowest Completeness */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900">Kelengkapan Terendah</h2>
              <div className="mt-4 divide-y divide-slate-100">
                {lowestCompleteness.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="min-w-0 pr-3">
                      <p className="truncate font-bold text-slate-900">{svc.nameId}</p>
                      <p className="text-slate-500">
                        {svc.status} · {svc.visibility} · {svc.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold tabular-nums text-amber-700">
                        {svc.completenessPct}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditorState({ open: true, service: svc, isNew: false })}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Lengkapi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG (ALL 53) */}
      {activeTab === 'catalog' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Cari nama produk, slug, atau kategori..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ServiceLifecycleStatus | 'all')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="all">Semua Status ({data.services.length})</option>
              <option value="published">Published ({data.stats.byStatus.published})</option>
              <option value="draft">Draft ({data.stats.byStatus.draft})</option>
              <option value="inactive">Nonaktif ({data.stats.byStatus.inactive})</option>
              <option value="archived">Archived ({data.stats.byStatus.archived})</option>
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as ServiceVisibility | 'all')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="all">Semua Visibilitas</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="all">Semua Kategori</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameId}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold">Produk</th>
                  <th className="py-2.5 px-2 font-semibold">Status & Visibilitas</th>
                  <th className="py-2.5 px-2 font-semibold">Varian</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Harga Mulai</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Margin Terendah</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Lengkap</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-900">{svc.nameId}</p>
                      <p className="text-[11px] text-slate-500">
                        <span className="font-mono">{svc.slug}</span> · {svc.categoryName}
                        {svc.serviceType === 'addon' && ' · Add-on'}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[svc.status]}`}
                        >
                          {svc.status}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            svc.visibility === 'internal'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-sky-50 text-sky-800'
                          }`}
                        >
                          {svc.visibility}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 tabular-nums">{svc.variants.length}</td>
                    <td className="py-3 px-2 text-right font-semibold tabular-nums">
                      {formatRp(svc.lowestPriceAmount)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {svc.lowestMarginPct !== null ? (
                        <span
                          className={`rounded-full px-2 py-0.5 font-bold ${
                            svc.lowestMarginPct < data.settings.marginThreshold
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {svc.lowestMarginPct.toFixed(1)}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-bold tabular-nums">
                      {svc.completenessPct}%
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditorState({ open: true, service: svc, isNew: false })}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void duplicateAdminService(svc.id).then(loadData)}
                          title="Duplikat menjadi draft"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          <CopyPlus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEDGER HARGA, FEE & MARGIN */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Cari layanan, varian, atau nama psikolog..."
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs"
              />
            </div>
            <select
              value={ledgerFilter}
              onChange={(e) =>
                setLedgerFilter(e.target.value as 'all' | 'low_margin' | 'usulan' | 'missing_fee')
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="all">Semua Scope ({data.ledgerRows.length})</option>
              <option value="low_margin">Margin &lt; {data.settings.marginThreshold}%</option>
              <option value="usulan">Punya Harga Usulan</option>
              <option value="missing_fee">Fee Belum Diisi</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3 font-semibold">Layanan / Varian</th>
                  <th className="py-2.5 px-2 font-semibold">Penyedia</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Harga Berlaku</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Fee Penyedia</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Biaya Langsung</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Margin Kotor</th>
                  <th className="py-2.5 px-2 font-semibold">Usulan / Hist</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Ubah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {filteredLedger.map((row) => {
                  const isLow =
                    row.margin !== null && row.margin.pct < data.settings.marginThreshold
                  return (
                    <tr key={row.key} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pr-3">
                        <p className="font-bold text-slate-900">{row.serviceName}</p>
                        <p className="text-[11px] text-slate-500">
                          {row.variantName}
                          {row.promoAmount !== null && (
                            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              Promo: {formatRp(row.promoAmount)}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">{row.psychologistName}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-slate-900">
                        {formatRp(row.berlakuPrice)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {formatRp(row.feeAmount)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {formatRp(row.directCostAmount)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {row.margin ? (
                          <div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                                isLow
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {row.margin.pct.toFixed(1)}%
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {formatRp(row.margin.gross)}
                            </p>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-[11px] text-slate-500">
                        {row.usulanAmounts.length > 0 && (
                          <span className="mr-1 rounded bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-800">
                            Usulan: {row.usulanAmounts.map(formatRp).join(', ')}
                          </span>
                        )}
                        {row.historisCount > 0 && <span>{row.historisCount} hist</span>}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => openCostEditor(row, 'fee', 'berlaku')}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Fee
                          </button>
                          <button
                            type="button"
                            onClick={() => openCostEditor(row, 'biaya', 'berlaku')}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Biaya
                          </button>
                          {row.priceSource !== 'psychologist_profiles' && (
                            <button
                              type="button"
                              onClick={() => openCostEditor(row, 'harga', 'berlaku')}
                              className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-800 hover:bg-teal-100"
                            >
                              Harga
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => openProgramModal(null)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
            >
              <Plus className="size-4" /> Program Diskon Baru
            </button>
          </div>
          {data.programs.map((prog) => (
            <section
              key={prog.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{prog.nameId}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        prog.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prog.status === 'ended'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    <span className="font-mono">{prog.slug}</span> · {prog.startsOn} s.d.{' '}
                    {prog.endsOn} · {prog.prices.length} varian promo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openProgramModal(prog)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit Program
                  </button>
                  {prog.status !== 'active' ? (
                    <button
                      type="button"
                      onClick={() => void updateAdminProgramStatus(prog.id, 'active').then(loadData)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Aktifkan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void updateAdminProgramStatus(prog.id, 'ended').then(loadData)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                    >
                      Akhiri
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Layanan & Varian</th>
                      <th className="py-2 px-2 text-right font-semibold">Harga Normal</th>
                      <th className="py-2 px-2 text-right font-semibold">Harga Promo</th>
                      <th className="py-2 px-2 text-right font-semibold">Fee + Biaya</th>
                      <th className="py-2 pl-2 text-right font-semibold">Margin Saat Promo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prog.prices.map((pp) => (
                      <tr key={pp.variantId}>
                        <td className="py-2 pr-3">
                          <span className="font-bold text-slate-900">{pp.serviceName}</span> —{' '}
                          {pp.variantName}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-500 line-through">
                          {formatRp(pp.normalPrice)}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-teal-700">
                          {formatRp(pp.promoAmount)}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-600">
                          {pp.feeAmount !== null
                            ? formatRp(pp.feeAmount + (pp.directCostAmount ?? 0))
                            : '—'}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          {pp.promoMargin ? (
                            <span
                              className={`rounded-full px-2 py-0.5 font-bold ${
                                pp.promoMargin.pct < data.settings.marginThreshold
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {pp.promoMargin.pct.toFixed(1)}% ({formatRp(pp.promoMargin.gross)})
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* TAB 5: PSYCHOLOGIST MATRIX */}
      {activeTab === 'psychologists' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-3 font-semibold">Psikolog</th>
                <th className="py-2.5 px-2 font-semibold">Tier / Cabang</th>
                <th className="py-2.5 px-2 text-right font-semibold">Tarif Online</th>
                <th className="py-2.5 px-2 text-right font-semibold">Tarif Offline</th>
                <th className="py-2.5 px-2 font-semibold">Layanan Terhubung</th>
                <th className="py-2.5 pl-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {data.psychologists.map((psych) => (
                <tr key={psych.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 pr-3">
                    <p className="font-bold text-slate-900">{psych.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {psych.slug} · {psych.credential}
                    </p>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="font-semibold uppercase text-slate-700">{psych.tier}</span>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                      {psych.availableOnline && (
                        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-700">Online</span>
                      )}
                      {psych.availableTbi && (
                        <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700">TBI</span>
                      )}
                      {psych.availableBsd && (
                        <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700">BSD</span>
                      )}
                      {psych.availableMalang && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                          Malang
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold">
                    {formatRp(psych.onlineRate)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-semibold">
                    {formatRp(psych.offlineRate)}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-slate-700">
                      {psych.linkedServiceSlugs.length > 0
                        ? psych.linkedServiceSlugs.join(', ')
                        : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setPsychEditing(psych)
                        setPsychOnlineRate(psych.onlineRate !== null ? String(psych.onlineRate) : '')
                        setPsychOfflineRate(psych.offlineRate !== null ? String(psych.offlineRate) : '')
                        setPsychServices(psych.linkedServiceSlugs)
                        setPsychFlags({
                          availableOnline: psych.availableOnline,
                          availableTbi: psych.availableTbi,
                          availableBsd: psych.availableBsd,
                          availableMalang: psych.availableMalang,
                          acceptingNewClients: psych.acceptingNewClients,
                        })
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Atur Tarif & Layanan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: DATA ISSUES & AUDIT */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-60 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  placeholder="Cari kode atau judul isu..."
                  className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs"
                />
              </div>
              <select
                value={issueStatusFilter}
                onChange={(e) => setIssueStatusFilter(e.target.value as 'all' | 'Terbuka' | 'Selesai')}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
              >
                <option value="Terbuka">Terbuka ({data.stats.openIssuesCount})</option>
                <option value="Selesai">Selesai</option>
                <option value="all">Semua ({data.issues.length})</option>
              </select>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-start">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        {issue.code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          issue.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {issue.issueType}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-600">{issue.detail}</p>
                    {issue.resolution && (
                      <p className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                        Resolusi: {issue.resolution}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {issue.status === 'Terbuka' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingIssue(issue)
                          setIssueResolutionNote(issue.resolution ?? '')
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="size-3.5" /> Tandai Selesai
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void updateAdminDataIssue(issue.id, 'Terbuka', null).then(loadData)}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Buka Kembali
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.auditLogs.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Riwayat Perubahan Superadmin</h2>
              <div className="mt-3 divide-y divide-slate-100 text-xs">
                {data.auditLogs.slice(0, 15).map((log) => (
                  <div key={log.id} className="flex flex-wrap justify-between gap-2 py-2">
                    <span>
                      <strong className="text-slate-900">{log.actorEmail}</strong> ·{' '}
                      <span className="font-mono text-slate-600">{log.action}</span> — {log.summary}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Slide-over Service Editor */}
      {editorState.open && (
        <ServiceEditorDrawer
          service={editorState.service}
          isNew={editorState.isNew}
          categories={data.categories}
          subgroups={data.subgroups}
          psychologists={data.psychologists}
          onClose={() => setEditorState({ open: false, service: null, isNew: false })}
          onSave={async (payload) => {
            await saveAdminService(payload)
            await loadData()
          }}
        />
      )}

      {/* Inline Cost / Fee / Price Editor Modal */}
      {costModalRow && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setCostModalRow(null)}
        >
          <form
            onSubmit={(e) => void submitCostModal(e)}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Atur {costKind.toUpperCase()} — {costModalRow.variantName}
              </h3>
              <button type="button" onClick={() => setCostModalRow(null)}>
                <X className="size-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {costModalRow.serviceName} ({costModalRow.psychologistName})
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">
                Jenis
                <select
                  value={costKind}
                  onChange={(e) => setCostKind(e.target.value as InternalCostKind)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  <option value="fee">Fee Penyedia</option>
                  <option value="biaya">Biaya Langsung</option>
                  <option value="harga">Harga Klien</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Status Record
                <select
                  value={costStatus}
                  onChange={(e) => setCostStatus(e.target.value as InternalPriceStatus)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  <option value="berlaku">Berlaku Sekarang</option>
                  <option value="usulan">Usulan Baru</option>
                  <option value="historis">Historis</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Nominal (Rp)
              <input
                type="number"
                min={0}
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm tabular-nums"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Catatan Audit
              <input
                value={costNote}
                onChange={(e) => setCostNote(e.target.value)}
                placeholder="Alasan penyesuaian tarif/fee..."
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCostModalRow(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={costSaving}
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white"
              >
                {costSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Program Modal */}
      {programModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setProgramModalOpen(false)}
        >
          <form
            onSubmit={(e) => void submitProgramModal(e)}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProgram ? `Edit Program: ${editingProgram.nameId}` : 'Program Diskon Baru'}
              </h3>
              <button type="button" onClick={() => setProgramModalOpen(false)}>
                <X className="size-4 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                Nama Program *
                <input
                  required
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Slug *
                <input
                  required
                  value={progSlug}
                  onChange={(e) => setProgSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Tanggal Mulai
                <input
                  type="date"
                  required
                  value={progStartsOn}
                  onChange={(e) => setProgStartsOn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Tanggal Selesai
                <input
                  type="date"
                  required
                  value={progEndsOn}
                  onChange={(e) => setProgEndsOn(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Badge Promo
                <input
                  value={progBadge}
                  onChange={(e) => setProgBadge(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Status
                <select
                  value={progStatus}
                  onChange={(e) => setProgStatus(e.target.value as ServiceProgramStatus)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </label>
            </div>
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <p className="text-xs font-bold text-slate-700">Harga Promo per Varian (kosongkan jika tidak ikut):</p>
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {data.services
                  .filter((s) => s.pricingModel === 'fixed_variant')
                  .flatMap((s) =>
                    s.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate">
                          <strong>{s.nameId}</strong> — {v.nameId}{' '}
                          <span className="text-slate-400">({formatRp(v.publicPriceAmount)})</span>
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="Rp promo"
                          value={progPrices[v.id] ?? ''}
                          onChange={(e) =>
                            setProgPrices((prev) => ({ ...prev, [v.id]: e.target.value }))
                          }
                          className="w-32 rounded-lg border border-slate-300 px-2.5 py-1 text-right tabular-nums"
                        />
                      </div>
                    )),
                  )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white"
              >
                Simpan Program
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Psychologist Matrix Edit Modal */}
      {psychEditing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setPsychEditing(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await updateAdminPsychologistMatrix(psychEditing.id, {
                onlineRate: psychOnlineRate.trim() !== '' ? Number(psychOnlineRate) : null,
                offlineRate: psychOfflineRate.trim() !== '' ? Number(psychOfflineRate) : null,
                ...psychFlags,
                linkedServiceSlugs: psychServices,
              })
              setPsychEditing(null)
              await loadData()
            }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Atur Tarif & Layanan — {psychEditing.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="font-semibold text-slate-700">
                Tarif Online (Rp)
                <input
                  type="number"
                  min={0}
                  value={psychOnlineRate}
                  onChange={(e) => setPsychOnlineRate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs tabular-nums"
                />
              </label>
              <label className="font-semibold text-slate-700">
                Tarif Offline (Rp)
                <input
                  type="number"
                  min={0}
                  value={psychOfflineRate}
                  onChange={(e) => setPsychOfflineRate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs tabular-nums"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {(
                [
                  ['availableOnline', 'Online'],
                  ['availableTbi', 'TBI'],
                  ['availableBsd', 'BSD'],
                  ['availableMalang', 'Malang'],
                  ['acceptingNewClients', 'Terima Klien Baru'],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="flex items-center gap-1.5 font-medium">
                  <input
                    type="checkbox"
                    checked={psychFlags[field]}
                    onChange={(e) =>
                      setPsychFlags((prev) => ({ ...prev, [field]: e.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-1.5 text-xs">
              {data.services.map((svc) => (
                <label key={svc.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={psychServices.includes(svc.slug)}
                    onChange={(e) =>
                      setPsychServices((prev) =>
                        e.target.checked
                          ? [...prev, svc.slug]
                          : prev.filter((s) => s !== svc.slug),
                      )
                    }
                  />
                  <span>{svc.nameId}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPsychEditing(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white"
              >
                Simpan Matriks
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issue Resolution Modal */}
      {resolvingIssue && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setResolvingIssue(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await updateAdminDataIssue(
                resolvingIssue.id,
                'Selesai',
                issueResolutionNote.trim() || 'Diverifikasi oleh superadmin',
              )
              setResolvingIssue(null)
              await loadData()
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Selesaikan {resolvingIssue.code}
            </h3>
            <p className="text-xs text-slate-600">{resolvingIssue.title}</p>
            <textarea
              rows={3}
              required
              value={issueResolutionNote}
              onChange={(e) => setIssueResolutionNote(e.target.value)}
              placeholder="Catatan keputusan atau verifikasi..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingIssue(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
              >
                Tandai Selesai
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
