/**
 * The e-mail a participant gets once the payment is confirmed and the psychologist has released the full report.
 * It follows the layout of the Attentive report e-mails (Big 10): a short summary of the result, a details box,
 * what is inside the report, and buttons to open the full report and to chat with the admin.
 * Only the overall result (MHI and level) is shown here; the three indices and any clinical notes stay in the report itself.
 */

import { decimal, formatSubmittedDate, LEVELS } from './mhcu-result-email'
import { esc, shell, type BuiltMail } from './mhcu-payment-emails'

export interface ReportReadyInput {
    name: string
    code: string
    lang: 'id' | 'en'
    /** The stored scoring result (see scoreMhcu); read defensively. */
    scores: unknown
    /** 1-5; null when unknown. */
    level: number | null
    /** Signed link that opens the full report. */
    reportLink: string
    /** When the check-up was submitted. */
    submittedAt?: Date
    /** When the report was released (defaults to now). */
    releasedAt?: Date
    psychologistName?: string | null
    siteOrigin?: string
}

const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const ONE_LINER = {
    id: [
        'Kondisi kesehatan mental Anda tampak baik saat pengisian.',
        'Ada beberapa hal yang sebaiknya Anda pantau dari waktu ke waktu.',
        'Ada beberapa hal yang perlu mendapat perhatian.',
        'Ada hal yang perlu perhatian serius. Psikolog menyarankan tindak lanjut.',
        'Hasil ini perlu ditindaklanjuti segera bersama psikolog.'
    ],
    en: [
        'Your mental health looked good at the time of the check-up.',
        'There are a few things worth keeping an eye on over time.',
        'There are some things that need attention.',
        'Some things need serious attention. The psychologist recommends a follow-up.',
        'This result should be followed up with a psychologist soon.'
    ]
} as const

const COPY = {
    id: {
        subject: (code: string) => `Laporan lengkap Anda sudah siap · ${code}`,
        kicker: 'LAPORAN HASIL PEMERIKSAAN',
        hello: (name: string) => `Yth. ${name},`,
        intro: 'Terima kasih sudah mempercayakan pemeriksaan kesehatan mental Anda kepada Attentive. Laporan lengkap Mental Health Check-Up Anda sudah siap. Berikut ringkasannya.',
        summary: 'RINGKASAN HASIL',
        mhi: 'MENTAL HEALTH INDEX',
        outOf: 'dari 100 (semakin tinggi semakin baik)',
        levelOf: (level: number, name: string) => `Level ${level} dari 5: ${name}`,
        detailName: 'Nama',
        detailCode: 'Kode laporan',
        detailFilled: 'Tanggal pengisian',
        detailReport: 'Tanggal laporan',
        detailBy: 'Psikolog pemeriksa',
        insideHead: 'YANG ADA DI LAPORAN ANDA',
        inside: [
            ['Ringkasan', 'Mental Health Index dan status level Anda.'],
            ['Per indeks', 'Hasil Distress Index (DI), Well-being Index (WI) dan Behavioral Health Index (BHI) beserta keterangannya.'],
            ['Catatan psikolog', 'Catatan dan rekomendasi dari psikolog Attentive.']
        ],
        open: 'Buka laporan lengkap',
        saveNote: 'Anda dapat menyimpan laporan sebagai PDF dari halaman tersebut (Cetak > Simpan sebagai PDF).',
        safety: 'Bila Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, segera hubungi layanan darurat medis 119 atau datang ke IGD terdekat.',
        closing: 'Laporan ini paling bermakna bila dibahas bersama psikolog, supaya hasilnya bisa dikaitkan dengan keseharian dan pekerjaan Anda. Bila ada yang ingin ditanyakan atau Anda ingin menjadwalkan sesi, kabari admin kami.',
        whatsapp: 'Chat admin via WhatsApp',
        regards: 'Salam hangat,',
        team: 'Tim Biro Psikologi Attentive',
        disclaimer: 'Hasil ini merupakan skrining berbasis laporan diri, bukan diagnosis klinis.',
        confidential: 'Email dan tautan ini bersifat rahasia dan hanya untuk penerima yang namanya tertera. Bila email ini salah alamat, mohon hapus dan kabari kami.',
        org: 'Biro Psikologi Attentive'
    },
    en: {
        subject: (code: string) => `Your full report is ready · ${code}`,
        kicker: 'ASSESSMENT REPORT',
        hello: (name: string) => `Dear ${name},`,
        intro: 'Thank you for trusting Attentive with your mental health check-up. Your full Mental Health Check-Up report is ready. Here is a summary.',
        summary: 'RESULT SUMMARY',
        mhi: 'MENTAL HEALTH INDEX',
        outOf: 'out of 100 (higher is better)',
        levelOf: (level: number, name: string) => `Level ${level} of 5: ${name}`,
        detailName: 'Name',
        detailCode: 'Report code',
        detailFilled: 'Date taken',
        detailReport: 'Report date',
        detailBy: 'Examining psychologist',
        insideHead: 'WHAT IS IN YOUR REPORT',
        inside: [
            ['Summary', 'Your Mental Health Index and status level.'],
            ['Per index', 'Your Distress Index (DI), Well-being Index (WI) and Behavioral Health Index (BHI) results with explanations.'],
            ['Psychologist notes', 'Notes and recommendations from an Attentive psychologist.']
        ],
        open: 'Open the full report',
        saveNote: 'You can save the report as a PDF from the page (Print > Save as PDF).',
        safety: 'If you are having thoughts of harming yourself or feel unsafe, contact the medical emergency line 119 or go to the nearest emergency room right away.',
        closing: 'This report is most useful when discussed with a psychologist, so the result can be connected to your daily life and work. If you have questions or want to book a session, let our admin know.',
        whatsapp: 'Chat admin on WhatsApp',
        regards: 'Warm regards,',
        team: 'The Attentive Psychology Bureau team',
        disclaimer: 'This result is a self-report screening, not a clinical diagnosis.',
        confidential: 'This e-mail and link are confidential and meant only for the named recipient. If it reached you by mistake, please delete it and let us know.',
        org: 'Attentive Psychology Bureau'
    }
} as const

