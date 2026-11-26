import { useState, type ReactNode } from 'react'
import { EMAIL_IMPORT_MAX_BYTES, type EmailImportOverlapReason, type EmailImportPlan, type EmailImportResult } from '@attentiveid/shared'
import { Download } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTx } from '@/features/i18n/use-tx'
import { ConfirmButton } from './ConfirmButton'
import { applyImport, checkImport, downloadContacts } from './service'
import { buttonSecondary } from './styles'

/** Rows listed per group; the count in the heading is always complete. */
const LISTED = 100

type Checked = { id: string; plan: EmailImportPlan }

function Group({ title, count, tone = 'text-slate-900', open, children }: { title: string; count: number; tone?: string; open?: boolean; children?: ReactNode }) {
  const { tx } = useTx()
  if (count === 0) return null
  return (
    <details className="rounded-xl border border-slate-200 px-3 py-2" open={open}>
      <summary className={`cursor-pointer text-sm font-semibold ${tone}`}>{title}: {count}</summary>
      <ul className="mt-2 space-y-1.5 text-xs text-slate-600">{children}</ul>
      {count > LISTED && <p className="mt-1 text-xs text-slate-500">{tx(`Hanya ${LISTED} baris pertama yang ditampilkan.`, `Only the first ${LISTED} rows are listed.`)}</p>}
    </details>
  )
}

