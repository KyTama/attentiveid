/**
 * Psychologist report (internal, never given to the client): result summary, every index, dimension
 * and symptom area with its percentile, status triggers, and the full questionnaire responses.
 * Three pages for a single check-up, four from the second check-up on (adds trend and comparison).
 * Mirrors the team's v7 demo documents p1, p5 and p4r.
 */
import { MHCU_BHI_DIMENSIONS, MHCU_DOMAINS, MHCU_WI_DIMENSIONS } from '@attentiveid/shared';
import type {
  MhcuAppendixItem,
  MhcuProgressData,
  MhcuPsychologistReportData,
  MhcuPsychologistRow,
} from '../../../../../packages/shared/src/assessments/mhcu-report-data';
import { mhiTrendSvg } from './chart';
import {
  INK,
  L,
  LEVEL_NAME,
  MUTE,
  NAVY,
  RULE,
  SLATE,
  SOFT,
  fmt1,
  fmtDate,
  fmtSigned,
  infoGrid,
  letterhead,
  mhiPosition,
  sectionTitle,
  statusScale,
  type Lang,
  type Level,
} from './common';
import {
  LH_HEAD,
  SVG_DATA_URI,
  documentHtml,
  img,
  page,
  para,
  run,
  sp,
  table,
  td,
  zp,
  type DocumentOpts,
} from './html';

const BORDER = `0.5pt solid ${RULE}`;

const TEXT = {
  banner: { id: 'DOKUMEN INTERNAL, HANYA UNTUK PSIKOLOG', en: 'INTERNAL DOCUMENT, FOR PSYCHOLOGISTS ONLY' },
  footDisclaimer: {
    id: 'Dokumen internal untuk psikolog Attentive. Tidak untuk diberikan kepada klien. Skrining berbasis laporan diri, bukan diagnosis klinis.',
    en: 'Internal document for Attentive psychologists. Not to be given to the client. Self-report screening, not a clinical diagnosis.',
  },
  domainNote: {
    id: 'Skor area keluhan adalah skor item tertinggi pada area tersebut (0 tidak ada sampai 4 berat). Tanda * berarti area mencapai ambang penggalian lanjutan, yaitu skor 2 atau lebih (skor 1 atau lebih untuk Pikiran Menyakiti Diri, Gejala Psikotik, dan Penggunaan Zat).',
    en: 'A symptom-area score is the highest item score in that area (0 none to 4 severe). An asterisk marks an area at or above the threshold for further exploration: a score of 2 or more (1 or more for Thoughts of Hurting Oneself, Psychosis-related Experiences and Substance Use).',
  },
  compareNote: {
    id: 'Perubahan dianggap bermakna bila selisihnya 5 poin atau lebih pada skala 0-100 (acuan sementara Attentive). Status berkisar dari Level 1 (Baik) sampai Level 5 (Prioritas). Skor area keluhan adalah skor item tertinggi pada area tersebut (0 tidak ada sampai 4 berat).',
    en: 'A change counts as clear when it is 5 points or more on the 0-100 scale (interim Attentive reference). Status ranges from Level 1 (Good) to Level 5 (Priority). A symptom-area score is the highest item score in that area (0 none to 4 severe).',
  },
  answersNote: {
    id: 'Jawaban ditampilkan sesuai isian responden. Kotak gelap menunjukkan pilihan yang diberikan.',
    en: 'Answers are shown as given by the respondent. The dark box shows the option chosen.',
  },
};

/** Answer scale headers of the four questionnaire parts. */
const PARTS: Record<
  MhcuAppendixItem['part'],
  { title: { id: string; en: string }; scale: { id: string[]; en: string[] }; first: number }
