import { useEffect, useState } from 'react'
import {
  CAT_BLOCKED_PAGES,
  CAT_PAGES,
  DEFAULT_GIFT,
  GIFT_BLOCKED_PAGES,
  GIFT_PAGES,
  GIFT_PRAYER_TOKEN,
  type GiftFrequency,
  type GiftSettings,
  DEFAULT_BROWSER_TAB,
  DEFAULT_CATS,
  DEFAULT_FLOATING_BAR,
  FEATURED_CARD_ICONS,
  FLOATING_BAR_MAX_ITEMS,
  type BrowserTabSettings,
  type CatSettings,
  type FeaturedCardIcon,
  type FloatingBarItem,
  type FloatingBarSettings,
} from '@attentiveid/shared'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react'
import {
  AdminToolsApiError,
  getAdminSiteSettings,
  saveBrowserTabSettings,
  saveCatSettings,
  saveGiftSettings,
  saveFloatingBarSettings,
  uploadSharePreviewImage,
} from '../../features/admin-tools/service'
import { CARD_ICONS, CARD_ICON_LABELS, CARD_ICON_LABELS_EN } from '../../features/featured/card-style'
import { setSiteSettings } from '../../features/site-settings/use-site-settings'
import { FloatingBarView } from '../../components/landing/FloatingBarView'
import { useTx } from '@/features/i18n/use-tx'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function SiteSettingsPage() {
  const { tx, isEn } = useTx()
  const [bar, setBar] = useState<FloatingBarSettings>(clone(DEFAULT_FLOATING_BAR))
  const [tab, setTab] = useState<BrowserTabSettings>(clone(DEFAULT_BROWSER_TAB))
  const [cats, setCats] = useState<CatSettings>(clone(DEFAULT_CATS))
  const [giftSettings, setGiftSettings] = useState<GiftSettings>(clone(DEFAULT_GIFT))
  const [giftErrors, setGiftErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [barErrors, setBarErrors] = useState<Record<string, string>>({})
  const [tabErrors, setTabErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<'bar' | 'tab' | 'cats' | 'gift' | null>(null)
  const [uploading, setUploading] = useState<'top' | 'favicon' | 'giftImageUrl' | 'sealFrontUrl' | 'sealBackUrl' | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminSiteSettings()
      .then((settings) => {
        if (cancelled) return
        setBar(clone(settings.floatingBar))
        setTab(clone(settings.browserTab))
        setCats(clone(settings.cats))
        setGiftSettings(clone(settings.gift))
      })
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : tx('Gagal memuat pengaturan.', 'Failed to load the settings.')))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patchTop = (patch: Partial<FloatingBarSettings['top']>) => setBar((current) => ({ ...current, top: { ...current.top, ...patch } }))
  const patchItem = (index: number, patch: Partial<FloatingBarItem>) =>
    setBar((current) => ({ ...current, items: current.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) }))
  const moveItem = (index: number, delta: number) =>
    setBar((current) => {
      const items = [...current.items]
      const target = index + delta
      if (target < 0 || target >= items.length) return current
      ;[items[index], items[target]] = [items[target], items[index]]
      return { ...current, items }
    })
  const addItem = () =>
    setBar((current) => ({
      ...current,
      items: [
        ...current.items,
        { id: `item-${Date.now().toString(36)}`, visible: true, label: { id: '', en: '' }, icon: 'sparkles', url: '', highlight: false },
      ],
    }))

  const upload = async (file: File | undefined, target: 'top' | 'favicon') => {
    if (!file) return
    setUploading(target)
    setError(null)
    try {
      const url = await uploadSharePreviewImage(file)
      if (target === 'top') patchTop({ imageUrl: url, mode: 'image' })
      else setTab((current) => ({ ...current, faviconUrl: url }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal mengunggah gambar.', 'Failed to upload the image.'))
    } finally {
      setUploading(null)
    }
  }

  const saveBar = async () => {
    setSaving('bar')
    setError(null)
    setBarErrors({})
    try {
      const settings = await saveFloatingBarSettings(bar)
      setSiteSettings(settings)
      setBar(clone(settings.floatingBar))
      setNotice(tx('Bar melayang tersimpan. Halaman publik memuat pengaturan baru dalam sekitar satu menit.', 'Floating bar saved. Public pages pick up the new settings within about a minute.'))
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setBarErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setSaving(null)
    }
  }

  const uploadGiftImage = async (file: File | undefined, key: 'giftImageUrl' | 'sealFrontUrl' | 'sealBackUrl') => {
    if (!file) return
    setUploading(key)
    setError(null)
    try {
      const url = await uploadSharePreviewImage(file)
      setGiftSettings((current) => ({ ...current, [key]: url }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal mengunggah gambar.', 'Failed to upload the image.'))
    } finally {
      setUploading(null)
    }
  }

  const saveGift = async () => {
    setSaving('gift')
    setError(null)
    setGiftErrors({})
    try {
      const settings = await saveGiftSettings(giftSettings)
      setSiteSettings(settings)
      setGiftSettings(clone(settings.gift))
      setNotice(tx('Pengaturan hadiah tersimpan. Halaman publik memuat pengaturan baru dalam sekitar satu menit.', 'Gift settings saved. Public pages pick up the new settings within about a minute.'))
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setGiftErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setSaving(null)
    }
  }

  const saveCats = async () => {
    setSaving('cats')
    setError(null)
    try {
      const settings = await saveCatSettings(cats)
      setSiteSettings(settings)
      setCats(clone(settings.cats))
      setNotice(tx('Pengaturan kucing tersimpan. Halaman publik memuat pengaturan baru dalam sekitar satu menit.', 'Cat settings saved. Public pages pick up the new settings within about a minute.'))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setSaving(null)
    }
  }

  const saveTab = async () => {
    setSaving('tab')
    setError(null)
    setTabErrors({})
    try {
      const settings = await saveBrowserTabSettings(tab)
      setSiteSettings(settings)
      setTab(clone(settings.browserTab))
      setNotice(tx('Pengaturan tab browser tersimpan.', 'Browser tab settings saved.'))
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setTabErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setSaving(null)
    }
  }

  const iconLabel = (icon: FeaturedCardIcon) => (isEn ? CARD_ICON_LABELS_EN[icon] : CARD_ICON_LABELS[icon])

  const iconPicker = (value: FeaturedCardIcon, onChange: (icon: FeaturedCardIcon) => void, label: string) => (
    <div aria-label={label} className="flex flex-wrap gap-1.5" role="group">
      {FEATURED_CARD_ICONS.map((icon) => {
        const Icon = CARD_ICONS[icon]
        return (
          <button
            aria-label={iconLabel(icon)}
            aria-pressed={value === icon}
            className={`grid size-9 place-items-center rounded-lg border cursor-pointer ${
              value === icon ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            key={icon}
            onClick={() => onChange(icon)}
            title={iconLabel(icon)}
            type="button"
          >
            <Icon size={16} strokeWidth={2.2} />
          </button>
        )
      })}
    </div>
  )

  if (isLoading) return <p className="p-10 text-center text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Pengaturan Situs', 'Site Settings')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {tx('Atur bar melayang di bagian bawah halaman publik dan judul serta ikon tab browser.', 'Set the floating bar at the bottom of the public pages and the browser tab title and icon.')}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {notice}
        </div>
      )}

      {/* ---------------- Floating bar ---------------- */}
      <section aria-labelledby="bar-heading" className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900" id="bar-heading">
              {tx('Bar melayang', 'Floating bar')}
            </h2>
            <p className="text-xs text-slate-500">
              {tx('Lingkaran di tengah atas (logo lampu atau tautan teks + ikon) dan tombol di bawahnya.', 'The round badge on top (the lights logo or a text link + icon) and the buttons below it.')}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input checked={bar.visible} onChange={(e) => setBar({ ...bar, visible: e.target.checked })} type="checkbox" />
            {tx('Tampilkan bar di website', 'Show the bar on the website')}
          </label>
        </div>

        {/* Preview */}
        <div>
          <span className="text-sm font-medium text-slate-700">{tx('Pratinjau', 'Preview')}</span>
          <div className="mt-2 rounded-xl border border-slate-200 bg-[#FAF8F3] px-4 pb-6 pt-10">
            <FloatingBarView isId={!isEn} preview settings={bar} />
          </div>
        </div>

        {/* Top badge */}
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">{tx('Lingkaran di tengah atas', 'Top centre badge')}</h3>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input checked={bar.top.visible} onChange={(e) => patchTop({ visible: e.target.checked })} type="checkbox" />
              {tx('Tampilkan', 'Show')}
            </label>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={tx('Jenis', 'Type')}>
            {(['image', 'link'] as const).map((mode) => (
              <button
                aria-pressed={bar.top.mode === mode}
                className={`rounded-xl border px-3 py-2 text-sm font-medium cursor-pointer ${
                  bar.top.mode === mode ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                key={mode}
                onClick={() => patchTop({ mode })}
                type="button"
              >
                {mode === 'image' ? tx('Logo (gambar)', 'Logo (image)') : tx('Tautan teks + ikon', 'Text link + icon')}
              </button>
            ))}
          </div>

          {bar.top.mode === 'image' ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-14 place-items-center rounded-full border border-slate-200 bg-secondary">
                {bar.top.imageUrl && <img alt="" className="size-9 object-contain" height={36} src={bar.top.imageUrl} width={36} />}
              </span>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {uploading === 'top' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
                {tx('Unggah logo', 'Upload logo')}
                <input accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => upload(e.target.files?.[0], 'top')} type="file" />
              </label>
              <button className="text-sm text-slate-500 underline cursor-pointer" onClick={() => patchTop({ imageUrl: DEFAULT_FLOATING_BAR.top.imageUrl })} type="button">
                {tx('Pakai logo bawaan (Attend)', 'Use the default logo (Attend)')}
              </button>
              {barErrors['top.imageUrl'] && <span className="w-full text-xs text-rose-700">{barErrors['top.imageUrl']}</span>}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                {tx('Teks (Indonesia)', 'Text (Indonesian)')}
                <input className={inputClass} maxLength={40} onChange={(e) => patchTop({ label: { ...bar.top.label, id: e.target.value } })} value={bar.top.label.id} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                {tx('Teks (English)', 'Text (English)')}
                <input className={inputClass} maxLength={40} onChange={(e) => patchTop({ label: { ...bar.top.label, en: e.target.value } })} value={bar.top.label.en} />
              </label>
              {barErrors['top.label'] && <span className="text-xs text-rose-700 sm:col-span-2">{barErrors['top.label']}</span>}
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">{tx('Ikon', 'Icon')}</span>
                <div className="mt-1.5">
                  {iconPicker(bar.top.icon, (icon) => patchTop({ icon }), tx('Ikon', 'Icon'))}
                </div>
              </div>
            </div>
          )}
          <label className="block text-sm font-medium text-slate-700">
            {tx('Tautan (opsional)', 'Link (optional)')}
            <input className={inputClass} onChange={(e) => patchTop({ url: e.target.value })} placeholder="/let-there-be-light" value={bar.top.url} />
            {barErrors['top.url'] && <span className="text-xs text-rose-700">{barErrors['top.url']}</span>}
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{tx('Tombol di bawah', 'Buttons')}</h3>
            <button
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              disabled={bar.items.length >= FLOATING_BAR_MAX_ITEMS}
              onClick={addItem}
              type="button"
            >
              <Plus className="size-4" aria-hidden="true" />
              {tx('Tambah tombol', 'Add button')}
            </button>
          </div>
          {barErrors.items && <span className="text-xs text-rose-700">{barErrors.items}</span>}
          {bar.items.map((item, index) => (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4" key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">#{index + 1}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input checked={item.visible} onChange={(e) => patchItem(index, { visible: e.target.checked })} type="checkbox" />
                    {tx('Tampil', 'Show')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input checked={item.highlight} onChange={(e) => patchItem(index, { highlight: e.target.checked })} type="checkbox" />
                    {tx('Warna emas', 'Gold color')}
                  </label>
                  <button aria-label={tx(`Naikkan tombol ${index + 1}`, `Move button ${index + 1} up`)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer" disabled={index === 0} onClick={() => moveItem(index, -1)} type="button">
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                  </button>
                  <button aria-label={tx(`Turunkan tombol ${index + 1}`, `Move button ${index + 1} down`)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer" disabled={index === bar.items.length - 1} onClick={() => moveItem(index, 1)} type="button">
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </button>
                  <button aria-label={tx(`Hapus tombol ${index + 1}`, `Delete button ${index + 1}`)} className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => setBar((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))} type="button">
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  {tx('Teks (Indonesia)', 'Text (Indonesian)')}
                  <input className={inputClass} maxLength={40} onChange={(e) => patchItem(index, { label: { ...item.label, id: e.target.value } })} value={item.label.id} />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  {tx('Teks (English)', 'Text (English)')}
                  <input className={inputClass} maxLength={40} onChange={(e) => patchItem(index, { label: { ...item.label, en: e.target.value } })} value={item.label.en} />
                </label>
                {barErrors[`items.${index}.label`] && <span className="text-xs text-rose-700 sm:col-span-2">{barErrors[`items.${index}.label`]}</span>}
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  {tx('Tautan', 'Link')}
                  <input className={inputClass} onChange={(e) => patchItem(index, { url: e.target.value })} placeholder="https://..." value={item.url} />
                  {barErrors[`items.${index}.url`] && <span className="text-xs text-rose-700">{barErrors[`items.${index}.url`]}</span>}
                </label>
                <div className="sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">{tx('Ikon', 'Icon')}</span>
                  <div className="mt-1.5">
                    {iconPicker(item.icon, (icon) => patchItem(index, { icon }), tx('Ikon', 'Icon'))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            disabled={saving === 'bar'}
            onClick={saveBar}
            type="button"
          >
            {saving === 'bar' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tx('Simpan bar melayang', 'Save floating bar')}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={() => {
              setBar(clone(DEFAULT_FLOATING_BAR))
              setNotice(null)
            }}
            type="button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {tx('Kembalikan ke bawaan', 'Reset to default')}
          </button>
        </div>
      </section>

      {/* ---------------- Browser tab ---------------- */}
      <section aria-labelledby="tab-heading" className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900" id="tab-heading">
            {tx('Tab browser', 'Browser tab')}
          </h2>
          <p className="text-xs text-slate-500">
            {tx('Judul dan ikon yang tampil di tab browser untuk halaman beranda. Halaman lain (mis. Sci-Brief, Sesi Gratis) tetap memakai judulnya sendiri.', 'The title and icon shown in the browser tab for the home page. Other pages (e.g. Sci-Brief, Free Session) keep their own titles.')}
          </p>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700">{tx('Pratinjau tab', 'Tab preview')}</span>
          <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-t-lg border border-slate-300 border-b-0 bg-slate-100 px-3 py-2 text-xs text-slate-800 shadow-xs">
            <img alt="" className="size-4 shrink-0 object-contain" height={16} src={tab.faviconUrl || '/images/favicon.webp'} width={16} />
            <span className="truncate">{(isEn ? tab.titleEn : tab.titleId) || tab.titleId}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {tx('Judul tab (Indonesia)', 'Tab title (Indonesian)')}
            <input className={inputClass} maxLength={70} onChange={(e) => setTab({ ...tab, titleId: e.target.value })} value={tab.titleId} />
            {tabErrors.titleId && <span className="text-xs text-rose-700">{tabErrors.titleId}</span>}
          </label>
          <label className="text-sm font-medium text-slate-700">
            {tx('Judul tab (English)', 'Tab title (English)')}
            <input className={inputClass} maxLength={70} onChange={(e) => setTab({ ...tab, titleEn: e.target.value })} value={tab.titleEn} />
            {tabErrors.titleEn && <span className="text-xs text-rose-700">{tabErrors.titleEn}</span>}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {uploading === 'favicon' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
            {tx('Unggah ikon tab', 'Upload tab icon')}
            <input accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => upload(e.target.files?.[0], 'favicon')} type="file" />
          </label>
          {tab.faviconUrl && (
            <button className="text-sm text-slate-500 underline cursor-pointer" onClick={() => setTab({ ...tab, faviconUrl: '' })} type="button">
              {tx('Pakai ikon bawaan', 'Use the default icon')}
            </button>
          )}
          <span className="text-xs text-slate-500">{tx('Disarankan gambar persegi (mis. 64×64), PNG/WebP, maks 2 MB.', 'A square image works best (e.g. 64×64), PNG/WebP, max 2 MB.')}</span>
          {tabErrors.faviconUrl && <span className="w-full text-xs text-rose-700">{tabErrors.faviconUrl}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            disabled={saving === 'tab'}
            onClick={saveTab}
            type="button"
          >
            {saving === 'tab' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tx('Simpan tab browser', 'Save browser tab')}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={() => setTab(clone(DEFAULT_BROWSER_TAB))}
            type="button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {tx('Kembalikan ke bawaan', 'Reset to default')}
          </button>
        </div>
      </section>

      <section aria-labelledby="cats-heading" className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900" id="cats-heading">
            {tx('Kucing jalan-jalan', 'Walking cats')}
          </h2>
          <p className="text-xs text-slate-500">
            {tx('Delapan kucing 3D yang berjalan di halaman publik dan bisa diajak main. Bawaan: menyala di semua halaman di bawah, kecuali formulir dan Let There Be Light. Pengunjung yang mengaktifkan "kurangi gerakan" di perangkatnya tidak melihat kucing.', 'Eight 3D cats that walk around the public pages and can be played with. Default: on for every page below, except the forms and Let There Be Light. Visitors who ask their device for reduced motion do not see them.')}
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
          <input checked={cats.enabled} className="size-4 accent-navy-700" onChange={(e) => setCats({ ...cats, enabled: e.target.checked })} type="checkbox" />
          {tx('Nyalakan kucing di situs', 'Turn the cats on for the site')}
        </label>

        <fieldset className="space-y-2" disabled={!cats.enabled}>
          <legend className="mb-1 text-sm font-medium text-slate-700">{tx('Tampil di halaman', 'Show on these pages')}</legend>
          {CAT_PAGES.map((page) => (
            <label className={`flex cursor-pointer items-center gap-3 text-sm ${cats.enabled ? 'text-slate-800' : 'text-slate-400'}`} key={page.path}>
              <input
                checked={cats.pages[page.path] !== false}
                className="size-4 accent-navy-700"
                onChange={(e) => setCats({ ...cats, pages: { ...cats.pages, [page.path]: e.target.checked } })}
                type="checkbox"
              />
              <span>{isEn ? page.labelEn : page.labelId}</span>
              <span className="text-xs text-slate-400">{page.path}</span>
            </label>
          ))}
          {CAT_BLOCKED_PAGES.map((page) => (
            <label className="flex items-center gap-3 text-sm text-slate-400" key={page.path}>
              <input checked={false} className="size-4" disabled type="checkbox" />
              <span>{isEn ? page.labelEn : page.labelId}</span>
              <span className="text-xs">{page.path} · {tx('selalu mati', 'always off')}</span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            disabled={saving === 'cats'}
            onClick={saveCats}
            type="button"
          >
            {saving === 'cats' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tx('Simpan kucing', 'Save cats')}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={() => setCats(clone(DEFAULT_CATS))}
            type="button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {tx('Kembalikan ke bawaan', 'Reset to default')}
          </button>
        </div>
      </section>

      <section aria-labelledby="gift-heading" className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900" id="gift-heading">
            {tx('Hadiah untuk pengunjung', 'Gift for visitors')}
          </h2>
          <p className="text-xs text-slate-500">
            {tx(
              'Hadiah muncul saat pengunjung masuk ke situs. Jika tombol kucing pengunjung menyala, seekor kucing menunjukkan hadiah dan memanggil "Klik aku!"; setelah 3 kali tidak ditanggapi kucing kedua datang dan hadiah membesar bertahap sampai menutupi layar. Jika kucing mati, hadiah langsung membesar bertahap. Isinya surat dengan doa acak dari pengunjung (dikirim lewat halaman Let There Be Light).',
              'The gift shows when a visitor enters the site. With the visitor\'s cat button on, a cat shows the gift and calls "Click me!"; after 3 unanswered tries a second cat joins and the gift grows step by step until it covers the screen. With cats off, the gift just grows step by step. Inside is a letter with a random prayer from visitors (sent on the Let There Be Light page).',
            )}
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
          <input checked={giftSettings.enabled} className="size-4 accent-navy-700" onChange={(e) => setGiftSettings({ ...giftSettings, enabled: e.target.checked })} type="checkbox" />
          {tx('Nyalakan hadiah di situs', 'Turn the gift on for the site')}
        </label>

        <fieldset className="space-y-2" disabled={!giftSettings.enabled}>
          <legend className="mb-1 text-sm font-medium text-slate-700">{tx('Tampil di halaman', 'Show on these pages')}</legend>
          {GIFT_PAGES.map((page) => (
            <label className={`flex cursor-pointer items-center gap-3 text-sm ${giftSettings.enabled ? 'text-slate-800' : 'text-slate-400'}`} key={page.path}>
              <input
                checked={giftSettings.pages[page.path] === true}
                className="size-4 accent-navy-700"
                onChange={(e) => setGiftSettings({ ...giftSettings, pages: { ...giftSettings.pages, [page.path]: e.target.checked } })}
                type="checkbox"
              />
              <span>{isEn ? page.labelEn : page.labelId}</span>
              <span className="text-xs text-slate-400">{page.path}</span>
            </label>
          ))}
          {GIFT_BLOCKED_PAGES.map((page) => (
            <label className="flex items-center gap-3 text-sm text-slate-400" key={page.path}>
              <input checked={false} className="size-4" disabled type="checkbox" />
              <span>{isEn ? page.labelEn : page.labelId}</span>
              <span className="text-xs">{page.path} · {tx('selalu mati', 'always off')}</span>
            </label>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {tx('Seberapa sering muncul', 'How often it shows')}
            <select className={inputClass} onChange={(e) => setGiftSettings({ ...giftSettings, frequency: e.target.value as GiftFrequency })} value={giftSettings.frequency}>
              <option value="session">{tx('Sekali per kunjungan (sesi browser)', 'Once per visit (browser session)')}</option>
              <option value="day">{tx('Sekali sehari', 'Once a day')}</option>
              <option value="always">{tx('Setiap membuka halaman (untuk mencoba)', 'On every page load (for testing)')}</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {tx('Doa baru dari pengunjung', 'New prayers from visitors')}
            <select className={inputClass} onChange={(e) => setGiftSettings({ ...giftSettings, moderation: e.target.value as GiftSettings['moderation'] })} value={giftSettings.moderation}>
              <option value="auto">{tx('Langsung bisa tampil di hadiah', 'May show in the gift right away')}</option>
              <option value="manual">{tx('Tampil setelah saya setujui (menu Doa Pengunjung)', 'Show after I approve them (menu Doa Pengunjung)')}</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ['giftImageUrl', tx('Gambar hadiah', 'Gift picture'), tx('Kosong = kotak merah 3D dengan pita kuning.', 'Empty = the 3D red box with a yellow ribbon.')],
              ['sealFrontUrl', tx('Segel surat (depan)', 'Letter seal (front)'), tx('Kosong = logo Attentive.', 'Empty = the Attentive mark.')],
              ['sealBackUrl', tx('Segel surat (belakang)', 'Letter seal (back)'), tx('Kosong = logo Let There Be Light.', 'Empty = the Let There Be Light logo.')],
            ] as const
          ).map(([key, label, hint]) => (
            <div className="space-y-2 rounded-xl border border-slate-200 p-3" key={key}>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50">
                {giftSettings[key] ? <img alt="" className="max-h-16 max-w-full object-contain" src={giftSettings[key]} /> : <span className="text-xs text-slate-400">{tx('Bawaan', 'Default')}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  {uploading === key ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-3.5" aria-hidden="true" />}
                  {tx('Unggah', 'Upload')}
                  <input accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={(e) => uploadGiftImage(e.target.files?.[0], key)} type="file" />
                </label>
                {giftSettings[key] && (
                  <button className="text-xs text-slate-500 underline cursor-pointer" onClick={() => setGiftSettings({ ...giftSettings, [key]: '' })} type="button">
                    {tx('Pakai bawaan', 'Use default')}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{hint}</p>
              {giftErrors[key] && <span className="text-xs text-rose-700">{giftErrors[key]}</span>}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {tx('Teks surat (Indonesia)', 'Letter text (Indonesian)')}
            <textarea className={`${inputClass} min-h-44`} maxLength={1200} onChange={(e) => setGiftSettings({ ...giftSettings, messageId: e.target.value })} value={giftSettings.messageId} />
            {giftErrors.messageId && <span className="text-xs text-rose-700">{giftErrors.messageId}</span>}
          </label>
          <label className="text-sm font-medium text-slate-700">
            {tx('Teks surat (English)', 'Letter text (English)')}
            <textarea className={`${inputClass} min-h-44`} maxLength={1200} onChange={(e) => setGiftSettings({ ...giftSettings, messageEn: e.target.value })} value={giftSettings.messageEn} />
            {giftErrors.messageEn && <span className="text-xs text-rose-700">{giftErrors.messageEn}</span>}
          </label>
        </div>
        <p className="-mt-3 text-xs text-slate-500">
          {tx(`Tulis ${GIFT_PRAYER_TOKEN} di tempat doa akan muncul.`, `Write ${GIFT_PRAYER_TOKEN} where the prayer should appear.`)}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-800">
            <input checked={giftSettings.showName} className="size-4 accent-navy-700" onChange={(e) => setGiftSettings({ ...giftSettings, showName: e.target.checked })} type="checkbox" />
            {tx('Tampilkan nama pengirim doa', "Show the prayer sender's name")}
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-800">
            <input checked={giftSettings.showCity} className="size-4 accent-navy-700" onChange={(e) => setGiftSettings({ ...giftSettings, showCity: e.target.checked })} type="checkbox" />
            {tx('Tampilkan kota pengirim doa', "Show the prayer sender's city")}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer"
            disabled={saving === 'gift'}
            onClick={saveGift}
            type="button"
          >
            {saving === 'gift' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {tx('Simpan hadiah', 'Save gift')}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={() => setGiftSettings(clone(DEFAULT_GIFT))}
            type="button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {tx('Kembalikan ke bawaan', 'Reset to default')}
          </button>
        </div>
      </section>
    </div>
  )
}
