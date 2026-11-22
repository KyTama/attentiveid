/**
 * MHI trend chart (T1..Tn) drawn against the four reference bands. Returns an SVG string; the
 * reports embed it as an <img> data URI so that it prints identically everywhere.
 */
import { fmtDateShort, fmtTrim, type Lang } from './common';

export interface TrendPoint {
  waveNo: number;
  /** yyyy-mm-dd */
  date: string;
  mhi: number | null;
}

const W = 1200;
const LEFT = 46;
const PLOT_W = 1136;
const TOP = 30;

/** Band edges on the 0-100 MHI scale and their fill (Perlu Perhatian Serius .. Baik). */
const BANDS: { from: number; to: number; fill: string }[] = [
  { from: 0, to: 40, fill: '#D0D5DD' },
  { from: 40, to: 55, fill: '#DDE1E7' },
  { from: 55, to: 70, fill: '#E8EBEF' },
  { from: 70, to: 100, fill: '#F4F5F7' },
];

/**
 * @param height 504 for the client report (170pt tall image), 350 for the psychologist report.
 */
export function mhiTrendSvg(points: TrendPoint[], lang: Lang, height: 504 | 350 = 504): string {
  const bottom = height - 58;
  const plotH = bottom - TOP;
  const y = (v: number) => bottom - (v / 100) * plotH;
  const n = points.length;
  const x = (i: number) => LEFT + (PLOT_W * (i + 0.5)) / n;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" font-family="Montserrat, Arial">`;
  s += `<rect width="${W}" height="${height}" fill="#fff"/>`;
  for (const b of BANDS) {
    const top = y(b.to);
    s += `<rect x="${LEFT}" y="${top}" width="${PLOT_W}" height="${y(b.from) - top}" fill="${b.fill}"/>`;
  }
  for (const tick of [0, 40, 55, 70, 100]) {
    s += `<text x="38" y="${y(tick) + 7}" font-size="20" text-anchor="end" fill="#667085">${tick}</text>`;
  }
  const plotted = points.map((p, i) => ({ p, i })).filter((q) => q.p.mhi !== null);
  s += `<polyline fill="none" stroke="#142B51" stroke-width="5" points="${plotted.map((q) => `${x(q.i)},${y(q.p.mhi as number)}`).join(' ')}"/>`;
  points.forEach((p, i) => {
    const cx = x(i);
    if (p.mhi !== null) {
      const cy = y(p.mhi);
      s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#142B51" stroke="#fff" stroke-width="3"/>`;
      s += `<text x="${cx}" y="${cy - 20}" font-size="22" font-weight="700" text-anchor="middle" fill="#142B51">${fmtTrim(p.mhi, lang)}</text>`;
    }
    s += `<text x="${cx}" y="${height - 36}" font-size="20" font-weight="700" text-anchor="middle" fill="#3C4858">T${p.waveNo}</text>`;
    s += `<text x="${cx}" y="${height - 16}" font-size="16" font-weight="400" text-anchor="middle" fill="#667085">${fmtDateShort(p.date)}</text>`;
  });
  return `${s}</svg>`;
}