> = {
  cc: {
    title: { id: 'BAGIAN A: Keluhan Psikologis (2 minggu terakhir)', en: 'PART A: Psychological Symptoms (past 2 weeks)' },
    scale: {
      id: ['0 Tidak sama sekali', '1 Sangat ringan', '2 Ringan', '3 Sedang', '4 Berat'],
      en: ['0 Not at all', '1 Slight', '2 Mild', '3 Moderate', '4 Severe'],
    },
    first: 0,
  },
  wb: {
    title: { id: 'BAGIAN B: Kesejahteraan Mental (2 minggu terakhir)', en: 'PART B: Mental Well-being (past 2 weeks)' },
    scale: {
      id: ['1 Tidak pernah', '2 Jarang', '3 Kadang', '4 Sering', '5 Selalu'],
      en: ['1 None of the time', '2 Rarely', '3 Some of the time', '4 Often', '5 All of the time'],
    },
    first: 1,
  },
  hb: {
    title: { id: 'BAGIAN C: Perilaku Sehat Sehari-hari (2 minggu terakhir)', en: 'PART C: Everyday Healthy Behaviour (past 2 weeks)' },
    scale: {
      id: ['0 Tidak pernah', '1 Jarang', '2 Kadang', '3 Sering', '4 Hampir selalu'],
      en: ['0 Never', '1 Rarely', '2 Sometimes', '3 Often', '4 Almost always'],
    },
    first: 0,
  },
  ati: {
    title: { id: 'BAGIAN D: Gambaran Diri (secara umum)', en: 'PART D: Self-description (in general)' },
    scale: {
      id: ['0 Sangat tidak sesuai', '1 Kurang sesuai', '2 Cukup sesuai', '3 Sesuai', '4 Sangat sesuai'],
      en: ['0 Not like me', '1 Slightly', '2 Moderately', '3 Like me', '4 Very much'],
    },
    first: 0,
  },
};

const lbl = (lang: Lang, v: { id: string; en: string }): string => (lang === 'id' ? v.id : v.en);

/** Full HTML document of the psychologist report. */
export function renderPsychologistReport(data: MhcuPsychologistReportData, opts: DocumentOpts = {}): string {
  const lang = data.header.lang;
  // Both kinds run to four sheets. The team's single-check-up demo (p1) prints "Halaman 4 dari 3" because
  // it counts one sheet too few; the total is the real number of sheets here.
  const total = 4;
  const pages: string[] = [resultPage(data, total)];
  pages.push(data.progress ? progressPage(data, data.progress, total) : triggerPage(data, total));
  pages.push(appendixPage(data, total, ['cc', 'wb'], 3, false));
  pages.push(appendixPage(data, total, ['hb', 'ati'], 4, true));
  return documentHtml(pages, { lang, ...opts });
}

function foot(lang: Lang): string {
  return [
    para('left', 6.5, run(lbl(lang, TEXT.footDisclaimer), 6.5, MUTE), { lh: '1.265' }),
    para('left', 6.5, run(L(lang, 'Biro Psikologi Attentive', 'Attentive Psychology Bureau') + '   |   attentiveid.com   |   contact@attentiveid.com   |   WhatsApp +62 851-5641-0912', 6.5, NAVY, { b: 1 }), {
      m: '2pt 0 0pt 0',
      lh: LH_HEAD,
    }),
  ].join('');
}

function head(lang: Lang, pageLine: string, first: boolean): string {
  return letterhead(lang, pageLine, first, { label: lbl(lang, TEXT.banner), labelColor: NAVY });
}

const ofPages = (lang: Lang, n: number, total: number) => `${L(lang, 'Halaman', 'Page')} ${n} ${L(lang, 'dari', 'of')} ${total}`;

// --- page 1 --------------------------------------------------------------------------------

