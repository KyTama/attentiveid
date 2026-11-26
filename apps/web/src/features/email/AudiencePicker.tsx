import { useEffect, useState } from 'react'
import type { EmailAudience, EmailAudiencePreview, EmailCategory, EmailContact } from '@attentiveid/shared'
import { useTx } from '@/features/i18n/use-tx'
import { toAudience, type AudienceChoice } from './audience'
import { countAudience } from './campaigns'
import { filterContacts } from './filter'
import { inputClass } from './styles'

const LISTED = 100

interface Props {
  choice: AudienceChoice
  categories: EmailCategory[]
  contacts: EmailContact[]
  onChange: (choice: AudienceChoice) => void
  /** The count for the current choice, or null while unknown. */
  onCounted: (preview: EmailAudiencePreview | null) => void
}

/** "Subject": who receives it. */
export function AudiencePicker({ choice, categories, contacts, onChange, onCounted }: Props) {
  const { tx } = useTx()
  const [search, setSearch] = useState('')
  const [counted, setCounted] = useState<{ key: string; preview: EmailAudiencePreview } | null>(null)
  const [failure, setFailure] = useState('')
  const key = JSON.stringify(toAudience(choice))

  useEffect(() => {
    onCounted(null)
    const audience = JSON.parse(key) as EmailAudience | null
    if (!audience) return
    let cancelled = false
    const timer = setTimeout(() => {
      countAudience(audience)
        .then((preview) => {
          if (cancelled) return
          setCounted({ key, preview })
          setFailure('')
          onCounted(preview)
        })
        .catch((caught) => !cancelled && setFailure(caught instanceof Error ? caught.message : 'Gagal menghitung penerima.'))
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key, onCounted])

  const toggle = (list: string[], id: string, on: boolean) => (on ? [...list, id] : list.filter((item) => item !== id))
  const found = filterContacts(contacts, 'all', search)
  const preview = counted?.key === key ? counted.preview : null

  const mode = (value: AudienceChoice['mode'], label: string) => (
    <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-800">
      <input checked={choice.mode === value} name="audience-mode" onChange={() => onChange({ ...choice, mode: value })} type="radio" />
      {label}
    </label>
  )

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium text-slate-700">{tx('Subjek (siapa penerimanya)', 'Subject (who receives)')}</legend>
      <div className="flex flex-wrap gap-x-5">
        {mode('categories', tx('Kategori', 'Categories'))}
        {mode('contacts', tx('Orang tertentu', 'Chosen people'))}
        {mode('all', tx('Semua kontak', 'All contacts'))}
      </div>

      {choice.mode === 'categories' && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" key={category.id}>
              <input checked={choice.categories.includes(category.id)} onChange={(e) => onChange({ ...choice, categories: toggle(choice.categories, category.id, e.target.checked) })} type="checkbox" />
              {category.name}
            </label>
          ))}
        </div>
      )}

      {choice.mode === 'contacts' && (
        <div className="space-y-2">
          <input aria-label={tx('Cari penerima', 'Search recipients')} className={inputClass} onChange={(e) => setSearch(e.target.value)} placeholder={tx('Cari nama atau e-mail', 'Search name or e-mail')} type="search" value={search} />
          <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
            {found.slice(0, LISTED).map((contact) => (
              <li key={contact.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-1 text-sm">
                  <input checked={choice.contacts.includes(contact.id)} disabled={contact.unsubscribed} onChange={(e) => onChange({ ...choice, contacts: toggle(choice.contacts, contact.id, e.target.checked) })} type="checkbox" />
                  <span className="min-w-0 flex-1 truncate text-slate-800">{contact.name || contact.email}{contact.name && <span className="text-slate-500"> · {contact.email}</span>}</span>
                  {contact.unsubscribed && <span className="shrink-0 text-xs text-amber-800">{tx('berhenti', 'unsubscribed')}</span>}
                </label>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            {tx(`${choice.contacts.length} dipilih.`, `${choice.contacts.length} chosen.`)}
            {found.length > LISTED && tx(` Menampilkan ${LISTED} dari ${found.length}; gunakan pencarian.`, ` Showing ${LISTED} of ${found.length}; use the search.`)}
          </p>
        </div>
      )}

      {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
      <p className="text-sm font-semibold text-slate-900" role="status">
        {!toAudience(choice) ? tx('Belum ada penerima dipilih.', 'No recipient chosen yet.')
          : !preview ? tx('Menghitung...', 'Counting...')
            : tx(`${preview.count} penerima`, `${preview.count} recipients`)}
        {preview && preview.unsubscribed + preview.archived > 0 && (
          <span className="font-normal text-slate-500">
            {tx(` (tidak termasuk ${preview.unsubscribed} yang berhenti berlangganan dan ${preview.archived} di arsip)`, ` (leaving out ${preview.unsubscribed} unsubscribed and ${preview.archived} archived)`)}
          </span>
        )}
      </p>
    </fieldset>
  )
}
