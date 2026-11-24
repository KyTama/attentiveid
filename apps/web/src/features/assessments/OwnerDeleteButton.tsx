import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { isOwnerUser } from '../auth/owner'
import { useTx } from '../i18n/use-tx'
import { deleteAssessment } from './service'

interface Props {
  id: string
  /** Who the record is about, shown in the confirmation ("AT-MHCU-2026-112 · Nama"). */
  label: string
  onDeleted: () => void
  onError: (message: string) => void
}

/** Permanent delete of one result (and its proof of transfer). Shown only to the owner account. */
export function OwnerDeleteButton({ id, label, onDeleted, onError }: Props) {
  const { user } = useAuth()
  const { tx } = useTx()
  const [busy, setBusy] = useState(false)
  if (!isOwnerUser(user)) return null

  const remove = async () => {
    const ok = window.confirm(
      tx(
        `Hapus "${label}" secara permanen? Hasil, catatan, dan bukti transfernya hilang dan tidak bisa dikembalikan. Baris di Google Sheet tidak ikut terhapus dan harus dihapus manual.`,
        `Permanently delete "${label}"? The result, note and proof of transfer are lost and cannot be restored. The Google Sheet row is not removed and must be deleted by hand.`,
      ),
    )
    if (!ok) return
    setBusy(true)
    try {
      await deleteAssessment(id)
      onDeleted()
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : tx('Gagal menghapus data.', 'Failed to delete the record.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={busy}
      onClick={() => void remove()}
      type="button"
    >
      {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
      {tx('Hapus', 'Delete')}
    </button>
  )
}