function resultPage(data: MhcuPsychologistReportData, total: number): string {
  const { header: h, summary: s } = data;
  const lang = h.lang;
  const ref = data.reference;
  const body = [
    head(lang, `${L(lang, 'Hasil Pemeriksaan', 'Assessment Result')} (T${h.waveNo})   |   ${ofPages(lang, 1, total)}`, true),
    infoGrid([
      [
        { w: 140, label: L(lang, 'NAMA', 'NAME'), value: h.name },
        { w: 120, label: L(lang, 'NO. LAPORAN/ID PESERTA', 'REPORT NO./PARTICIPANT ID'), value: `${h.reportNo}/${h.participantId}` },
        { w: 128, label: L(lang, 'USIA/JENIS KELAMIN', 'AGE/SEX'), value: `${h.age} ${L(lang, 'tahun', 'years')}/${h.sex}` },
        { w: 127, label: L(lang, 'TANGGAL PEMERIKSAAN', 'DATE OF ASSESSMENT'), value: `${fmtDate(h.examinedAt.slice(0, 10), lang)} ${h.examinedAt.slice(11, 16)}` },
      ],
      [
        { w: 140, label: L(lang, 'PENGUKURAN', 'MEASUREMENT'), value: `T${h.waveNo} (${h.waveNo}/${h.waveCount})` },
        { w: 120, label: L(lang, 'PERIODE YANG DINILAI', 'PERIOD ASSESSED'), value: lbl(lang, h.period) },
        { w: 128, label: L(lang, 'PSIKOLOG PEMERIKSA', 'EXAMINING PSYCHOLOGIST'), value: h.psychologist.name },
        { w: 127, label: 'WHATSAPP/EMAIL', value: `${h.clientContact.whatsapp}, ${h.clientContact.email}` },
      ],
    ]),
    sp(6),
    sectionTitle(L(lang, '1   RINGKASAN HASIL', '1   SUMMARY OF RESULTS')),
    summaryBox(data),
    sp(7),
    statusScale(s.level as Level, lang),
    sp(8),
    s.mhi === null ? '' : mhiPosition(s.mhi, lang),
    sp(6),
    sectionTitle(L(lang, '2   HASIL PER INDEKS, DIMENSI, DAN AREA', '2   RESULTS PER INDEX, DIMENSION AND AREA')),
    rowsTable(data.rows, lang),
    para('left', 6.3, run(lbl(lang, TEXT.domainNote), 6.3, MUTE), { m: '3pt 0 0pt 0', lh: LH_HEAD }),
    para('left', 6.3, run(percentileNote(ref, lang), 6.3, MUTE), { m: '1pt 0 0pt 0', lh: LH_HEAD }),
  ];
  return page(body, foot(lang));
}

function percentileNote(ref: MhcuPsychologistReportData['reference'], lang: Lang): string {
  const sample = ref ? `n = ${ref.n}, ${L(lang, 'data bersih', 'cleaned data')}, ${ref.from} s.d. ${ref.to}` : L(lang, 'belum tersedia', 'not available');
  return lang === 'id'
    ? `¹ Persentil terhadap sampel acuan Attentive (${sample}). Persentil 80 berarti skor lebih tinggi daripada 80% sampel acuan. Untuk DI dan area keluhan, persentil tinggi berarti keluhan lebih banyak.`
    : `¹ Percentile against the Attentive reference sample (${sample}). Percentile 80 means a higher score than 80% of the reference sample. For DI and symptom areas a high percentile means more symptoms.`;
}

function summaryBox(data: MhcuPsychologistReportData): string {
  const { summary: s, header: h } = data;
  const lang = h.lang;
  return table([
    [
      td(128, SOFT, '7pt 6pt 7pt 6pt', 'middle', [
        para('center', 6.5, run('MENTAL HEALTH INDEX', 6.5, MUTE, { b: 1 })),
        para('center', 26, run(s.mhi === null ? '-' : fmt1(s.mhi, lang), 26, NAVY, { b: 1 })),
        para('center', 6.5, run(L(lang, 'dari 100', 'out of 100'), 6.5, MUTE)),
      ]),
      td(387, '#FFFFFF', '6pt 6pt 6pt 14pt', 'middle', [
        para('left', 6.5, run(L(lang, 'STATUS KESELURUHAN', 'OVERALL STATUS'), 6.5, MUTE, { b: 1 })),
        para('left', 13, run(`Level ${s.level} ${L(lang, 'dari', 'of')} 5: ${lbl(lang, s.levelName)}`, 13, NAVY, { b: 1 }), { m: '1pt 0 0pt 0' }),
        para('left', 7.5, run(lbl(lang, s.reason), 7.5, SLATE, { i: 1 }), { m: '3pt 0 0pt 0' }),
      ]),
    ],
  ]);
}

/** Label of a row of the results table: area rows are indented, flagged areas end with " *". */
function rowLabel(r: MhcuPsychologistRow, lang: Lang): string {
  const name = lbl(lang, r.label);
  if (r.kind === 'index') {
    if (r.key === 'DI') return `${name}, ${L(lang, 'semakin rendah semakin baik', 'lower is better')}`;
    if (r.key === 'WI') return `${name}, WEMWBS ${r.wbTotal == null ? '-' : Math.round(r.wbTotal)}/70`;
    if (r.key === 'ATI') return `${name}, ${L(lang, 'catatan, tidak masuk MHI', 'note only, not part of the MHI')}`;
    return name;
  }
  return `    ${name}${r.flagged ? ' *' : ''}`;
}

