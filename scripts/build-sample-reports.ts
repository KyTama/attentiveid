/**
 * Builds the two sample MHCU reports that the result e-mail links to, plus a first-page thumbnail of each.
 *
 *   bun scripts/build-sample-reports.ts
 *
 * Output (committed, served as static files):
 *   apps/web/public/assessments-static/contoh-laporan-1x.pdf        single check-up
 *   apps/web/public/assessments-static/contoh-laporan-paket-3x.pdf  a package of 3 check-ups (T1, T2, T3)
 *   apps/web/public/images/email/teaser-1x.png                      first page, about 520 px wide
 *   apps/web/public/images/email/teaser-paket-3x.png
 *
 * The samples go through the same builder and renderer as a real released report (buildClientReportData + renderClientReport),
 * fed with fictional answers, so their layout and length are exactly what a participant receives. Names are fictional
 * ("Nama Peserta (contoh)"). Every page carries a CONTOH / SAMPLE mark. The PDF is printed by headless Chrome or Edge
 * (found automatically, or set CHROME_PATH). Needs no network and no database.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MHCU_ANSWER_RANGE, MHCU_ITEMS, MHCU_LEVELS, buildClientReportData, mhcuCode, scoreMhcu } from '../packages/shared/src';
import type { MhcuStoredSession } from '../packages/shared/src';
import { renderClientReport } from '../apps/api/src/reports/mhcu/client-report';
import { FONT_URL, LOGO_URL } from '../apps/api/src/reports/mhcu/html';

const ROOT = resolve(import.meta.dir, '..');
const PUBLIC = join(ROOT, 'apps/web/public');
const MAX_PDF_BYTES = 1.5 * 1024 * 1024;
const SAMPLE_NAME = 'Nama Peserta (contoh)';
const SAMPLE_PSYCHOLOGIST = 'Nama Psikolog (contoh)';
/** Fixed, so the committed PDFs do not change from one build to the next. */
const REPORT_DATE = '2026-11-24';
/** Thumbnail width in pixels; an A4 page is 794 CSS pixels wide. */
const THUMB_WIDTH = 520;

/** Average answer per part for each fictional check-up (cc = complaints, wb = well-being, hb = habits, ati = self-image). */
type Means = { cc: number; wb: number; hb: number; ati: number };

const SAMPLES = [
  {
    key: 'single' as const,
    pdf: 'contoh-laporan-1x.pdf',
    thumb: 'teaser-1x.png',
    title: 'Contoh laporan 1x pemeriksaan',
    checkups: [{ date: '2026-11-16 09:30:00', means: { cc: 1.0, wb: 3.5, hb: 2.6, ati: 2 } as Means }],
  },
  {
    key: 'package3' as const,
    pdf: 'contoh-laporan-paket-3x.pdf',
    thumb: 'teaser-paket-3x.png',
    title: 'Contoh laporan paket 3x',
    // three check-ups about three weeks apart, getting better over time
    checkups: [
      { date: '2026-10-05 09:30:00', means: { cc: 1.5, wb: 2.9, hb: 2.1, ati: 2 } as Means },
      { date: '2026-10-26 09:30:00', means: { cc: 1.1, wb: 3.3, hb: 2.5, ati: 2 } as Means },
      { date: '2026-11-16 09:30:00', means: { cc: 0.7, wb: 3.8, hb: 2.9, ati: 2 } as Means },
    ],
  },
];
export type SampleKey = (typeof SAMPLES)[number]['key'];

