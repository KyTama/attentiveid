import { useCallback, useState } from 'react'
import {
  EMAIL_BODY_MAX, EMAIL_FILES_MAX_TOTAL, EMAIL_FILE_EXTENSIONS, EMAIL_FILE_MAX_BYTES, EMAIL_FILE_MAX_COUNT, EMAIL_TITLE_MAX,
  type EmailAudiencePreview, type EmailCampaign, type EmailCampaignFile, type EmailCategory, type EmailContact, type EmailLanguage, type EmailSendingState,
} from '@attentiveid/shared'
import { Eye, Paperclip, Send, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTx } from '@/features/i18n/use-tx'
import { toAudience, type AudienceChoice } from './audience'
import { AudiencePicker } from './AudiencePicker'
import { htmlToPlain, textToHtml } from './body'
import { addFile, deleteDraft, previewDraft, removeFile, saveDraft, sendCampaign, sendTest } from './campaigns'
import { ConfirmButton } from './ConfirmButton'
import { buttonDanger, buttonPrimary, buttonSecondary, iconButton, inputClass } from './styles'

interface Props {
  /** Null = a new e-mail. */
  campaign: EmailCampaign | null
  categories: EmailCategory[]
  contacts: EmailContact[]
  sending: EmailSendingState
  /** The draft now exists on the server (its address changes). */
  onSaved: (id: string) => void
  onSent: (id: string) => void
  onDeleted: () => void
}

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)

