/**
 * E-mails around the payment of the full report:
 *  - to the participant, right after they send the proof of transfer: "we received it, we are confirming it, we will contact you";
 *  - to staff (the admin inbox), so someone checks the proof and confirms the payment in the dashboard.
 */

import { PAYMENT_OPTIONS, priceFor } from './assessment-payment'

export interface BuiltMail {
    subject: string
    html: string
    text: string
}

const esc = (value: unknown): string =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const rupiah = (amount: number): string => `Rp ${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
const FONT = 'Montserrat,Arial,Helvetica,sans-serif'

const FOR_LABEL = {
    id: { single: 'Laporan lengkap 1x pemeriksaan', package3: 'Paket 3x pemeriksaan' },
    en: { single: 'Full report, single check-up', package3: 'Package of 3 check-ups' }
} as const

const labelOf = (paymentFor: string, lang: 'id' | 'en'): string =>
    (FOR_LABEL[lang] as Record<string, string>)[paymentFor] ?? paymentFor

/** The same clean white header as the result e-mail (gold logo, navy rule), so the mails look like one family. */
const shell = (origin: string, kicker: string, inner: string, footer: string): string =>
    `<!DOCTYPE html><meta charset="utf-8"><div style="background:#EEF0F3;padding:24px 10px;font-family:${FONT};"><table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #D0D5DD"><tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:22px 28px 16px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle"><img src="${esc(origin)}/images/assessments/attentive-logo-light.png" width="132" height="36" alt="attentive." style="display:block;border:0"></td><td align="right" valign="middle" style="font-family:${FONT};font-size:9.5px;line-height:1.6;letter-spacing:1.4px;font-weight:bold;color:#667085">${esc(kicker)}</td></tr></table></td></tr><tr><td height="2" bgcolor="#142B51" style="background:#142B51;font-size:1px;line-height:2px">&nbsp;</td></tr><tr><td style="padding:26px 28px 22px 28px;font-size:14px;line-height:1.6;color:#1B2533">${inner}</td></tr><tr><td style="padding:16px 28px 22px 28px;border-top:1px solid #EAECF0;font-size:11px;line-height:1.55;color:#667085">${footer}</td></tr></table></div>`

export interface PaymentReceivedInput {
    name: string
    code: string
    lang: 'id' | 'en'
    paymentFor: string
    siteOrigin?: string
    today?: Date
}

/** To the participant: the proof arrived, an admin is checking it, and they will be contacted. Nothing says the payment is already confirmed. */
export const buildPaymentReceivedEmail = (input: PaymentReceivedInput): BuiltMail => {
    const lang = input.lang === 'en' ? 'en' : 'id'
    const origin = (input.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '')
    const today = input.today ?? new Date()
    const option = input.paymentFor === 'package3' ? 'package3' : 'single'
    const amount = rupiah(priceFor(option, today))
    const what = labelOf(input.paymentFor, lang)
    const copy =
        lang === 'en'
            ? {
                  subject: `We received your proof of transfer · ${input.code}`,
                  kicker: 'PAYMENT RECEIVED',
                  heading: 'We received your proof of transfer',
                  hello: `Dear ${input.name},`,
                  body: 'Thank you. Your proof of transfer has reached us. Our admin is now checking your payment. This can take a little while, so there is nothing more you need to do.',
                  next: 'Once your payment is confirmed, we will contact you. An Attentive psychologist will then be assigned to review your result and prepare your full report.',
                  detail: 'Your submission',
                  code: 'Result code',
                  forWhat: 'Payment for',
                  amount: 'Amount',
                  note: 'This e-mail is not yet a confirmation of payment. If you have not heard from us within 1 working day, reply to this e-mail or message us on WhatsApp.',
                  org: 'Attentive Psychology Bureau',
                  conf: 'This e-mail is confidential and intended only for the recipient.'
              }
            : {
                  subject: `Bukti transfer Anda sudah kami terima · ${input.code}`,
                  kicker: 'PEMBAYARAN DITERIMA',
                  heading: 'Bukti transfer Anda sudah kami terima',
                  hello: `Yth. ${input.name},`,
                  body: 'Terima kasih. Bukti transfer Anda sudah sampai kepada kami. Admin kami sedang memeriksa pembayaran Anda. Prosesnya memerlukan sedikit waktu, jadi Anda tidak perlu melakukan apa pun lagi.',
                  next: 'Setelah pembayaran Anda terkonfirmasi, kami akan menghubungi Anda. Psikolog Attentive kemudian akan ditugaskan untuk meninjau hasil Anda dan menyusun laporan lengkap.',
                  detail: 'Data pengiriman Anda',
                  code: 'Kode hasil',
                  forWhat: 'Pembayaran untuk',
                  amount: 'Jumlah',
                  note: 'Email ini belum merupakan konfirmasi pembayaran. Jika dalam 1 hari kerja Anda belum mendapat kabar dari kami, balas email ini atau hubungi kami lewat WhatsApp.',
                  org: 'Biro Psikologi Attentive',
                  conf: 'Email ini bersifat rahasia dan hanya ditujukan kepada penerima.'
              }
    const row = (label: string, value: string) =>
        `<tr><td style="padding:3px 18px 3px 0;color:#667085">${esc(label)}</td><td style="padding:3px 0;font-weight:bold;color:#142B51">${esc(value)}</td></tr>`
    const inner = `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">${esc(copy.kicker)} | ${esc(input.code)}</p><p style="margin:0 0 12px 0;font-size:20px;line-height:1.3;font-weight:bold;color:#142B51">${esc(copy.heading)}</p><p style="margin:0 0 10px 0">${esc(copy.hello)}</p><p style="margin:0 0 10px 0;color:#3C4858">${esc(copy.body)}</p><p style="margin:0 0 16px 0;color:#3C4858">${esc(copy.next)}</p><div style="border:1px solid #D0D5DD;background:#F4F5F7;padding:12px 16px;margin:0 0 16px 0"><div style="font-size:10px;font-weight:bold;letter-spacing:1px;color:#667085;margin-bottom:4px">${esc(copy.detail.toUpperCase())}</div><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px">${row(copy.code, input.code)}${row(copy.forWhat, what)}${row(copy.amount, amount)}</table></div><p style="font-size:11.5px;line-height:1.55;color:#667085;margin:0">${esc(copy.note)}</p>`
    const footer = `<b style="color:#142B51">${esc(copy.org)}</b><br>WhatsApp <a href="https://wa.me/6285156410912" style="color:#142B51">+62 851-5641-0912</a> | <a href="mailto:contact@attentiveid.com" style="color:#142B51">contact@attentiveid.com</a> | <a href="https://attentiveid.com" style="color:#142B51">attentiveid.com</a><br>${esc(copy.conf)}`
    const text = [
        `${copy.kicker} | ${input.code}`,
        copy.heading,
        '',
        copy.hello,
        '',
        copy.body,
        copy.next,
        '',
        `${copy.code}: ${input.code}`,
        `${copy.forWhat}: ${what}`,
        `${copy.amount}: ${amount}`,
        '',
        copy.note,
        '',
        `${copy.org} | WhatsApp +62 851-5641-0912 | contact@attentiveid.com | attentiveid.com`,
        copy.conf
    ].join('\n')
    return { subject: copy.subject, html: shell(origin, copy.kicker, inner, footer), text }
}

