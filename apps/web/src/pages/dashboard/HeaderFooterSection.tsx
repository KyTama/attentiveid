import { useEffect, useState, type ReactNode } from 'react'
import {
  DEFAULT_HEADER_FOOTER,
  FOOTER_MAX_LINKS,
  HEADER_MAX_CHILDREN,
  HEADER_MAX_ITEMS,
  type BilingualText,
  type FooterSettings,
  type HeaderFooterSettings,
  type MenuItem,
  type MenuLink,
  type MenuSubItem,
} from '@attentiveid/shared'
import { ArrowDown, ArrowUp, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { AdminToolsApiError, getAdminSiteSettings, saveHeaderFooterSettings } from '../../features/admin-tools/service'
import { setSiteSettings } from '../../features/site-settings/use-site-settings'
import { useTx } from '@/features/i18n/use-tx'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100'
const smallButton = 'rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer'
const outlineButton =
  'flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`

const swap = <T,>(items: T[], index: number, delta: number): T[] => {
  const target = index + delta
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
const replaceAt = <T,>(items: T[], index: number, value: T) => items.map((item, i) => (i === index ? value : item))
const removeAt = <T,>(items: T[], index: number) => items.filter((_, i) => i !== index)

type Errors = Record<string, string>

function FieldError({ message }: { message?: string }) {
  return message ? <span className="block text-xs text-rose-700">{message}</span> : null
}

function TextPair({ label, value, onChange, error, max, long }: {
  label: string
  value: BilingualText
  onChange: (value: BilingualText) => void
  error?: string
  max: number
  long?: boolean
}) {
  const { tx } = useTx()
  const field = (lang: 'id' | 'en', name: string) => (
    <label className="text-sm font-medium text-slate-700">
      {name}
      {long ? (
        <textarea className={`${inputClass} min-h-20`} maxLength={max} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} value={value[lang]} />
      ) : (
        <input className={inputClass} maxLength={max} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} value={value[lang]} />
      )}
    </label>
  )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {field('id', `${label} (Indonesia)`)}
      {field('en', `${label} (${tx('Inggris', 'English')})`)}
      <FieldError message={error} />
    </div>
  )
}

