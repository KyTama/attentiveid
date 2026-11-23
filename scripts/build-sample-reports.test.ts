import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sampleHtml } from './build-sample-reports';

const PUBLIC = resolve(import.meta.dir, '../apps/web/public');
const pages = (html: string) => (html.match(/<div class="page">/g) ?? []).length;

describe('sample reports', () => {
  test('single check-up: one sheet, fictional name, marked CONTOH / SAMPLE', () => {
    const html = sampleHtml('c1');
    expect(pages(html)).toBe(1);
    expect(html).toContain('Nama Peserta (contoh)');
    expect(html).not.toContain('Larasati Dewi');
    expect(html.match(/class="sample-diag"/g)?.length).toBe(1);
    expect(html.match(/class="sample-bar"/g)?.length).toBe(1);
    expect(html).toContain('CONTOH LAPORAN');
    // the numbers stay
    expect(html).toContain('77,5');
  });

  test('over time: every sheet is marked, numbers and wave dates stay', () => {
    const html = sampleHtml('c5');
    expect(pages(html)).toBe(2);
    expect(html).not.toContain('Nadia Putri Lestari');
    expect(html.match(/class="sample-diag"/g)?.length).toBe(2);
    expect(html).toContain('76,1');
    expect(html).toContain('T1 sampai T5');
  });

  test('the page is self-contained (logo inline, font from a local file)', () => {
    const html = sampleHtml('c1');
    expect(html).toContain('src="data:image/png;base64,');
    expect(html).toContain('url(file:///');
  });

  test('the marks sit in the margin or are see-through, never opaque over the content', () => {
    const html = sampleHtml('c1');
    expect(html).toContain('rgba(209,158,58,.16)');
    expect(html).toContain('pointer-events:none');
  });

  const files: [string, number][] = [
    ['assessments-static/contoh-laporan-1x.pdf', 1],
    ['assessments-static/contoh-laporan-paket-3x.pdf', 2],
  ];
  for (const [file, sheets] of files) {
    test(`${file} exists, is a PDF under 1.5 MB with ${sheets} A4 sheet(s)`, () => {
      const path = join(PUBLIC, file);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeLessThan(1.5 * 1024 * 1024);
      const bytes = readFileSync(path).toString('latin1');
      expect(bytes.startsWith('%PDF')).toBe(true);
      expect((bytes.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(sheets);
      expect(bytes).toMatch(/\/MediaBox\s*\[0 0 594\.9\d* 841\.9\d*\]/);
    });
  }

  for (const thumb of ['images/email/teaser-1x.png', 'images/email/teaser-paket-3x.png']) {
    test(`${thumb} is a PNG about 520 px wide`, () => {
      const bytes = readFileSync(join(PUBLIC, thumb));
      expect(bytes.subarray(1, 4).toString()).toBe('PNG');
      expect(bytes.readUInt32BE(16)).toBe(520);
      expect(bytes.readUInt32BE(20)).toBeGreaterThan(700);
    });
  }
});
