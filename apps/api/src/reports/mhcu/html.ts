/**
 * Markup helpers for the MHCU report documents (A4, 595.28pt x 841.89pt).
 *
 * The documents are table based, with inline point-sized styles, because that is the layout the
 * team's RMHCU app produces and the browser's "Save as PDF" prints it exactly as it looks on screen.
 * Every helper returns a plain HTML string. All text that reaches `run()` is HTML-escaped here, so
 * callers pass raw user text and never pre-escape it.
 */

export const FONT_URL = '/fonts/montserrat-latin-variable.woff2';
export const LOGO_URL = '/images/reports/attentive-logo.png';

export const LH = '1.2075';
export const LH_SPACER = '1.15';
export const LH_HEAD = '1.3224999999999998';
export const LH_BODY = '1.4949999999999999';

/** Escapes text for an HTML text node or a double-quoted attribute. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type Align = 'left' | 'right' | 'center' | 'justify';

export interface RunOpts {
  b?: 0 | 1 | boolean;
  i?: 0 | 1 | boolean;
}

/** One Montserrat text run. `text` is raw (unescaped). */
export function run(text: string, fs: number, color: string, o: RunOpts = {}): string {
  const style =
    'font-family:Montserrat;' +
    `font-size:${fs}pt;` +
    (o.i ? 'font-style:italic;' : '') +
    (o.b ? 'font-weight:bold;' : '') +
    `color:${color};`;
  return `<span style="${style}">${esc(text)}</span>`;
}

export interface ParaOpts {
  /** CSS margin shorthand, default "0pt 0 0pt 0". */
  m?: string;
  lh?: string;
}

/** A paragraph holding one or more already-built runs. */
export function para(al: Align, fs: number, runs: string | string[], o: ParaOpts = {}): string {
  const inner = Array.isArray(runs) ? runs.join('') : runs;
  return `<p style="margin:${o.m ?? '0pt 0 0pt 0'};text-align:${al};line-height:${o.lh ?? LH};font-size:${fs}pt;font-family:Arial">${inner}</p>`;
}

function emptyPara(fs: number, lh: string): string {
  return `<p style="margin:0pt 0 0pt 0;text-align:left;line-height:${lh};font-size:${fs}pt;font-family:Arial"><span style="font-size:${fs}pt">&#8203;</span></p>`;
}

/** Vertical gap between blocks (an empty paragraph of the given point size). */
export const sp = (fs: number): string => emptyPara(fs, LH_SPACER);
/** Empty paragraph inside a cell (gives colour bars and spacer cells their height). */
export const zp = (fs: number): string => emptyPara(fs, LH);

export const img = (src: string, w: number, h: number): string =>
  `<img src="${esc(src)}" style="width:${w}pt;height:${h}pt;vertical-align:middle">`;

const NO_BORDER = '0pt solid transparent';

/** A fixed-width table cell. `bd` is a full CSS border value, default none. */
export function td(
  w: number,
  bg: string,
  pd: string,
  va: 'top' | 'middle' | 'bottom',
  content: string | string[],
  bd: string = NO_BORDER,
): string {
  const inner = Array.isArray(content) ? content.join('') : content;
  return `<td style="border:${bd};width:${w}pt;max-width:${w}pt;padding:${pd};background:${bg};vertical-align:${va}">${inner}</td>`;
}

/** A fixed-layout table; each row is a list of `td()` strings. */
export function table(rows: string[][]): string {
  return `<table style="border-collapse:collapse;table-layout:fixed;margin:0">${rows.map((r) => `<tr>${r.join('')}</tr>`).join('')}</table>`;
}

export const div = (cls: string, content: string | string[]): string =>
  `<div class="${cls}">${Array.isArray(content) ? content.join('') : content}</div>`;

/** One A4 page: body content plus the footer pinned to the bottom of the sheet. */
export function page(body: string | string[], foot: string | string[]): string {
  return div('page', [div('body', body), div('foot', foot)]);
}

export const SVG_DATA_URI = (svg: string): string =>
  `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

export interface DocumentOpts {
  title?: string;
  lang?: 'id' | 'en';
  /** Replaces the hosted font URL (tests, offline use). */
  fontUrl?: string;
}

/**
 * Wraps the pages in the full HTML document. The first two style blocks are the demo's own.
 * The `print` block is added so that "Save as PDF" gets exact A4 sheets: no grey backdrop and no
 * 16px gap under each page (the gap exists on screen only).
 */
export function documentHtml(pages: string[], o: DocumentOpts = {}): string {
  const fontUrl = o.fontUrl ?? FONT_URL;
  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    (o.title ? `<title>${esc(o.title)}</title>` : '') +
    '<style>@page{size:595.28pt 841.89pt;margin:0}body{margin:0;font-family:Arial;background:#fff}.page{position:relative;width:595.28pt;height:841.89pt;box-sizing:border-box;padding:32pt 40pt 40pt 40pt;page-break-after:always;overflow:hidden}.page .body{height:100%}.foot{position:absolute;left:40pt;right:40pt;bottom:14pt}</style>' +
    `<style>@font-face{font-family:Montserrat;font-weight:100 900;src:url(${fontUrl}) format("woff2")}html,body{background:#E9EDF2!important}.page{margin:0 0 16px 0;background:#fff}</style>` +
    '<style media="print">html,body{background:#fff!important}.page{margin:0!important}.page:last-child{page-break-after:auto}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>' +
    '</head><body>' +
    pages.join('') +
    '</body></html>'
  );
}
