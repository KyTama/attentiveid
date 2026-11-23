import { MHCU_LEVELS } from '@attentiveid/shared'

export interface AdminAlertInput {
    code: string
    level: number
    mhi: number | null
    name: string
    phone: string
    email: string
    lang: string
    waveNo: number | null
    submittedAt: Date
    portalUrl: string
}

const esc = (value: unknown): string =>
    String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** The e-mail staff get when a result is Level 4 or 5: who to contact, how fast, and where to open it. For staff only. */
export const buildAdminAlertEmail = (input: AdminAlertInput): { subject: string; html: string; text: string } => {
    const level = Math.min(5, Math.max(1, Math.round(input.level))) as 1 | 2 | 3 | 4 | 5;
    const def = MHCU_LEVELS[level];
    const mhi = input.mhi === null ? '-' : (Math.round(input.mhi * 10) / 10).toFixed(1);
    const subject = level >= 4
        ? `[MHCU] Level ${level} (${def.id}) · ${input.code} · hubungi: ${def.responseTimeId}`
        : `[MHCU] Hasil baru · Level ${level} (${def.id}) · ${input.code}`;
    const lines = [
        `Hasil MHCU Level ${level} dari 5: ${def.id}`,
        `Tindak lanjut: ${def.actionId}`,
        '',
        `Kode: ${input.code}${input.waveNo ? ` (pengukuran ke-${input.waveNo})` : ''}`,
        `MHI: ${mhi}`,
        `Nama: ${input.name}`,
        `WhatsApp: ${input.phone}`,
        `Email: ${input.email}`,
        `Bahasa: ${input.lang}`,
        `Waktu: ${input.submittedAt.toISOString()}`,
        '',
        `Buka di portal: ${input.portalUrl}`,
        '',
        'Email ini berisi data pribadi untuk staf saja. Jangan diteruskan.'
    ];
    const html = `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#111827;max-width:560px">
<p style="margin:0 0 6px;font-size:16px;font-weight:700">Hasil MHCU Level ${level} dari 5: ${esc(def.id)}</p>
<p style="margin:0 0 14px;color:#374151">Tindak lanjut: ${esc(def.actionId)}</p>
<table cellpadding="4" style="border-collapse:collapse;font-size:14px">
<tr><td style="color:#6b7280">Kode</td><td><b>${esc(input.code)}</b>${input.waveNo ? ` (pengukuran ke-${input.waveNo})` : ''}</td></tr>
<tr><td style="color:#6b7280">MHI</td><td>${esc(mhi)}</td></tr>
<tr><td style="color:#6b7280">Nama</td><td>${esc(input.name)}</td></tr>
<tr><td style="color:#6b7280">WhatsApp</td><td>${esc(input.phone)}</td></tr>
<tr><td style="color:#6b7280">Email</td><td>${esc(input.email)}</td></tr>
<tr><td style="color:#6b7280">Bahasa</td><td>${esc(input.lang)}</td></tr>
</table>
<p style="margin:16px 0"><a href="${esc(input.portalUrl)}" style="background:#142B51;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600">Buka di portal</a></p>
<p style="margin:0;font-size:12px;color:#6b7280">Email ini berisi data pribadi untuk staf saja. Jangan diteruskan.</p>
</div>`;
    return { subject, html, text: lines.join('\n') };
};
