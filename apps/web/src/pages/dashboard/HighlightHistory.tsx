import { useCallback, useEffect, useState } from 'react'
import type { LandingContentMutation } from '@attentiveid/shared'
import { useAuth } from '@/features/auth/auth-context'
import { resolveHeroSlides } from '@/features/content/hero-slides'
import { useTx } from '@/features/i18n/use-tx'

type Hero = Extract<LandingContentMutation['sections'][number], { key: 'hero' }>
interface Version { id: string; number: number; publishedAt: string; current: boolean }
interface Schedule { id: string; publishAt: string; status: 'pending' | 'publishing' | 'published' | 'failed' | 'canceled'; createdBy: string; error: string }

interface Props {
  /** The highlight as it is in the editor now (saved or not), ready to be sent. */
  editorHero: () => Hero | null
}

const button = 'cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

function Slides({ hero }: { hero: Hero }) {
  const { tx, isEn } = useTx()
  return (
    <ol className="mt-2 grid gap-2 sm:grid-cols-2">
      {resolveHeroSlides(hero, isEn ? 'en' : 'id').map((slide, index) => (
        <li className={`flex gap-2 rounded-lg border border-slate-200 p-2 ${slide.visible ? 'bg-white' : 'bg-slate-100 opacity-70'}`} key={slide.id}>
          <img alt="" className="size-12 shrink-0 rounded object-cover" loading="lazy" src={slide.imageSrc} />
          <span className="min-w-0 text-[11px]">
            <span className="block font-semibold text-slate-900">{index + 1}. {slide.tabLabel}{slide.visible ? '' : ` (${tx('disembunyikan', 'hidden')})`}</span>
            <span className="block break-words text-slate-600">{slide.headline.replace(/\*\*/g, '')}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Earlier published highlight cards (look, then put back) and highlight cards that go live later. */
export function HighlightHistory({ editorHero }: Props) {
  const { getAuthHeaders } = useAuth()
  const { tx, isEn } = useTx()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<{ versions: Version[]; schedules: Schedule[] } | null>(null)
  const [viewing, setViewing] = useState<{ id: string; hero: Hero } | null>(null)
  const [when, setWhen] = useState('')
  const [shown, setShown] = useState(10)
  const [message, setMessage] = useState<{ bad: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const date = (iso: string) => new Date(iso).toLocaleString(isEn ? 'en-GB' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' })

  const call = useCallback(async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`/api/admin/landing${path}`, { ...init, headers: { ...getAuthHeaders(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) } })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json?.message || `${tx('Permintaan gagal', 'Request failed')} (${response.status})`)
    return json.data
  }, [getAuthHeaders, tx])

  const load = () => call('/history').then(setData).catch((error: Error) => setMessage({ bad: true, text: error.message }))

  useEffect(() => {
    if (open) void load()
    // Loaded when the panel is opened; actions reload it themselves.
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (work: () => Promise<string>) => {
    setBusy(true)
    setMessage(null)
    try {
      setMessage({ bad: false, text: await work() })
      await load()
    } catch (error) {
      setMessage({ bad: true, text: error instanceof Error ? error.message : tx('Gagal.', 'Failed.') })
    } finally {
      setBusy(false)
    }
  }

  const view = async (id: string) => {
    if (viewing?.id === id) return setViewing(null)
    try {
      setViewing({ id, hero: (await call(`/history/${id}`)).hero })
    } catch (error) {
      setMessage({ bad: true, text: error instanceof Error ? error.message : tx('Gagal.', 'Failed.') })
    }
  }

  const restore = (version: Version) => {
    if (!window.confirm(tx(
      `Highlight dari versi ${version.number} (${date(version.publishedAt)}) akan LANGSUNG TAYANG. Bagian lain dan draf tersimpan tidak berubah. Lanjutkan?`,
      `The highlight from version ${version.number} (${date(version.publishedAt)}) goes LIVE NOW. Other sections and the saved draft stay as they are. Continue?`,
    ))) return
    void run(async () => {
      await call(`/history/${version.id}/restore-highlight`, { method: 'POST' })
      // The editor still holds the old content; saving it would undo the restore.
      window.setTimeout(() => window.location.reload(), 1500)
      return tx('Sudah tayang. Halaman dimuat ulang…', 'It is live. Reloading the page…')
    })
  }

  const schedule = (source: { revisionId: string } | { hero: Hero | null }, label: string) => {
    if (!when) return setMessage({ bad: true, text: tx('Isi dulu tanggal dan jam tayang di atas.', 'Choose the date and time above first.') })
    const publishAt = new Date(when)
    if (!window.confirm(tx(`${label} akan tayang otomatis pada ${date(publishAt.toISOString())}. Jadwalkan?`, `${label} will go live by itself on ${date(publishAt.toISOString())}. Schedule it?`))) return
    void run(async () => {
      await call('/schedule', { method: 'POST', body: JSON.stringify({ publishAt: publishAt.toISOString(), ...source }) })
      return tx('Terjadwal.', 'Scheduled.')
    })
  }

  const status: Record<Schedule['status'], string> = {
    pending: tx('menunggu', 'waiting'), publishing: tx('sedang tayang', 'publishing'), published: tx('sudah tayang', 'published'),
    failed: tx('gagal', 'failed'), canceled: tx('dibatalkan', 'canceled'),
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5">
      <button aria-expanded={open} className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-bold text-slate-900" onClick={() => setOpen(!open)} type="button">
        {tx('Riwayat & jadwal tayang highlight', 'Highlight history and scheduling')}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-[11px] text-slate-700">
          {message && <p className={`rounded-lg border px-3 py-2 ${message.bad ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role={message.bad ? 'alert' : 'status'}>{message.text}</p>}

          <div className="flex flex-wrap items-end gap-2">
            <label className="font-semibold">
              {tx('Tayang pada (jam di perangkat ini)', 'Go live at (this device’s time)')}
              <input className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-slate-900" onChange={(event) => setWhen(event.target.value)} type="datetime-local" value={when} />
            </label>
            <button className={button} disabled={busy} onClick={() => schedule({ hero: editorHero() }, tx('Highlight yang ada di editor sekarang', 'The highlight in the editor now'))} type="button">
              {tx('Jadwalkan highlight di editor', 'Schedule the highlight in the editor')}
            </button>
          </div>

          {data && data.schedules.length > 0 && (
            <ul className="space-y-1">
              {data.schedules.slice(0, 5).map((item) => (
                <li className="flex flex-wrap items-center gap-2" key={item.id}>
                  <span className="font-semibold">{date(item.publishAt)}</span>
                  <span>{status[item.status]} · {item.createdBy}{item.error ? ` · ${item.error}` : ''}</span>
                  {item.status === 'pending' && <button className="cursor-pointer font-semibold text-rose-700 underline" disabled={busy} onClick={() => void run(async () => { await call(`/schedule/${item.id}`, { method: 'DELETE' }); return tx('Jadwal dibatalkan.', 'Schedule canceled.') })} type="button">{tx('Batalkan', 'Cancel')}</button>}
                </li>
              ))}
            </ul>
          )}

          <h4 className="pt-1 font-bold text-slate-900">{tx('Versi yang pernah tayang', 'Published versions')}</h4>
          {!data && <p>{tx('Memuat...', 'Loading...')}</p>}
          <ul className="divide-y divide-slate-100">
            {data?.versions.slice(0, shown).map((version) => (
              <li className="py-2" key={version.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 font-semibold">
                    {tx('Versi', 'Version')} {version.number} · {date(version.publishedAt)}
                    {version.current && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{tx('tayang sekarang', 'live now')}</span>}
                  </span>
                  <button className={button} onClick={() => void view(version.id)} type="button">{viewing?.id === version.id ? tx('Tutup', 'Close') : tx('Lihat', 'View')}</button>
                  <button className={button} disabled={busy} onClick={() => schedule({ revisionId: version.id }, `${tx('Versi', 'Version')} ${version.number}`)} type="button">{tx('Jadwalkan', 'Schedule')}</button>
                  {!version.current && <button className={button} disabled={busy} onClick={() => restore(version)} type="button">{tx('Pulihkan highlight', 'Restore highlight')}</button>}
                </div>
                {viewing?.id === version.id && <Slides hero={viewing.hero} />}
              </li>
            ))}
          </ul>
          {data && data.versions.length > shown && <button className={button} onClick={() => setShown(shown + 20)} type="button">{tx('Tampilkan yang lebih lama', 'Show older')}</button>}
        </div>
      )}
    </section>
  )
}