export interface PaymentStaffInput {
    name: string
    code: string
    phone: string
    email: string
    level: number | null
    paymentFor: string
    submissionId: string
    siteOrigin?: string
}

/** To the admin inbox: a proof of transfer is waiting to be checked. For staff only. */
export const buildPaymentStaffEmail = (input: PaymentStaffInput): BuiltMail => {
    const origin = (input.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '')
    const link = `${origin}/dashboard/assessments/mhcu/${encodeURIComponent(input.submissionId)}`
    const what = labelOf(input.paymentFor, 'id')
    const option = input.paymentFor === 'package3' ? PAYMENT_OPTIONS.package3 : PAYMENT_OPTIONS.single
    const expected = `${rupiah(priceFor(input.paymentFor === 'package3' ? 'package3' : 'single'))} (harga normal ${rupiah(option.normal)})`
    const row = (label: string, value: string) =>
        `<tr><td style="padding:3px 18px 3px 0;color:#667085">${esc(label)}</td><td style="padding:3px 0;color:#1B2533">${esc(value)}</td></tr>`
    const inner = `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">BUKTI TRANSFER MASUK | ${esc(input.code)}</p><p style="margin:0 0 12px 0;font-size:19px;line-height:1.3;font-weight:bold;color:#142B51">Periksa dan konfirmasi pembayaran</p><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13.5px;margin:0 0 16px 0">${row('Kode', input.code)}${row('Nama', input.name)}${row('WhatsApp', input.phone)}${row('Email', input.email)}${row('Level', input.level === null ? '-' : String(input.level))}${row('Membayar untuk', what)}${row('Jumlah seharusnya', expected)}</table><p style="margin:0 0 16px 0"><a href="${esc(link)}" style="display:inline-block;background:#142B51;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13.5px;padding:11px 20px">Buka di dasbor dan lihat bukti</a></p><p style="font-size:11.5px;line-height:1.55;color:#667085;margin:0">Cocokkan bukti dengan mutasi rekening BCA 4500499562, lalu ubah status pembayaran di dasbor. Peserta sudah diberi tahu bahwa pembayarannya sedang dikonfirmasi.</p>`
    const text = [
        `BUKTI TRANSFER MASUK | ${input.code}`,
        '',
        `Nama: ${input.name}`,
        `WhatsApp: ${input.phone}`,
        `Email: ${input.email}`,
        `Level: ${input.level ?? '-'}`,
        `Membayar untuk: ${what}`,
        `Jumlah seharusnya: ${expected}`,
        '',
        `Buka di dasbor: ${link}`,
        '',
        'Email ini berisi data pribadi untuk staf saja. Jangan diteruskan.'
    ].join('\n')
    return {
        subject: `[MHCU] Bukti transfer masuk · ${input.code} · ${what}`,
        html: shell(origin, 'UNTUK STAF', inner, 'Email ini berisi data pribadi untuk staf saja. Jangan diteruskan.'),
        text
    }
}
