import { describe, expect, test } from 'bun:test';
import { renderClientReport } from './client-report';
import { DEMO_CLIENT } from './demo-client-data';
import { LOGO_URL } from './html';
import { wrapReportPage } from './report-page';

const single = () => renderClientReport(DEMO_CLIENT.c1);
const longitudinal = () => renderClientReport(DEMO_CLIENT.c5);
const meta = { lang: 'id' as const, name: 'Larasati Dewi', code: 'AT-MHCU-2026-114', createdAt: '2026-11-15T06:18:00.000Z', mode: 'public' as const };
const bodyOf = (html: string) => html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));

describe('report page', () => {
  test('title, name, code and the date in Jakarta time', () => {
    const html = wrapReportPage(single(), meta);
    expect(html).toContain('<h1>Laporan Hasil Pemeriksaan MHCU</h1>');
    expect(html).toContain('Larasati Dewi · AT-MHCU-2026-114 · 15 November 2026');
    expect(html).toContain('Laporan Mental Health Check-Up');
    expect(html).toContain(`src="${LOGO_URL}"`);
  });

  test('the date rolls over at midnight Jakarta time (UTC+7)', () => {
    expect(wrapReportPage(single(), { ...meta, createdAt: '2026-11-15T18:30:00.000Z' })).toContain('16 November 2026');
  });

  test('has the print and copy buttons, a status line, and the two cards', () => {
    const html = wrapReportPage(single(), meta);
    expect(html).toContain('id="rp-print"');
    expect(html).toContain('id="rp-save"');
    expect(html).toContain('Simpan sebagai PDF');
    expect(html).toContain('id="rp-lang"');
    expect(html).toContain('English version');
    expect(html).toContain('Laporan-MHCU-AT-MHCU-2026-114');
    expect(html).toContain('id="rp-copy"');
    expect(html).toContain('Salin tautan');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('<h2>Isi laporan</h2>');
    expect(html).toContain('<h2>Menyimpan laporan</h2>');
    expect(html).toContain('1 halaman A4.');
    expect(html).toContain('Tautan halaman ini bersifat pribadi');
    expect(html).toContain('window.print()');
    expect(html).toContain('navigator.clipboard.writeText(location.href)');
  });

  test('says how many pages the report has', () => {
    expect(wrapReportPage(longitudinal(), meta)).toContain('2 halaman A4: hasil terkini dan perkembangan');
  });

  test('the report pages inside are exactly what the renderer made', () => {
    const report = longitudinal();
    const wrapped = wrapReportPage(report, meta);
    expect(wrapped).toContain(bodyOf(report));
    expect((wrapped.match(/<div class="page">/g) ?? []).length).toBe(2);
    // the pages sit in their own container, after the framing
    expect(wrapped.indexOf('id="rp-pages"')).toBeGreaterThan(wrapped.indexOf('id="rp-print"'));
  });

  test('printing hides the framing and uses the plain A4 sheets', () => {
    const html = wrapReportPage(single(), meta);
    expect(html).toContain('@media print{.rp-frame,.rp-foot{display:none!important}');
    expect(html).toContain('@page{size:595.28pt 841.89pt;margin:0}');
    expect(html).toContain('<style media="print">');
    // the pages are shrunk on phones only on screen, never on paper
    expect(html).toContain("addEventListener('beforeprint'");
    expect(html).toContain('zoom:1!important');
  });

  test('works on a phone: viewport meta, one column cards, full-width buttons, pages scaled to fit', () => {
    const html = wrapReportPage(single(), meta);
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expect(html).toContain('@media (max-width:700px){.rp-cards{grid-template-columns:1fr}');
    expect(html).toContain('flex:1 1 100%');
    expect(html).toContain('clientWidth-16)/794');
  });

  test('is not indexed', () => {
    expect(wrapReportPage(single(), meta)).toContain('<meta name="robots" content="noindex, nofollow">');
  });

  test('English page', () => {
    const html = wrapReportPage(renderClientReport(DEMO_CLIENT.c1en), { ...meta, lang: 'en', name: 'Kevin Wijaya', code: 'AT-MHCU-2026-115' });
    expect(html).toContain('<h1>MHCU Assessment Report</h1>');
    expect(html).toContain('Save as PDF');
    expect(html).toContain('Versi Bahasa Indonesia');
    expect(html).toContain('Copy link');
    expect(html).toContain('What is in the report');
    expect(html).toContain('15 November 2026');
    expect(html).toContain('Keeping the report');
    expect(html).toContain('1 A4 page.');
  });

  test('the staff preview says so, has no copy button and no "private link" sentence', () => {
    const html = wrapReportPage(single(), { ...meta, mode: 'staff' });
    expect(html).toContain('Pratinjau untuk staf.');
    expect(html).toContain('id="rp-print"');
    expect(html).not.toContain('id="rp-copy"');
    expect(html).not.toContain('Tautan halaman ini bersifat pribadi');
  });

  test('user text is escaped in the framing', () => {
    const evil = '<img src=x onerror=alert(1)>"&';
    const html = wrapReportPage(single(), { ...meta, name: evil, code: evil });
    const frame = html.slice(html.indexOf('<div class="rp-frame">'), html.indexOf('id="rp-pages"'));
    expect(frame).not.toContain('<img src=x');
    expect(frame).toContain('&lt;img src=x onerror=alert(1)&gt;&quot;&amp;');
  });

  test('refuses something that is not a complete report document', () => {
    expect(() => wrapReportPage('<p>no body</p>', meta)).toThrow();
  });

  test('loads no scripts from outside, and uses only the one inline script', () => {
    const html = wrapReportPage(single(), meta);
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect((html.match(/<script>/g) ?? []).length).toBe(1);
  });
});