/** Show/hide, move and delete controls shared by every row. */
function RowTools({ name, visible, onVisible, index, count, onMove, onRemove }: {
  name: string
  visible: boolean
  onVisible: (visible: boolean) => void
  index: number
  count: number
  onMove: (delta: number) => void
  onRemove: () => void
}) {
  const { tx } = useTx()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input checked={visible} onChange={(e) => onVisible(e.target.checked)} type="checkbox" />
        {tx('Tampil', 'Show')}
      </label>
      <button aria-label={tx(`Naikkan ${name}`, `Move ${name} up`)} className={smallButton} disabled={index === 0} onClick={() => onMove(-1)} type="button">
        <ArrowUp className="size-3.5" aria-hidden="true" />
      </button>
      <button aria-label={tx(`Turunkan ${name}`, `Move ${name} down`)} className={smallButton} disabled={index === count - 1} onClick={() => onMove(1)} type="button">
        <ArrowDown className="size-3.5" aria-hidden="true" />
      </button>
      <button aria-label={tx(`Hapus ${name}`, `Delete ${name}`)} className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={onRemove} type="button">
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

function UrlField({ value, onChange, error, label }: { value: string; onChange: (value: string) => void; error?: string; label: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input className={inputClass} onChange={(e) => onChange(e.target.value)} placeholder="/halaman, /#bagian, https://..." value={value} />
      <FieldError message={error} />
    </label>
  )
}

function Group({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export function HeaderFooterSection() {
  const { tx, isEn } = useTx()
  const [value, setValue] = useState<HeaderFooterSettings | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAdminSiteSettings()
      .then((settings) => !cancelled && setValue(clone(settings.headerFooter)))
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat menu atas dan footer.'))
    return () => {
      cancelled = true
    }
  }, [])

  const heading = tx('Menu atas & footer', 'Top menu & footer')

  // Never show the defaults as if they were saved: saving them would overwrite the real menu.
  if (!value) {
    return (
      <section aria-label={heading} className="rounded-2xl border border-slate-200/80 bg-white p-5 text-sm shadow-xs sm:p-6">
        {error ? <p className="text-rose-700" role="alert">{error}</p> : <p className="text-slate-500">{tx('Memuat...', 'Loading...')}</p>}
      </section>
    )
  }

  const { header, footer } = value
  const setHeader = (patch: Partial<HeaderFooterSettings['header']>) => setValue({ ...value, header: { ...header, ...patch } })
  const setFooter = (patch: Partial<FooterSettings>) => setValue({ ...value, footer: { ...footer, ...patch } })
  const setItem = (index: number, patch: Partial<MenuItem>) => setHeader({ items: replaceAt(header.items, index, { ...header.items[index], ...patch }) })
  const setChild = (index: number, childIndex: number, patch: Partial<MenuSubItem>) =>
    setItem(index, { children: replaceAt(header.items[index].children, childIndex, { ...header.items[index].children[childIndex], ...patch }) })
  const setLink = (index: number, patch: Partial<MenuLink>) => setFooter({ exploreLinks: replaceAt(footer.exploreLinks, index, { ...footer.exploreLinks[index], ...patch }) })
  const blankText = (): BilingualText => ({ id: '', en: '' })
  const nameOf = (label: BilingualText, index: number) => (isEn ? label.en : label.id) || `#${index + 1}`

  const save = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    setErrors({})
    try {
      const settings = await saveHeaderFooterSettings(value)
      setSiteSettings(settings)
      setValue(clone(settings.headerFooter))
      setNotice(tx('Tersimpan. Halaman publik memuat menu dan footer baru dalam sekitar satu menit.', 'Saved. Public pages pick up the new menu and footer within about a minute.'))
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setSaving(false)
    }
  }

  const textInput = (key: 'whatsappNumber' | 'instagramLabel' | 'instagramUrl' | 'linkedinLabel' | 'linkedinUrl' | 'email', label: string) => (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input className={inputClass} onChange={(e) => setFooter({ [key]: e.target.value })} value={footer[key]} />
      <FieldError message={errors[`footer.${key}`]} />
    </label>
  )

  return (
    <section aria-labelledby="chrome-heading" className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900" id="chrome-heading">{heading}</h2>
        <p className="text-xs text-slate-500">
          {tx(
            'Berlaku di semua halaman publik. Tekan Simpan untuk langsung menayangkan. Tautan: /halaman, /#bagian di beranda, atau https://... (dibuka di tab baru).',
            'Used on every public page. Press Save to put it live right away. Links: /page, /#section on the homepage, or https://... (opens in a new tab).',
          )}
        </p>
      </div>

      <Group
        action={
          <button className={outlineButton} disabled={header.items.length >= HEADER_MAX_ITEMS} onClick={() => setHeader({ items: [...header.items, { id: newId('menu'), visible: true, label: blankText(), url: '', children: [] }] })} type="button">
            <Plus className="size-4" aria-hidden="true" />
            {tx('Tambah menu', 'Add menu')}
          </button>
        }
        title={tx('Menu atas', 'Top menu')}
      >
        <FieldError message={errors['header.items'] ?? errors.header} />
        {header.items.map((item, index) => {
          const name = nameOf(item.label, index)
          const hasErrors = Object.keys(errors).some((key) => key.startsWith(`header.items.${index}.`))
          return (
            <details className="rounded-xl border border-slate-200" key={item.id} open={hasErrors || !item.label.id || undefined}>
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
                {name}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {item.children.length > 0 ? tx(`menu turun · ${item.children.length} isi`, `dropdown · ${item.children.length} entries`) : item.url}
                  {!item.visible && ` · ${tx('disembunyikan', 'hidden')}`}
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-200 p-4">
                <RowTools
                  count={header.items.length}
                  index={index}
                  name={name}
                  onMove={(delta) => setHeader({ items: swap(header.items, index, delta) })}
                  onRemove={() => setHeader({ items: removeAt(header.items, index) })}
                  onVisible={(visible) => setItem(index, { visible })}
                  visible={item.visible}
                />
                <TextPair error={errors[`header.items.${index}.label`]} label={tx('Teks menu', 'Menu text')} max={40} onChange={(label) => setItem(index, { label })} value={item.label} />
                {item.children.length === 0 && (
                  <UrlField error={errors[`header.items.${index}.url`]} label={tx('Tautan', 'Link')} onChange={(url) => setItem(index, { url })} value={item.url} />
                )}
                <FieldError message={errors[`header.items.${index}.children`]} />
                {item.children.map((child, childIndex) => (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-3" key={child.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">{tx('Sub-menu', 'Sub-menu')} {childIndex + 1}</span>
                      <RowTools
                        count={item.children.length}
                        index={childIndex}
                        name={nameOf(child.label, childIndex)}
                        onMove={(delta) => setItem(index, { children: swap(item.children, childIndex, delta) })}
                        onRemove={() => setItem(index, { children: removeAt(item.children, childIndex) })}
                        onVisible={(visible) => setChild(index, childIndex, { visible })}
                        visible={child.visible}
                      />
                    </div>
                    <TextPair error={errors[`header.items.${index}.children.${childIndex}.label`]} label={tx('Teks', 'Text')} max={40} onChange={(label) => setChild(index, childIndex, { label })} value={child.label} />
                    <UrlField error={errors[`header.items.${index}.children.${childIndex}.url`]} label={tx('Tautan', 'Link')} onChange={(url) => setChild(index, childIndex, { url })} value={child.url} />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input checked={child.comingSoon} onChange={(e) => setChild(index, childIndex, { comingSoon: e.target.checked })} type="checkbox" />
                      {tx('Tandai "Segera Hadir" (tidak bisa diklik)', 'Mark as "Coming Soon" (not clickable)')}
                    </label>
                  </div>
                ))}
                <button
                  className={outlineButton}
                  disabled={item.children.length >= HEADER_MAX_CHILDREN}
                  onClick={() => setItem(index, { children: [...item.children, { id: newId('sub'), visible: true, label: blankText(), url: '', comingSoon: false }] })}
                  type="button"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {tx('Tambah sub-menu', 'Add sub-menu')}
                </button>
              </div>
            </details>
          )
        })}

        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input checked={header.cta.visible} onChange={(e) => setHeader({ cta: { ...header.cta, visible: e.target.checked } })} type="checkbox" />
            {tx('Tombol emas di kanan atas', 'Gold button at the top right')}
          </label>
          <TextPair error={errors['header.cta.label']} label={tx('Teks tombol', 'Button text')} max={40} onChange={(label) => setHeader({ cta: { ...header.cta, label } })} value={header.cta.label} />
          <UrlField error={errors['header.cta.url']} label={tx('Tautan tombol', 'Button link')} onChange={(url) => setHeader({ cta: { ...header.cta, url } })} value={header.cta.url} />
        </div>
      </Group>

      <Group title="Footer">
        <FieldError message={errors.footer} />
        <TextPair error={errors['footer.statement']} label={tx('Kalimat di bawah logo', 'Sentence under the logo')} long max={300} onChange={(statement) => setFooter({ statement })} value={footer.statement} />
        <TextPair error={errors['footer.exploreHeading']} label={tx('Judul kolom tautan', 'Links column heading')} max={40} onChange={(exploreHeading) => setFooter({ exploreHeading })} value={footer.exploreHeading} />
        <FieldError message={errors['footer.exploreLinks']} />
        {footer.exploreLinks.map((link, index) => {
          const name = nameOf(link.label, index)
          return (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4" key={link.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{tx('Tautan', 'Link')} {index + 1}</span>
                <RowTools
                  count={footer.exploreLinks.length}
                  index={index}
                  name={name}
                  onMove={(delta) => setFooter({ exploreLinks: swap(footer.exploreLinks, index, delta) })}
                  onRemove={() => setFooter({ exploreLinks: removeAt(footer.exploreLinks, index) })}
                  onVisible={(visible) => setLink(index, { visible })}
                  visible={link.visible}
                />
              </div>
              <TextPair error={errors[`footer.exploreLinks.${index}.label`]} label={tx('Teks', 'Text')} max={40} onChange={(label) => setLink(index, { label })} value={link.label} />
              <UrlField error={errors[`footer.exploreLinks.${index}.url`]} label={tx('Tautan', 'Link')} onChange={(url) => setLink(index, { url })} value={link.url} />
            </div>
          )
        })}
        <button className={outlineButton} disabled={footer.exploreLinks.length >= FOOTER_MAX_LINKS} onClick={() => setFooter({ exploreLinks: [...footer.exploreLinks, { id: newId('link'), visible: true, label: blankText(), url: '' }] })} type="button">
          <Plus className="size-4" aria-hidden="true" />
          {tx('Tambah tautan', 'Add link')}
        </button>

        <TextPair error={errors['footer.locationsHeading']} label={tx('Judul kolom lokasi', 'Locations column heading')} max={40} onChange={(locationsHeading) => setFooter({ locationsHeading })} value={footer.locationsHeading} />
        <p className="text-xs text-slate-500">{tx('Daftar cabang belum bisa diubah dari sini.', 'The list of branches cannot be changed here yet.')}</p>
        <TextPair error={errors['footer.contactHeading']} label={tx('Judul kolom kontak', 'Contact column heading')} max={40} onChange={(contactHeading) => setFooter({ contactHeading })} value={footer.contactHeading} />
        <div className="grid gap-3 sm:grid-cols-2">
          {textInput('whatsappNumber', tx('Nomor WhatsApp', 'WhatsApp number'))}
          {textInput('email', 'E-mail')}
          {textInput('instagramLabel', tx('Teks Instagram', 'Instagram text'))}
          {textInput('instagramUrl', tx('Alamat Instagram', 'Instagram address'))}
          {textInput('linkedinLabel', tx('Teks LinkedIn', 'LinkedIn text'))}
          {textInput('linkedinUrl', tx('Alamat LinkedIn', 'LinkedIn address'))}
        </div>
        <p className="text-xs text-slate-500">
          {tx('Kontak ini hanya mengubah footer. Kosongkan sebuah kolom untuk menyembunyikan barisnya.', 'These contacts change the footer only. Leave a field empty to hide its row.')}
        </p>
        <TextPair error={errors['footer.copyright']} label={tx('Teks hak cipta (setelah "© tahun")', 'Copyright text (after "© year")')} max={120} onChange={(copyright) => setFooter({ copyright })} value={footer.copyright} />
      </Group>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <button className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer" disabled={saving} onClick={save} type="button">
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {tx('Simpan menu & footer', 'Save menu & footer')}
        </button>
        <button
          className={outlineButton}
          onClick={() => {
            setValue(clone(DEFAULT_HEADER_FOOTER))
            setNotice(tx('Bawaan dimuat. Tekan Simpan untuk menayangkan.', 'Defaults loaded. Press Save to put them live.'))
          }}
          type="button"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {tx('Kembalikan ke bawaan', 'Reset to default')}
        </button>
      </div>
    </section>
  )
}
