import { useState, type FormEvent } from 'react'
import { EMAIL_CATEGORY_NAME_MAX, validateCategoryName, type EmailCategory } from '@attentiveid/shared'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTx } from '@/features/i18n/use-tx'
import { addCategory, deleteCategory, renameCategory } from './service'
import { buttonPrimary, iconButton, inputClass } from './styles'

export function CategoryDialog({ categories, onClose, onChanged }: { categories: EmailCategory[]; onClose: () => void; onChanged: () => void }) {
  const { tx } = useTx()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    setBusy(true)
    setFailure('')
    try {
      await action()
      after?.()
      onChanged()
    } catch (caught) {
      setFailure(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setBusy(false)
    }
  }

  const add = (event: FormEvent) => {
    event.preventDefault()
    const clean = validateCategoryName(name)
    if (!clean) return setFailure(tx('Nama wajib diisi, tanpa titik koma.', 'A name is required, without semicolons.'))
    void run(() => addCategory(clean), () => setName(''))
  }

  const rename = (event: FormEvent) => {
    event.preventDefault()
    if (!editing) return
    const clean = validateCategoryName(editing.name)
    if (!clean) return setFailure(tx('Nama wajib diisi, tanpa titik koma.', 'A name is required, without semicolons.'))
    void run(() => renameCategory(editing.id, clean), () => setEditing(null))
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white">
        <DialogTitle className="text-lg font-semibold text-slate-900">{tx('Kategori', 'Categories')}</DialogTitle>
        <DialogDescription className="text-sm text-slate-600">
          {tx('Kategori bawaan tidak bisa diubah. Kategori hanya bisa dihapus kalau tidak ada kontak di dalamnya.', 'Built-in categories cannot be changed. A category can be deleted only when no contact has it.')}
        </DialogDescription>
        <ul className="divide-y divide-slate-100">
          {categories.map((category) => (
            <li className="flex min-h-12 items-center gap-2 py-1" key={category.id}>
              {editing?.id === category.id ? (
                <form className="flex flex-1 items-center gap-2" onSubmit={rename}>
                  <input aria-label={tx('Nama kategori', 'Category name')} autoFocus className={inputClass} maxLength={EMAIL_CATEGORY_NAME_MAX} onChange={(e) => setEditing({ id: category.id, name: e.target.value })} value={editing.name} />
                  <button aria-label={tx('Simpan nama', 'Save name')} className={iconButton} disabled={busy} type="submit"><Check aria-hidden="true" className="size-4" /></button>
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1 break-words text-sm text-slate-800">{category.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">{tx(`${category.count} kontak`, `${category.count} contacts`)}</span>
                  {!category.builtin && (
                    <>
                      <button aria-label={tx(`Ubah ${category.name}`, `Rename ${category.name}`)} className={iconButton} onClick={() => setEditing({ id: category.id, name: category.name })} type="button">
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button aria-label={tx(`Hapus ${category.name}`, `Delete ${category.name}`)} className={`${iconButton} disabled:opacity-40`} disabled={busy || category.count > 0} onClick={() => void run(() => deleteCategory(category.id))} type="button">
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        <form className="flex gap-2" onSubmit={add}>
          <input aria-label={tx('Kategori baru', 'New category')} className={inputClass} maxLength={EMAIL_CATEGORY_NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder={tx('Kategori baru', 'New category')} value={name} />
          <button className={`${buttonPrimary} shrink-0`} disabled={busy} type="submit">{tx('Tambah', 'Add')}</button>
        </form>
        {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
      </DialogContent>
    </Dialog>
  )
}