export function ExcelDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const { tx } = useTx()
  const [checked, setChecked] = useState<Checked | null>(null)
  const [include, setInclude] = useState<string[]>([])
  const [result, setResult] = useState<EmailImportResult | null>(null)
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const [round, setRound] = useState(0)

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setFailure('')
    try {
      await action()
    } catch (caught) {
      setFailure(caught instanceof Error ? caught.message : tx('Gagal.', 'Failed.'))
    } finally {
      setBusy(false)
    }
  }

  const pick = (file: File | undefined) => {
    setChecked(null)
    setResult(null)
    setInclude([])
    if (!file) return
    if (file.size > EMAIL_IMPORT_MAX_BYTES) return setFailure(tx('Berkas terlalu besar (maksimal 5 MB).', 'The file is too large (5 MB at most).'))
    void run(async () => {
      setChecked(await checkImport(file))
      setRound((value) => value + 1)
    })
  }

  const confirm = () => {
    if (!checked) return
    void run(async () => {
      try {
        setResult(await applyImport(checked.id, include))
        onImported()
      } finally {
        // A preview can be used once, whatever the outcome.
        setChecked(null)
        setRound((value) => value + 1)
      }
    })
  }

  const plan = checked?.plan
  const changes = plan ? plan.added.length + plan.edited.length + include.length : 0

  const overlapReason: Record<EmailImportOverlapReason, string> = {
    email_exists: tx('e-mail sudah ada', 'e-mail already exists'),
    email_archived: tx('e-mail ada di arsip', 'e-mail is in the archive'),
    email_in_file: tx('e-mail dua kali di berkas', 'e-mail twice in the file'),
    phone_exists: tx('telepon sama dengan kontak lain', 'same phone as another contact'),
    phone_in_file: tx('telepon dua kali di berkas', 'phone twice in the file'),
  }
  const invalidReason = {
    email: tx('e-mail tidak valid', 'invalid e-mail'),
    name: tx('nama terlalu panjang', 'name too long'),
    phone: tx('telepon tidak valid', 'invalid phone'),
    category: tx('nama kategori tidak valid', 'invalid category name'),
    unknown_id: tx('kontak ini sudah tidak ada', 'this contact no longer exists'),
  }
  const fieldName = { email: 'e-mail', name: tx('nama', 'name'), phone: tx('telepon', 'phone'), categories: tx('kategori', 'categories') }
  const where = (row: { sheet: 'new' | 'existing'; row: number }) =>
    tx(`${row.sheet === 'new' ? 'Baru' : 'Ada'} baris ${row.row}`, `${row.sheet === 'new' ? 'New' : 'Existing'} row ${row.row}`)
  const line = (key: string, text: string, note: string) => (
    <li className="break-words" key={key}><span className="font-medium text-slate-800">{text}</span> · {note}</li>
  )

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white">
        <DialogTitle className="text-lg font-semibold text-slate-900">{tx('Excel kontak', 'Contacts in Excel')}</DialogTitle>
        <DialogDescription className="text-sm text-slate-600">
          {tx('Unduh, isi sheet "Baru" atau ubah sheet "Ada", lalu unggah lagi. Menghapus baris tidak menghapus kontak. Berkas berisi data pribadi: simpan dengan aman.',
            'Download, fill the "New" sheet or edit the "Existing" sheet, then upload it again. Removing a row does not delete the contact. The file holds personal data: keep it safe.')}
        </DialogDescription>

        <button className={buttonSecondary} disabled={busy} onClick={() => void run(downloadContacts)} type="button">
          <Download aria-hidden="true" className="size-4" />{tx('Unduh Excel', 'Download Excel')}
        </button>

        <label className="block text-sm font-medium text-slate-700">
          {tx('Unggah berkas yang sudah diisi (.xlsx)', 'Upload the filled-in file (.xlsx)')}
          <input
            accept=".xlsx"
            className="mt-1 block w-full min-w-0 text-sm text-slate-600"
            disabled={busy}
            onChange={(e) => {
              pick(e.target.files?.[0])
              // The same file can be chosen again after fixing it.
              e.target.value = ''
            }}
            type="file"
          />
        </label>

        {busy && <p className="text-sm text-slate-500" role="status">{tx('Memproses...', 'Working...')}</p>}
        {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
        {result && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {tx(`Selesai: ${result.added} ditambahkan, ${result.updated} diperbarui, ${result.skipped} dilewati.`, `Done: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`)}
          </p>
        )}

        {plan && (
          <div className="space-y-2">
            <dl className="grid grid-cols-3 gap-2 text-center">
              {([
                [tx('Baru', 'New'), plan.added.length],
                [tx('Diubah', 'Edited'), plan.edited.length],
                [tx('Tumpang tindih', 'Overlapping'), plan.overlapping.length],
              ] as const).map(([label, count]) => (
                <div className="rounded-xl border border-slate-200 px-2 py-2" key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{count}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-slate-500">{tx(`${plan.unchanged} baris tidak berubah.`, `${plan.unchanged} rows are unchanged.`)}</p>
            {plan.newCategories.length > 0 && <p className="text-xs text-slate-600">{tx('Kategori baru yang akan dibuat: ', 'New categories to be created: ')}{plan.newCategories.join(', ')}</p>}

            <Group count={plan.added.length} title={tx('Baru', 'New')}>
              {plan.added.slice(0, LISTED).map((row) => line(row.key, row.email, [row.name, row.categories.join('; ')].filter(Boolean).join(' · ')))}
            </Group>
            <Group count={plan.edited.length} title={tx('Diubah', 'Edited')}>
              {plan.edited.slice(0, LISTED).map((row) => line(row.key, row.email, `${tx('berubah', 'changed')}: ${row.changed.map((field) => fieldName[field]).join(', ')}`))}
            </Group>
            <Group count={plan.overlapping.length} open title={tx('Tumpang tindih', 'Overlapping')} tone="text-amber-800">
              {plan.overlapping.slice(0, LISTED).map((row) => (
                <li className="break-words" key={row.key}>
                  <span className="font-medium text-slate-800">{row.email}</span> · {overlapReason[row.reason]} · {where(row)}
                  {row.canInclude ? (
                    <label className="mt-1 flex min-h-8 cursor-pointer items-center gap-2 text-slate-700">
                      <input checked={include.includes(row.key)} onChange={(e) => setInclude((current) => (e.target.checked ? [...current, row.key] : current.filter((key) => key !== row.key)))} type="checkbox" />
                      {tx('Tetap tambahkan', 'Add anyway')}
                    </label>
                  ) : <span> · {tx('dilewati', 'skipped')}</span>}
                </li>
              ))}
            </Group>
            <Group count={plan.conflicts.length} open title={tx('Diubah di portal setelah diunduh (dilewati)', 'Changed in the portal since the download (skipped)')} tone="text-amber-800">
              {plan.conflicts.slice(0, LISTED).map((row) => line(row.key, row.email, where(row)))}
            </Group>
            <Group count={plan.invalid.length} open title={tx('Baris bermasalah (dilewati)', 'Rows with problems (skipped)')} tone="text-rose-700">
              {plan.invalid.slice(0, LISTED).map((row) => line(row.key, row.email || tx('(kosong)', '(empty)'), `${invalidReason[row.reason]} · ${where(row)}`))}
            </Group>

            {changes === 0 && <p className="text-sm text-slate-600">{tx('Tidak ada yang perlu disimpan.', 'There is nothing to save.')}</p>}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className={buttonSecondary} disabled={busy} onClick={onClose} type="button">{result ? tx('Tutup', 'Close') : tx('Batal', 'Cancel')}</button>
          {plan && changes > 0 && <ConfirmButton disabled={busy} key={round} label={tx('Konfirmasi', 'Confirm')} onClick={confirm} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
