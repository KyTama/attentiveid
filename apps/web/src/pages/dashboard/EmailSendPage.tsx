import { useCallback, useEffect, useState } from 'react'
import type { EmailCampaign, EmailSendingState } from '@attentiveid/shared'
import { ArrowLeft, Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getCampaign, listCampaigns, type CampaignDetail } from '@/features/email/campaigns'
import { Composer } from '@/features/email/Composer'
import { useLabels } from '@/features/email/labels'
import { SendLog } from '@/features/email/SendLog'
import { listContacts, type EmailBook } from '@/features/email/service'
import { buttonPrimary, buttonSecondary } from '@/features/email/styles'
import { useTx } from '@/features/i18n/use-tx'

interface Loaded {
  campaigns: EmailCampaign[]
  sending: EmailSendingState
  book: EmailBook
  /** The send opened by ?id=, when there is one. */
  detail: CampaignDetail | null
  key: string
}

/** Email menu > Bulk send: the log, and writing a new e-mail. ?new=1 writes, ?id=… opens one. Admins and superadmins. */
export function EmailSendPage() {
  const { tx } = useTx()
  const { when, status } = useLabels()
  const [params, setParams] = useSearchParams()
  const id = params.get('id')
  const writing = params.get('new') === '1'
  const [data, setData] = useState<Loaded | null>(null)
  const [offset, setOffset] = useState(0)
  const [round, setRound] = useState(0)
  const [error, setError] = useState('')
  /** A draft just saved from the editor: keep the editor as it is instead of reloading it. */
  const [kept, setKept] = useState<string | null>(null)
  const key = writing ? 'new' : (id ?? 'list')
  const editing = writing || (id !== null && id === kept)

  const reload = useCallback(() => setRound((value) => value + 1), [])

  useEffect(() => {
    if (id !== null && id === kept) return
    let cancelled = false
    Promise.all([listCampaigns(), listContacts(false), id ? getCampaign(id, offset) : Promise.resolve(null)])
      .then(([sends, book, detail]) => {
        if (cancelled) return
        setData({ ...sends, book, detail, key })
        setError('')
      })
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat.'))
    return () => {
      cancelled = true
    }
  }, [id, offset, round, key, kept])

  const go = (next: Record<string, string>) => {
    setKept(null)
    setOffset(0)
    setError('')
    setParams(next)
  }
  const ready = data && (editing || data.key === key)
  const draft = !editing && data?.detail?.campaign.status === 'draft' ? data.detail.campaign : null

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 outline-none sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Kirim massal', 'Bulk send')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{tx('Satu e-mail per orang dari alamat Attentive, dengan catatan siapa mengirim apa.', 'One e-mail per person from Attentive\'s address, with a record of who sent what.')}</p>
        </div>
        {key === 'list' ? (
          <button className={buttonPrimary} onClick={() => go({ new: '1' })} type="button"><Plus aria-hidden="true" className="size-4" />{tx('Tulis e-mail', 'New e-mail')}</button>
        ) : (
          <button className={buttonSecondary} onClick={() => go({})} type="button"><ArrowLeft aria-hidden="true" className="size-4" />{tx('Daftar kiriman', 'All sends')}</button>
        )}
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}
      {!ready && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}

      {ready && key === 'list' && (
        <>
          <p className="text-sm text-slate-600">
            {tx(`Terkirim 24 jam terakhir: ${data.sending.sentLast24h} dari ${data.sending.dailyLimit}.`, `Sent in the last 24 hours: ${data.sending.sentLast24h} of ${data.sending.dailyLimit}.`)}
            {!data.sending.enabled && <span className="text-amber-800">{tx(' Pengiriman belum diaktifkan di server.', ' Sending is not switched on at the server.')}</span>}
          </p>
          {data.campaigns.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{tx('Belum ada kiriman atau draf.', 'No sends or drafts yet.')}</p>}
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white empty:hidden">
            {data.campaigns.map((campaign) => (
              <li key={campaign.id}>
                <button className="block w-full cursor-pointer px-4 py-3 text-left hover:bg-slate-50" onClick={() => go({ id: campaign.id })} type="button">
                  <span className="block break-words text-sm font-semibold text-slate-900">{campaign.title}</span>
                  <span className="block text-xs text-slate-600">
                    {status(campaign.status)} · {when(campaign.queuedAt ?? campaign.createdAt)} · {campaign.sentBy || campaign.createdBy}
                    {campaign.counts.total > 0 && ` · ${tx(`${campaign.counts.sent}/${campaign.counts.total} terkirim`, `${campaign.counts.sent}/${campaign.counts.total} sent`)}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {ready && (editing || draft) && (
        <Composer
          campaign={draft}
          categories={data.book.categories}
          contacts={data.book.contacts}
          // One editor for the whole life of a new draft; another saved draft gets a fresh one.
          key={editing ? 'editor' : draft!.id}
          onDeleted={() => { go({}); reload() }}
          onSaved={(saved) => { setKept(saved); setParams({ id: saved }, { replace: true }) }}
          onSent={(sent) => { go({ id: sent }); reload() }}
          sending={data.sending}
        />
      )}

      {ready && !editing && data.detail && !draft && <SendLog detail={data.detail} onChanged={reload} onPage={setOffset} />}
    </div>
  )
}