/** Same answers every build. The three safety items (cc 11-13) stay at 0 so a sample never shows an alert level. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
const answersFor = (means: Means): Record<string, number> => {
  const answers: Record<string, number> = {};
  MHCU_ITEMS.forEach((item, i) => {
    const range = MHCU_ANSWER_RANGE[item.part];
    let value = Math.round(means[item.part] + noise(i) * 0.9);
    if (item.part === 'cc' && [11, 12, 13].includes(item.n)) value = 0;
    answers[mhcuCode(item.part, item.n)] = Math.min(range.max, Math.max(range.min, value));
  });
  return answers;
};

const SAMPLE_CSS =
  '<style>' +
  // diagonal mark: faint, on top of the page but see-through, so no number or sentence is hidden
  '.sample-diag{position:absolute;left:0;right:0;top:50%;margin-top:-30pt;text-align:center;font-family:Montserrat,Arial,sans-serif;font-weight:800;font-size:56pt;line-height:60pt;letter-spacing:3pt;color:rgba(209,158,58,.16);transform:rotate(-32deg);pointer-events:none;z-index:5;white-space:nowrap}' +
  // banner in the top margin of the sheet, above the letterhead
  '.sample-bar{position:absolute;left:40pt;right:40pt;top:11pt;text-align:center;font-family:Montserrat,Arial,sans-serif;font-weight:700;font-size:6.5pt;letter-spacing:1pt;color:#9A6B12;z-index:5}' +
  '</style>';

const MARKS =
  '<div class="sample-bar">CONTOH LAPORAN (data fiktif, bukan hasil pemeriksaan nyata) · SAMPLE REPORT (fictional data)</div>' +
  '<div class="sample-diag">CONTOH · SAMPLE</div>';

function findBrowser(): string {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error('No Chrome or Edge found. Install one or set CHROME_PATH.');
  return found;
}

/** The report page as a standalone file: local font, logo as a data URI, and the sample marks on every sheet. */
export function sampleHtml(key: SampleKey): string {
  const sample = SAMPLES.find((entry) => entry.key === key)!;
  const sessions: MhcuStoredSession[] = sample.checkups.map((checkup, index) => ({
    sessionId: `sample-${index + 1}`,
    reportNo: `AT-MHCU-2026-${String(index + 1).padStart(3, '0')}`,
    participantId: 'P00000',
    submittedAt: checkup.date,
    lang: 'id',
    name: SAMPLE_NAME,
    sex: 'Perempuan (Female)',
    age: 28,
    phone: '08xxxxxxxxxx',
    email: 'contoh@example.com',
    answers: answersFor(checkup.means),
  }));
  const current = sessions[sessions.length - 1];
  const level = scoreMhcu(current.answers).level;
  const data = buildClientReportData({
    session: current,
    history: sessions,
    extras: {
      psychologist: { name: SAMPLE_PSYCHOLOGIST, sipp: null },
      note: { recommendation: MHCU_LEVELS[level].actionId, status: 'final', finalizedBy: SAMPLE_PSYCHOLOGIST },
      reportDate: REPORT_DATE,
    },
  });
  data.header.name = SAMPLE_NAME;
  const fontPath = join(PUBLIC, FONT_URL);
  const logo = readFileSync(join(PUBLIC, LOGO_URL));
  let html = renderClientReport(data, { title: SAMPLE_NAME, fontUrl: pathToFileURL(fontPath).href });
  html = html.replaceAll(`src="${LOGO_URL}"`, `src="data:image/png;base64,${logo.toString('base64')}"`);
  html = html.replace('</head>', `${SAMPLE_CSS}</head>`);
  html = html.replaceAll('<div class="page">', `<div class="page">${MARKS}`);
  return html;
}

function run(browser: string, args: string[]) {
  const result = spawnSync(browser, args, { stdio: 'pipe', timeout: 120_000 });
  if (result.status !== 0) throw new Error(`${browser} failed (${result.status}): ${String(result.stderr).slice(-400)}`);
}

function main() {
  const browser = findBrowser();
  const work = mkdtempSync(join(tmpdir(), 'mhcu-sample-'));
  mkdirSync(join(PUBLIC, 'images/email'), { recursive: true });
  try {
    for (const sample of SAMPLES) {
      const htmlFile = join(work, `${sample.key}.html`);
      writeFileSync(htmlFile, sampleHtml(sample.key), 'utf8');
      const url = pathToFileURL(htmlFile).href;
      const profile = ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${join(work, 'profile')}`, '--no-first-run'];

      const pdfOut = join(PUBLIC, 'assessments-static', sample.pdf);
      run(browser, [...profile, '--no-pdf-header-footer', '--virtual-time-budget=8000', `--print-to-pdf=${pdfOut}`, url]);
      const size = statSync(pdfOut).size;
      if (size > MAX_PDF_BYTES) throw new Error(`${sample.pdf} is ${size} bytes, over the ${MAX_PDF_BYTES} limit`);

      // first sheet only: the page box is 794 x 1123 CSS px; the scale factor makes the picture THUMB_WIDTH wide
      const thumbOut = join(PUBLIC, 'images/email', sample.thumb);
      const scale = THUMB_WIDTH / 794;
      run(browser, [...profile, `--force-device-scale-factor=${scale}`, '--window-size=794,1123', '--virtual-time-budget=8000', `--screenshot=${thumbOut}`, url]);
      console.log(`${sample.title}: ${sample.pdf} ${(size / 1024).toFixed(0)} KB, ${sample.thumb} ${(statSync(thumbOut).size / 1024).toFixed(0)} KB`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (import.meta.main) main();
