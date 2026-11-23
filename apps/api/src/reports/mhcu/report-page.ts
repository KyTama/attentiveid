/**
 * The page a person lands on for a finished MHCU report: logo header, title with name, code and date, the two action buttons
 * (print / save as PDF, copy link), a short note of what the report holds and how to keep it, and then the A4 pages themselves.
 *
 * It only WRAPS the output of `renderClientReport` (the report pages stay byte for byte as the team's demo has them). On paper
 * the framing is hidden, so "Print / Save as PDF" gives clean A4 sheets. Layout follows the team's report-access page (uK) and the
 * Big 10 result page.
 */
import { fmtDate, type Lang } from './common';
import { LOGO_URL, esc } from './html';

export interface ReportPageMeta {
  lang: Lang;
  name: string;
  code: string;
  /** When the check-up was taken (ISO timestamp); shown as a date in Jakarta time. */
  createdAt: string;
  /** public = the participant's own page (link can be copied); staff = the preview in the portal. */
  mode: 'public' | 'staff';
}

const TEXT = {
  kicker: { id: 'Laporan Mental Health Check-Up', en: 'Mental Health Check-Up Report' },
  title: { id: 'Laporan Hasil Pemeriksaan MHCU', en: 'MHCU Assessment Report' },
  print: { id: 'Cetak / Simpan sebagai PDF', en: 'Print / Save as PDF' },
  copy: { id: 'Salin tautan', en: 'Copy link' },
  copied: { id: 'Tautan disalin.', en: 'Link copied.' },
  copyFailed: { id: 'Tautan tidak bisa disalin otomatis. Salin dari kolom alamat browser.', en: 'The link could not be copied automatically. Copy it from the address bar.' },
  inside: { id: 'Isi laporan', en: 'What is in the report' },
  keep: { id: 'Menyimpan laporan', en: 'Keeping the report' },
  staffRibbon: {
    id: 'Pratinjau untuk staf. Peserta menerima halaman ini setelah laporan dirilis.',
    en: 'Preview for staff. The participant receives this page once the report is released.',
  },
  privateLink: { id: 'Tautan halaman ini bersifat pribadi. Jangan bagikan ke orang lain.', en: 'The link to this page is private. Do not share it with anyone else.' },
  footer: { id: 'Biro Psikologi Attentive', en: 'Attentive Psychology Bureau' },
} as const;

const insideText = (pages: number, lang: Lang): string =>
  lang === 'id'
    ? `Hasil per indeks (Distress, Well-being, Behavioral Health) dan Mental Health Index, nilai rujukan, serta keterangan dan rekomendasi dari psikolog Attentive. ${pages > 1 ? `${pages} halaman A4: hasil terkini dan perkembangan dari pemeriksaan ke pemeriksaan.` : '1 halaman A4.'}`
    : `Your results per index (Distress, Well-being, Behavioral Health) and the Mental Health Index, reference values, plus notes and recommendations from an Attentive psychologist. ${pages > 1 ? `${pages} A4 pages: the latest result and progress from one check-up to the next.` : '1 A4 page.'}`;

const keepText = (lang: Lang): string =>
  lang === 'id'
    ? 'Tekan "Cetak / Simpan sebagai PDF", lalu pilih "Simpan sebagai PDF" sebagai printer. Gunakan ukuran A4 dan matikan header serta footer browser agar halaman tercetak rapi.'
    : 'Press "Print / Save as PDF", then choose "Save as PDF" as the printer. Use A4 and turn off the browser header and footer so the pages print cleanly.';

const CSS = `
.rp-frame{font-family:Montserrat,'Segoe UI',Arial,sans-serif;color:#1B2533;-webkit-font-smoothing:antialiased}
.rp-frame *{box-sizing:border-box}
.rp-hd{background:#fff;border-bottom:1px solid #DCE2EA}
.rp-hd .in{max-width:860px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:14px}
.rp-hd img{height:30px;display:block}
.rp-hd small{flex:1;text-align:right;font-size:10.5px;letter-spacing:1.6px;font-weight:700;color:#667085;text-transform:uppercase}
.rp-rule{height:2px;background:#142B51}
.rp-ribbon{background:#FFF7E0;border-bottom:1px solid #F0DDA5;color:#6B4E0A;font-size:12.5px;padding:8px 20px;text-align:center}
.rp-intro{max-width:860px;margin:0 auto;padding:22px 20px 6px}
.rp-intro h1{font-size:24px;line-height:1.3;color:#142B51;margin:0 0 4px;letter-spacing:-.3px}
.rp-meta{margin:0;color:#667085;font-size:13.5px;overflow-wrap:anywhere}
.rp-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:16px 0 4px}
.rp-btn{min-height:44px;padding:0 20px;border-radius:8px;border:1px solid #DCE2EA;background:#fff;color:#142B51;font:700 14px Montserrat,Arial,sans-serif;cursor:pointer}
.rp-btn.pri{background:#142B51;border-color:#142B51;color:#fff}
.rp-btn:focus-visible{outline:2px solid #142B51;outline-offset:2px}
.rp-status{font-size:13px;color:#1E6B42;font-weight:600}
.rp-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0 4px}
.rp-card{background:#fff;border:1px solid #DCE2EA;border-radius:10px;padding:16px 18px;font-size:13.5px;line-height:1.55}
.rp-card h2{font-size:14px;color:#142B51;margin:0 0 6px}
.rp-card p{margin:0 0 8px}
.rp-card p:last-child{margin-bottom:0}
.rp-pages{display:flex;flex-direction:column;align-items:center;padding:18px 0 28px}
.rp-foot{max-width:860px;margin:0 auto;padding:0 20px 28px;font-family:Montserrat,Arial,sans-serif;font-size:12px;color:#667085}
@media (max-width:700px){.rp-cards{grid-template-columns:1fr}.rp-intro h1{font-size:21px}.rp-btn{flex:1 1 100%}}
@media print{.rp-frame,.rp-foot{display:none!important}.rp-pages{display:block;padding:0;zoom:1!important}}
`;

