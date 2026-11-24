import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  MhcuClientReportData,
  MhcuPsychologistReportData,
} from '../../../../../packages/shared/src/assessments/mhcu-report-data';
import { mhiTrendSvg } from './chart';
import { renderClientReport } from './client-report';
import { fmt1, fmtDate, fmtDateShort, fmtSigned, fmtTrim, indexCategory } from './common';
import { DEMO_CLIENT } from './demo-client-data';
import { DEMO_PSYCHOLOGIST } from './demo-psychologist-data';
import { esc, FONT_URL, LOGO_URL } from './html';
import { renderPsychologistReport } from './psychologist-report';

/** Visible text of a rendered report, tags removed and the zero-width spacer dropped. */
const textOf = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '|')
    .replace(/&#8203;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

const pageCount = (html: string): number => (html.match(/<div class="page">/g) ?? []).length;

// The demo documents live outside the repository (docs/ is private). Byte comparison runs only where they exist.
const DEMO_DIR = resolve(import.meta.dir, '../../../../../../docs/assessments-work/mhcu-v7-docs');
const demoBody = (name: string): string | null => {
  const file = resolve(DEMO_DIR, `${name}.html`);
  if (!existsSync(file)) return null;
  const html = readFileSync(file, 'utf8');
  // 24 Nov 2026: the team (Andina) asked for "rujukan" (can read as "referral") to become "acuan" in the reports.
  // The demo documents are the team's older source files and are left as they are, so the new wording is applied here.
  return html
    .slice(html.indexOf('<body>') + 6)
    .replaceAll('NILAI RUJUKAN', 'NILAI ACUAN')
    .replaceAll('RENTANG RUJUKAN', 'RENTANG ACUAN')
    .replaceAll('rentang rujukan', 'rentang acuan')
    .replaceAll('Nilai rujukan', 'Nilai acuan')
    .replaceAll('nilai rujukan', 'nilai acuan');
};
/** Images (logo, chart) are hosted or data URIs; compare everything else. */
const normalise = (body: string): string => body.replace(/src="[^"]*"/g, 'src="IMG"');

describe('formatting', () => {
  test('numbers: decimal comma for Bahasa, point for English', () => {
    expect(fmt1(77.5, 'id')).toBe('77,5');
    expect(fmt1(77.5, 'en')).toBe('77.5');
    expect(fmt1(50, 'en')).toBe('50.0');
    expect(fmtTrim(32, 'id')).toBe('32');
    expect(fmtTrim(52.5, 'id')).toBe('52,5');
    expect(fmtSigned(8.94, 'id')).toBe('+8,9');
    expect(fmtSigned(-1.9, 'en')).toBe('-1.9');
    expect(fmtSigned(0, 'id')).toBe('0,0');
  });

  test('dates', () => {
    expect(fmtDate('2026-11-15', 'id')).toBe('15 November 2026');
    expect(fmtDate('2026-07-31', 'id')).toBe('31 Juli 2026');
    expect(fmtDate('2026-07-31', 'en')).toBe('31 July 2026');
    expect(fmtDateShort('2026-07-31')).toBe('31/07/26');
    expect(() => fmtDate('15/11/2026', 'id')).toThrow();
  });

  test('index categories follow the reference ranges', () => {
    expect(indexCategory('di', 17.3, 'id')).toBe('Ringan');
    expect(indexCategory('wi', 76.8, 'id')).toBe('Rata-rata');
    expect(indexCategory('wi', 50, 'en')).toBe('Low');
    expect(indexCategory('bhi', 68.3, 'id')).toBe('Cukup');
  });

  test('esc escapes markup characters', () => {
    expect(esc(`<b a="1">&`)).toBe('&lt;b a=&quot;1&quot;&gt;&amp;');
    expect(esc(null)).toBe('');
  });
});

describe('client report', () => {
  test('c1 (single, Bahasa): header, scores, status, notes, signature', () => {
    const html = renderClientReport(DEMO_CLIENT.c1);
    const t = textOf(html);
    expect(pageCount(html)).toBe(1);
    for (const s of [
      'Larasati Dewi',
      'AT-MHCU-2026-114',
      '41 tahun/Perempuan',
      '15 November 2026',
      'T1 (pengukuran ke-1)',
      '2 minggu terakhir',
      'Ni Putu Mayda A. A, M.Psi., Psikolog.',
      '21 November 2026',
      'Hasil Pemeriksaan (T1)   |   Halaman 1 dari 1',
      '77,5',
      'Level 2 dari 5: Perlu Dipantau',
      'No. SIPP: ____________________',
    ]) {
      expect(t).toContain(s);
    }
    // index table rows: value, reference text, category
    expect(t).toContain('17,3');
    expect(t).toContain('Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100');
    expect(t).toContain('76,8');
    expect(t).toContain('Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100');
    expect(t).toContain('68,3');
    expect(t).toContain('Sangat kurang 0-24,9; Kurang 25-49,9; Cukup 50-74,9; Baik 75-100');
  });

  test('c1en (single, English)', () => {
    const t = textOf(renderClientReport(DEMO_CLIENT.c1en));
    for (const s of [
      'PSYCHOLOGICAL ASSESSMENT REPORT',
      'Kevin Wijaya',
      'AT-MHCU-2026-115',
      '26 years/Male',
      '16 November 2026',
      'Level 3 of 5: Needs Attention',
      '59.9',
      '26.9',
      '50.0',
      '53.3',
      'Minimal 0-9.9; Mild 10-24.9; Moderate 25-49.9; High 50-100',
      'Assessment Result (T1)   |   Page 1 of 1',
      'SIPP no.: ____________________',
    ]) {
      expect(t).toContain(s);
    }
  });

  test('the current level is the highlighted step of the status scale', () => {
    const html = renderClientReport(DEMO_CLIENT.c1);
    expect(html).toContain('background:#142B51;vertical-align:middle"><p style="margin:0pt 0 0pt 0;text-align:center;line-height:1.2075;font-size:7.5pt');
    expect(html.match(/font-size:7\.5pt;font-weight:bold;color:#FFFFFF;">2  Perlu Dipantau/g)?.length).toBe(1);
  });

  test('MHI marker sits at its position on the 515pt bar', () => {
    // 77.5 -> 385pt of empty space before the 28pt marker, 102pt after (as in the demo)
    const html = renderClientReport(DEMO_CLIENT.c1);
    expect(html).toContain('width:385pt;max-width:385pt;padding:0pt 0pt 0pt 0pt');
    expect(html).toContain('width:102pt;max-width:102pt;padding:0pt 0pt 0pt 0pt');
  });

  test('c5 (longitudinal, Bahasa): two pages, previous result, comparison, progress sentence', () => {
    const html = renderClientReport(DEMO_CLIENT.c5);
    const t = textOf(html);
    expect(pageCount(html)).toBe(2);
    for (const s of [
      'Nadia Putri Lestari',
      'AT-MHCU-2026-122',
      'T5 (pengukuran ke-5)',
      'Hasil Pemeriksaan (T5)   |   Halaman 1 dari 2',
      'Perkembangan Hasil (T1 sampai T5)   |   Halaman 2 dari 2',
      '76,1',
      'SEBELUMNYA (T4)',
      '19,2',
      '-1,9',
      'Sedikit membaik',
      '+8,9',
      'Membaik bermakna',
      'P00001',
      '5 (T1 sampai T5)',
      '31 Juli 2026 s.d. 20 November 2026',
      '46,1',
      '54,1',
      '61,4',
      '71,4',
      '+30,0',
      'Turun 1 level',
      'Selama 112 hari dan 5 kali pengukuran, MHI Anda bergerak dari 46,1 pada T1 menjadi 76,1 pada T5.',
      'Status Anda berubah dari Level 3 (Perlu Perhatian) menjadi Level 2 (Perlu Dipantau).',
    ]) {
      expect(t).toContain(s);
    }
    // the trend chart is an inline image with one point per measurement
    const svg = chartOf(html);
    expect((svg.match(/<circle /g) ?? []).length).toBe(5);
  });

  test('c5en (longitudinal, English)', () => {
    const t = textOf(renderClientReport(DEMO_CLIENT.c5en));
    for (const s of [
      'Assessment Result (T5)   |   Page 1 of 2',
      'Progress of Results (T1 to T5)   |   Page 2 of 2',
      'PREVIOUS (T4)',
      '+8.9',
      'Clearly improved',
      '31 July 2026 to 20 November 2026',
      'Over 112 days and 5 measurements, your MHI went from 46.1 at T1 to 76.1 at T5.',
      'Your status moved from Level 3 (Needs Attention) to Level 2 (Needs Monitoring).',
      'distress is clearly improved, well-being is clearly improved and healthy daily habits are clearly improved',
    ]) {
      expect(t).toContain(s);
    }
  });

  test('c4r (starts from Priority): four waves', () => {
    const html = renderClientReport(DEMO_CLIENT.c4r);
    const t = textOf(html);
    for (const s of [
      'Rizky Pratama',
      '56,5',
      'Level 3 dari 5: Perlu Perhatian',
      '4 (T1 sampai T4)',
      '18 September 2026 s.d. 13 November 2026',
      '+24,5',
      'Selama 56 hari dan 4 kali pengukuran, MHI Anda bergerak dari 32,0 pada T1 menjadi 56,5 pada T4.',
      'Status Anda berubah dari Level 5 (Prioritas) menjadi Level 3 (Perlu Perhatian).',
    ]) {
      expect(t).toContain(s);
    }
    expect((chartOf(html).match(/<circle /g) ?? []).length).toBe(4);
  });

  test('user text is HTML-escaped everywhere it is printed', () => {
    const evil = `<script>alert(1)</script>"&`;
    const data: MhcuClientReportData = structuredClone(DEMO_CLIENT.c5);
    data.header.name = evil;
    data.header.reportNo = evil;
    data.header.psychologist.name = evil;
    data.header.participantId = evil;
    data.note.explanation = evil;
    data.note.recommendation = evil;
    data.summary.reason = { id: evil, en: evil };
    const html = renderClientReport(data);
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;&quot;&amp;');
  });

  test('references hosted logo and font, never an embedded font or logo', () => {
    const html = renderClientReport(DEMO_CLIENT.c1);
    expect(html).toContain(`src="${LOGO_URL}"`);
    expect(html).toContain(`url(${FONT_URL})`);
    expect(html).not.toContain('data:image/png');
    expect(html).not.toContain('data:font');
  });

  test('A4 sheet geometry and print rules', () => {
    const html = renderClientReport(DEMO_CLIENT.c5);
    expect(html).toContain('@page{size:595.28pt 841.89pt;margin:0}');
    expect(html).toContain('width:595.28pt;height:841.89pt');
    expect(html).toContain('page-break-after:always');
    expect(html).toContain('<style media="print">');
    expect(html).toContain('<div class="foot">');
  });

  test('an incomplete result prints a dash instead of a number', () => {
    const data = structuredClone(DEMO_CLIENT.c1);
    data.summary.mhi = null;
    data.summary.incomplete = true;
    const html = renderClientReport(data);
    expect(textOf(html)).not.toContain('NaN');
    expect(textOf(html)).not.toContain('null');
  });

  const byte: [keyof typeof DEMO_CLIENT, string][] = [
    ['c1', 'c1'],
    ['c1en', 'c1en'],
    ['c5', 'c5'],
    ['c5en', 'c5en'],
    ['c4r', 'c4r'],
  ];
  for (const [key, file] of byte) {
    test(`${file}: markup is identical to the team's demo document`, () => {
      const demo = demoBody(file);
      if (demo === null) return; // demo files not present on this machine
      const mine = renderClientReport(DEMO_CLIENT[key]);
      expect(normalise(mine.slice(mine.indexOf('<body>') + 6))).toBe(normalise(demo));
    });
  }
});

describe('psychologist report', () => {
  test('p1 (single, Bahasa): four sheets, header, index table, triggers, appendix, client note', () => {
    const html = renderPsychologistReport(DEMO_PSYCHOLOGIST.p1);
    const t = textOf(html);
    expect(pageCount(html)).toBe(4);
    for (const s of [
      'DOKUMEN INTERNAL, HANYA UNTUK PSIKOLOG',
      'Hasil Pemeriksaan (T1)   |   Halaman 1 dari 4',
      'Larasati Dewi',
      'AT-MHCU-2026-114/P00007',
      '15 November 2026 06:18',
      'T1 (1/1)',
      '081122233344, laras.dewi@example.com',
      '77,5',
      'Level 2 dari 5: Perlu Dipantau',
      'Distress Index (DI), semakin rendah semakin baik',
      'Well-being Index (WI), WEMWBS 57/70',
      '    Penggunaan Zat *',
      'P93',
      'P61',
      'Attentive Index (ATI), catatan, tidak masuk MHI',
      '(n = 87, data bersih, 2026-11-05 s.d. 2026-11-20)',
      '3   PEMICU STATUS DAN TINDAK LANJUT',
      '1 domain di atas ambang',
      '2 minggu',
      'Lampiran 1: Respons Kuesioner (T1)   |   Halaman 3 dari 4',
      'Lampiran 1: Respons Kuesioner (T1)   |   Halaman 4 dari 4',
      'KETERANGAN YANG DITERIMA KLIEN',
      'Status catatan: final, Ni Putu Mayda A. A',
    ]) {
      expect(t).toContain(s);
    }
    // 23 + 14 + 15 + 6 answered items, one dark cell each
    const darkCells = html.match(/width:40pt;max-width:40pt;padding:1\.5pt 6pt 1\.5pt 6pt;background:#142B51/g) ?? [];
    expect(darkCells.length).toBe(DEMO_PSYCHOLOGIST.p1.appendix.filter((a) => a.answer !== null).length);
    expect(DEMO_PSYCHOLOGIST.p1.appendix.length).toBe(58);
  });

  test('every sheet number agrees with the total', () => {
    for (const key of ['p1', 'p5', 'p4r'] as const) {
      const t = textOf(renderPsychologistReport(DEMO_PSYCHOLOGIST[key]));
      const nums = [...t.matchAll(/(?:Halaman|Page) (\d) (?:dari|of) (\d)/g)].map((m) => `${m[1]}/${m[2]}`);
      expect(nums).toEqual(['1/4', '2/4', '3/4', '4/4']);
    }
  });

  test('p5 (longitudinal, Bahasa): trend, comparison table with areas and dimensions', () => {
    const html = renderPsychologistReport(DEMO_PSYCHOLOGIST.p5);
    const t = textOf(html);
    for (const s of [
      'Perkembangan Hasil (T1 sampai T5)   |   Halaman 2 dari 4',
      '2 domain di atas ambang',
      '4   TREN MENTAL HEALTH INDEX (MHI)',
      '5   PERBANDINGAN HASIL',
      'T1 ke T5',
      '+30,0',
      'Turun 1 level',
      'Tetap, masih di atas ambang',
      'Membaik, masih di atas ambang',
      '    Afek Positif',
      '+33,3',
      'Relatif tetap',
      'T5 (5/5)',
    ]) {
      expect(t).toContain(s);
    }
    expect((chartOf(html).match(/<circle /g) ?? []).length).toBe(5);
    // flagged area scores carry an asterisk
    expect(t).toContain('|2*|');
  });

  test('p4r (longitudinal, English)', () => {
    const t = textOf(renderPsychologistReport(DEMO_PSYCHOLOGIST.p4r));
    for (const s of [
      'INTERNAL DOCUMENT, FOR PSYCHOLOGISTS ONLY',
      'Assessment Result (T4)   |   Page 1 of 4',
      'Progress of Results (T1 to T4)   |   Page 2 of 4',
      'REPORT NO./PARTICIPANT ID',
      'AT-MHCU-2026-113/P00005',
      '13 November 2026 07:30',
      'Well-being Index (WI), WEMWBS 41/70',
      '3   STATUS TRIGGERS AND FOLLOW-UP',
      '7 domain(s) at or above threshold, WEMWBS total 41 (41-44; possible depression indication), low MHI (56.5)',
      '1 week',
      '    Somatic Symptoms *',
      'PART A: Psychological Symptoms (past 2 weeks)',
      'PART D: Self-description (in general)',
      'NOTES RECEIVED BY THE CLIENT',
      'Note status: final, Valencia Yang',
      'Appendix 1: Questionnaire Responses (T4)   |   Page 4 of 4',
    ]) {
      expect(t).toContain(s);
    }
  });

  test('user text is HTML-escaped everywhere it is printed', () => {
    const evil = `<img src=x onerror=alert(1)>&"`;
    const data: MhcuPsychologistReportData = structuredClone(DEMO_PSYCHOLOGIST.p5);
    data.header.name = evil;
    data.header.clientContact = { whatsapp: evil, email: evil };
    data.header.psychologist.name = evil;
    data.clientNote.recommendation = evil;
    data.clientNote.finalizedBy = evil;
    data.triggers.triggers = [{ id: evil, en: evil }];
    data.triggers.followUp = { id: evil, en: evil };
    data.rows[2] = { ...(data.rows[2] as MhcuPsychologistReportData['rows'][number]), label: { id: evil, en: evil } };
    data.appendix[0] = { ...(data.appendix[0] as MhcuPsychologistReportData['appendix'][number]), text: { id: evil, en: evil } };
    const html = renderPsychologistReport(data);
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;&amp;&quot;');
  });

  test('a missing reference sample is said so instead of printing numbers', () => {
    const data = structuredClone(DEMO_PSYCHOLOGIST.p1);
    data.reference = null;
    expect(textOf(renderPsychologistReport(data))).toContain('belum tersedia');
  });

  test('unanswered items have no dark cell', () => {
    const data = structuredClone(DEMO_PSYCHOLOGIST.p1);
    (data.appendix[0] as { answer: number | null }).answer = null;
    const html = renderPsychologistReport(data);
    const dark = html.match(/width:40pt;max-width:40pt;padding:1\.5pt 6pt 1\.5pt 6pt;background:#142B51/g) ?? [];
    expect(dark.length).toBe(57);
  });

  const byte: [keyof typeof DEMO_PSYCHOLOGIST, string][] = [
    ['p1', 'p1'],
    ['p5', 'p5'],
    ['p4r', 'p4r'],
  ];
  for (const [key, file] of byte) {
    test(`${file}: markup is identical to the team's demo document`, () => {
      const demo = demoBody(file);
      if (demo === null) return;
      const mine = renderPsychologistReport(DEMO_PSYCHOLOGIST[key]);
      // The p1 demo prints "Halaman N dari 3" on a four-sheet report; ours prints the real total.
      const expected = normalise(demo).replace(/Halaman (\d) dari 3/g, 'Halaman $1 dari 4');
      expect(normalise(mine.slice(mine.indexOf('<body>') + 6))).toBe(expected);
    });
  }
});

describe('trend chart', () => {
  const waves = [
    { waveNo: 1, date: '2026-07-31', mhi: 46.1 },
    { waveNo: 2, date: '2026-08-28', mhi: 54.1 },
    { waveNo: 3, date: '2026-09-25', mhi: 61.4 },
    { waveNo: 4, date: '2026-10-23', mhi: 71.4 },
    { waveNo: 5, date: '2026-11-20', mhi: 76.1 },
  ];

  test('draws the demo polyline, labels and dates', () => {
    const svg = mhiTrendSvg(waves, 'id', 504);
    expect(svg).toContain('width="1200" height="504"');
    expect(svg).toContain('points="159.6,254.224 386.8,220.944 614,190.576 841.2,148.97599999999994 1068.4,129.42400000000004"');
    expect(svg).toContain('>46,1</text>');
    expect(svg).toContain('>T5</text>');
    expect(svg).toContain('>20/11/26</text>');
  });

  test('the psychologist chart is shorter, same width', () => {
    expect(mhiTrendSvg(waves, 'id', 350)).toContain('width="1200" height="350"');
  });

  test('a wave without an MHI is left out of the line', () => {
    const svg = mhiTrendSvg([waves[0]!, { waveNo: 2, date: '2026-08-28', mhi: null }, waves[2]!], 'id');
    expect((svg.match(/<circle /g) ?? []).length).toBe(2);
    expect(svg).not.toContain('NaN');
  });
});

/** Decodes the trend chart embedded in a report. */
function chartOf(html: string): string {
  const m = /src="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"/.exec(html);
  expect(m).not.toBeNull();
  return Buffer.from((m as RegExpExecArray)[1] as string, 'base64').toString('utf8');
}
