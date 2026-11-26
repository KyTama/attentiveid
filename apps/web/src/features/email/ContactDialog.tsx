import { useState, type FormEvent } from 'react'
import {
  DEFAULT_EMAIL_CATEGORY, EMAIL_ADDRESS_MAX, EMAIL_NAME_MAX, EMAIL_PHONE_MAX, suggestNameFromEmail, validateContact,
  type EmailCategory, type EmailContact, type EmailContactErrors,
} from '@attentiveid/shared'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTx } from '@/features/i18n/use-tx'
import { EmailRequestError, saveContact } from './service'
import { buttonPrimary, buttonSecondary, inputClass } from './styles'

interface Props {
  /** Null = a new contact. */
  contact: EmailContact | null
  categories: EmailCategory[]
  onClose: () => void
  onSaved: () => void
}

export function ContactDialog({ contact, categories, onClose, onSaved }: Props) {
  const { tx } = useTx()
  const fallback = categories.find((category) => category.builtin && category.name === DEFAULT_EMAIL_CATEGORY)
  const [email, setEmail] = useState(contact?.email ?? '')
  const [name, setName] = useState(contact?.name ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [chosen, setChosen] = useState<string[]>(contact?.categoryIds ?? (fallback ? [fallback.id] : []))
  const [errors, setErrors] = useState<EmailContactErrors>({})
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  const problem = (field: keyof EmailContactErrors) => {
    const code = errors[field]
    if (!code) return ''
    if (code === 'required') return field === 'categoryIds' ? tx('Pilih minimal satu kategori.', 'Choose at least one category.') : tx('Wajib diisi.', 'Required.')
    if (code === 'too_long') return tx('Terlalu panjang.', 'Too long.')
    if (code === 'too_many') return tx('Terlalu banyak kategori.', 'Too many categories.')
    return field === 'email' ? tx('Alamat e-mail tidak valid.', 'Not a valid e-mail address.') : tx('Isian tidak valid.', 'Not valid.')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFailure('')
    const checked = validateContact({ email, name, phone, categoryIds: chosen })
    const found: EmailContactErrors = checked.ok ? {} : checked.errors
    if (chosen.length === 0) found.categoryIds = 'required'
    setErrors(found)
    if (!checked.ok || found.categoryIds) return
    setBusy(true)
    try {
      await saveContact(contact?.id ?? null, checked.value)
      onSaved()
    } catch (caught) {
      if (caught instanceof EmailRequestError) setErrors(caught.errors)
      setFailure(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
      setBusy(false)
    }
  }

  const field = (id: 'email' | 'name' | 'phone', label: string, input: React.ReactNode) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={`contact-${id}`}>{label}</label>
      {input}
      {errors[id] && <p className="mt-1 text-xs text-rose-700" id={`contact-${id}-error`}>{problem(id)}</p>}
    </div>
  )
  const describe = (id: 'email' | 'name' | 'phone') => (errors[id] ? { 'aria-invalid': true, 'aria-describedby': `contact-${id}-error` } : {})

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white">
        <DialogTitle className="text-lg font-semibold text-slate-900">{contact ? tx('Ubah kontak', 'Edit contact') : tx('Tambah kontak', 'Add contact')}</DialogTitle>
        <DialogDescription className="sr-only">{tx('E-mail wajib diisi. Nama dan telepon opsional.', 'E-mail is required. Name and phone are optional.')}</DialogDescription>
        <form className="space-y-4" noValidate onSubmit={submit}>
          {field('email', 'E-mail', (
            <input autoComplete="off" className={inputClass} id="contact-email" maxLength={EMAIL_ADDRESS_MAX} type="email" value={email} {...describe('email')}
              onBlur={() => setName((current) => current || suggestNameFromEmail(email.trim()))}
              onChange={(e) => setEmail(e.target.value)} />
          ))}
          {field('name', tx('Nama', 'Name'), (
            <input autoComplete="off" className={inputClass} id="contact-name" maxLength={EMAIL_NAME_MAX} value={name} {...describe('name')} onChange={(e) => setName(e.target.value)} />
          ))}
          {field('phone', tx('Telepon (opsional)', 'Phone (optional)'), (
            <input autoComplete="off" className={inputClass} id="contact-phone" inputMode="tel" maxLength={EMAIL_PHONE_MAX} value={phone} {...describe('phone')} onChange={(e) => setPhone(e.target.value)} />
          ))}
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-slate-700">{tx('Kategori', 'Categories')}</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-800" key={category.id}>
                  <input
                    checked={chosen.includes(category.id)}
                    onChange={(e) => setChosen((current) => (e.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id)))}
                    type="checkbox"
                  />
                  {category.name}
                </label>
              ))}
            </div>
            {errors.categoryIds && <p className="mt-1 text-xs text-rose-700">{problem('categoryIds')}</p>}
          </fieldset>
          {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
          <div className="flex justify-end gap-2">
            <button className={buttonSecondary} onClick={onClose} type="button">{tx('Batal', 'Cancel')}</button>
            <button className={buttonPrimary} disabled={busy} type="submit">{tx('Simpan', 'Save')}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
