import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Loader2, Send, X } from 'lucide-react'
import { openPaymentProof } from '../assessments/service'
import { OwnerDeleteButton } from '../assessments/OwnerDeleteButton'
import { useTx } from '../i18n/use-tx'
import {
  PAYMENT_STATUSES,
  creditsOf,
  assignPsychologist,
  getMhcu,
  openReport,
  releaseReport,
  savePayment,
  saveNote,
  type MhcuDetail,
  type PaymentStatus,
  type PsychologistOption,
} from './api'
import {
  CUSTOM_NOTE_MAX,
  dateText,
  awaitsConfirmation,
  fmt1,
  noteChanged,
  noteDraftOf,
  noteInputOf,
  parseAmount,
  releaseBlocker,
  type NoteDraft,
} from './helpers'
import { HistorySection } from './HistorySection'
import { LevelBadge, PaymentChip, StatusText, TrackChip } from './ListParts'
import { DeliveryBlock, SummaryBlock } from './SummarySection'

interface Props {
  id: string
  isAdmin: boolean
  psychologists: PsychologistOption[]
  onClose: () => void
  /** Called after any save so the list row can follow (psychologist, payment, status). */
  onChanged: (detail: MhcuDetail) => void
  /** Opens another check-up of the same person (history chart and table). */
  onOpenWave: (id: string) => void
  /** Called after the owner deleted this result (the list should drop the row and close the panel). */
  onDeleted: () => void
}

type Scores = Record<string, unknown>
const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === 'object' ? (v as Record<string, unknown>) : null)
const bilingual = (v: unknown, en: boolean): string => {
  const o = obj(v)
  return o ? String((en ? o.en : o.id) ?? '') : ''
}

const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 disabled:bg-slate-50'
const buttonClass = 'min-h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
const primaryClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

