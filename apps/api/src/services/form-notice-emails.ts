/**
 * E-mails for the Goal System Compass (GSC) and the free session sign-up:
 *  - to the person, right after they send the form: "we received it" (nothing more is promised);
 *  - to staff (the admin inbox), so someone opens the entry in the dashboard and follows up.
 */

import { esc, shell, type BuiltMail } from './mhcu-payment-emails'

const origin = (value?: string): string => (value || 'https://attentiveid.com').replace(/\/$/, '')

const FOOTER_STAFF = 'Email ini berisi data pribadi untuk staf saja. Jangan diteruskan.'

const clientFooter = (lang: 'id' | 'en'): string =>
    lang === 'en'
        ? 'Attentive | WhatsApp +62 851-5641-0912 | contact@attentiveid.com | attentiveid.com<br>You get this e-mail because this address was entered on our form. If that was not you, you can ignore it.'
        : 'Attentive | WhatsApp +62 851-5641-0912 | contact@attentiveid.com | attentiveid.com<br>Anda menerima email ini karena alamat ini diisi pada formulir kami. Jika itu bukan Anda, abaikan saja.'

const row = (label: string, value: string): string =>
    `<tr><td style="padding:3px 18px 3px 0;color:#667085">${esc(label)}</td><td style="padding:3px 0;color:#1B2533">${esc(value)}</td></tr>`

const button = (link: string, label: string): string =>
    `<p style="margin:0 0 16px 0"><a href="${esc(link)}" style="display:inline-block;background:#142B51;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13.5px;padding:11px 20px">${esc(label)}</a></p>`

const clientBody = (kicker: string, title: string, paragraphs: string[]): string =>
    `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">${esc(kicker)}</p><p style="margin:0 0 12px 0;font-size:19px;line-height:1.3;font-weight:bold;color:#142B51">${esc(title)}</p>${paragraphs.map((text) => `<p style="margin:0 0 12px 0">${text}</p>`).join('')}`

// ---------- Goal System Compass ----------

export interface GscReceivedInput {
    name: string
    code: string
    lang: 'id' | 'en'
    siteOrigin?: string
}

/** To the person who filled in the Goal System Compass. */
export const buildGscReceivedEmail = (input: GscReceivedInput): BuiltMail => {
    const lang = input.lang === 'en' ? 'en' : 'id'
    const site = origin(input.siteOrigin)
    const copy =
        lang === 'en'
            ? {
                  subject: `We received your Goal System Compass · ${input.code}`,
                  kicker: 'GOAL SYSTEM COMPASS',
                  title: 'Your answers have arrived',
                  hello: `Hello ${esc(input.name)},`,
                  body: 'Thank you for filling in the Goal System Compass. Your answers are saved safely and the Attentive team will go through them.',
                  next: 'If we need anything from you, we will reach out by WhatsApp or e-mail. You do not need to do anything else for now.',
                  codeLabel: 'Your reference code',
              }
            : {
                  subject: `Goal System Compass Anda sudah kami terima · ${input.code}`,
                  kicker: 'GOAL SYSTEM COMPASS',
                  title: 'Jawaban Anda sudah masuk',
                  hello: `Halo ${esc(input.name)},`,
                  body: 'Terima kasih sudah mengisi Goal System Compass. Jawaban Anda tersimpan dengan aman dan akan dibaca oleh tim Attentive.',
                  next: 'Bila kami membutuhkan sesuatu dari Anda, kami akan menghubungi lewat WhatsApp atau email. Untuk saat ini tidak ada yang perlu Anda lakukan.',
                  codeLabel: 'Kode referensi Anda',
              }
    const inner = clientBody(copy.kicker, copy.title, [
        copy.hello,
        copy.body,
        `${esc(copy.codeLabel)}: <b>${esc(input.code)}</b>`,
        copy.next,
    ])
    const text = [lang === 'en' ? `Hello ${input.name},` : `Halo ${input.name},`, '', copy.body, `${copy.codeLabel}: ${input.code}`, '', copy.next, '', `attentiveid.com | contact@attentiveid.com`].join('\n')
    return { subject: copy.subject, html: shell(site, copy.kicker, inner, clientFooter(lang)), text }
}

export interface GscStaffInput {
    name: string
    code: string
    age: number
    phone: string
    email: string
    lang: string
    submissionId: string
    siteOrigin?: string
}

