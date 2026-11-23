import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Loader2 } from 'lucide-react'
import { useTx } from '@/features/i18n/use-tx'
import {
  cancelInvite,
  createInvite,
  listInvites,
  listPsychologistOptions,
  type Invite,
  type InviteStatus,
  type InviteTrack,
  type PsychologistOption,
} from '@/features/mhcu-dashboard/api'
import { dateText, trackLabel } from '@/features/mhcu-dashboard/helpers'

const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'
const buttonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

const STATUS_STYLE: Record<InviteStatus, string> = {
  OPEN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  USED: 'border-slate-200 bg-slate-100 text-slate-600',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
}

/** One-time links for people who register for an initial assessment or a free session (admin only). */
export function MhcuInvitesPage() {
  const { tx, isEn } = useTx()
  const lang = isEn ? 'en' : 'id'
  const [invites, setInvites] = useState<Invite[]>([])
  const [psychologists, setPsychologists] = useState<PsychologistOption[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [created, setCreated] = useState<{ url: string; name: string } | null>(null)
  const [form, setForm] = useState({ track: 'asesmen' as InviteTrack, psychologistId: '', clientName: '', clientEmail: '', clientPhone: '', note: '' })

  useEffect(() => {
    let alive = true
    Promise.all([listInvites(), listPsychologistOptions().catch(() => [] as PsychologistOption[])])
      .then(([list, people]) => {
        if (!alive) return
        setInvites(list)
        setPsychologists(people)
        setForm((current) => ({ ...current, psychologistId: current.psychologistId || people[0]?.id || '' }))
      })
      .catch((caught) => alive && setError(caught instanceof Error ? caught.message : tx('Undangan belum bisa dimuat.', 'The invitations could not be loaded.')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setError(null)
      setNotice(tx('Tautan disalin.', 'Link copied.'))
    } catch {
      setNotice(null)
      setError(tx('Tautan tidak bisa disalin otomatis; salin dari kolom di atas.', 'The link could not be copied automatically; copy it from the box above.'))
    }
  }

  const submit = () => {
    if (!form.psychologistId) {
      setError(tx('Pilih psikolog.', 'Choose a psychologist.'))
      return
    }
    if (form.clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.clientEmail.trim())) {
      setError(tx('Alamat email klien tidak valid.', 'The client e-mail address is not valid.'))
      return
    }
    setBusy(true)
    setError(null)
    createInvite({
      track: form.track,
      psychologistId: form.psychologistId,
      clientName: form.clientName.trim() || undefined,
      clientEmail: form.clientEmail.trim() || undefined,
      clientPhone: form.clientPhone.trim() || undefined,
      note: form.note.trim() || undefined,
    })
      .then((result) => {
        setInvites(result.invites)
        setCreated({ url: result.url, name: form.clientName.trim() })
        setNotice(tx('Tautan dibuat.', 'Link created.'))
        setForm((current) => ({ ...current, clientName: '', clientEmail: '', clientPhone: '', note: '' }))
      })
      .catch((caught) => {
        setNotice(null)
        setError(caught instanceof Error ? caught.message : tx('Gagal membuat tautan.', 'Failed to create the link.'))
      })
      .finally(() => setBusy(false))
  }

  const cancel = (invite: Invite) => {
    if (!window.confirm(tx('Batalkan undangan ini? Tautannya tidak bisa dipakai lagi.', 'Cancel this invitation? The link can no longer be used.'))) return
    setBusy(true)
    cancelInvite(invite.id)
      .then((list) => {
        setInvites(list)
        setError(null)
        setNotice(tx('Undangan dibatalkan.', 'Invitation cancelled.'))
      })
      .catch((caught) => {
        setNotice(null)
        setError(caught instanceof Error ? caught.message : tx('Gagal membatalkan.', 'Failed to cancel.'))
      })
      .finally(() => setBusy(false))
  }

  const statusName = (s: InviteStatus) => (s === 'OPEN' ? tx('Terbuka', 'Open') : s === 'USED' ? tx('Dipakai', 'Used') : tx('Dibatalkan', 'Cancelled'))
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="space-y-2">
        <Link className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy-800" to="/dashboard/assessments/mhcu">
          <ArrowLeft aria-hidden="true" className="size-4" /> {tx('Dasbor MHCU', 'MHCU dashboard')}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Tautan undangan', 'Invitation links')}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          {tx(
            'Tautan sekali pakai untuk klien jalur asesmen awal (sudah membayar saat registrasi) atau free session. Klien yang mengisi lewat tautan ini langsung mendapat psikolog dan laporan lengkap tanpa biaya tambahan.',
            'One-time links for clients of the initial assessment (paid at registration) or a free session. A client who fills in the check-up through the link gets a psychologist and the full report at no extra cost.',
          )}
        </p>
      </div>

      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}

      <section aria-label={tx('Buat tautan', 'Create a link')} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">{tx('Buat tautan baru', 'New link')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Jalur', 'Track')}
            <select className={`${fieldClass} mt-1`} onChange={(e) => set('track', e.target.value as InviteTrack)} value={form.track}>
              <option value="asesmen">{tx('Asesmen awal (registrasi klien baru)', 'Initial assessment (new client)')}</option>
              <option value="free">Free session</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Psikolog', 'Psychologist')}
            <select className={`${fieldClass} mt-1`} onChange={(e) => set('psychologistId', e.target.value)} value={form.psychologistId}>
              {psychologists.length === 0 && <option value="">{tx('Tidak ada psikolog', 'No psychologists')}</option>}
              {psychologists.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Nama klien (opsional)', 'Client name (optional)')}
            <input className={`${fieldClass} mt-1`} maxLength={120} onChange={(e) => set('clientName', e.target.value)} value={form.clientName} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Email klien (opsional)', 'Client e-mail (optional)')}
            <input className={`${fieldClass} mt-1`} inputMode="email" maxLength={160} onChange={(e) => set('clientEmail', e.target.value)} type="email" value={form.clientEmail} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Telepon/WhatsApp klien (opsional)', 'Client phone/WhatsApp (optional)')}
            <input className={`${fieldClass} mt-1`} inputMode="tel" maxLength={40} onChange={(e) => set('clientPhone', e.target.value)} value={form.clientPhone} />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Catatan (opsional)', 'Note (optional)')}
            <input className={`${fieldClass} mt-1`} maxLength={200} onChange={(e) => set('note', e.target.value)} value={form.note} />
          </label>
        </div>
        <button className={`${buttonClass} !border-navy-900 !bg-navy-900 !text-white hover:!opacity-90`} disabled={busy || loading} onClick={submit} type="button">
          {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {tx('Buat tautan', 'Create link')}
        </button>

        {created && (
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">{tx('Tautan untuk', 'Link for')} {created.name || tx('klien', 'the client')}:</p>
            <input aria-label={tx('Tautan undangan', 'Invitation link')} className={`${fieldClass} font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} readOnly value={created.url} />
            <p className="text-xs text-amber-900">{tx('Kirim tautan ini ke klien. Tautan hanya bisa dipakai satu kali.', 'Send this link to the client. It can only be used once.')}</p>
            <button className={buttonClass} onClick={() => void copy(created.url)} type="button">
              <Copy aria-hidden="true" className="size-4" /> {tx('Salin tautan', 'Copy link')}
            </button>
          </div>
        )}
      </section>

      <section aria-label={tx('Daftar undangan', 'Invitations')}>
        <h2 className="mb-2 text-base font-bold text-slate-900">{tx('Daftar undangan', 'Invitations')}</h2>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-slate-500" role="status"><Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat...', 'Loading...')}</p>
        ) : invites.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">{tx('Belum ada undangan.', 'No invitations yet.')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {invites.map((invite) => (
              <li className="space-y-2 px-4 py-3" key={invite.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                    <p className="font-semibold text-slate-900">{invite.clientName || tx('(tanpa nama)', '(no name)')}</p>
                    <p className="text-xs text-slate-500">{invite.clientEmail || '–'}{invite.clientPhone ? ` · ${invite.clientPhone}` : ''}</p>
                    <p className="text-xs text-slate-500">
                      {trackLabel(invite.track, lang)} · {invite.psychologistName?.split(',')[0] ?? '–'} · {dateText(invite.createdAt)}
                    </p>
                    {invite.note && <p className="text-xs text-slate-600">{invite.note}</p>}
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[invite.status]}`}>{statusName(invite.status)}</span>
                </div>
                {invite.status === 'OPEN' && (
                  <div className="flex flex-wrap gap-2">
                    <button className={buttonClass} onClick={() => void copy(invite.url)} type="button">
                      <Copy aria-hidden="true" className="size-4" /> {tx('Salin tautan', 'Copy link')}
                    </button>
                    <button className={`${buttonClass} text-rose-700`} disabled={busy} onClick={() => cancel(invite)} type="button">
                      {tx('Batalkan', 'Cancel')}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
