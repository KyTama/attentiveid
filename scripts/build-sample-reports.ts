/**
 * Builds the two sample MHCU reports that the result e-mail links to, plus a first-page thumbnail of each.
 *
 *   bun scripts/build-sample-reports.ts
 *
 * Output (committed, served as static files):
 *   apps/web/public/assessments-static/contoh-laporan-1x.pdf        single check-up (demo data "c1")
 *   apps/web/public/assessments-static/contoh-laporan-paket-3x.pdf  over time, T1..T5 (demo data "c5")
 *   apps/web/public/images/email/teaser-1x.png                      first page, about 520 px wide
 *   apps/web/public/images/email/teaser-paket-3x.png
 *
 * The data is the team's fictional demo data; only the name is replaced ("Nama Peserta (contoh)").
 * Every page carries a CONTOH / SAMPLE mark. The PDF is printed by headless Chrome or Edge (found automatically, or set
 * CHROME_PATH). Needs no network and no database.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderClientReport } from '../apps/api/src/reports/mhcu/client-report';
import { DEMO_CLIENT } from '../apps/api/src/reports/mhcu/demo-client-data';
import { FONT_URL, LOGO_URL } from '../apps/api/src/reports/mhcu/html';

const ROOT = resolve(import.meta.dir, '..');
const PUBLIC = join(ROOT, 'apps/web/public');
const MAX_PDF_BYTES = 1.5 * 1024 * 1024;
const SAMPLE_NAME = 'Nama Peserta (contoh)';
/** Thumbnail width in pixels; an A4 page is 794 CSS pixels wide. */
const THUMB_WIDTH = 520;

const SAMPLES = [
  { key: 'c1' as const, pdf: 'contoh-laporan-1x.pdf', thumb: 'teaser-1x.png', title: 'Contoh laporan 1x pemeriksaan' },
  { key: 'c5' as const, pdf: 'contoh-laporan-paket-3x.pdf', thumb: 'teaser-paket-3x.png', title: 'Contoh laporan paket 3x' },
];

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
export function sampleHtml(key: (typeof SAMPLES)[number]['key']): string {
  const data = structuredClone(DEMO_CLIENT[key]);
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
