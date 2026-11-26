import type { EmailCategory } from '@attentiveid/shared'
import { useTx } from '@/features/i18n/use-tx'
import type { ContactFilter } from './filter'

/** Categories shown as chips; the rest sit in the drop-down. */
const CHIPS = 4

const chip = (active: boolean) =>
  `min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium ${active ? 'border-navy-700 bg-navy-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`

export function CategoryChips({ categories, value, onChange }: { categories: EmailCategory[]; value: ContactFilter; onChange: (value: ContactFilter) => void }) {
  const { tx } = useTx()
  const extra = categories.slice(CHIPS)
  const inExtra = extra.some((category) => category.id === value)
  return (
    <>
      <button aria-pressed={value === 'all'} className={chip(value === 'all')} onClick={() => onChange('all')} type="button">{tx('Semua', 'All')}</button>
      {categories.slice(0, CHIPS).map((category) => (
        <button aria-pressed={value === category.id} className={chip(value === category.id)} key={category.id} onClick={() => onChange(category.id)} type="button">{category.name}</button>
      ))}
      {extra.length > 0 && (
        <select aria-label={tx('Kategori lainnya', 'More categories')} className={chip(inExtra)} onChange={(e) => onChange(e.target.value || 'all')} value={inExtra ? value : ''}>
          <option value="">{tx('Lainnya', 'More')}</option>
          {extra.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      )}
    </>
  )
}
