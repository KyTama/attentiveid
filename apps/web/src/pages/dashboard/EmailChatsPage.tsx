import { Fragment, useEffect, useState } from 'react'
import type { EmailCategory, EmailChat, EmailChatMessage, EmailContact, EmailRecipientStatus } from '@attentiveid/shared'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getChat, listChats } from '@/features/email/campaigns'
import { CategoryChips } from '@/features/email/CategoryChips'
import type { ContactFilter } from '@/features/email/filter'
import { useLabels } from '@/features/email/labels'
import { buttonSecondary, inputClass } from '@/features/email/styles'
import { useTx } from '@/features/i18n/use-tx'

const PAGE = 100
/** Longer bodies are folded until asked for. */
const FOLD = 400

function Bubble({ message }: { message: EmailChatMessage }) {
  const { tx } = useTx()
  const { when } = useLabels()
  const [open, setOpen] = useState(false)
  const long = message.text.length > FOLD
  const state: Record<EmailRecipientStatus, string> = {
    queued: tx('menunggu', 'waiting'), sending: tx('mengirim', 'sending'), sent: tx('terkirim', 'sent'),
    failed: tx('gagal', 'failed'), skipped: tx('tidak dikirim', 'not sent'), unknown: tx('tidak pasti', 'uncertain'),
  }
  return (
    // Our own messages sit on the right, as in a chat app.
    <li className="ml-auto w-[92%] rounded-2xl rounded-tr-sm border border-navy-100 bg-navy-50 p-3 sm:w-4/5">
      <p className="break-words text-sm font-semibold text-slate-900">{message.title}</p>
      <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-800">{long && !open ? `${message.text.slice(0, FOLD)}…` : message.text}</p>
      {long && (
        <button aria-expanded={open} className="mt-1 cursor-pointer text-xs font-semibold text-navy-700 underline" onClick={() => setOpen(!open)} type="button">
          {open ? tx('Ringkas', 'Show less') : tx('Baca selengkapnya', 'Read more')}
        </button>
      )}
      {message.files.map((file) => (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-600" key={file}><Paperclip aria-hidden="true" className="size-3.5 shrink-0" /><span className="break-all">{file}</span></p>
      ))}
      <p className="mt-1 text-right text-xs text-slate-500">
        {when(message.at)} · {state[message.status]}
        {message.openedAt && ` · ${tx('dibuka', 'opened')}`}
        {message.clickedAt && ` · ${tx('diklik', 'clicked')}`}
      </p>
    </li>
  )
}

