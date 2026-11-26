import { useCallback, useEffect, useState } from 'react'
import type { EmailContact } from '@attentiveid/shared'
import { Archive, ArchiveRestore, FileSpreadsheet, MoreHorizontal, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { CategoryDialog } from '@/features/email/CategoryDialog'
import { ContactDialog } from '@/features/email/ContactDialog'
import { ExcelDialog } from '@/features/email/ExcelDialog'
import { filterContacts, type ContactFilter } from '@/features/email/filter'
import { archiveContacts, deleteContacts, listContacts, type EmailBook } from '@/features/email/service'
import { buttonDanger, buttonPrimary, buttonSecondary, iconButton, inputClass } from '@/features/email/styles'
import { useTx } from '@/features/i18n/use-tx'

const PAGE = 100
/** Categories shown as chips; the rest sit in the drop-down. */
const CHIPS = 4

const chip = (active: boolean) =>
  `min-h-10 cursor-pointer rounded-full border px-4 text-sm font-medium ${active ? 'border-navy-700 bg-navy-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`

/** Email menu > Contacts: who bulk e-mails can go to. Admins and superadmins. */
export function EmailContactsPage() {
  const { tx } = useTx()
  const [book, setBook] = useState<EmailBook | null>(null)
  const [archived, setArchived] = useState(false)
  const [filter, setFilter] = useState<ContactFilter>('all')
  const [search, setSearch] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [selected, setSelected] = useState<string[]>([])
  const [menu, setMenu] = useState<string | null>(null)
  const [editing, setEditing] = useState<EmailContact | 'new' | null>(null)
  const [removing, setRemoving] = useState<string[] | null>(null)
  const [managing, setManaging] = useState(false)
  const [excel, setExcel] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [round, setRound] = useState(0)

  const reload = useCallback(() => setRound((value) => value + 1), [])

  useEffect(() => {
    let cancelled = false
    listContacts(archived)
      .then((data) => {
        if (cancelled) return
        setBook(data)
        setError('')
      })
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat kontak.'))
    return () => {
      cancelled = true
    }
  }, [archived, round])

  const categories = book?.categories ?? []
  const visible = filterContacts(book?.contacts ?? [], filter, search)
  const page = visible.slice(0, shown)
  // Only what is on screen can be selected, so a bulk action never touches a contact that is filtered away.
  const marked = selected.filter((id) => page.some((contact) => contact.id === id))
  const nameOf = (id: string) => categories.find((category) => category.id === id)?.name ?? ''
  const extra = categories.slice(CHIPS)

  const choose = (value: ContactFilter) => {
    setFilter(value)
    setShown(PAGE)
  }
  const switchList = (value: boolean) => {
    if (value === archived) return
    setArchived(value)
    setBook(null)
    setSelected([])
    setShown(PAGE)
  }

  const act = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try {
      await action()
      setSelected([])
      setMenu(null)
      reload()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 outline-none sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Kontak e-mail', 'E-mail contacts')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{tx('Daftar penerima untuk e-mail massal. Halaman ini tidak mengirim apa pun.', 'Recipients for bulk e-mail. This page sends nothing.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={buttonSecondary} disabled={!book} onClick={() => setExcel(true)} type="button">
            <FileSpreadsheet aria-hidden="true" className="size-4" />Excel
          </button>
          <button className={buttonSecondary} disabled={!book} onClick={() => setManaging(true)} type="button">
            <Tags aria-hidden="true" className="size-4" />{tx('Kategori', 'Categories')}
          </button>
          <button className={buttonPrimary} disabled={!book} onClick={() => setEditing('new')} type="button">
            <Plus aria-hidden="true" className="size-4" />{tx('Tambah kontak', 'Add contact')}
          </button>
        </div>
      </div>

      <input aria-label={tx('Cari kontak', 'Search contacts')} className={inputClass} onChange={(e) => { setSearch(e.target.value); setShown(PAGE) }} placeholder={tx('Cari nama, e-mail, atau telepon', 'Search name, e-mail or phone')} type="search" value={search} />

      <div aria-label={tx('Saring menurut kategori', 'Filter by category')} className="flex flex-wrap items-center gap-2" role="group">
        <button aria-pressed={filter === 'all'} className={chip(filter === 'all')} onClick={() => choose('all')} type="button">{tx('Semua', 'All')}</button>
        {categories.slice(0, CHIPS).map((category) => (
          <button aria-pressed={filter === category.id} className={chip(filter === category.id)} key={category.id} onClick={() => choose(category.id)} type="button">{category.name}</button>
        ))}
        {extra.length > 0 && (
          <select aria-label={tx('Kategori lainnya', 'More categories')} className={chip(extra.some((c) => c.id === filter))} onChange={(e) => choose(e.target.value || 'all')} value={extra.some((c) => c.id === filter) ? filter : ''}>
            <option value="">{tx('Lainnya', 'More')}</option>
            {extra.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        )}
        <label className="ml-auto flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input checked={archived} onChange={(e) => switchList(e.target.checked)} type="checkbox" />
          {tx('Lihat arsip', 'Show archived')}
        </label>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}
      {!book && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}

      {book && (
        <>
          <div className="flex min-h-11 flex-wrap items-center gap-2">
            <label className="flex min-h-10 cursor-pointer items-center gap-2 pl-3 text-sm text-slate-700">
              <input
                checked={page.length > 0 && marked.length === page.length}
                disabled={page.length === 0}
                onChange={(e) => setSelected(e.target.checked ? page.map((contact) => contact.id) : [])}
                type="checkbox"
              />
              {marked.length > 0 ? tx(`${marked.length} dipilih`, `${marked.length} selected`) : tx(`${visible.length} kontak`, `${visible.length} contacts`)}
            </label>
            {marked.length > 0 && (
              <div className="ml-auto flex flex-wrap gap-2">
                <button className={buttonSecondary} disabled={busy} onClick={() => void act(() => archiveContacts(marked, !archived))} type="button">
                  {archived ? tx('Kembalikan', 'Restore') : tx('Arsipkan', 'Archive')}
                </button>
                <button className={buttonSecondary} disabled={busy} onClick={() => setRemoving(marked)} type="button">{tx('Hapus', 'Delete')}</button>
              </div>
            )}
          </div>

          {visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              {book.contacts.length === 0
                ? archived ? tx('Arsip kosong.', 'The archive is empty.') : tx('Belum ada kontak. Tambahkan yang pertama.', 'No contacts yet. Add the first one.')
                : tx('Tidak ada kontak yang cocok.', 'No contact matches.')}
            </p>
          )}

          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white empty:hidden">
            {page.map((contact) => {
              const who = contact.name || contact.email
              return (
                <li className="group flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-slate-50" key={contact.id}>
                  <input
                    aria-label={tx(`Pilih ${who}`, `Select ${who}`)}
                    checked={selected.includes(contact.id)}
                    onChange={(e) => setSelected((current) => (e.target.checked ? [...current, contact.id] : current.filter((id) => id !== contact.id)))}
                    type="checkbox"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{contact.name || tx('(tanpa nama)', '(no name)')}</p>
                    <p className="truncate text-sm text-slate-600">{contact.email}</p>
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      {contact.phone && <span>{contact.phone}</span>}
                      {contact.categoryIds.map((id) => <span className="rounded-full bg-navy-50 px-2 py-0.5 font-medium text-navy-800" key={id}>{nameOf(id)}</span>)}
                    </p>
                  </div>
                  <button aria-expanded={menu === contact.id} aria-label={tx(`Tindakan untuk ${who}`, `Actions for ${who}`)} className={`${iconButton} md:hidden`} onClick={() => setMenu((current) => (current === contact.id ? null : contact.id))} type="button">
                    <MoreHorizontal aria-hidden="true" className="size-5" />
                  </button>
                  {/* Phones have no hover: the three dots open this row. From tablet width it appears on hover and on keyboard focus. */}
                  <div className={`${menu === contact.id ? 'flex' : 'hidden'} w-full justify-end gap-1 md:flex md:w-auto md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100`}>
                    <button aria-label={tx(`Ubah ${who}`, `Edit ${who}`)} className={iconButton} onClick={() => setEditing(contact)} title={tx('Ubah', 'Edit')} type="button">
                      <Pencil aria-hidden="true" className="size-4" />
                    </button>
                    <button aria-label={archived ? tx(`Kembalikan ${who}`, `Restore ${who}`) : tx(`Arsipkan ${who}`, `Archive ${who}`)} className={iconButton} disabled={busy} onClick={() => void act(() => archiveContacts([contact.id], !archived))} title={archived ? tx('Kembalikan', 'Restore') : tx('Arsipkan', 'Archive')} type="button">
                      {archived ? <ArchiveRestore aria-hidden="true" className="size-4" /> : <Archive aria-hidden="true" className="size-4" />}
                    </button>
                    <button aria-label={tx(`Hapus ${who}`, `Delete ${who}`)} className={iconButton} onClick={() => setRemoving([contact.id])} title={tx('Hapus', 'Delete')} type="button">
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {visible.length > page.length && (
            <button className={`${buttonSecondary} w-full`} onClick={() => setShown((value) => value + PAGE)} type="button">
              {tx(`Tampilkan lagi (${visible.length - page.length} tersisa)`, `Show more (${visible.length - page.length} left)`)}
            </button>
          )}
        </>
      )}

      {book && editing && (
        <ContactDialog
          categories={categories}
          contact={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setMenu(null); reload() }}
        />
      )}
      {book && excel && <ExcelDialog onClose={() => setExcel(false)} onImported={reload} />}
      {book && managing && <CategoryDialog categories={categories} onChanged={reload} onClose={() => setManaging(false)} />}
      {removing && (
        <Dialog open onOpenChange={(open) => !open && setRemoving(null)}>
          <DialogContent className="bg-white">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {tx(`Hapus ${removing.length} kontak?`, `Delete ${removing.length} contact(s)?`)}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {tx('Kontak dihapus permanen dan tidak bisa dikembalikan. Kalau hanya ingin menyembunyikan, arsipkan saja.', 'The contact is deleted for good and cannot be brought back. To only hide it, archive it instead.')}
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <button className={buttonSecondary} onClick={() => setRemoving(null)} type="button">{tx('Batal', 'Cancel')}</button>
              <button className={buttonDanger} disabled={busy} onClick={() => { const ids = removing; setRemoving(null); void act(() => deleteContacts(ids)) }} type="button">
                {tx('Hapus permanen', 'Delete for good')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
