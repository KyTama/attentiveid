/**
 * Client report (what the person receives): one A4 page for a single check-up, two pages from the
 * second check-up on (latest result + progress). Mirrors the team's v7 demo documents c1, c1en,
 * c5, c5en and c4r.
 */
import type {
  MhcuClientIndexRow,
  MhcuClientReportData,
  MhcuProgressData,
} from '../../../../../packages/shared/src/assessments/mhcu-report-data';
import { mhiTrendSvg } from './chart';
import {
  INDEX_DEFS,
  INDEX_NOTE,
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
  footer,
  infoGrid,
  letterhead,
  levelName,
  mhiPosition,
  sectionTitle,
  statusScale,
  type Lang,
  type Level,
} from './common';
import { LH_BODY, SVG_DATA_URI, documentHtml, img, page, para, run, sp, table, td, zp, type DocumentOpts } from './html';

const BORDER = `0.5pt solid ${RULE}`;

/** Full HTML document of the client report. */
export function renderClientReport(data: MhcuClientReportData, opts: DocumentOpts = {}): string {
  const lang = data.header.lang;
  const pages = [clientResultPage(data)];
  if (data.progress) pages.push(clientProgressPage(data, data.progress));
  return documentHtml(pages, { lang, ...opts });
}

// --- page 1: latest result -----------------------------------------------------------------

function datePart(examinedAt: string): string {
  return examinedAt.slice(0, 10);
}