function rowsTable(rows: MhcuPsychologistRow[], lang: Lang): string {
  const head = (w: number, al: 'left' | 'center', text: string) =>
    td(w, SOFT, '4pt 6pt 4pt 6pt', 'middle', [para(al, 6.5, run(text, 6.5, NAVY, { b: 1 }))], BORDER);
  const header = [
    head(208, 'left', L(lang, 'KOMPONEN', 'COMPONENT')),
    head(52, 'center', L(lang, 'SKOR', 'SCORE')),
    head(52, 'center', L(lang, 'RENTANG', 'RANGE')),
    head(108, 'center', L(lang, 'KATEGORI', 'CATEGORY')),
    head(95, 'center', L(lang, 'PERSENTIL¹', 'PERCENTILE¹')),
  ];
  const body = rows.map((r) => {
    const isIndex = r.kind === 'index';
    const bg = isIndex ? SOFT : '#FFFFFF';
    const bold = isIndex || r.flagged;
    const o = bold ? { b: 1 as const } : {};
    const cell = (w: number, al: 'left' | 'center', fs: number, text: string, color: string, b: boolean) =>
      td(w, bg, '2pt 6pt 2pt 6pt', 'middle', [para(al, fs, run(text, fs, color, b ? { b: 1 } : {}))], BORDER);
    void o;
    const score = r.value === null ? '-' : r.range === '0-4' ? String(Math.round(r.value)) : fmt1(r.value, lang);
    return [
      cell(208, 'left', 7.3, rowLabel(r, lang), isIndex || r.flagged ? INK : SLATE, bold),
      cell(52, 'center', 7.3, score, INK, bold),
      cell(52, 'center', 6.8, r.range, MUTE, false),
      cell(108, 'left', 7.3, r.category ? lbl(lang, r.category) : '-', INK, bold),
      cell(95, 'center', 7.3, r.percentile === null ? '-' : `P${r.percentile}`, SLATE, isIndex),
    ];
  });
  return table([header, ...body]);
}

// --- page 2 --------------------------------------------------------------------------------

function triggerTable(data: MhcuPsychologistReportData): string {
  const lang = data.header.lang;
  const t = data.triggers;
  const row = (label: string, value: string) => [
    td(130, SOFT, '4pt 6pt 4pt 6pt', 'middle', [para('left', 7.5, run(label, 7.5, NAVY, { b: 1 }))], BORDER),
    td(385, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [para('left', 7.5, run(value, 7.5, INK))], BORDER),
  ];
  return table([
    row(L(lang, 'Pemicu', 'Triggers'), t.triggers.map((x) => lbl(lang, x)).join(', ')),
    row(L(lang, 'Waktu respons', 'Response time'), lbl(lang, t.responseTime)),
    row(L(lang, 'Tindak lanjut', 'Follow-up'), lbl(lang, t.followUp)),
  ]);
}

function triggerBlock(data: MhcuPsychologistReportData): string {
  const lang = data.header.lang;
  return [sectionTitle(L(lang, '3   PEMICU STATUS DAN TINDAK LANJUT', '3   STATUS TRIGGERS AND FOLLOW-UP')), triggerTable(data)].join('');
}

function triggerPage(data: MhcuPsychologistReportData, total: number): string {
  const { header: h } = data;
  const lang = h.lang;
  return page(
    [head(lang, `${L(lang, 'Hasil Pemeriksaan', 'Assessment Result')} (T${h.waveNo})   |   ${ofPages(lang, 2, total)}`, false), sp(6), triggerBlock(data)],
    foot(lang),
  );
}

const MEASURE_COL = 156;
const CHANGE_COL = 56;

