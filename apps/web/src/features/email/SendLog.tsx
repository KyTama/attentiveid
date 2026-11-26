import { useState } from 'react'
import type { EmailPauseReason, EmailRecipientStatus } from '@attentiveid/shared'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTx } from '@/features/i18n/use-tx'
import { controlCampaign, type CampaignDetail } from './campaigns'
import { useLabels } from './labels'
import { buttonDanger, buttonPrimary, buttonSecondary } from './styles'

interface Props {
  detail: CampaignDetail
  onChanged: () => void
  onPage: (offset: number) => void
}

/** One queued or finished send: what, to whom, when, by whom. */
export function SendLog({ detail, onChanged, onPage }: Props) {
  const { tx } = useTx()
  const { when, status } = useLabels()
  const { campaign, recipients, offset, pageSize } = detail
  const [failure, setFailure] = useState('')
  const [busy, setBusy] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { counts } = campaign

  const act = async (action: 'pause' | 'resume' | 'cancel') => {
    setBusy(true)
    setFailure('')
    try {
      await controlCampaign(campaign.id, action)
      setCancelling(false)
      onChanged()
    } catch (caught) {
      setFailure(caught instanceof Error ? caught.message : tx('Gagal.', 'Failed.'))
    } finally {
      setBusy(false)
    }
  }

  const pause: Record<EmailPauseReason, string> = {
    manual: tx('Dijeda oleh admin.', 'Paused by an admin.'),
    daily_limit: tx('Dijeda: Google menolak karena batas harian. Lanjutkan besok.', 'Paused: Google refused because of its daily limit. Resume tomorrow.'),
    sign_in: tx('Dijeda: akun e-mail tidak bisa masuk. Hubungi pengelola sebelum melanjutkan.', 'Paused: the mail account could not sign in. Ask the administrator before resuming.'),
    rejected: tx('Dijeda: beberapa e-mail berturut-turut ditolak dengan alasan yang sama. Periksa isi dan lampiran sebelum melanjutkan.', 'Paused: several e-mails in a row were refused for the same reason. Check the content and attachments before resuming.'),
    switched_off: tx('Dijeda karena pengiriman sempat dimatikan di server. Lanjutkan bila masih ingin dikirim.', 'Paused because sending was switched off at the server. Resume if it should still go out.'),
  }
  const recipientStatus: Record<EmailRecipientStatus, string> = {
    queued: tx('menunggu', 'waiting'), sending: tx('mengirim', 'sending'), sent: tx('terkirim', 'sent'),
    failed: tx('gagal', 'failed'), skipped: tx('dilewati', 'skipped'), unknown: tx('tidak pasti', 'uncertain'),
  }
  const reason: Record<string, string> = {
    refused: tx('alamat ditolak', 'address refused'), temporary: tx('gangguan sementara', 'temporary problem'),
    unsubscribed: tx('berhenti berlangganan', 'unsubscribed'), archived: tx('diarsipkan atau dihapus', 'archived or removed'),
    cancelled: tx('dibatalkan', 'cancelled'), unknown: tx('mungkin sudah terkirim; tidak dikirim ulang', 'may have been sent; not sent again'),
    interrupted: tx('terputus; tidak dikirim ulang', 'interrupted; not sent again'),
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
        <p className="break-words text-lg font-semibold text-slate-900">{campaign.title}</p>
        <p className="mt-1 text-sm text-slate-600">
          {status(campaign.status)} · {tx('dikirim oleh', 'sent by')} {campaign.sentBy || campaign.createdBy}
          {campaign.queuedAt && ` · ${when(campaign.queuedAt)}`}
        </p>
        {campaign.files.length > 0 && <p className="text-sm text-slate-600">{tx('Lampiran', 'Attachments')}: {campaign.files.map((file) => file.name).join(', ')}</p>}
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center sm:grid-cols-6">
          {([
            [tx('Penerima', 'Recipients'), counts.total], [tx('Terkirim', 'Sent'), counts.sent], [tx('Menunggu', 'Waiting'), counts.queued],
            [tx('Gagal/lewat', 'Failed/skipped'), counts.failed + counts.skipped + counts.unknown], [tx('Dibuka', 'Opened'), counts.opened], [tx('Diklik', 'Clicked'), counts.clicked],
          ] as const).map(([label, value]) => (
            <div className="rounded-xl border border-slate-200 px-2 py-2" key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-xl font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate-500">
          {tx('"Dibuka" hanya perkiraan: sebagian aplikasi memuat gambar sendiri, sebagian memblokirnya. "Diklik" bisa berasal dari pemindai keamanan.',
            '"Opened" is only a rough figure: some apps load images by themselves, others block them. A "click" can come from a security scanner.')}
        </p>
        {campaign.status === 'paused' && campaign.pausedReason && <p className="mt-2 text-sm text-amber-800">{pause[campaign.pausedReason]}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {campaign.status === 'queued' && <button className={buttonSecondary} disabled={busy} onClick={() => void act('pause')} type="button">{tx('Jeda', 'Pause')}</button>}
          {campaign.status === 'paused' && <button className={buttonPrimary} disabled={busy} onClick={() => void act('resume')} type="button">{tx('Lanjutkan', 'Resume')}</button>}
          {(campaign.status === 'queued' || campaign.status === 'paused') && <button className={buttonSecondary} disabled={busy} onClick={() => setCancelling(true)} type="button">{tx('Batalkan', 'Cancel send')}</button>}
          <button className={buttonSecondary} disabled={busy} onClick={onChanged} type="button">{tx('Muat ulang', 'Refresh')}</button>
        </div>
        {failure && <p className="mt-2 text-sm text-rose-700" role="alert">{failure}</p>}
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white empty:hidden">
        {recipients.map((row) => (
          <li className="px-3 py-2 text-sm" key={row.id}>
            <p className="break-words font-medium text-slate-900">{row.name || row.email || tx('(kontak sudah dihapus)', '(deleted contact)')}{row.name && <span className="font-normal text-slate-500"> · {row.email}</span>}</p>
            <p className="text-xs text-slate-600">
              {recipientStatus[row.status]}
              {row.sentAt && ` ${when(row.sentAt)}`}
              {row.error && ` · ${reason[row.error] ?? row.error}`}
              {row.openedAt && ` · ${tx(`dibuka ${row.openCount}x`, `opened ${row.openCount}x`)}`}
              {row.clickedAt && ` · ${tx(`diklik ${row.clickCount}x`, `clicked ${row.clickCount}x`)}`}
            </p>
          </li>
        ))}
      </ul>
      {counts.total > pageSize && (
        <div className="flex items-center justify-between gap-2 text-sm text-slate-600">
          <button className={buttonSecondary} disabled={offset === 0} onClick={() => onPage(Math.max(0, offset - pageSize))} type="button">{tx('Sebelumnya', 'Previous')}</button>
          <span>{offset + 1}–{offset + recipients.length} / {counts.total}</span>
          <button className={buttonSecondary} disabled={offset + pageSize >= counts.total} onClick={() => onPage(offset + pageSize)} type="button">{tx('Berikutnya', 'Next')}</button>
        </div>
      )}

      {cancelling && (
        <Dialog open onOpenChange={(open) => !open && setCancelling(false)}>
          <DialogContent className="bg-white">
            <DialogTitle className="text-lg font-semibold text-slate-900">{tx('Batalkan kiriman?', 'Cancel this send?')}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">{tx(`${counts.queued} e-mail yang menunggu tidak akan dikirim. Yang sudah terkirim tidak bisa ditarik.`, `${counts.queued} waiting e-mails will not be sent. Sent ones cannot be taken back.`)}</DialogDescription>
            <div className="flex justify-end gap-2">
              <button className={buttonSecondary} onClick={() => setCancelling(false)} type="button">{tx('Tidak', 'No')}</button>
              <button className={buttonDanger} disabled={busy} onClick={() => void act('cancel')} type="button">{tx('Ya, batalkan', 'Yes, cancel')}</button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
