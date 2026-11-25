import { useEffect, useState } from 'react'
import type { UpdateLogEntry } from '@attentiveid/shared'
import { listUpdateLog } from '@/features/feedback/service'
import { useTx } from '@/features/i18n/use-tx'

const PAGE_SIZE = 30

/** History of website updates. It is built from the change history at every release, so nobody writes it by hand. */
export function UpdateLogPage() {
  const { tx, isEn } = useTx()
  const [entries, setEntries] = useState<UpdateLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    listUpdateLog()
      .then((data) => !cancelled && setEntries(data))
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat riwayat.'))
    return () => {
      cancelled = true
    }
  }, [])

  const locale = isEn ? 'en-GB' : 'id-ID'
  const days = new Map<string, UpdateLogEntry[]>()
  for (const entry of (entries ?? []).slice(0, shown)) {
    const day = new Date(entry.at).toLocaleDateString(locale, { dateStyle: 'full' })
    days.set(day, [...(days.get(day) ?? []), entry])
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Riwayat Update', 'Update History')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {tx(
            'Terisi otomatis setiap kali website diperbarui. Perubahan konten lewat dasbor (mis. teks beranda) tidak tercatat di sini.',
            'Filled in automatically every time the website is updated. Content edits made in the portal (such as homepage text) are not listed here.',
          )}
        </p>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}
      {!entries && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}
      {entries?.length === 0 && <p className="text-sm text-slate-500">{tx('Versi ini tidak membawa riwayat update.', 'This build carries no update history.')}</p>}

      {[...days].map(([day, items]) => (
        <section aria-label={day} className="space-y-2" key={day}>
          <h2 className="text-sm font-bold text-slate-900">{day}</h2>
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            {items.map((entry) => (
              <li className="p-4" key={entry.id}>
                <p className="break-words text-sm font-semibold text-slate-900">{entry.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(entry.at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} · {entry.author} · {entry.id}
                </p>
                {entry.detail && (
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs font-medium text-slate-600">{tx('Rincian', 'Details')}</summary>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-slate-700">{entry.detail}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {entries && entries.length > shown && (
        <button className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setShown(shown + PAGE_SIZE)} type="button">
          {tx('Tampilkan lebih banyak', 'Show more')}
        </button>
      )}
    </div>
  )
}