function progressPage(data: MhcuPsychologistReportData, pr: MhcuProgressData, total: number): string {
  const lang = data.header.lang;
  const first = pr.waves[0];
  const last = pr.waves[pr.waves.length - 1];
  const svg = mhiTrendSvg(
    pr.waves.map((w) => ({ waveNo: w.waveNo, date: w.date, mhi: w.mhi })),
    'id',
    350,
  );
  const legend = (name: string, range: string) => [
    para('left', 7, run(name, 7, SLATE, { b: 1 }), { m: '4pt 0 0pt 0' }),
    para('left', 6.5, run(`    ${range}`, 6.5, MUTE)),
  ];
  const body = [
    head(lang, `${L(lang, 'Perkembangan Hasil', 'Progress of Results')} (T${first?.waveNo} ${L(lang, 'sampai', 'to')} T${last?.waveNo})   |   ${ofPages(lang, 2, total)}`, false),
    sp(6),
    triggerBlock(data),
    sp(6),
    sectionTitle(L(lang, '4   TREN MENTAL HEALTH INDEX (MHI)', '4   MENTAL HEALTH INDEX (MHI) TREND')),
    table([
      [
        td(411, '#FFFFFF', '0pt 0pt 0pt 0pt', 'middle', [para('left', 8.5, [img(SVG_DATA_URI(svg), 405, 118)])]),
        td(104, '#FFFFFF', '10pt 6pt 4pt 8pt', 'top', [
          para('left', 6, run(L(lang, 'RENTANG RUJUKAN', 'REFERENCE RANGES'), 6, MUTE, { b: 1 })),
          ...legend(LEVEL_NAME[lang][0] as string, '70-100'),
          ...legend(LEVEL_NAME[lang][1] as string, '55-70'),
          ...legend(LEVEL_NAME[lang][2] as string, '40-55'),
          ...legend(LEVEL_NAME[lang][3] as string, '0-40'),
        ]),
      ],
    ]),
    sp(6),
    sectionTitle(L(lang, '5   PERBANDINGAN HASIL', '5   COMPARISON OF RESULTS')),
    comparisonTable(pr, lang),
    para('left', 6.3, run(lbl(lang, TEXT.compareNote), 6.3, MUTE), { m: '3pt 0 0pt 0', lh: LH_HEAD }),
  ];
  return page(body, foot(lang));
}

