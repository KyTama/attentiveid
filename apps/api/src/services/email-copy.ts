/**
 * Every sentence a recipient of a bulk e-mail reads that the sender did not write: footer, tracking notice, unsubscribe page.
 * It is all here so the wording is easy to change.
 *
 * Indonesian uses "kamu" (the user's choice, 27 Nov 2026, for the bulk e-mail only; the site's other forms and e-mails are
 * not changed). The tracking notice still needs the Director's approval and a matching paragraph in the privacy notice.
 */
import type { EmailLanguage } from '@attentiveid/shared';

export const EMAIL_COPY: Record<EmailLanguage, {
    reason: string;
    tracking: string;
    unsubscribe: string;
    privacy: string;
    pageTitle: string;
    pageAsk: string;
    pageButton: string;
    pageDone: string;
    pageInvalid: string;
}> = {
    id: {
        reason: 'E-mail ini dikirim kepadamu oleh Attentive (attentiveid.com).',
        tracking: 'Kami mencatat apakah e-mail ini dibuka dan tautan mana yang diklik, untuk memperbaiki kiriman kami.',
        unsubscribe: 'Berhenti berlangganan',
        privacy: 'Kebijakan privasi',
        pageTitle: 'Berhenti berlangganan',
        pageAsk: 'Tekan tombol di bawah agar kamu tidak menerima e-mail massal dari Attentive lagi. E-mail layanan (misalnya hasil pemeriksaan atau pembayaran) tetap dikirim.',
        pageButton: 'Berhenti berlangganan',
        pageDone: 'Selesai. Kamu tidak akan menerima e-mail massal dari Attentive lagi.',
        pageInvalid: 'Tautan ini tidak berlaku. Balas e-mail kami dan tulis "berhenti".'
    },
    en: {
        reason: 'Attentive (attentiveid.com) sent you this e-mail.',
        tracking: 'We record whether this e-mail is opened and which links are clicked, to improve what we send.',
        unsubscribe: 'Unsubscribe',
        privacy: 'Privacy notice',
        pageTitle: 'Unsubscribe',
        pageAsk: 'Press the button below to stop receiving bulk e-mail from Attentive. Service e-mails (such as results or payments) are still sent.',
        pageButton: 'Unsubscribe',
        pageDone: 'Done. You will not receive bulk e-mail from Attentive again.',
        pageInvalid: 'This link is not valid. Reply to our e-mail and write "unsubscribe".'
    }
};

/** Used for {{name}} when a contact has no name. Neutral in both voices. */
export const NAME_FALLBACK: Record<EmailLanguage, string> = { id: 'Kak', en: 'there' };
