import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { useTx } from '../i18n/use-tx'
import { resendResult, type MhcuDetail } from './api'
import { LEVEL_HEX, MHI_BANDS, dateText, fmt1, levelNameOf, markerPercent } from './helpers'

const SCALE_TEXT = (lang: 'id' | 'en') => [1, 2, 3, 4, 5].map((n) => ({ n, name: levelNameOf(n, lang) }))

/** The summary the participant gets in the result e-mail, drawn from the stored scores (nothing is sent from the server). */
export function SummaryBlock({ detail }: { detail: MhcuDetail }) {
  const { tx, isEn } = useTx()
  const lang = isEn ? 'en' : 'id'
  const scores = detail.scores as Record<string, unknown>
  const mhi = typeof scores.mhi === 'number' ? scores.mhi : null
  const level = detail.level
  const position = markerPercent(mhi)
  return (
    <section aria-label={tx('Ringkasan seperti di email', 'Summary as in the e-mail')} className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900">{tx('Ringkasan (seperti di email)', 'Summary (as in the e-mail)')}</h3>
      <div className="grid overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-[9rem_1fr]">
        <div className="bg-slate-50 px-3 py-3 text-center">
          <p className="text-[10px] font-bold tracking-wide text-slate-500">MENTAL HEALTH INDEX</p>
          <p className="text-3xl font-bold text-navy-900">{fmt1(mhi)}</p>
          <p className="text-xs text-slate-500">{tx('dari 100', 'out of 100')}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold tracking-wide text-slate-500">{tx('STATUS KESELURUHAN', 'OVERALL STATUS')}</p>
          <p className="text-base font-bold text-navy-900">
            {level ? `Level ${level} ${tx('dari', 'of')} 5: ${levelNameOf(level, lang)}` : tx('Level belum ada', 'No level yet')}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-bold tracking-wide text-slate-500">{tx('SKALA STATUS', 'STATUS SCALE')}</p>
        <ol className="grid grid-cols-5 gap-1 text-center text-[10px] leading-tight sm:text-xs">
          {SCALE_TEXT(lang).map(({ n, name }) => (
            <li
              aria-current={n === level ? 'true' : undefined}
              className={`flex min-h-11 flex-col justify-center rounded-md border-b-4 px-1 py-1.5 ${n === level ? 'bg-navy-900 font-bold text-white' : 'bg-slate-50 text-slate-500'}`}
              key={n}
              style={{ borderBottomColor: LEVEL_HEX[n] }}
            >
              <span>{n}</span>
              <span className="[overflow-wrap:anywhere]">{name}</span>
            </li>
          ))}
        </ol>
      </div>

      {position !== null && (
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-wide text-slate-500">{tx('POSISI MHI PADA RENTANG RUJUKAN', 'MHI POSITION ON THE REFERENCE RANGES')}</p>
          <div className="relative pt-6">
            <div className="absolute top-0 -translate-x-1/2 text-center text-xs font-bold leading-none text-navy-900" style={{ left: `${position}%` }}>
              {fmt1(mhi)}
              <span aria-hidden="true" className="block text-[9px]">▼</span>
            </div>
            <div aria-hidden="true" className="flex h-5 overflow-hidden rounded-md">
              {MHI_BANDS.map((band) => (
                <span key={band.from} style={{ width: `${band.to - band.from}%`, backgroundColor: band.fill, opacity: 0.45 }} />
              ))}
            </div>
            <div className="mt-1 flex text-[10px] text-slate-500">
              {MHI_BANDS.map((band) => (
                <span className="truncate" key={band.from} style={{ width: `${band.to - band.from}%` }}>
                  {band.from}–{band.to}
                  <span className="hidden sm:inline"> {levelNameOf(band.level, lang)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const dateOrNot = (iso: string | null | undefined, no: string): string => (iso ? dateText(iso) : no)

/** What was sent or done so far, from the fields the detail already has; admins can send the result e-mail again. */
export function DeliveryBlock({ detail, isAdmin, onNotice, onError }: { detail: MhcuDetail; isAdmin: boolean; onNotice: (message: string) => void; onError: (caught: unknown, fallback: string) => void }) {
  const { tx } = useTx()
  const [busy, setBusy] = useState(false)
  const no = tx('belum', 'not yet')
  const rows: [string, string][] = [
    [tx('Email hasil ke peserta', 'Result e-mail to the participant'), dateOrNot(detail.resultEmailSentAt, no)],
    [tx('Peringatan ke contact@ (level 4–5)', 'Alert to contact@ (level 4–5)'), detail.level && detail.level >= 4 ? dateOrNot(detail.adminAlertAt, no) : tx('tidak diperlukan', 'not needed')],
    [tx('Bukti transfer masuk', 'Proof of transfer received'), dateOrNot(detail.paymentSubmittedAt, no)],
    [tx('Laporan lengkap dirilis', 'Full report released'), dateOrNot(detail.reportSentAt ?? detail.releasedAt, no)],
  ]
  return (
    <section aria-label={tx('Pengiriman', 'Deliveries')} className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900">{tx('Pengiriman', 'Deliveries')}</h3>
      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
        {rows.map(([label, value]) => (
          <div className="flex flex-wrap justify-between gap-x-3 px-3 py-2" key={label}>
            <dt className="text-slate-600">{label}</dt>
            <dd className={value === no ? 'text-slate-400' : 'font-semibold text-slate-900'}>{value}</dd>
          </div>
        ))}
      </dl>
      {isAdmin && (
        <button
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(tx(`Kirim ulang email hasil ke ${detail.email}?`, `Send the result e-mail to ${detail.email} again?`))) return
            setBusy(true)
            resendResult(detail.id)
              .then((r) => onNotice(r.sent ? tx('Email hasil dikirim ulang.', 'The result e-mail was sent again.') : tx('Email hasil belum terkirim.', 'The result e-mail was not sent.')))
              .catch((caught) => onError(caught, tx('Gagal mengirim ulang email.', 'Failed to send the e-mail again.')))
              .finally(() => setBusy(false))
          }}
          type="button"
        >
          {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Mail aria-hidden="true" className="size-4" />}
          {tx('Kirim ulang email hasil', 'Send result e-mail again')}
        </button>
      )}
    </section>
  )
}