function comparisonTable(pr: MhcuProgressData, lang: Lang): string {
  const n = pr.waves.length;
  const waveW = Math.floor((515 - MEASURE_COL - CHANGE_COL - 108) / n);
  const readW = 515 - MEASURE_COL - CHANGE_COL - waveW * n;
  const first = pr.waves[0];
  const last = pr.waves[n - 1];
  const f = pr.firstToLast;

  const hcell = (w: number, al: 'left' | 'center', top: string, sub?: string) =>
    td(w, SOFT, '4pt 6pt 4pt 6pt', 'middle', [
      para(al, 6.5, run(top, 6.5, NAVY, { b: 1 })),
      ...(sub === undefined ? [] : [para('center', 5.5, run(sub, 5.5, MUTE))]),
    ], BORDER);
  const header = [
    hcell(MEASURE_COL, 'left', L(lang, 'KOMPONEN', 'COMPONENT')),
    ...pr.waves.map((w) => hcell(waveW, 'center', `T${w.waveNo}`, shortDate(w.date))),
    hcell(CHANGE_COL, 'center', L(lang, 'PERUBAHAN', 'CHANGE'), L(lang, `T${first?.waveNo} ke T${last?.waveNo}`, `T${first?.waveNo} to T${last?.waveNo}`)),
    hcell(readW, 'center', L(lang, 'KETERANGAN', 'READING')),
  ];

  type RowOpts = { bg: string; labelColor: string; bold: boolean; readBold: boolean; readFs?: number; lastColor?: string; labelBold?: boolean };
  const row = (label: string, vals: string[], change: string, reading: string, o: RowOpts) => {
    const c = (w: number, al: 'left' | 'center', fs: number, text: string, color: string, b: boolean) =>
      td(w, o.bg, '1.4pt 6pt 1.4pt 6pt', 'middle', [para(al, fs, run(text, fs, color, b ? { b: 1 } : {}))], BORDER);
    return [
      c(MEASURE_COL, 'left', 7, label, o.labelColor, o.labelBold ?? true),
      ...vals.map((v, i) => c(waveW, 'center', 7, v, o.lastColor && i === n - 1 ? o.lastColor : INK, o.bold || v.endsWith('*'))),
      c(CHANGE_COL, 'center', 7, change, INK, true),
      c(readW, 'left', o.readFs ?? 6.5, reading, SLATE, o.readBold),
    ];
  };

  const wv = (v: number | null) => (v === null ? '-' : fmt1(v, lang));
  const chg = (c: { deltaShown: number | null; word: { id: string; en: string } | null; significant?: boolean }) => ({
    d: c.deltaShown === null ? '-' : fmtSigned(c.deltaShown, lang),
    w: c.word ? lbl(lang, c.word) : '-',
    sig: Boolean(c.significant),
  });
  const idx = { bg: SOFT, labelColor: INK, bold: true, readBold: true };
  const rows: string[][] = [];
  const m = chg(f.mhi);
  rows.push(row('Mental Health Index (MHI)', pr.waves.map((w) => wv(w.mhi)), m.d, m.w, { ...idx, readBold: m.sig }));
  const lv = f.level;
  rows.push(row(L(lang, 'Status keseluruhan', 'Overall status'), pr.waves.map((w) => `L${w.level}`), lbl(lang, lv.text), lbl(lang, lv.word), { bg: '#FFFFFF', labelColor: SLATE, bold: true, readBold: false, lastColor: NAVY }));
  const d = chg(f.di);
  rows.push(row('Distress Index (DI)', pr.waves.map((w) => wv(w.di)), d.d, d.w, { ...idx, readBold: d.sig }));
  MHCU_DOMAINS.forEach((dm, i) => {
    const dc = f.domains?.[i];
    rows.push(
      row(
        `    ${lbl(lang, dm)}`,
        pr.waves.map((w) => {
          const v = w.domains?.[i] ?? null;
          return v === null ? '-' : `${Math.round(v)}${v >= dm.threshold ? '*' : ''}`;
        }),
        dc?.delta == null ? '-' : signedInt(dc.delta),
        dc?.word ? lbl(lang, dc.word) : '-',
        { bg: '#FFFFFF', labelColor: SLATE, bold: false, readBold: false, labelBold: false },
      ),
    );
  });
  const dims = (title: string, c: typeof f.mhi, defs: readonly { id: string; en: string }[], key: 'wiDims' | 'bhiDims', changes: typeof f.wiDims, top: (w: MhcuProgressData['waves'][number]) => number | null) => {
    const t = chg(c);
    rows.push(row(title, pr.waves.map((w) => wv(top(w))), t.d, t.w, { bg: SOFT, labelColor: INK, bold: true, readBold: t.sig }));
    defs.forEach((dm, i) => {
      const dc = changes?.[i];
      const cc = dc ? chg(dc) : { d: '-', w: '-', sig: false };
      rows.push(row(`    ${lbl(lang, dm)}`, pr.waves.map((w) => wv(w[key]?.[i] ?? null)), cc.d, cc.w, { bg: '#FFFFFF', labelColor: SLATE, bold: false, readBold: cc.sig, labelBold: false }));
    });
  };
  dims('Well-being Index (WI)', f.wi, MHCU_WI_DIMENSIONS, 'wiDims', f.wiDims, (w) => w.wi);
  dims('Behavioral Health Index (BHI)', f.bhi, MHCU_BHI_DIMENSIONS, 'bhiDims', f.bhiDims, (w) => w.bhi);
  return table([header, ...rows]);
}

const signedInt = (v: number): string => (v > 0 ? `+${Math.round(v)}` : String(Math.round(v)));

function shortDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${(y ?? '').slice(2)}`;
}

// --- appendix ------------------------------------------------------------------------------

function appendixPage(
  data: MhcuPsychologistReportData,
  total: number,
  parts: MhcuAppendixItem['part'][],
  pageNo: number,
  withClientNote: boolean,
): string {
  const { header: h } = data;
  const lang = h.lang;
  const out: string[] = [
    head(lang, `${L(lang, 'Lampiran 1: Respons Kuesioner', 'Appendix 1: Questionnaire Responses')} (T${h.waveNo})   |   ${ofPages(lang, pageNo, total)}`, false),
  ];
  if (pageNo === 3) out.push(para('left', 6.5, run(lbl(lang, TEXT.answersNote), 6.5, MUTE, { i: 1 }), { lh: LH_HEAD }));
  for (const p of parts) out.push(partTable(data.appendix.filter((a) => a.part === p), p, lang));
  if (withClientNote) out.push(clientNoteBlock(data));
  return page(out, foot(lang));
}

function partTable(items: MhcuAppendixItem[], part: MhcuAppendixItem['part'], lang: Lang): string {
  const def = PARTS[part];
  const scale = def.scale[lang];
  const hc = (w: number, al: 'left' | 'center', text: string) =>
    td(w, SOFT, '3pt 3pt 3pt 3pt', 'middle', [para(al, 5.8, run(text, 5.8, NAVY, { b: 1 }))], BORDER);
  const header = [hc(18, 'left', L(lang, 'No', 'No')), hc(297, 'left', L(lang, 'Pernyataan', 'Statement')), ...scale.map((s) => hc(40, 'center', s))];
  const rows = items.map((it) => [
    td(18, '#FFFFFF', '1.5pt 2pt 1.5pt 3pt', 'middle', [para('left', 6.5, run(String(it.n), 6.5, MUTE))], BORDER),
    td(297, '#FFFFFF', '1.5pt 6pt 1.5pt 4pt', 'middle', [para('left', 6.5, run(lbl(lang, it.text), 6.5, INK))], BORDER),
    ...scale.map((_, k) => {
      const v = def.first + k;
      const on = it.answer === v;
      return td(40, on ? NAVY : '#FFFFFF', '1.5pt 6pt 1.5pt 6pt', 'middle', [
        para('center', 6.5, run(String(v), 6.5, on ? '#FFFFFF' : '#98A2B3', on ? { b: 1 } : {})),
      ], BORDER);
    }),
  ]);
  return [para('left', 7.5, run(lbl(lang, def.title), 7.5, NAVY, { b: 1 }), { m: '6pt 0 3pt 0', lh: LH_HEAD }), table([header, ...rows])].join('');
}

function clientNoteBlock(data: MhcuPsychologistReportData): string {
  const { header: h, clientNote: n } = data;
  const lang = h.lang;
  const sipp = h.psychologist.sipp ?? '____________________';
  return [
    sp(6),
    sectionTitle(L(lang, 'KETERANGAN YANG DITERIMA KLIEN', 'NOTES RECEIVED BY THE CLIENT')),
    para('justify', 7.8, run(n.recommendation, 7.8, SLATE), { lh: '1.4375' }),
    para('left', 6.5, run(`${L(lang, 'Status catatan', 'Note status')}: ${n.status === 'final' ? 'final' : 'draft'}${n.finalizedBy ? `, ${n.finalizedBy}` : ''}`, 6.5, MUTE), { m: '2pt 0 0pt 0', lh: LH_HEAD }),
    sp(6),
    table([
      [
        td(295, '#FFFFFF', '4pt 6pt 4pt 0pt', 'bottom', [
          para('left', 7, run(L(lang, 'Diterbitkan oleh Biro Psikologi Attentive.', 'Issued by Attentive Psychology Bureau.'), 7, MUTE)),
          para('left', 7, run(`${L(lang, 'No. laporan', 'Report no.')}: ${h.reportNo}`, 7, MUTE)),
        ]),
        td(220, '#FFFFFF', '4pt 0pt 4pt 6pt', 'middle', [
          para('center', 8, run(L(lang, 'Psikolog Pemeriksa,', 'Examining Psychologist,'), 8, SLATE)),
          para('center', 34, run(' ', 34, INK)),
          para('center', 8, run('_______________________________', 8, '#98A2B3')),
          para('center', 8.5, run(h.psychologist.name, 8.5, NAVY, { b: 1 })),
          para('center', 7.5, run(`${L(lang, 'No. SIPP', 'SIPP no.')}: ${sipp}`, 7.5, SLATE), { m: '2pt 0 0pt 0' }),
          para('center', 7.5, run(fmtDate(h.reportDate, lang), 7.5, SLATE)),
        ]),
      ],
    ]),
  ].join('');
}

export { zp };