const SCRIPT = (texts: { copied: string; copyFailed: string }) => `
(function(){
  var pages=document.getElementById('rp-pages');
  function fit(){var z=Math.min(1,(document.documentElement.clientWidth-16)/794);pages.style.zoom=z<1?String(z):'';}
  fit();window.addEventListener('resize',fit);
  window.addEventListener('beforeprint',function(){pages.style.zoom='';});window.addEventListener('afterprint',fit);
  var status=document.getElementById('rp-status');
  var say=function(m){if(status){status.textContent=m;}};
  var print=document.getElementById('rp-print');if(print){print.addEventListener('click',function(){window.print();});}
  var copy=document.getElementById('rp-copy');
  if(copy){copy.addEventListener('click',function(){
    var done=function(){say(${JSON.stringify(texts.copied)});};
    var fail=function(){say(${JSON.stringify(texts.copyFailed)});};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(done,fail);}else{fail();}
  });}
})();`;

/** Wraps a rendered client report (full HTML document) in the report page; the report's own pages are left untouched. */
export function wrapReportPage(reportHtml: string, meta: ReportPageMeta): string {
  const bodyStart = reportHtml.indexOf('<body>');
  const bodyEnd = reportHtml.lastIndexOf('</body>');
  if (bodyStart < 0 || bodyEnd < bodyStart) throw new Error('Expected a complete report document');
  const head = reportHtml.slice(0, bodyStart);
  const pagesHtml = reportHtml.slice(bodyStart + '<body>'.length, bodyEnd);
  const pageCount = (pagesHtml.match(/<div class="page">/g) ?? []).length;
  const l = meta.lang;
  const date = fmtDate(new Date(new Date(meta.createdAt).getTime() + 7 * 3600_000).toISOString().slice(0, 10), l);

  const headWithMeta = head
    .replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">')
    .replace('</head>', `<style>${CSS}</style></head>`);

  const frame =
    `<div class="rp-frame">` +
    `<header class="rp-hd"><div class="in"><img alt="attentive." height="30" src="${esc(LOGO_URL)}"><small>${esc(TEXT.kicker[l])}</small></div><div class="rp-rule"></div></header>` +
    (meta.mode === 'staff' ? `<div class="rp-ribbon" role="note">${esc(TEXT.staffRibbon[l])}</div>` : '') +
    `<div class="rp-intro">` +
    `<h1>${esc(TEXT.title[l])}</h1>` +
    `<p class="rp-meta">${esc(meta.name)} · ${esc(meta.code)} · ${esc(date)}</p>` +
    `<div class="rp-actions"><button class="rp-btn pri" id="rp-print" type="button">${esc(TEXT.print[l])}</button>` +
    (meta.mode === 'public' ? `<button class="rp-btn" id="rp-copy" type="button">${esc(TEXT.copy[l])}</button>` : '') +
    `<span aria-live="polite" class="rp-status" id="rp-status" role="status"></span></div>` +
    `<div class="rp-cards">` +
    `<section class="rp-card"><h2>${esc(TEXT.inside[l])}</h2><p>${esc(insideText(pageCount, l))}</p></section>` +
    `<section class="rp-card"><h2>${esc(TEXT.keep[l])}</h2><p>${esc(keepText(l))}</p>${meta.mode === 'public' ? `<p>${esc(TEXT.privateLink[l])}</p>` : ''}</section>` +
    `</div></div></div>`;

  return (
    `${headWithMeta}<body>${frame}<main class="rp-pages" id="rp-pages">${pagesHtml}</main>` +
    `<div class="rp-foot">${esc(TEXT.footer[l])} | attentiveid.com | contact@attentiveid.com | WhatsApp +62 851-5641-0912</div>` +
    `<script>${SCRIPT({ copied: TEXT.copied[l], copyFailed: TEXT.copyFailed[l] })}</script></body></html>`
  );
}