export function Composer({ campaign, categories, contacts, sending, onSaved, onSent, onDeleted }: Props) {
  const { tx } = useTx()
  const plain = campaign ? htmlToPlain(campaign.html) : ''
  const [id, setId] = useState(campaign?.id ?? null)
  const [title, setTitle] = useState(campaign?.title ?? '')
  const [mode, setMode] = useState<'text' | 'html'>(plain === null ? 'html' : 'text')
  const [text, setText] = useState(plain ?? '')
  const [html, setHtml] = useState(plain === null ? campaign!.html : '')
  const [lang, setLang] = useState<EmailLanguage>(campaign?.lang ?? 'id')
  const [files, setFiles] = useState<EmailCampaignFile[]>(campaign?.files ?? [])
  const [choice, setChoice] = useState<AudienceChoice>({ mode: 'categories', categories: [], contacts: [] })
  const [counted, setCounted] = useState<EmailAudiencePreview | null>(null)
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null)
  /** The content a test was sent for; changing anything asks for a new test. */
  const [tested, setTested] = useState('')
  /** The server's version of the draft that the test was made from. */
  const [version, setVersion] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [notice, setNotice] = useState('')
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)

  const onCounted = useCallback((value: EmailAudiencePreview | null) => setCounted(value), [])
  const draft = { title: title.trim(), html: mode === 'text' ? textToHtml(text) : html, lang }
  const fingerprint = JSON.stringify([draft, files.map((file) => file.id)])
  const incomplete = !draft.title || !draft.html.trim()
  const audience = toAudience(choice)

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setFailure('')
    setNotice('')
    try {
      await action()
    } catch (caught) {
      setFailure(caught instanceof Error ? caught.message : tx('Gagal.', 'Failed.'))
    } finally {
      setBusy(false)
    }
  }

  /** Saves what is on screen; every action that uses the server's copy starts with this. */
  const save = async () => {
    const saved = await saveDraft(id, draft)
    // A save makes a new version: it has to be tested again.
    setTested('')
    setId(saved.id)
    // The server removes anything unsafe: show what will really be sent.
    if (mode === 'html') setHtml(saved.html)
    if (!id) onSaved(saved.id)
    return saved
  }

  const attach = (file: File | undefined) => {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const total = files.reduce((sum, item) => sum + item.size, 0) + file.size
    if (!(EMAIL_FILE_EXTENSIONS as readonly string[]).includes(extension)) return setFailure(tx('Jenis berkas tidak didukung. Pakai PDF, gambar, Word, Excel, PowerPoint, atau TXT.', 'Unsupported file type. Use PDF, images, Word, Excel, PowerPoint or TXT.'))
    if (files.length >= EMAIL_FILE_MAX_COUNT || file.size > EMAIL_FILE_MAX_BYTES || total > EMAIL_FILES_MAX_TOTAL) return setFailure(tx('Maksimal 5 lampiran, 7 MB per berkas, 10 MB seluruhnya.', 'Up to 5 files, 7 MB each, 10 MB together.'))
    void run(async () => {
      const saved = await save()
      const added = await addFile(saved.id, file)
      setFiles((current) => [...current, added])
    })
  }

  const loadHtml = (file: File | undefined) => {
    if (!file) return
    if (file.size > EMAIL_BODY_MAX) return setFailure(tx('Berkas HTML terlalu besar.', 'The HTML file is too large.'))
    void file.text().then(setHtml)
  }

  const tab = (value: 'text' | 'html', label: string) => (
    <button aria-pressed={mode === value} className={mode === value ? buttonPrimary : buttonSecondary} onClick={() => setMode(value)} type="button">{label}</button>
  )

  return (
    <div className="space-y-5">
      {!sending.enabled && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {tx('Pengiriman belum diaktifkan di server. Draf bisa disimpan dan dilihat, tetapi belum bisa dikirim.', 'Sending is not switched on at the server. Drafts can be saved and previewed, not sent.')}
        </p>
      )}

      <AudiencePicker categories={categories} choice={choice} contacts={contacts} onChange={setChoice} onCounted={onCounted} />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="mail-title">{tx('Judul (baris subjek e-mail)', 'Title (the e-mail subject line)')}</label>
        <input className={inputClass} id="mail-title" maxLength={EMAIL_TITLE_MAX} onChange={(e) => setTitle(e.target.value)} value={title} />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={tx('Bentuk isi', 'Body type')}>
          {tab('text', tx('Teks biasa', 'Plain text'))}
          {tab('html', 'HTML')}
          <label className="ml-auto flex items-center gap-2 text-sm text-slate-700">
            {tx('Bahasa catatan bawah', 'Footer language')}
            <select className="min-h-10 rounded-lg border border-slate-200 bg-white px-2" onChange={(e) => setLang(e.target.value as EmailLanguage)} value={lang}>
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        {mode === 'text' ? (
          <textarea aria-label={tx('Isi e-mail', 'E-mail body')} className={`${inputClass} min-h-48`} onChange={(e) => setText(e.target.value)} placeholder={tx('Halo {{name}},\n\n...', 'Hello {{name}},\n\n...')} value={text} />
        ) : (
          <>
            <textarea aria-label={tx('Kode HTML', 'HTML code')} className={`${inputClass} min-h-48 font-mono text-xs`} maxLength={EMAIL_BODY_MAX} onChange={(e) => setHtml(e.target.value)} spellCheck={false} value={html} />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="text-slate-700">
                {tx('Atau unggah .html', 'Or upload .html')}
                <input accept=".html,.htm" className="ml-2 max-w-full text-xs" onChange={(e) => { loadHtml(e.target.files?.[0]); e.target.value = '' }} type="file" />
              </label>
              <a className="font-medium text-navy-700 underline" download href="/email/Panduan-HTML-Email.md">{tx('Panduan HTML', 'HTML guide')}</a>
              <a className="font-medium text-navy-700 underline" download href="/email/contoh-email.html">{tx('Contoh', 'Example')}</a>
            </div>
          </>
        )}
        <p className="text-xs text-slate-500">{tx('Tulis {{name}} untuk nama penerima ("Kak" bila nama kosong). Tautan berhenti berlangganan ditambahkan otomatis.', 'Write {{name}} for the recipient\'s name ("there" when empty). The unsubscribe link is added automatically.')}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{tx('Lampiran (maks. 10 MB seluruhnya)', 'Attachments (10 MB together at most)')}</p>
        <ul className="space-y-1">
          {files.map((file) => (
            <li className="flex items-center gap-2 text-sm text-slate-700" key={file.id}>
              <Paperclip aria-hidden="true" className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-slate-500">{size(file.size)}</span>
              <button aria-label={tx(`Hapus lampiran ${file.name}`, `Remove ${file.name}`)} className={iconButton} disabled={busy} onClick={() => void run(async () => { await removeFile(id!, file.id); setFiles((current) => current.filter((item) => item.id !== file.id)) })} type="button">
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <input aria-label={tx('Tambah lampiran', 'Add attachment')} className="block w-full min-w-0 text-sm text-slate-600" disabled={busy || incomplete} onChange={(e) => { attach(e.target.files?.[0]); e.target.value = '' }} type="file" />
        {incomplete && <p className="text-xs text-slate-500">{tx('Isi judul dan isi dulu untuk menambah lampiran.', 'Fill in the title and body before attaching.')}</p>}
      </div>

      {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
      {notice && <p className="text-sm text-emerald-800" role="status">{notice}</p>}

      <div className="flex flex-wrap gap-2">
        <button className={buttonSecondary} disabled={busy || incomplete} onClick={() => void run(async () => { await save(); setNotice(tx('Draf disimpan.', 'Draft saved.')) })} type="button">{tx('Simpan draf', 'Save draft')}</button>
        <button className={buttonSecondary} disabled={busy || incomplete} onClick={() => void run(async () => setPreview(await previewDraft(draft)))} type="button">
          <Eye aria-hidden="true" className="size-4" />{tx('Pratinjau', 'Preview')}
        </button>
        <button className={buttonSecondary} disabled={busy || incomplete || !sending.enabled} onClick={() => void run(async () => {
          const saved = await save()
          const { to, version: sentVersion } = await sendTest(saved.id)
          setVersion(sentVersion)
          setTested(JSON.stringify([{ ...draft, html: mode === 'html' ? saved.html : draft.html }, files.map((file) => file.id)]))
          setNotice(tx(`E-mail uji dikirim ke ${to}.`, `Test sent to ${to}.`))
        })} type="button">{tx('Kirim uji ke saya', 'Send me a test')}</button>
        <button className={buttonPrimary} disabled={busy || incomplete || !sending.enabled || tested !== fingerprint || !audience || !counted?.count} onClick={() => setConfirming(true)} type="button">
          <Send aria-hidden="true" className="size-4" />{tx('Kirim', 'Send')}
        </button>
        {id && <button className={`${buttonSecondary} ml-auto`} disabled={busy} onClick={() => setRemoving(true)} type="button">{tx('Hapus draf', 'Delete draft')}</button>}
      </div>
      {sending.enabled && tested !== fingerprint && <p className="text-xs text-slate-500">{tx('Kirim uji ke diri sendiri dulu; setelah itu tombol Kirim aktif.', 'Send yourself a test first; then Send becomes available.')}</p>}

      {preview && (
        <Dialog open onOpenChange={(open) => !open && setPreview(null)}>
          <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto bg-white">
            <DialogTitle className="break-words text-base font-semibold text-slate-900">{preview.subject}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">{tx('Seperti dilihat penerima. Tiap aplikasi e-mail bisa sedikit berbeda.', 'As a recipient sees it. Mail apps can differ a little.')}</DialogDescription>
            {/* sandbox="": nothing in the e-mail can run or reach the portal. */}
            <iframe className="h-[60dvh] w-full rounded-lg border border-slate-200 bg-white" sandbox="" srcDoc={preview.html} title={tx('Pratinjau e-mail', 'E-mail preview')} />
          </DialogContent>
        </Dialog>
      )}

      {confirming && audience && counted && (
        <Dialog open onOpenChange={(open) => !open && !busy && setConfirming(false)}>
          <DialogContent className="bg-white">
            <DialogTitle className="text-lg font-semibold text-slate-900">{tx(`Kirim ke ${counted.count} orang?`, `Send to ${counted.count} people?`)}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {tx(`Satu e-mail per orang, bertahap. Batas ${sending.dailyLimit} per 24 jam (${sending.sentLast24h} sudah terpakai); sisanya dikirim menyusul.`, `One e-mail each, gradually. Limit ${sending.dailyLimit} per 24 hours (${sending.sentLast24h} used); the rest follows later.`)}
              {files.length > 0 && tx(` Lampiran akan memakai sekitar ${size(files.reduce((s, f) => s + f.size, 0) * counted.count)} penyimpanan Google.`, ` Attachments will use about ${size(files.reduce((s, f) => s + f.size, 0) * counted.count)} of Google storage.`)}
            </DialogDescription>
            {failure && <p className="text-sm text-rose-700" role="alert">{failure}</p>}
            <div className="flex justify-end gap-2">
              <button className={buttonSecondary} disabled={busy} onClick={() => setConfirming(false)} type="button">{tx('Batal', 'Cancel')}</button>
              <ConfirmButton disabled={busy} label={tx('Ya, kirim', 'Yes, send')} onClick={() => void run(async () => { await sendCampaign(id!, version, audience, counted.count); onSent(id!) })} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {removing && (
        <Dialog open onOpenChange={(open) => !open && setRemoving(false)}>
          <DialogContent className="bg-white">
            <DialogTitle className="text-lg font-semibold text-slate-900">{tx('Hapus draf ini?', 'Delete this draft?')}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">{tx('Draf dan lampirannya dihapus permanen.', 'The draft and its attachments are deleted for good.')}</DialogDescription>
            <div className="flex justify-end gap-2">
              <button className={buttonSecondary} onClick={() => setRemoving(false)} type="button">{tx('Batal', 'Cancel')}</button>
              <button className={buttonDanger} disabled={busy} onClick={() => void run(async () => { await deleteDraft(id!); onDeleted() })} type="button">{tx('Hapus', 'Delete')}</button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
