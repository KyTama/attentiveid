/**
 * Shared pieces of the MHCU report documents: language strings, number/date formatting, reference
 * ranges, and the page blocks that are identical in the client and the psychologist reports.
 */
import { LH_HEAD, LOGO_URL, div, img, para, run, sp, table, td, zp } from './html';

export type Lang = 'id' | 'en';
export type Sex = 'female' | 'male';
export type Level = 1 | 2 | 3 | 4 | 5;

export const L = (lang: Lang, id: string, en: string): string => (lang === 'id' ? id : en);

// --- number and date formatting ------------------------------------------------------------

/** One decimal, comma as the decimal mark in Bahasa ("77,5") and a point in English ("77.5"). */
export function fmt1(v: number, lang: Lang): string {
  const s = (Math.round(v * 10) / 10).toFixed(1);
  return lang === 'id' ? s.replace('.', ',') : s;
}

/** Like `fmt1` but without a trailing ".0" (chart labels: "32", "52,5"). */
export function fmtTrim(v: number, lang: Lang): string {
  const r = Math.round(v * 10) / 10;
  const s = Number.isInteger(r) ? String(r) : r.toFixed(1);
  return lang === 'id' ? s.replace('.', ',') : s;
}

/** Signed change with one decimal: "+8,9", "-1,9", "0,0". */
export function fmtSigned(v: number, lang: Lang): string {
  const r = Math.round(v * 10) / 10;
  const s = fmt1(Math.abs(r), lang);
  return r > 0 ? `+${s}` : r < 0 ? `-${s}` : s;
}

