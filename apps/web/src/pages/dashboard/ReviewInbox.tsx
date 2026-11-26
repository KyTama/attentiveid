import { useCallback, useEffect, useState } from 'react'
import type { ImportedReview } from '@attentiveid/shared'
import { useAuth } from '@/features/auth/auth-context'

interface Props {
  /** Put the review into the testimonial list (it goes live with the usual save and publish). */
  onShow: (review: ImportedReview) => void
  /** Ids already put into the list but not saved yet. */
  taken: readonly string[]
}

/** Reviews read from the Google Sheet, waiting for a person to check them. Nothing here is public. */
export function ReviewInbox({ onShow, taken }: Props) {
  const { getAuthHeaders } = useAuth()
  const [state, setState] = useState<{ configured: boolean; sheetUrl: string; reviews: ImportedReview[] } | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const call = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const response = await fetch(`/api/admin/reviews${path}`, {
        ...init,
        headers: { ...getAuthHeaders(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(json?.message || `Permintaan gagal (${response.status})`)
      return json
    },
    [getAuthHeaders],
  )

  const load = useCallback(
    () => call('').then((json) => setState({ configured: json.configured, sheetUrl: json.sheetUrl, reviews: json.reviews ?? [] })),
    [call],
  )

  useEffect(() => {
    load().catch(() => setState(null))
  }, [load])

  const run = async (work: () => Promise<string>) => {
    setBusy(true)
    try {
      setMessage(await work())
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal.')
    } finally {
      setBusy(false)
    }
  }

  if (!state) return null
  const waiting = state.reviews.filter((review) => !taken.includes(review.id))

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Ulasan dari Google Sheet ({waiting.length})</h2>
        <span className="flex items-center gap-3 text-xs">
          {state.sheetUrl && <a className="font-semibold text-slate-700 underline" href={state.sheetUrl} rel="noopener noreferrer" target="_blank">Buka Sheet</a>}
          <button
            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 disabled:opacity-60"
            disabled={busy || !state.configured}
            onClick={() => void run(async () => {
              const result = await call('/import', { method: 'POST' })
              return `${result.added} baru, ${result.duplicates} sudah ada, ${result.skipped} baris tidak lengkap.`
            })}
            type="button"
          >
            Impor sekarang
          </button>
        </span>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Testimoni harus mengikuti Kode Etik HIMPSI. Sebelum menampilkan, periksa nama (samarkan bila perlu) dan hapus informasi sensitif seperti diagnosis, masalah pribadi, atau kontak.
      </p>
      {!state.configured && <p className="text-xs text-slate-500">Google Drive belum dikonfigurasi di server.</p>}
      {message && <p className="text-xs font-semibold text-slate-700" role="status">{message}</p>}
      <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
        {waiting.map((review) => (
          <li className="flex flex-wrap items-start justify-between gap-3 py-3" key={review.id}>
            <span className="min-w-0 flex-1 break-words text-sm">
              <span className="block font-semibold text-slate-900">{review.name}</span>
              <span className="text-slate-600">{review.quoteId}</span>
            </span>
            <span className="flex gap-3 text-xs font-semibold">
              <button aria-label={`Tampilkan ulasan ${review.name}`} className="cursor-pointer text-slate-800 underline" onClick={() => onShow(review)} type="button">
                Tampilkan
              </button>
              <button
                aria-label={`Abaikan ulasan ${review.name}`}
                className="cursor-pointer text-rose-700 underline disabled:opacity-60"
                disabled={busy}
                onClick={() => void run(async () => {
                  await call(`/${review.id}`, { method: 'PUT', body: JSON.stringify({ status: 'dismissed' }) })
                  return 'Diabaikan.'
                })}
                type="button"
              >
                Abaikan
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