export const buildReportReadyEmail = (input: ReportReadyInput): BuiltMail => {
    const lang = input.lang === 'en' ? 'en' : 'id'
    const copy = COPY[lang]
    const origin = (input.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '')
    const scores = (input.scores && typeof input.scores === 'object' ? input.scores : {}) as Record<string, unknown>
    const mhi = num(scores.mhi)
    const level = Math.min(5, Math.max(1, Math.round(input.level ?? num(scores.level) ?? 1)))
    const levelName = LEVELS[lang][level - 1]
    const oneLiner = ONE_LINER[lang][level - 1]
    const mhiText = mhi === null ? '–' : decimal(mhi, lang)
    const filled = formatSubmittedDate(input.submittedAt ?? new Date(), lang)
    const reported = formatSubmittedDate(input.releasedAt ?? new Date(), lang)
    const showSafety = level >= 4

    const row = (label: string, value: string) =>
        `<tr><td valign="top" style="padding:4px 18px 4px 0;font-size:12px;color:#667085;white-space:nowrap">${esc(label)}</td><td style="padding:4px 0;font-size:13px;color:#1B2533">${esc(value)}</td></tr>`
    const details = [
        row(copy.detailName, input.name),
        row(copy.detailCode, input.code),
        row(copy.detailFilled, filled),
        row(copy.detailReport, reported),
        ...(input.psychologistName ? [row(copy.detailBy, input.psychologistName)] : [])
    ].join('')

    const insideRows = copy.inside
        .map(
            ([label, text]) =>
                `<tr><td valign="top" width="110" style="padding:3px 12px 3px 0;font-size:12.5px;font-weight:bold;color:#142B51">${esc(label)}</td><td style="padding:3px 0;font-size:12.5px;line-height:1.5;color:#3C4858">${esc(text)}</td></tr>`
        )
        .join('')

    const summaryCard = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0"><tr><td bgcolor="#142B51" style="background:#142B51;padding:18px 20px;color:#FFFFFF"><div style="font-size:10px;letter-spacing:1.4px;font-weight:bold;color:#C9A55C">${esc(copy.summary)}</div><div style="font-size:24px;line-height:1.25;font-weight:bold;margin:4px 0 4px 0;color:#FFFFFF">${esc(copy.levelOf(level, levelName))}</div><div style="font-size:13px;line-height:1.5;color:#E4E8EF;margin:0 0 12px 0">${esc(oneLiner)}</div><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border:1px solid #3D5580;padding:8px 14px"><div style="font-size:9.5px;letter-spacing:1.4px;font-weight:bold;color:#C9A55C">${esc(copy.mhi)}</div><div style="font-size:26px;line-height:30px;font-weight:bold;color:#FFFFFF">${esc(mhiText)}</div><div style="font-size:10.5px;color:#C7CFDC">${esc(copy.outOf)}</div></td></tr></table></td></tr></table>`

    const safety = showSafety
        ? `<div style="border:1px solid #D0D5DD;border-left:3px solid #142B51;background:#F4F5F7;padding:11px 14px;margin:0 0 16px 0;font-size:12.5px;color:#1B2533">${esc(copy.safety)}</div>`
        : ''

    const inner =
        `<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1.4px;font-weight:bold;color:#667085">${esc(copy.kicker)} | ${esc(input.code)}</p>` +
        `<p style="margin:0 0 12px 0;font-size:20px;line-height:1.3;font-weight:bold;color:#142B51">${esc(copy.hello(input.name))}</p>` +
        `<p style="margin:0 0 16px 0;color:#3C4858">${esc(copy.intro)}</p>` +
        summaryCard +
        safety +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0;border:1px solid #EAECF0;background:#FAFAFB"><tr><td style="padding:10px 16px"><table role="presentation" cellpadding="0" cellspacing="0">${details}</table></td></tr></table>` +
        `<div style="font-size:10px;font-weight:bold;letter-spacing:1px;color:#667085;margin:0 0 6px 0">${esc(copy.insideHead)}</div>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0">${insideRows}</table>` +
        `<p style="margin:0 0 6px 0"><a href="${esc(input.reportLink)}" style="display:inline-block;background:#142B51;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:13.5px;padding:12px 22px">${esc(copy.open)}</a></p>` +
        `<p style="margin:0 0 18px 0;font-size:11.5px;color:#667085">${esc(copy.saveNote)}</p>` +
        `<p style="margin:0 0 14px 0;color:#3C4858">${esc(copy.closing)}</p>` +
        `<p style="margin:0 0 18px 0"><a href="https://wa.me/6285156410912" style="display:inline-block;background:#FFFFFF;color:#142B51;border:1px solid #142B51;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 20px">${esc(copy.whatsapp)}</a></p>` +
        `<p style="margin:0 0 2px 0;color:#3C4858">${esc(copy.regards)}</p><p style="margin:0 0 14px 0;font-weight:bold;color:#142B51">${esc(copy.team)}</p>` +
        `<p style="margin:0;font-size:11.5px;line-height:1.55;color:#667085">${esc(copy.disclaimer)}</p>`

    const footer = `<b style="color:#142B51">${esc(copy.org)}</b><br>WhatsApp <a href="https://wa.me/6285156410912" style="color:#142B51">+62 851-5641-0912</a> | <a href="mailto:contact@attentiveid.com" style="color:#142B51">contact@attentiveid.com</a> | <a href="https://attentiveid.com" style="color:#142B51">attentiveid.com</a><br>${esc(copy.confidential)}`

    const text = [
        `${copy.kicker} | ${input.code}`,
        '',
        copy.hello(input.name),
        '',
        copy.intro,
        '',
        `${copy.summary}`,
        copy.levelOf(level, levelName),
        oneLiner,
        `${copy.mhi}: ${mhiText} (${copy.outOf})`,
        '',
        ...(showSafety ? [copy.safety, ''] : []),
        `${copy.detailName}: ${input.name}`,
        `${copy.detailCode}: ${input.code}`,
        `${copy.detailFilled}: ${filled}`,
        `${copy.detailReport}: ${reported}`,
        ...(input.psychologistName ? [`${copy.detailBy}: ${input.psychologistName}`] : []),
        '',
        copy.insideHead,
        ...copy.inside.map(([label, line]) => `- ${label}: ${line}`),
        '',
        `${copy.open}: ${input.reportLink}`,
        copy.saveNote,
        '',
        copy.closing,
        `${copy.whatsapp}: https://wa.me/6285156410912`,
        '',
        copy.regards,
        copy.team,
        '',
        copy.disclaimer,
        `${copy.org} | WhatsApp +62 851-5641-0912 | contact@attentiveid.com | attentiveid.com`,
        copy.confidential
    ].join('\n')

    return { subject: copy.subject(input.code), html: shell(origin, copy.kicker, inner, footer), text }
}
