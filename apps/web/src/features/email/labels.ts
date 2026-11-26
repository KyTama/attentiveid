import type { EmailCampaignStatus } from '@attentiveid/shared'
import { useTx } from '@/features/i18n/use-tx'

export function useLabels() {
  const { tx, isEn } = useTx()
  const names: Record<EmailCampaignStatus, string> = {
    draft: tx('Draf', 'Draft'), queued: tx('Sedang dikirim', 'Sending'), paused: tx('Dijeda', 'Paused'),
    done: tx('Selesai', 'Done'), cancelled: tx('Dibatalkan', 'Cancelled'),
  }
  return {
    status: (value: EmailCampaignStatus) => names[value],
    /** Date and time in Jakarta, wherever the admin is. */
    when: (value: string) => `${new Date(value).toLocaleString(isEn ? 'en-GB' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })} WIB`,
  }
}