/** Email menu > Conversations: what the site sent to each contact (bulk sends only). Replies stay in Gmail. */
export function EmailChatsPage() {
  const { tx } = useTx()
  const { when } = useLabels()
  const [params, setParams] = useSearchParams()
  const id = params.get('id')
  const [list, setList] = useState<{ chats: EmailChat[]; categories: EmailCategory[] } | null>(null)
  const [thread, setThread] = useState<{ contact: EmailContact; messages: EmailChatMessage[] } | null>(null)
  const [filter, setFilter] = useState<ContactFilter>('all')
  const [search, setSearch] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [error, setError] = useState('')

  const fail = (caught: unknown) => setError(caught instanceof Error ? caught.message : 'Gagal memuat.')

  useEffect(() => {
    let cancelled = false
    listChats().then((data) => !cancelled && setList(data)).catch((caught) => !cancelled && fail(caught))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getChat(id).then((data) => !cancelled && setThread(data)).catch((caught) => !cancelled && fail(caught))
    return () => {
      cancelled = true
    }
  }, [id])

  const open = (contactId: string | null) => {
    setError('')
    setParams(contactId ? { id: contactId } : {})
  }
  const text = search.trim().toLowerCase()
  const found = (list?.chats ?? []).filter((chat) =>
    (filter === 'all' || chat.categoryIds.includes(filter))
    && (!text || chat.email.includes(text) || chat.name.toLowerCase().includes(text) || chat.lastTitle.toLowerCase().includes(text)))
  const current = thread && thread.contact.id === id ? thread : null
  const day = (iso: string) => when(iso).replace(/[,]? (pukul )?\d{1,2}[.:]\d{2}.*$/, '')

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-12">
      <div className={id ? 'hidden md:block' : ''}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 outline-none sm:text-3xl" data-route-heading tabIndex={-1}>{tx('Percakapan e-mail', 'E-mail conversations')}</h1>
        <p className="mt-1 text-sm text-slate-600">{tx('Hanya kiriman massal dari portal. Balasan belum ditampilkan di sini: baca dan balas di Gmail.', 'Only bulk sends from the portal. Replies are not shown here yet: read and answer them in Gmail.')}</p>
      </div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}

      <div className="gap-4 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* On a phone the list and the conversation take turns. */}
        <section aria-label={tx('Daftar percakapan', 'Conversation list')} className={`space-y-3 ${id ? 'hidden md:block' : ''}`}>
          <input aria-label={tx('Cari percakapan', 'Search conversations')} className={inputClass} onChange={(e) => { setSearch(e.target.value); setShown(PAGE) }} placeholder={tx('Cari nama, e-mail, atau judul', 'Search name, e-mail or title')} type="search" value={search} />
          <div aria-label={tx('Saring menurut kategori', 'Filter by category')} className="flex flex-wrap items-center gap-2" role="group">
            <CategoryChips categories={list?.categories ?? []} onChange={(value) => { setFilter(value); setShown(PAGE) }} value={filter} />
          </div>
          {!list && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}
          {list && found.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              {list.chats.length === 0 ? tx('Belum ada kiriman massal ke siapa pun.', 'Nothing has been sent to anyone yet.') : tx('Tidak ada yang cocok.', 'Nothing matches.')}
            </p>
          )}
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white empty:hidden">
            {found.slice(0, shown).map((chat) => (
              <li key={chat.contactId}>
                <button aria-current={chat.contactId === id ? 'true' : undefined} className={`block w-full cursor-pointer px-3 py-2 text-left hover:bg-slate-50 ${chat.contactId === id ? 'bg-navy-50' : ''}`} onClick={() => open(chat.contactId)} type="button">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{chat.name || chat.email}</span>
                    <span className="shrink-0 text-xs text-slate-500">{day(chat.lastAt)}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">{chat.email}</span>
                  <span className="block truncate text-sm text-slate-600">{chat.lastTitle}</span>
                </button>
              </li>
            ))}
          </ul>
          {found.length > shown && <button className={`${buttonSecondary} w-full`} onClick={() => setShown(shown + PAGE)} type="button">{tx('Tampilkan lagi', 'Show more')}</button>}
        </section>

        <section aria-label={tx('Percakapan', 'Conversation')} className={`min-w-0 space-y-3 ${id ? '' : 'hidden md:block'}`}>
          {!id && <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">{tx('Pilih kontak untuk melihat apa yang sudah dikirim.', 'Choose a contact to see what was sent.')}</p>}
          {id && (
            <button className={`${buttonSecondary} md:hidden`} onClick={() => open(null)} type="button"><ArrowLeft aria-hidden="true" className="size-4" />{tx('Kembali', 'Back')}</button>
          )}
          {id && !current && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}
          {current && (
            <>
              <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2">
                <h2 className="break-words text-base font-semibold text-slate-900">{current.contact.name || current.contact.email}</h2>
                <p className="break-all text-sm text-slate-600">{current.contact.email}</p>
                {current.contact.unsubscribed && <p className="text-xs font-medium text-amber-800">{tx('Berhenti berlangganan', 'Unsubscribed')}</p>}
              </div>
              <ol className="space-y-2">
                {current.messages.map((message, index) => (
                  <Fragment key={message.id}>
                    {(index === 0 || day(current.messages[index - 1]!.at) !== day(message.at)) && <li className="text-center text-xs font-medium text-slate-500">{day(message.at)}</li>}
                    <Bubble message={message} />
                  </Fragment>
                ))}
              </ol>
              {current.messages.length === 0 && <p className="text-sm text-slate-500">{tx('Belum ada kiriman ke kontak ini.', 'Nothing has been sent to this contact.')}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