/** To the admin inbox: a new Goal System Compass entry. For staff only. */
export const buildGscStaffEmail = (input: GscStaffInput): BuiltMail => {
    const link = `${origin(input.siteOrigin)}/dashboard/assessments/gsc`
    const inner = `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">GSC BARU | ${esc(input.code)}</p><p style="margin:0 0 12px 0;font-size:19px;line-height:1.3;font-weight:bold;color:#142B51">Ada isian Goal System Compass baru</p><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13.5px;margin:0 0 16px 0">${row('Kode', input.code)}${row('Nama', input.name)}${row('Usia', String(input.age))}${row('WhatsApp', input.phone)}${row('Email', input.email)}${row('Bahasa', input.lang)}</table>${button(link, 'Buka hasil GSC di dasbor')}`
    const text = [
        `GSC BARU | ${input.code}`,
        '',
        `Nama: ${input.name}`,
        `Usia: ${input.age}`,
        `WhatsApp: ${input.phone}`,
        `Email: ${input.email}`,
        `Bahasa: ${input.lang}`,
        '',
        `Buka di dasbor: ${link}`,
        '',
        FOOTER_STAFF,
    ].join('\n')
    return { subject: `[GSC] Isian baru · ${input.code} · ${input.name}`, html: shell(origin(input.siteOrigin), 'UNTUK STAF', inner, FOOTER_STAFF), text }
}

// ---------- Free session ----------

export interface FreeSessionReceivedInput {
    name: string
    siteOrigin?: string
}

/** To the visitor who left an e-mail address on the free session form (the e-mail is optional on the form). */
export const buildFreeSessionReceivedEmail = (input: FreeSessionReceivedInput): BuiltMail => {
    const site = origin(input.siteOrigin)
    const hello = `Halo ${esc(input.name)},`
    const inner = clientBody('SESI GRATIS', 'Pendaftaran Anda sudah masuk', [
        hello,
        'Terima kasih sudah mendaftar First Free Session Consultation di Attentive. Data Anda sudah kami terima.',
        'Tim kami akan menghubungi Anda lewat WhatsApp pada nomor yang Anda isi. Mohon pastikan nomor tersebut aktif.',
        'Jika data perlu diubah, balas email ini atau hubungi kami lewat WhatsApp.',
    ])
    const text = [
        `Halo ${input.name},`,
        '',
        'Terima kasih sudah mendaftar First Free Session Consultation di Attentive. Data Anda sudah kami terima.',
        'Tim kami akan menghubungi Anda lewat WhatsApp pada nomor yang Anda isi. Mohon pastikan nomor tersebut aktif.',
        'Jika data perlu diubah, balas email ini atau hubungi kami lewat WhatsApp.',
        '',
        'attentiveid.com | contact@attentiveid.com',
    ].join('\n')
    return { subject: 'Pendaftaran Sesi Gratis Anda sudah kami terima', html: shell(site, 'SESI GRATIS', inner, clientFooter('id')), text }
}

export interface FreeSessionStaffInput {
    name: string
    age: number
    gender: string | null
    phone: string
    email: string | null
    keluhan: string
    keluhanDetail: string | null
    siteOrigin?: string
}

/** To the admin inbox: someone signed up for the free session, so staff should contact them on WhatsApp. For staff only. */
export const buildFreeSessionStaffEmail = (input: FreeSessionStaffInput): BuiltMail => {
    const link = `${origin(input.siteOrigin)}/dashboard/free-session`
    const inner = `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">SESI GRATIS BARU</p><p style="margin:0 0 12px 0;font-size:19px;line-height:1.3;font-weight:bold;color:#142B51">Hubungi lewat WhatsApp</p><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13.5px;margin:0 0 16px 0">${row('Nama', input.name)}${row('Usia', String(input.age))}${row('Jenis kelamin', input.gender ?? '-')}${row('WhatsApp', input.phone)}${row('Email', input.email ?? '-')}${row('Keluhan', input.keluhan)}${row('Detail', input.keluhanDetail ?? '-')}</table>${button(link, 'Buka daftar pendaftar')}`
    const text = [
        'SESI GRATIS BARU',
        '',
        `Nama: ${input.name}`,
        `Usia: ${input.age}`,
        `Jenis kelamin: ${input.gender ?? '-'}`,
        `WhatsApp: ${input.phone}`,
        `Email: ${input.email ?? '-'}`,
        `Keluhan: ${input.keluhan}`,
        `Detail: ${input.keluhanDetail ?? '-'}`,
        '',
        `Buka di dasbor: ${link}`,
        '',
        FOOTER_STAFF,
    ].join('\n')
    return { subject: `[Sesi Gratis] Pendaftar baru · ${input.name}`, html: shell(origin(input.siteOrigin), 'UNTUK STAF', inner, FOOTER_STAFF), text }
}
