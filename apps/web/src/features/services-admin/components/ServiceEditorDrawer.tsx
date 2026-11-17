import { Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type {
  InternalProductItem,
  InternalPsychologistMatrixRow,
  PublicServiceCategory,
  PublicServiceSubgroup,
  ServiceBranch,
  ServiceLifecycleStatus,
  ServiceModality,
  ServicePricingModel,
  ServiceType,
  ServiceVisibility,
} from '@attentiveid/shared'
import type { AdminServiceUpsertInput } from '../api'

export interface ServiceEditorDrawerProps {
  service: InternalProductItem | null
  isNew: boolean
  categories: (PublicServiceCategory & { nameId: string; nameEn: string })[]
  subgroups: (PublicServiceSubgroup & { nameId: string; nameEn: string })[]
  psychologists: InternalPsychologistMatrixRow[]
  onClose: () => void
  onSave: (payload: AdminServiceUpsertInput) => Promise<void>
}

interface VariantDraft {
  id?: string
  slug: string
  status: ServiceLifecycleStatus
  visibility: ServiceVisibility
  nameId: string
  nameEn: string
  unitLabelId: string
  durationLabelId: string
  modalities: ServiceModality[]
  branch: ServiceBranch | null
  priceOnRequest: boolean
  publicPriceAmount: string
}

type DrawerTab = 'info' | 'copy' | 'variants' | 'providers'

export function ServiceEditorDrawer({
  service,
  isNew,
  categories,
  subgroups,
  psychologists,
  onClose,
  onSave,
}: ServiceEditorDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('info')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [slug, setSlug] = useState(service?.slug ?? '')
  const [categorySlug, setCategorySlug] = useState(service?.categorySlug ?? categories[0]?.slug ?? 'asesmen')
  const [subgroupSlug, setSubgroupSlug] = useState(service?.subgroupSlug ?? '')
  const [serviceType, setServiceType] = useState<ServiceType>(service?.serviceType ?? 'layanan')
  const [pricingModel, setPricingModel] = useState<ServicePricingModel>(service?.pricingModel ?? 'fixed_variant')
  const [status, setStatus] = useState<ServiceLifecycleStatus>(service?.status ?? 'draft')
  const [visibility, setVisibility] = useState<ServiceVisibility>(service?.visibility ?? 'internal')
  const [appliesNewClientFee, setAppliesNewClientFee] = useState(service?.appliesNewClientFee ?? false)
  const [isAssessment, setIsAssessment] = useState(service?.isAssessment ?? false)
  const [isFeaturedSpotlight, setIsFeaturedSpotlight] = useState(service?.isFeaturedSpotlight ?? false)

  const [nameId, setNameId] = useState(service?.nameId ?? '')
  const [nameEn, setNameEn] = useState(service?.nameEn ?? '')
  const [badgeId, setBadgeId] = useState(service?.badgeId ?? '')
  const [shortSummaryId, setShortSummaryId] = useState(service?.shortSummaryId ?? '')
  const [benefitId, setBenefitId] = useState(service?.benefitId ?? '')
  const [introductionId, setIntroductionId] = useState(service?.introductionId ?? '')
  const [targetAudienceId, setTargetAudienceId] = useState(service?.targetAudienceId ?? '')
  const [durationInfoId, setDurationInfoId] = useState(service?.durationInfoId ?? '')
  const [locationInfoId, setLocationInfoId] = useState(service?.locationInfoId ?? '')

  const [linkedPsychSlugs, setLinkedPsychSlugs] = useState<string[]>(
    service?.linkedPsychologistSlugs ?? [],
  )
  const [variants, setVariants] = useState<VariantDraft[]>(
    service?.variants.map((v) => ({
      id: v.id,
      slug: v.slug,
      status: v.status,
      visibility: v.visibility,
      nameId: v.nameId,
      nameEn: v.nameEn,
      unitLabelId: v.unitLabelId ?? '',
      durationLabelId: v.durationLabelId ?? '',
      modalities: v.modalities.length > 0 ? v.modalities : ['online'],
      branch: v.branch,
      priceOnRequest: v.priceOnRequest,
      publicPriceAmount: v.publicPriceAmount !== null ? String(v.publicPriceAmount) : '',
    })) ?? [
      {
        slug: '',
        status: 'draft',
        visibility: 'internal',
        nameId: 'Paket Utama',
        nameEn: 'Standard Package',
        unitLabelId: 'per layanan',
        durationLabelId: '',
        modalities: ['online', 'offline'],
        branch: null,
        priceOnRequest: false,
        publicPriceAmount: '',
      },
    ],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim() || !nameId.trim()) {
      setError('Slug dan Nama Produk (ID) wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        ...(service?.id && !isNew ? { id: service.id } : {}),
        slug: slug.trim(),
        categorySlug,
        subgroupSlug: subgroupSlug || null,
        serviceType,
        pricingModel,
        status,
        visibility,
        appliesNewClientFee,
        isAssessment,
        isFeaturedSpotlight,
        nameId: nameId.trim(),
        nameEn: nameEn.trim() || nameId.trim(),
        badgeId: badgeId.trim() || null,
        shortSummaryId: shortSummaryId.trim() || null,
        benefitId: benefitId.trim() || null,
        introductionId: introductionId.trim() || null,
        targetAudienceId: targetAudienceId.trim() || null,
        durationInfoId: durationInfoId.trim() || null,
        locationInfoId: locationInfoId.trim() || null,
        linkedPsychologistSlugs: linkedPsychSlugs,
        variants: variants
          .filter((v) => v.slug.trim() && v.nameId.trim())
          .map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            slug: v.slug.trim(),
            status: v.status,
            visibility: v.visibility,
            nameId: v.nameId.trim(),
            nameEn: v.nameEn.trim() || v.nameId.trim(),
            unitLabelId: v.unitLabelId.trim() || null,
            durationLabelId: v.durationLabelId.trim() || null,
            modalities: v.modalities,
            branch: v.branch,
            priceOnRequest: v.priceOnRequest,
            publicPriceAmount: v.publicPriceAmount.trim() !== '' ? Number(v.publicPriceAmount) : null,
          })),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan layanan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? 'Tambah Layanan Baru' : `Edit ${service?.nameId}`}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              {isNew ? 'Produk Baru' : `Editor Layanan · ${service?.completenessPct ?? 0}% Lengkap`}
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              {isNew ? 'Tambah Produk & Layanan' : service?.nameId}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup editor"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 border-b border-slate-200 px-6 pt-2 text-xs font-semibold">
          {(
            [
              ['info', 'Info & Status'],
              ['copy', 'Deskripsi & Konten'],
              ['variants', `Varian & Harga (${variants.length})`],
              ['providers', `Psikolog (${linkedPsychSlugs.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border-b-2 px-3 py-2.5 transition-colors ${
                tab === key
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-6 text-sm">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            {tab === 'info' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Nama Layanan (ID) *</span>
                  <input
                    required
                    value={nameId}
                    onChange={(e) => setNameId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Name (EN)</span>
                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Slug URL *</span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Badge</span>
                  <input
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Kategori</span>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.nameId}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Subkelompok</span>
                  <select
                    value={subgroupSlug}
                    onChange={(e) => setSubgroupSlug(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Tanpa subkelompok</option>
                    {subgroups.map((sg) => (
                      <option key={sg.id} value={sg.slug}>
                        {sg.nameId}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Status Lifecycle</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ServiceLifecycleStatus)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Visibilitas</span>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as ServiceVisibility)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="public">Public (Klien)</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Tipe Produk</span>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="layanan">Layanan Utama (tampil di card)</option>
                    <option value="addon">Add-on / Biaya Tambahan</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Model Harga</span>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value as ServicePricingModel)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="fixed_variant">Fixed Variant</option>
                    <option value="psychologist_rate">Tarif Psikolog Live</option>
                    <option value="price_on_request">Sesuai Kebutuhan / Hubungi Admin</option>
                    <option value="free_external">Gratis / Eksternal</option>
                  </select>
                </label>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={appliesNewClientFee}
                      onChange={(e) => setAppliesNewClientFee(e.target.checked)}
                    />
                    <span>Terapkan Biaya Klien Baru (+Rp 150.000)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isAssessment}
                      onChange={(e) => setIsAssessment(e.target.checked)}
                    />
                    <span>Asesmen Klinis</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFeaturedSpotlight}
                      onChange={(e) => setIsFeaturedSpotlight(e.target.checked)}
                    />
                    <span>Featured Spotlight</span>
                  </label>
                </div>
              </div>
            )}

            {tab === 'copy' && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Ringkasan Singkat (Card)</span>
                  <textarea
                    rows={2}
                    value={shortSummaryId}
                    onChange={(e) => setShortSummaryId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Manfaat Utama</span>
                  <textarea
                    rows={2}
                    value={benefitId}
                    onChange={(e) => setBenefitId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Pengantar / Deskripsi Detail</span>
                  <textarea
                    rows={3}
                    value={introductionId}
                    onChange={(e) => setIntroductionId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Untuk Siapa</span>
                  <textarea
                    rows={2}
                    value={targetAudienceId}
                    onChange={(e) => setTargetAudienceId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Info Durasi</span>
                    <input
                      value={durationInfoId}
                      onChange={(e) => setDurationInfoId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-700">Info Lokasi</span>
                    <input
                      value={locationInfoId}
                      onChange={(e) => setLocationInfoId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
            )}

            {tab === 'variants' && (
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Varian #{idx + 1}</span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-xs text-rose-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="size-3.5" /> Hapus
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Nama Varian *</span>
                        <input
                          value={variant.nameId}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) => (i === idx ? { ...v, nameId: e.target.value } : v)),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Slug Varian *</span>
                        <input
                          value={variant.slug}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) => (i === idx ? { ...v, slug: e.target.value } : v)),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Harga Publik Berlaku (Rp)</span>
                        <input
                          type="number"
                          min={0}
                          value={variant.publicPriceAmount}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) => (i === idx ? { ...v, publicPriceAmount: e.target.value } : v)),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs tabular-nums"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Satuan (unit)</span>
                        <input
                          value={variant.unitLabelId}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) => (i === idx ? { ...v, unitLabelId: e.target.value } : v)),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Status Varian</span>
                        <select
                          value={variant.status}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) =>
                                i === idx ? { ...v, status: e.target.value as ServiceLifecycleStatus } : v,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="inactive">Nonaktif</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-slate-600">Cabang Khusus</span>
                        <select
                          value={variant.branch ?? ''}
                          onChange={(e) =>
                            setVariants((prev) =>
                              prev.map((v, i) =>
                                i === idx
                                  ? { ...v, branch: (e.target.value || null) as ServiceBranch | null }
                                  : v,
                              ),
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="">Semua cabang / umum</option>
                          <option value="tbi">TBI</option>
                          <option value="bsd">BSD</option>
                          <option value="malang">Cabang Malang</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setVariants((prev) => [
                      ...prev,
                      {
                        slug: `${slug || 'svc'}-v${prev.length + 1}`,
                        status: 'draft',
                        visibility: 'internal',
                        nameId: `Varian ${prev.length + 1}`,
                        nameEn: `Variant ${prev.length + 1}`,
                        unitLabelId: 'per layanan',
                        durationLabelId: '',
                        modalities: ['online'],
                        branch: null,
                        priceOnRequest: false,
                        publicPriceAmount: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700"
                >
                  <Plus className="size-4" /> Tambah Varian
                </button>
              </div>
            )}

            {tab === 'providers' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Pilih psikolog / ahli yang menangani layanan ini:
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {psychologists.map((psych) => {
                    const checked = linkedPsychSlugs.includes(psych.slug)
                    return (
                      <label
                        key={psych.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                          checked ? 'border-teal-600 bg-teal-50/70' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2 font-medium text-slate-800">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setLinkedPsychSlugs((prev) =>
                                e.target.checked
                                  ? [...prev, psych.slug]
                                  : prev.filter((s) => s !== psych.slug),
                              )
                            }}
                          />
                          <span>{psych.nickname || psych.name}</span>
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          {psych.tier}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
