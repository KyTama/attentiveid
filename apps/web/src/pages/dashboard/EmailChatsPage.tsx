import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { EMAIL_REPLY_MAX, type EmailCategory, type EmailChat, type EmailChatMessage, type EmailContact, type EmailRecipientStatus } from '@attentiveid/shared'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getChat, listChats, sendReply } from '@/features/email/campaigns'
import { CategoryChips } from '@/features/email/CategoryChips'
import type { ContactFilter } from '@/features/email/filter'
import { useLabels } from '@/features/email/labels'
import { buttonPrimary, buttonSecondary, inputClass } from '@/features/email/styles'
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
  const incoming = message.direction === 'in'
  return (
    // As in a chat app: our messages on the right, theirs on the left.
    <li className={`w-[92%] rounded-2xl border p-3 sm:w-4/5 ${incoming ? 'mr-auto rounded-tl-sm border-slate-200 bg-white' : 'ml-auto rounded-tr-sm border-navy-100 bg-navy-50'}`}>
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
        {when(message.at)} · {incoming ? tx('diterima', 'received') : state[message.status]}
        {!incoming && message.kind === 'reply' && message.sentBy && ` · ${message.sentBy}`}
        {message.openedAt && ` · ${tx('dibuka', 'opened')}`}
        {message.clickedAt && ` · ${tx('diklik', 'clicked')}`}
      </p>
    </li>
  )
}

function ReplyBox({ contactId, unsubscribed, onSent }: { contactId: string; unsubscribed: boolean; onSent: () => void }) {
  const { tx } = useTx()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await sendReply(contactId, text)
      setText('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Balasan gagal terkirim.', 'The reply could not be sent.'))
    } finally {
      setBusy(false)
      // Also after a failure: the attempt is shown in the conversation.
      onSent()
    }
  }

  return (
    <form className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3" onSubmit={submit}>
      {unsubscribed && <p className="text-xs text-amber-800">{tx('Orang ini berhenti berlangganan kiriman massal. Balas hanya bila mereka menunggu jawaban.', 'This person unsubscribed from bulk e-mail. Reply only if they are waiting for an answer.')}</p>}
      <textarea aria-label={tx('Tulis balasan', 'Write a reply')} className={`${inputClass} min-h-24`} maxLength={EMAIL_REPLY_MAX} onChange={(e) => setText(e.target.value)} placeholder={tx('Tulis balasan…', 'Write a reply…')} value={text} />
      {error && <p className="text-xs text-rose-700" role="alert">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{tx('Dikirim sebagai e-mail dari alamat Attentive.', 'Sent as an e-mail from Attentive\'s address.')}</span>
        <button className={buttonPrimary} disabled={busy || !text.trim()} type="submit">{busy ? tx('Mengirim…', 'Sending…') : tx('Kirim balasan', 'Send reply')}</button>
      </div>
    </form>
  )
}

/** Email menu > Conversations: what the portal sent to each contact, their replies, and a box to answer. */
export function EmailChatsPage() {
  const { tx } = useTx()
  const { when } = useLabels()
  const [params, setParams] = useSearchParams()
  const id = params.get('id')
  const [list, setList] = useState<{ chats: EmailChat[]; categories: EmailCategory[] } | null>(null)
  const [thread, setThread] = useState<{ contact: EmailContact; messages: EmailChatMessage[]; canReply?: boolean; inbox?: boolean } | null>(null)
  const [round, setRound] = useState(0)
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
  }, [round])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getChat(id).then((data) => !cancelled && setThread(data)).catch((caught) => !cancelled && fail(caught))
    return () => {
      cancelled = true
    }
  }, [id, round])

  // New replies show up without reloading the page.
  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') setRound((value) => value + 1) }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

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
        <p className="mt-1 text-sm text-slate-600">{tx('Kiriman dari portal dan balasannya.', 'What the portal sent, and the answers.')}
          {current && !current.inbox && ` ${tx('Balasan dari penerima belum dibaca otomatis: lihat di Gmail, label Bulk.', 'Their replies are not read automatically yet: see Gmail, label Bulk.')}`}</p>
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
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                      {chat.unread > 0 && chat.contactId !== id && <span className="rounded-full bg-gold-500 px-1.5 font-semibold text-white">{chat.unread}<span className="sr-only"> {tx('belum dibaca', 'unread')}</span></span>}
                      {day(chat.lastAt)}
                    </span>
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
              {current.canReply && <ReplyBox contactId={current.contact.id} key={current.contact.id} onSent={() => setRound((value) => value + 1)} unsubscribed={Boolean(current.contact.unsubscribed)} />}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