/** One result with its scores, assignment, note, payment and report actions. */
export function DetailPanel({ id, isAdmin, psychologists, onClose, onChanged, onOpenWave, onDeleted }: Props) {
  const { tx, isEn } = useTx()
  const [detail, setDetail] = useState<MhcuDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    setNotice(null)
    getMhcu(id)
      .then((row) => alive && setDetail(row))
      .catch((caught) => alive && setError(caught instanceof Error ? caught.message : tx('Gagal membuka data.', 'Failed to open the record.')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const applied = (row: MhcuDetail, message: string) => {
    setDetail((current) => (current ? { ...current, ...row } : row))
    onChanged(row)
    setError(null)
    setNotice(message)
  }
  const fail = (caught: unknown, fallback: string) => {
    setNotice(null)
    setError(caught instanceof Error ? caught.message : fallback)
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-slate-500" role="status">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat...', 'Loading...')}
      </p>
    )
  }
  if (!detail) {
    return (
      <div className="space-y-3 p-6">
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error ?? tx('Data tidak ditemukan.', 'Record not found.')}</p>
        <button className={buttonClass} onClick={onClose} type="button">{tx('Tutup', 'Close')}</button>
      </div>
    )
  }

  const scores = detail.scores as Scores
  const reasons = Array.isArray(scores.reasons) ? scores.reasons : []
  const domains = Array.isArray(scores.domains) ? (scores.domains as { id: string; en: string; score: number | null; flagged: boolean }[]) : []
  const ati = obj(scores.ati)
  const followUp = obj(scores.followUp)

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <button className="flex min-h-11 cursor-pointer items-center gap-1 text-sm font-semibold text-navy-800 2xl:hidden" onClick={onClose} type="button">
        <ArrowLeft aria-hidden="true" className="size-4" /> {tx('Daftar hasil', 'Results list')}
      </button>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 break-words [overflow-wrap:anywhere]">
          <h2 className="text-lg font-bold text-slate-900">{detail.name}</h2>
          <p className="text-xs text-slate-500">
            {detail.code} · {detail.waveNo ? `T${detail.waveNo} · ` : ''}{dateText(detail.createdAt)} · {detail.age} {tx('tahun', 'years')} · {detail.sex ?? '–'} · {detail.lang.toUpperCase()}
          </p>
          <p className="text-xs text-slate-500">{detail.email} · {detail.phone}</p>
          {(detail.track || creditsOf(detail) !== null) && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <TrackChip track={detail.track} />
              {creditsOf(detail) !== null && <span className="font-semibold text-slate-700">{tx('Sisa kuota paket', 'Package credits left')}: {creditsOf(detail)}</span>}
            </p>
          )}
        </div>
        <button aria-label={tx('Tutup', 'Close')} className="hidden cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 2xl:block" onClick={onClose} type="button">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}

      {awaitsConfirmation(detail) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          <b>{tx('Bukti transfer masuk', 'Proof of transfer received')}</b>
          {' · '}
          {detail.paymentSubmittedAt ? dateText(detail.paymentSubmittedAt) : ''}
          {' · '}
          {detail.paymentFor === 'package3' ? tx('memilih Paket 3x', 'chose the package of 3') : detail.paymentFor === 'single' ? tx('memilih laporan 1x', 'chose the 1x report') : tx('pilihan belum diketahui', 'choice unknown')}
          {isAdmin ? ` — ${tx('periksa bukti, lalu ubah status menjadi PAID.', 'check the proof, then set the status to PAID.')}` : ''}
        </div>
      )}

      {(detail.level ?? 0) >= 4 && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {bilingual(scores.levelName, isEn) || `Level ${detail.level}`}
            {followUp ? ` — ${isEn ? String(followUp.responseTimeEn ?? '') : String(followUp.responseTimeId ?? '')}. ${isEn ? String(followUp.actionEn ?? '') : String(followUp.actionId ?? '')}` : ''}
            {detail.adminAlertAt ? ` (${tx('peringatan terkirim', 'alert sent')} ${dateText(detail.adminAlertAt)})` : ''}
          </span>
        </div>
      )}

      <SummaryBlock detail={detail} />

      <section aria-label={tx('Skor', 'Scores')}>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <LevelBadge level={detail.level} />
          <span className="font-semibold text-slate-900">{bilingual(scores.levelName, isEn)}</span>
          <span className="text-slate-500">· {bilingual(scores.mhiBand, isEn)}</span>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          {([
            ['MHI', fmt1(scores.mhi), ''],
            ['DI', fmt1(scores.di), bilingual(scores.diCategory, isEn)],
            ['WI', fmt1(scores.wi), bilingual(scores.wiCategory, isEn)],
            ['BHI', fmt1(scores.bhi), bilingual(scores.bhiCategory, isEn)],
            ['ATI', fmt1(ati?.total), bilingual(ati?.category, isEn)],
          ] as const).map(([label, value, category]) => (
            <div className="rounded-xl bg-slate-50 px-3 py-2" key={label}>
              <dt className="text-xs font-semibold text-slate-500">{label}</dt>
              <dd className="text-lg font-bold text-slate-900">{value}</dd>
              {category && <dd className="text-xs text-slate-500">{category}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {reasons.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-900">{tx('Pemicu tinjauan', 'Review triggers')}</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
            {reasons.map((reason, index) => (
              <li key={index}>{bilingual(reason, isEn)}</li>
            ))}
          </ul>
        </section>
      )}

      {domains.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-900">{tx('Area gejala (0–4)', 'Symptom areas (0–4)')}</h3>
          <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
            {domains.map((domain) => (
              <li className="flex justify-between gap-2 rounded-lg px-2 py-1 odd:bg-slate-50" key={domain.id}>
                <span className={domain.flagged ? 'font-semibold text-rose-700' : 'text-slate-700'}>{isEn ? domain.en : domain.id}{domain.flagged ? ' *' : ''}</span>
                <span className="font-mono text-slate-900">{domain.score ?? '–'}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate-500">{tx('* melewati ambang peninjauan.', '* at or above the review threshold.')}</p>
        </section>
      )}

      <HistorySection id={detail.id} key={`history:${detail.id}`} onOpenWave={onOpenWave} />
      <AssignBlock key={`assign:${detail.id}:${detail.psychologistId}`} detail={detail} isAdmin={isAdmin} onError={fail} onSaved={applied} psychologists={psychologists} />
      <NoteEditor key={`note:${detail.id}:${detail.noteTemplate}:${detail.noteCustom}:${detail.noteFinal}`} detail={detail} onError={fail} onSaved={applied} />
      <PaymentBlock key={`pay:${detail.id}:${detail.paymentStatus}:${detail.paymentPackage}:${detail.paymentAmount}:${detail.paymentRef}`} detail={detail} isAdmin={isAdmin} onError={fail} onSaved={applied} />
      <DeliveryBlock detail={detail} isAdmin={isAdmin} onError={fail} onNotice={(message) => { setError(null); setNotice(message) }} />
      <ReportBlock detail={detail} isAdmin={isAdmin} onError={fail} onSaved={applied} />
      <div className="border-t border-slate-100 pt-3">
        <OwnerDeleteButton id={detail.id} label={`${detail.code} · ${detail.name}`} onDeleted={onDeleted} onError={(message) => fail(new Error(message), message)} />
      </div>
    </div>
  )
}

interface BlockProps {
  detail: MhcuDetail
  onSaved: (row: MhcuDetail, message: string) => void
  onError: (caught: unknown, fallback: string) => void
}

function AssignBlock({ detail, isAdmin, psychologists, onSaved, onError }: BlockProps & { isAdmin: boolean; psychologists: PsychologistOption[] }) {
  const { tx } = useTx()
  const [value, setValue] = useState(detail.psychologistId ?? '')
  const [busy, setBusy] = useState(false)
  const current = psychologists.find((p) => p.id === detail.psychologistId)?.name
  return (
    <section>
      <h3 className="text-sm font-bold text-slate-900">{tx('Psikolog', 'Psychologist')}</h3>
      {isAdmin ? (
        <div className="mt-1 flex flex-wrap gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{tx('Pilih psikolog', 'Choose a psychologist')}</span>
            <select className={fieldClass} onChange={(e) => setValue(e.target.value)} value={value}>
              <option value="">{tx('Belum ditugaskan', 'Not assigned')}</option>
              {psychologists.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <button
            className={buttonClass}
            disabled={busy || value === (detail.psychologistId ?? '')}
            onClick={() => {
              setBusy(true)
              assignPsychologist(detail.id, value || null)
                .then((row) => onSaved(row, tx('Psikolog disimpan.', 'Psychologist saved.')))
                .catch((caught) => onError(caught, tx('Gagal menyimpan.', 'Failed to save.')))
                .finally(() => setBusy(false))
            }}
            type="button"
          >
            {tx('Simpan psikolog', 'Save psychologist')}
          </button>
        </div>
      ) : (
        <p className="mt-1 text-sm text-slate-700">{current ?? tx('Ditugaskan kepada Anda', 'Assigned to you')}</p>
      )}
    </section>
  )
}

function NoteEditor({ detail, onSaved, onError }: BlockProps) {
  const { tx } = useTx()
  const [draft, setDraft] = useState<NoteDraft>(() => noteDraftOf(detail))
  const [busy, setBusy] = useState(false)
  const dirty = noteChanged(draft, detail)
  const left = CUSTOM_NOTE_MAX - draft.custom.length
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900">{tx('Keterangan psikolog untuk laporan klien', 'Psychologist note for the client report')}</h3>
      <p className="text-xs text-slate-500">
        {tx(
          'Paragraf pertama dibuat otomatis dari skor (lihat pratinjau laporan). Di bawah ini paragraf rekomendasi.',
          'The first paragraph is written automatically from the scores (see the report preview). The recommendation paragraph is below.',
        )}
      </p>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">{tx('Rekomendasi (teks standar level, boleh diubah)', 'Recommendation (standard text of the level, may be edited)')}</span>
        <textarea className={`${fieldClass} mt-1`} maxLength={4000} onChange={(e) => setDraft({ ...draft, template: e.target.value })} rows={4} value={draft.template} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-slate-600">{tx('Catatan khusus psikolog (ditambahkan setelah rekomendasi)', "Psychologist's own addition (added after the recommendation)")}</span>
        <textarea
          className={`${fieldClass} mt-1`}
          maxLength={CUSTOM_NOTE_MAX}
          onChange={(e) => setDraft({ ...draft, custom: e.target.value })}
          placeholder={tx('Mis. Secara khusus, kami menyarankan Anda...', 'E.g. In particular, we suggest that you...')}
          rows={3}
          value={draft.custom}
        />
        <span className={`text-xs ${left < 40 ? 'text-amber-700' : 'text-slate-500'}`}>
          {left} {tx('karakter tersisa (agar laporan tetap rapi)', 'characters left (keeps the report tidy)')}
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={draft.final} onChange={(e) => setDraft({ ...draft, final: e.target.checked })} type="checkbox" />
          {tx('Catatan final (siap dirilis)', 'Note is final (ready to release)')}
        </label>
        <button
          className={primaryClass}
          disabled={busy || !dirty}
          onClick={() => {
            setBusy(true)
            saveNote(detail.id, noteInputOf(draft, detail))
              .then((row) => onSaved(row, tx('Catatan disimpan.', 'Note saved.')))
              .catch((caught) => onError(caught, tx('Gagal menyimpan catatan.', 'Failed to save the note.')))
              .finally(() => setBusy(false))
          }}
          type="button"
        >
          {tx('Simpan catatan', 'Save note')}
        </button>
        {dirty && <span className="text-xs text-amber-700">{tx('Belum disimpan', 'Not saved yet')}</span>}
      </div>
    </section>
  )
}

function PaymentBlock({ detail, isAdmin, onSaved, onError }: BlockProps & { isAdmin: boolean }) {
  const { tx } = useTx()
  const [status, setStatus] = useState<PaymentStatus>((detail.paymentStatus as PaymentStatus) || 'UNPAID')
  const [pack, setPack] = useState(detail.paymentPackage ?? '')
  const [amount, setAmount] = useState(detail.paymentAmount === null ? '' : String(detail.paymentAmount))
  const [ref, setRef] = useState(detail.paymentRef ?? '')
  const [busy, setBusy] = useState(false)
  const [amountError, setAmountError] = useState(false)

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900">{tx('Pembayaran laporan lengkap', 'Full report payment')}</h3>
      <p className="text-sm text-slate-700">
        <PaymentChip status={detail.paymentStatus} />{' '}
        {detail.paymentSubmittedAt
          ? `${detail.paymentFor === 'package3' ? tx('Paket 3x', 'Package of 3') : tx('1x pemeriksaan', '1 check-up')} · ${tx('bukti transfer diterima', 'proof of transfer received')} ${dateText(detail.paymentSubmittedAt)}`
          : tx('Belum ada bukti transfer.', 'No proof of transfer yet.')}
      </p>
      {detail.paymentSubmittedAt && (
        <button
          className={buttonClass}
          onClick={() => void openPaymentProof(detail.id).catch((caught) => onError(caught, tx('Gagal membuka bukti.', 'Could not open the proof.')))}
          type="button"
        >
          {tx('Lihat bukti transfer', 'View proof of transfer')}
        </button>
      )}
      {isAdmin && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Status', 'Status')}
            <select className={`${fieldClass} mt-1`} onChange={(e) => setStatus(e.target.value as PaymentStatus)} value={status}>
              {PAYMENT_STATUSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Paket', 'Package')}
            <select className={`${fieldClass} mt-1`} onChange={(e) => setPack(e.target.value)} value={pack}>
              <option value="">–</option>
              <option value="1x">{tx('Laporan 1x', 'Report 1x')}</option>
              <option value="3x">{tx('Paket 3x', 'Package 3x')}</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Nominal (Rp)', 'Amount (Rp)')}
            <input
              aria-invalid={amountError}
              className={`${fieldClass} mt-1 ${amountError ? 'border-rose-400' : ''}`}
              inputMode="numeric"
              onChange={(e) => { setAmount(e.target.value); setAmountError(false) }}
              placeholder="227.000"
              value={amount}
            />
            {amountError && <span className="text-rose-700">{tx('Isi angka rupiah, mis. 227.000.', 'Enter a rupiah amount, e.g. 227.000.')}</span>}
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Referensi pembayaran', 'Payment reference')}
            <input className={`${fieldClass} mt-1`} maxLength={120} onChange={(e) => setRef(e.target.value)} value={ref} />
          </label>
          <div className="sm:col-span-2">
            <button
              className={primaryClass}
              disabled={busy}
              onClick={() => {
                const parsed = parseAmount(amount)
                if (parsed === null) return setAmountError(true)
                setBusy(true)
                savePayment(detail.id, { status, package: pack || null, amount: parsed === '' ? null : parsed, ref: ref.trim() || null })
                  .then((row) => onSaved(row, tx('Pembayaran disimpan.', 'Payment saved.')))
                  .catch((caught) => onError(caught, tx('Gagal menyimpan pembayaran.', 'Failed to save the payment.')))
                  .finally(() => setBusy(false))
              }}
              type="button"
            >
              {tx('Simpan pembayaran', 'Save payment')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function ReportBlock({ detail, isAdmin, onSaved, onError }: BlockProps & { isAdmin: boolean }) {
  const { tx } = useTx()
  const [busy, setBusy] = useState(false)
  const blocker = releaseBlocker(detail)
  const reason =
    blocker === 'released'
      ? tx(`Sudah dirilis${detail.releasedAt ? ` ${dateText(detail.releasedAt)}` : ''}.`, `Already released${detail.releasedAt ? ` ${dateText(detail.releasedAt)}` : ''}.`)
      : blocker === 'note'
        ? tx('Belum bisa dirilis: catatan psikolog belum ditandai final.', 'Cannot be released yet: the psychologist note is not marked final.')
        : blocker === 'payment'
          ? tx('Belum bisa dirilis: pembayaran belum dikonfirmasi (PAID, FREE, INCLUDED, atau LEGACY).', 'Cannot be released yet: payment is not confirmed (PAID, FREE, INCLUDED or LEGACY).')
          : tx('Siap dirilis: catatan final dan pembayaran terkonfirmasi.', 'Ready to release: the note is final and the payment is confirmed.')
  const open = (kind: 'client' | 'psychologist', lang?: 'id' | 'en') => void openReport(detail.id, kind, lang).catch((caught) => onError(caught, tx('Gagal membuka laporan.', 'Could not open the report.')))
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900">{tx('Laporan', 'Report')}</h3>
      <p className="text-sm text-slate-700">
        {tx('Status', 'Status')}: <StatusText status={detail.status} /> · {tx('Email hasil', 'Result e-mail')}: {detail.resultEmailSentAt ? dateText(detail.resultEmailSentAt) : tx('belum terkirim', 'not sent')}
      </p>
      <p className="text-sm text-slate-600">{reason}</p>
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} onClick={() => open('client', 'id')} type="button">
          <FileText aria-hidden="true" className="mr-1 inline size-4" />{tx('Pratinjau laporan klien (Indonesia)', 'Preview client report (Indonesian)')}
        </button>
        <button className={buttonClass} onClick={() => open('client', 'en')} type="button">
          <FileText aria-hidden="true" className="mr-1 inline size-4" />{tx('Pratinjau laporan klien (English)', 'Preview client report (English)')}
        </button>
        <button className={buttonClass} onClick={() => open('psychologist')} type="button">
          <FileText aria-hidden="true" className="mr-1 inline size-4" />{tx('Laporan psikolog (internal)', 'Psychologist report (internal)')}
        </button>
        {isAdmin && (
          <button
            className={primaryClass}
            disabled={busy || blocker !== null}
            onClick={() => {
              if (!window.confirm(tx(`Rilis laporan ke ${detail.email}? Peserta akan menerima tautan laporan.`, `Release the report to ${detail.email}? The participant will receive a link to it.`))) return
              setBusy(true)
              releaseReport(detail.id)
                .then(async (result) => {
                  const row = await getMhcu(detail.id)
                  onSaved(
                    row,
                    result.emailed
                      ? tx('Laporan dirilis dan tautannya sudah dikirim lewat email.', 'The report is released and the link was sent by e-mail.')
                      : tx('Laporan dirilis, tetapi email belum terkirim. Kirim tautannya secara manual.', 'The report is released, but the e-mail was not sent. Send the link yourself.'),
                  )
                })
                .catch((caught) => onError(caught, tx('Gagal merilis laporan.', 'Failed to release the report.')))
                .finally(() => setBusy(false))
            }}
            type="button"
          >
            {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : blocker === 'released' ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <Send aria-hidden="true" className="size-4" />}
            {tx('Rilis laporan', 'Release report')}
          </button>
        )}
      </div>
    </section>
  )
}