function clientResultPage(data: MhcuClientReportData): string {
  const { header: h, summary: s } = data;
  const lang: Lang = h.lang;
  const total = data.progress ? 2 : 1;
  const longitudinal = data.progress !== null;
  const noteParas = [data.note.explanation, data.note.recommendation];

  const body = [
    letterhead(lang, `${L(lang, 'Hasil Pemeriksaan', 'Assessment Result')} (T${h.waveNo})   |   ${L(lang, 'Halaman', 'Page')} 1 ${L(lang, 'dari', 'of')} ${total}`),
    infoGrid([
      [
        { w: 140, label: L(lang, 'NAMA', 'NAME'), value: h.name },
        { w: 120, label: L(lang, 'NO. LAPORAN', 'REPORT NO.'), value: h.reportNo },
        {
          w: 128,
          label: L(lang, 'USIA/JENIS KELAMIN', 'AGE/SEX'),
          value: `${h.age} ${L(lang, 'tahun', 'years')}/${h.sex}`,
        },
        { w: 127, label: L(lang, 'TANGGAL PEMERIKSAAN', 'DATE OF ASSESSMENT'), value: fmtDate(datePart(h.examinedAt), lang) },
      ],
      [
        {
          w: 140,
          label: L(lang, 'PENGUKURAN', 'MEASUREMENT'),
          value: `T${h.waveNo} (${L(lang, `pengukuran ke-${h.waveNo}`, `measurement ${h.waveNo}`)})`,
        },
        { w: 120, label: L(lang, 'PERIODE YANG DINILAI', 'PERIOD ASSESSED'), value: L(lang, h.period.id, h.period.en) },
        { w: 128, label: L(lang, 'PSIKOLOG PEMERIKSA', 'EXAMINING PSYCHOLOGIST'), value: h.psychologist.name },
        { w: 127, label: L(lang, 'TANGGAL LAPORAN', 'REPORT DATE'), value: fmtDate(h.reportDate, lang) },
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
    sectionTitle(L(lang, '2   HASIL PER INDEKS', '2   RESULTS PER INDEX')),
    indexTable(data.indices, lang, longitudinal),
    para('left', 6.5, run(INDEX_NOTE[lang], 6.5, MUTE), { m: '4pt 0 0pt 0', lh: '1.38' }),
    sp(6),
    sectionTitle(L(lang, '3   KETERANGAN PSIKOLOG', "3   PSYCHOLOGIST'S NOTES")),
    para('justify', 8.5, run(noteParas[0] ?? '', 8.5, INK), { m: '0pt 0 5pt 0', lh: LH_BODY }),
    para('justify', 8.5, run(noteParas[1] ?? '', 8.5, INK), { lh: LH_BODY }),
    longitudinal ? '' : [sp(6), signatureBlock(data)].join(''),
  ];
  return page(body, footer(lang));
}

function summaryBox(data: MhcuClientReportData): string {
  const { summary: s, header: h } = data;
  const lang = h.lang;
  const levelLine = `Level ${s.level} ${L(lang, 'dari', 'of')} 5: ${L(lang, s.levelName.id, s.levelName.en)}`;
  return table([
    [
      td(128, SOFT, '7pt 6pt 7pt 6pt', 'middle', [
        para('center', 6.5, run('MENTAL HEALTH INDEX', 6.5, MUTE, { b: 1 })),
        para('center', 26, run(s.mhi === null ? '-' : fmt1(s.mhi, lang), 26, NAVY, { b: 1 })),
        para('center', 6.5, run(L(lang, 'dari 100', 'out of 100'), 6.5, MUTE)),
      ]),
      td(387, '#FFFFFF', '6pt 6pt 6pt 14pt', 'middle', [
        para('left', 6.5, run(L(lang, 'STATUS KESELURUHAN', 'OVERALL STATUS'), 6.5, MUTE, { b: 1 })),
        para('left', 13, run(levelLine, 13, NAVY, { b: 1 }), { m: '1pt 0 0pt 0' }),
        para('left', 7.5, run(L(lang, s.reason.id, s.reason.en), 7.5, SLATE, { i: 1 }), { m: '3pt 0 0pt 0' }),
      ]),
    ],
  ]);
}

// --- index table ---------------------------------------------------------------------------

function indexTable(rows: MhcuClientIndexRow[], lang: Lang, longitudinal: boolean): string {
  const w = longitudinal ? [138, 50, 163, 64, 46, 54] : [160, 56, 219, 80];
  const prevNo = rows.find((r) => r.previous)?.previous?.waveNo;
  const head = (width: number, al: 'left' | 'center', text: string) =>
    td(width, SOFT, '5pt 6pt 5pt 6pt', 'middle', [para(al, 6.5, run(text, 6.5, NAVY, { b: 1 }))], BORDER);
  const header = [
    head(w[0] as number, 'left', L(lang, 'PEMERIKSAAN', 'TEST')),
    head(w[1] as number, 'center', L(lang, 'HASIL', 'RESULT')),
    head(w[2] as number, 'left', L(lang, 'NILAI RUJUKAN', 'REFERENCE VALUES')),
    head(w[3] as number, 'center', L(lang, 'KATEGORI', 'CATEGORY')),
  ];
  if (longitudinal) {
    header.push(
      head(w[4] as number, 'center', L(lang, `SEBELUMNYA (T${prevNo})`, `PREVIOUS (T${prevNo})`)),
      head(w[5] as number, 'center', L(lang, 'PERUBAHAN', 'CHANGE')),
    );
  }
  const body = rows.map((r) => {
    const def = INDEX_DEFS[r.key];
    const cells = [
      td(w[0] as number, '#FFFFFF', '5pt 6pt 5pt 6pt', 'middle', [
        para('left', 8.5, run(def.name, 8.5, INK, { b: 1 })),
        para('left', 6.5, run(def.hint[lang], 6.5, MUTE, { i: 1 })),
      ], BORDER),
      td(w[1] as number, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [
        para('center', 11, run(r.value === null ? '-' : fmt1(r.value, lang), 11, NAVY, { b: 1 })),
        para('center', 6, run('0-100', 6, '#98A2B3')),
      ], BORDER),
      td(w[2] as number, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [
        para('left', 6.5, run(L(lang, r.referenceRanges.id, r.referenceRanges.en), 6.5, SLATE)),
      ], BORDER),
      td(w[3] as number, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [
        para('center', 8, run(r.category ? L(lang, r.category.id, r.category.en) : '-', 8, INK, { b: 1 })),
      ], BORDER),
    ];
    if (longitudinal) {
      const prev = r.previous;
      cells.push(
        td(w[4] as number, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [
          para('center', 8.5, run(prev?.value == null ? '-' : fmt1(prev.value, lang), 8.5, SLATE)),
        ], BORDER),
        td(w[5] as number, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [
          para('center', 8.5, run(prev?.change.deltaShown == null ? '-' : fmtSigned(prev.change.deltaShown, lang), 8.5, INK, { b: 1 })),
          para('center', 6, run(prev?.change.word ? L(lang, prev.change.word.id, prev.change.word.en) : '', 6, MUTE)),
        ], BORDER),
      );
    }
    return cells;
  });
  return table([header, ...body]);
}

// --- signature -----------------------------------------------------------------------------

function signatureBlock(data: MhcuClientReportData): string {
  const { header: h } = data;
  const lang = h.lang;
  const sipp = h.psychologist.sipp ?? '____________________';
  return table([
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
  ]);
}

// --- page 2: progress ----------------------------------------------------------------------

const MEASURE_COL = 170;
const CHANGE_COL = 68;

function clientProgressPage(data: MhcuClientReportData, pr: MhcuProgressData): string {
  const { header: h } = data;
  const lang = h.lang;
  const n = pr.waves.length;
  const last = pr.waves[n - 1];
  const first = pr.waves[0];
  // The team's English demo (c5en) draws the chart labels with a decimal comma too, so the chart is
  // always formatted the Indonesian way to stay identical to it.
  const svg = mhiTrendSvg(
    pr.waves.map((w) => ({ waveNo: w.waveNo, date: w.date, mhi: w.mhi })),
    'id',
    504,
  );

  const legend = (name: string, range: string) => [
    para('left', 7, run(name, 7, SLATE, { b: 1 }), { m: '4pt 0 0pt 0' }),
    para('left', 6.5, run(`    ${range}`, 6.5, MUTE)),
  ];

  const body = [
    letterhead(
      lang,
      `${L(lang, 'Perkembangan Hasil', 'Progress of Results')} (T${first?.waveNo} ${L(lang, 'sampai', 'to')} T${last?.waveNo})   |   ${L(lang, 'Halaman', 'Page')} 2 ${L(lang, 'dari', 'of')} 2`,
      false,
    ),
    infoGrid([
      [
        { w: 140, label: L(lang, 'NAMA', 'NAME'), value: h.name },
        { w: 120, label: L(lang, 'ID PESERTA', 'PARTICIPANT ID'), value: h.participantId },
        {
          w: 128,
          label: L(lang, 'JUMLAH PENGUKURAN', 'MEASUREMENTS'),
          value: `${n} (T${first?.waveNo} ${L(lang, 'sampai', 'to')} T${last?.waveNo})`,
        },
        {
          w: 127,
          label: L(lang, 'RENTANG PEMANTAUAN', 'MONITORING PERIOD'),
          value: `${fmtDate(pr.firstDate, lang)} ${L(lang, 's.d.', 'to')} ${fmtDate(pr.lastDate, lang)}`,
        },
      ],
    ]),
    sp(6),
    sectionTitle(L(lang, '1   TREN MENTAL HEALTH INDEX (MHI)', '1   MENTAL HEALTH INDEX (MHI) TREND')),
    table([
      [
        td(411, '#FFFFFF', '0pt 0pt 0pt 0pt', 'middle', [para('left', 8.5, [img(SVG_DATA_URI(svg), 405, 170)])]),
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
    sectionTitle(L(lang, '2   PERBANDINGAN HASIL', '2   COMPARISON OF RESULTS')),
    comparisonTable(pr, lang),
    para(
      'left',
      6.5,
      run(
        L(
          lang,
          'Perubahan dianggap bermakna bila selisihnya 5 poin atau lebih pada skala 0-100 (acuan sementara Attentive). Status berkisar dari Level 1 (Baik) sampai Level 5 (Prioritas).',
          'A change counts as clear when it is 5 points or more on the 0-100 scale (interim Attentive reference). Status ranges from Level 1 (Good) to Level 5 (Priority).',
        ),
        6.5,
        MUTE,
      ),
      { m: '4pt 0 0pt 0', lh: '1.38' },
    ),
    sp(6),
    sectionTitle(L(lang, '3   RINGKASAN PERKEMBANGAN', '3   SUMMARY OF PROGRESS')),
    para('justify', 8.5, run(progressSummary(pr, lang), 8.5, INK), { lh: '1.5525' }),
    sp(6),
    signatureBlock(data),
  ];
  return page(body, footer(lang));
}

function comparisonTable(pr: MhcuProgressData, lang: Lang): string {
  const n = pr.waves.length;
  const waveW = Math.floor((515 - MEASURE_COL - CHANGE_COL - 112) / n);
  const readW = 515 - MEASURE_COL - CHANGE_COL - waveW * n;
  const first = pr.waves[0];
  const last = pr.waves[n - 1];

  const head = (w: number, al: 'left' | 'center', top: string, sub?: string) =>
    td(w, SOFT, '4pt 6pt 4pt 6pt', 'middle', [
      para(al, 6.5, run(top, 6.5, NAVY, { b: 1 })),
      ...(sub === undefined ? [] : [para('center', 5.5, run(sub, 5.5, MUTE))]),
    ], BORDER);
  const header = [
    head(MEASURE_COL, 'left', L(lang, 'KOMPONEN', 'COMPONENT')),
    ...pr.waves.map((w) => head(waveW, 'center', `T${w.waveNo}`, shortDate(w.date))),
    head(CHANGE_COL, 'center', L(lang, 'PERUBAHAN', 'CHANGE'), L(lang, `T${first?.waveNo} ke T${last?.waveNo}`, `T${first?.waveNo} to T${last?.waveNo}`)),
    head(readW, 'center', L(lang, 'KETERANGAN', 'READING')),
  ];

  const cell = (w: number, al: 'left' | 'center', fs: number, text: string, color: string, bold: boolean) =>
    td(w, '#FFFFFF', '4pt 6pt 4pt 6pt', 'middle', [para(al, fs, run(text, fs, color, bold ? { b: 1 } : {}))], BORDER);

  const metricRow = (label: string, vals: (number | null)[], change: MhcuProgressData['firstToLast']['mhi']) => [
    cell(MEASURE_COL, 'left', 8, label, INK, true),
    ...vals.map((v) => cell(waveW, 'center', 8, v === null ? '-' : fmt1(v, lang), INK, true)),
    cell(CHANGE_COL, 'center', 8, change.deltaShown === null ? '-' : fmtSigned(change.deltaShown, lang), INK, true),
    cell(readW, 'left', 7, change.word ? L(lang, change.word.id, change.word.en) : '-', SLATE, change.significant),
  ];

  const lvl = pr.firstToLast.level;
  const statusRow = [
    cell(MEASURE_COL, 'left', 8, L(lang, 'Status keseluruhan', 'Overall status'), SLATE, true),
    ...pr.waves.map((w, i) => cell(waveW, 'center', 8, `L${w.level}`, i === n - 1 ? NAVY : INK, true)),
    cell(CHANGE_COL, 'center', 8, L(lang, lvl.text.id, lvl.text.en), INK, true),
    cell(readW, 'left', 7, L(lang, lvl.word.id, lvl.word.en), SLATE, false),
  ];

  const f = pr.firstToLast;
  return table([
    header,
    metricRow('Mental Health Index (MHI)', pr.waves.map((w) => w.mhi), f.mhi),
    statusRow,
    metricRow(INDEX_DEFS.di.name, pr.waves.map((w) => w.di), f.di),
    metricRow(INDEX_DEFS.wi.name, pr.waves.map((w) => w.wi), f.wi),
    metricRow(INDEX_DEFS.bhi.name, pr.waves.map((w) => w.bhi), f.bhi),
  ]);
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${(y ?? '').slice(2)}`;
}

/** The "RINGKASAN PERKEMBANGAN" paragraph, written from the progress numbers. */
export function progressSummary(pr: MhcuProgressData, lang: Lang): string {
  const n = pr.waves.length;
  const first = pr.waves[0];
  const last = pr.waves[n - 1];
  const s = pr.summary;
  const f = pr.firstToLast;
  const mhi = (v: number | null) => (v === null ? '-' : fmt1(v, lang));
  const lvl = (l: number) => `Level ${l} (${LEVEL_NAME[lang][l - 1]})`;
  const word = (c: { word: { id: string; en: string } | null }) => (c.word ? L(lang, c.word.id, c.word.en).toLowerCase() : '-');

  if (lang === 'id') {
    return (
      `Selama ${pr.spanDays} hari dan ${pr.waveCount} kali pengukuran, MHI Anda bergerak dari ${mhi(s.mhiFrom)} pada T${first?.waveNo} menjadi ${mhi(s.mhiTo)} pada T${last?.waveNo}. ` +
      `Status Anda berubah dari ${lvl(s.levelFrom)} menjadi ${lvl(s.levelTo)}. ` +
      `Dibandingkan pengukuran pertama, tingkat distres ${word(f.di)}, kesejahteraan mental ${word(f.wi)}, dan kebiasaan sehari-hari yang sehat ${word(f.bhi)}. ` +
      'Ini adalah kecenderungan dari skrining berbasis laporan diri, jadi sebaiknya dibicarakan bersama psikolog sambil melihat pengalaman Anda sendiri selama periode ini.'
    );
  }
  return (
    `Over ${pr.spanDays} days and ${pr.waveCount} measurements, your MHI went from ${mhi(s.mhiFrom)} at T${first?.waveNo} to ${mhi(s.mhiTo)} at T${last?.waveNo}. ` +
    `Your status moved from ${lvl(s.levelFrom)} to ${lvl(s.levelTo)}. ` +
    `Compared with the first measurement, distress is ${word(f.di)}, well-being is ${word(f.wi)} and healthy daily habits are ${word(f.bhi)}. ` +
    'This is a trend from a self-report screening, so it is best discussed with your psychologist alongside your own experience of these weeks.'
  );
}

export { levelName, zp };