const MONTHS: Record<Lang, string[]> = {
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function ymd(iso: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) throw new Error(`Expected an ISO date (yyyy-mm-dd), got "${iso}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** "15 November 2026" */
export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = ymd(iso);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

/** "31/07/26" */
export function fmtDateShort(iso: string): string {
  const [y, m, d] = ymd(iso);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${String(y).slice(2)}`;
}

// --- levels and indices --------------------------------------------------------------------

export const LEVEL_NAME: Record<Lang, string[]> = {
  id: ['Baik', 'Perlu Dipantau', 'Perlu Perhatian', 'Perlu Perhatian Serius', 'Prioritas'],
  en: ['Good', 'Needs Monitoring', 'Needs Attention', 'Needs Serious Attention', 'Priority'],
};
export const LEVEL_COLOR = ['#8DB39B', '#B9C98F', '#D9C089', '#D3A184', '#C48A8A'];

export const levelName = (l: Level, lang: Lang): string => LEVEL_NAME[lang][l - 1] as string;

export type IndexKey = 'di' | 'wi' | 'bhi';

interface IndexDef {
  name: string;
  hint: Record<Lang, string>;
  /** Category boundaries, upper edges of the first three categories. */
  cuts: number[];
  cats: Record<Lang, string[]>;
  ranges: Record<Lang, string>;
}

export const INDEX_DEFS: Record<IndexKey, IndexDef> = {
  di: {
    name: 'Distress Index (DI)',
    hint: { id: 'semakin rendah semakin baik', en: 'lower is better' },
    cuts: [10, 25, 50],
    cats: { id: ['Minimal', 'Ringan', 'Sedang', 'Tinggi'], en: ['Minimal', 'Mild', 'Moderate', 'High'] },
    ranges: {
      id: 'Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100',
      en: 'Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100',
    },
  },
  wi: {
    name: 'Well-being Index (WI)',
    hint: { id: 'semakin tinggi semakin baik', en: 'higher is better' },
    cuts: [48.15, 55.25, 82.05],
    cats: { id: ['Sangat rendah', 'Rendah', 'Rata-rata', 'Tinggi'], en: ['Very low', 'Low', 'Average', 'High'] },
    ranges: {
      id: 'Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100',
      en: 'Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100',
    },
  },
  bhi: {
    name: 'Behavioral Health Index (BHI)',
    hint: { id: 'semakin tinggi semakin baik', en: 'higher is better' },
    cuts: [25, 50, 75],
    cats: { id: ['Sangat kurang', 'Kurang', 'Cukup', 'Baik'], en: ['Very low', 'Low', 'Fair', 'High'] },
    ranges: {
      id: 'Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100',
      en: 'Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100',
    },
  },
};

/** Category name of an index score ("Ringan", "Rata-rata", ...). */
export function indexCategory(key: IndexKey, v: number, lang: Lang): string {
  const def = INDEX_DEFS[key];
  const i = def.cuts.findIndex((cut) => v < cut);
  return def.cats[lang][i === -1 ? 3 : i] as string;
}

export const INDEX_NOTE: Record<Lang, string> = {
  id: 'Semua indeks memakai skala 0-100. Untuk Distress Index, skor yang lebih rendah lebih baik. Untuk Well-being Index dan Behavioral Health Index, skor yang lebih tinggi lebih baik. Nilai acuan Well-being Index mengikuti acuan Warwick; nilai acuan lainnya masih merupakan acuan sementara Attentive.',
  en: 'All indices use a 0-100 scale. For the Distress Index a lower score is better. For the Well-being Index and the Behavioral Health Index a higher score is better. Reference values for the Well-being Index follow the Warwick benchmark; the others are interim Attentive references.',
};

export const DISCLAIMER: Record<Lang, string> = {
  id: 'Laporan ini merupakan hasil skrining berbasis laporan diri dan bukan diagnosis klinis. Interpretasi akhir dilakukan oleh psikolog dengan mempertimbangkan wawancara dan data pendukung lain. Dokumen bersifat rahasia.',
  en: 'This report is the result of a self-report screening and is not a clinical diagnosis. Final interpretation is made by a psychologist, considering an interview and other supporting data. Confidential document.',
};

export const FOOTER_LINE: Record<Lang, string> = {
  id: 'Biro Psikologi Attentive   |   attentiveid.com   |   contact@attentiveid.com   |   WhatsApp +62 851-5641-0912',
  en: 'Attentive Psychology Bureau   |   attentiveid.com   |   contact@attentiveid.com   |   WhatsApp +62 851-5641-0912',
};

// --- page blocks ---------------------------------------------------------------------------

export const NAVY = '#142B51';
export const INK = '#1B2533';
export const MUTE = '#667085';
export const SLATE = '#3C4858';
export const RULE = '#D0D5DD';
export const SOFT = '#F4F5F7';

export interface LetterheadOpts {
  /** Small caps line above the title; defaults to the client report wording. */
  label?: string;
  labelColor?: string;
}

/** Logo on the left, report title block on the right. `pageLine` is e.g. "Hasil Pemeriksaan (T1)   |   Halaman 1 dari 1". */
export function letterhead(lang: Lang, pageLine: string, firstPage = true, o: LetterheadOpts = {}): string {
  return [
    firstPage ? sp(1) : '',
    table([
      [
        td(190, '#FFFFFF', '0pt 6pt 2pt 0pt', 'bottom', [para('left', 8.5, [img(LOGO_URL, 136, 37)])]),
        td(325, '#FFFFFF', '0pt 0pt 2pt 6pt', 'bottom', [
          para('right', 6.5, run(o.label ?? L(lang, 'LAPORAN HASIL PEMERIKSAAN PSIKOLOGIS', 'PSYCHOLOGICAL ASSESSMENT REPORT'), 6.5, o.labelColor ?? MUTE, { b: 1 })),
          para('right', 14, run('Mental Health Check-Up', 14, NAVY, { b: 1 })),
          para('right', 7.5, run(pageLine, 7.5, SLATE)),
        ]),
      ],
    ]),
    sp(3),
    navyBar(),
    sp(6),
  ].join('');
}

function navyBar(): string {
  return table([[td(515, NAVY, '0pt 6pt 0pt 6pt', 'middle', [zp(1)])]]);
}

/** A grid of label/value boxes. Cell widths are given per row. */
export function infoGrid(rows: { w: number; label: string; value: string }[][]): string {
  return table(
    rows.map((r) =>
      r.map((c) =>
        td(
          c.w,
          '#FFFFFF',
          '4pt 6pt 5pt 7pt',
          'middle',
          [para('left', 6, run(c.label, 6, MUTE, { b: 1 })), para('left', 8.5, run(c.value, 8.5, INK, { b: 1 }), { m: '1pt 0 0pt 0' })],
          `0.5pt solid ${RULE}`,
        ),
      ),
    ),
  );
}

/** Section heading with the thin rule under it ("1   RINGKASAN HASIL"). */
export function sectionTitle(text: string): string {
  return [
    para('left', 8.5, run(text, 8.5, NAVY, { b: 1 }), { lh: LH_HEAD }),
    sp(1),
    table([[td(515, RULE, '0pt 6pt 0pt 6pt', 'middle', [zp(1)])]]),
    sp(4),
  ].join('');
}

/** The five-step status scale with the current level highlighted, plus the colour bar under it. */
export function statusScale(level: Level, lang: Lang): string {
  const cells = [1, 2, 3, 4, 5].map((n) => {
    const text = `${n}  ${LEVEL_NAME[lang][n - 1]}`;
    return n === level
      ? td(103, NAVY, '5pt 6pt 5pt 6pt', 'middle', [para('center', 7.5, run(text, 7.5, '#FFFFFF', { b: 1 }))])
      : td(103, SOFT, '4pt 6pt 4pt 6pt', 'middle', [para('center', 7, run(text, 7, MUTE))]);
  });
  const bars = LEVEL_COLOR.map((c) => td(103, c, '0pt 6pt 0pt 6pt', 'middle', [zp(2)]));
  return [
    para('left', 6.5, run(L(lang, 'Skala status', 'Status scale'), 6.5, MUTE, { b: 1 }), { lh: LH_HEAD }),
    sp(2),
    table([cells, bars]),
  ].join('');
}

/** MHI marker on the 0-100 reference bar (Perlu Perhatian Serius / Perlu Perhatian / Perlu Dipantau / Baik). */
export function mhiPosition(mhi: number, lang: Lang): string {
  const left = Math.round((515 * mhi) / 100 - 14);
  const band = (w: number, bg: string, name: string) =>
    td(w, bg, '3pt 6pt 3pt 6pt', 'middle', [para('center', 6.5, run(name, 6.5, SLATE, { b: 1 }))], '0.5pt solid #FFFFFF');
  const tick = (w: number, text: string, al: 'left' | 'right' = 'left') =>
    td(w, '#FFFFFF', '1pt 0pt 0pt 0pt', 'middle', [para(al, 6, run(text, 6, '#98A2B3'))]);
  return [
    para('left', 6.5, run(L(lang, 'Posisi MHI pada rentang acuan', 'Position of the MHI on the reference ranges'), 6.5, MUTE, { b: 1 }), { lh: LH_HEAD }),
    sp(2),
    table([
      [
        td(left, '#FFFFFF', '0pt 0pt 0pt 0pt', 'middle', [zp(6)]),
        td(28, '#FFFFFF', '0pt 0pt 0pt 0pt', 'middle', [
          para('center', 7, run(fmt1(mhi, lang), 7, NAVY, { b: 1 })),
          para('center', 7, run('▼', 7, NAVY)),
        ]),
        td(515 - 28 - left, '#FFFFFF', '0pt 0pt 0pt 0pt', 'middle', [zp(6)]),
      ],
    ]),
    table([
      [
        band(206, '#D0D5DD', LEVEL_NAME[lang][3] as string),
        band(77, '#DDE1E7', LEVEL_NAME[lang][2] as string),
        band(77, '#E8EBEF', LEVEL_NAME[lang][1] as string),
        band(155, SOFT, LEVEL_NAME[lang][0] as string),
      ],
    ]),
    table([[tick(206, '0'), tick(77, '40'), tick(77, '55'), tick(131, '70'), tick(24, '100', 'right')]]),
  ].join('');
}

/** Disclaimer and contact line pinned to the bottom of every page. */
export function footer(lang: Lang): string {
  return [
    para('left', 6.5, run(DISCLAIMER[lang], 6.5, MUTE), { lh: '1.265' }),
    para('left', 6.5, run(FOOTER_LINE[lang], 6.5, NAVY, { b: 1 }), { m: '2pt 0 0pt 0', lh: LH_HEAD }),
  ].join('');
}

export { div };
