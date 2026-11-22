import { describe, expect, it } from 'bun:test'
import { MHCU_ITEMS, scoreMhcu } from './mhcu'
import {
  buildClientReportData,
  buildExplanation,
  buildLevelReason,
  buildPsychologistReportData,
  formatLongDate,
  formatOneDecimal,
  referenceRangesText,
  reportSex,
  type MhcuReportBuildInput,
  type MhcuStoredSession,
} from './mhcu-report-builders'
import { buildHistory } from './mhcu-longitudinal'
import type { MhcuClientReportData, MhcuPsychologistReportData } from './mhcu-report-data'

/* The fixtures of the Designer (apps/api/src/reports/mhcu/demo-*.ts) are loaded at run time: they live in another package. */
const dir = new URL('../../../../apps/api/src/reports/mhcu/', import.meta.url).href
const DEMO_CLIENT = (await import(`${dir}demo-client-data.ts`)).DEMO_CLIENT as Record<string, MhcuClientReportData>
const DEMO_PSY = (await import(`${dir}demo-psychologist-data.ts`)).DEMO_PSYCHOLOGIST as Record<string, MhcuPsychologistReportData>

/* The demo database (RMHCU_Demo_Lengkap_v7.html, DB.sessions + DB.responses_long): 29 sessions of 13 fictional participants.
   `answers` = 58 digits in form order (CC01..CC23, WB01..WB14, HB01..HB15, ATI01..ATI06), '-' = unanswered;
   `db` = the scores the demo's database holds for the session. */
interface Fx {
  sessionId: string
  reportNo: string
  participantId: string
  submittedAt: string
  lang: 'id' | 'en'
  name: string
  sex: string
  age: number
  phone: string
  email: string
  psychologist: string
  answers: string
  db: { mhi: number; level: number; di: number; wi: number; bhi: number; wb: number; wiDims: number[]; bhiDims: number[]; ati: number; flagged: number }
}

const SESSIONS: Fx[] = [
  {sessionId:'S20260731100000454B',reportNo:'AT-MHCU-2026-094',participantId:'P00001',submittedAt:'2026-07-31 10:00:00',lang:'id',name:'Nadia Putri Lestari',sex:'Perempuan (Female)',age:27,phone:'081234567890',email:'nadia.lestari@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'2221133222000223222100032332233212322232122322110203222132',db:{mhi:46.08,level:3,di:40.38,wi:33.93,bhi:43.33,wb:33,wiDims:[41.67,28.13,41.67],bhiDims:[50,20,66.67],ati:50,flagged:9}},
  {sessionId:'S202608120655008AF4',reportNo:'AT-MHCU-2026-095',participantId:'P00002',submittedAt:'2026-08-12 06:55:00',lang:'id',name:'Dimas Hidayat',sex:'Laki-laki (Male)',age:29,phone:'081955566677',email:'dimas.h@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1021112111000112010210033343443433243223222412331213333223',db:{mhi:62.32,level:3,di:28.85,wi:57.14,bhi:55,wb:46,wiDims:[50,59.38,58.33],bhiDims:[57.14,50,58.33],ati:66.67,flagged:5}},
  {sessionId:'S20260822092300385C',reportNo:'AT-MHCU-2026-096',participantId:'P00003',submittedAt:'2026-08-22 09:23:00',lang:'id',name:'Bima Saputra',sex:'Laki-laki (Male)',age:31,phone:'081298765431',email:'bima.saputra@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'0110010111000110111113044444434434455323332333322322123223',db:{mhi:73.77,level:2,di:23.08,wi:75,bhi:65,wb:56,wiDims:[83.33,71.88,75],bhiDims:[71.43,60,58.33],ati:54.17,flagged:1}},
  {sessionId:'S202608280947000EC4',reportNo:'AT-MHCU-2026-097',participantId:'P00001',submittedAt:'2026-08-28 09:47:00',lang:'id',name:'Nadia Putri Lestari',sex:'Perempuan (Female)',age:27,phone:'081234567890',email:'nadia.lestari@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'2221221212000211212100044232233333333142123221210212333233',db:{mhi:54.11,level:3,di:34.62,wi:48.21,bhi:43.33,wb:41,wiDims:[50,46.88,50],bhiDims:[42.86,30,66.67],ati:70.83,flagged:8}},
  {sessionId:'S20260909064200C8D0',reportNo:'AT-MHCU-2026-098',participantId:'P00002',submittedAt:'2026-09-09 06:42:00',lang:'id',name:'Dimas Hidayat',sex:'Laki-laki (Male)',age:29,phone:'081955566677',email:'dimas.h@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1232121221000122222200033232222233232223312333320203234223',db:{mhi:49.57,level:3,di:38.46,wi:35.71,bhi:53.33,wb:34,wiDims:[33.33,37.5,33.33],bhiDims:[67.86,35,50],ati:66.67,flagged:9}},
  {sessionId:'S20260911084600D121',reportNo:'AT-MHCU-2026-099',participantId:'P00004',submittedAt:'2026-09-11 08:46:00',lang:'id',name:'Sari Wulandari',sex:'Perempuan (Female)',age:24,phone:'085711223344',email:'sari.w@example.com',psychologist:'Putri Dewinta, M.Psi., Psikolog.',answers:'0111111211000011101100034343433444433322243223232323243333',db:{mhi:70.74,level:2,di:17.31,wi:62.5,bhi:63.33,wb:49,wiDims:[50,62.5,75],bhiDims:[60.71,60,75],ati:75,flagged:1}},
  {sessionId:'S20260918080900E9FB',reportNo:'AT-MHCU-2026-100',participantId:'P00005',submittedAt:'2026-09-18 08:09:00',lang:'id',name:'Rizky Pratama',sex:'Laki-laki (Male)',age:22,phone:'081377788899',email:'rizky.p@example.com',psychologist:'Valencia Yang, S.Psi, M.Psi, Psikolog',answers:'4322232323200343333300022222122223221113213112210202233233',db:{mhi:32,level:5,di:61.54,wi:23.21,bhi:36.67,wb:27,wiDims:[16.67,25,25],bhiDims:[46.43,25,33.33],ati:66.67,flagged:10}},
  {sessionId:'S20260921091000BDCC',reportNo:'AT-MHCU-2026-101',participantId:'P00003',submittedAt:'2026-09-21 09:10:00',lang:'id',name:'Bima Saputra',sex:'Laki-laki (Male)',age:31,phone:'081298765431',email:'bima.saputra@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'2111012011010121111103043345443343344123332222231422333222',db:{mhi:64.68,level:4,di:32.69,wi:66.07,bhi:56.67,wb:51,wiDims:[66.67,68.75,58.33],bhiDims:[53.57,60,58.33],ati:62.5,flagged:4}},
  {sessionId:'S2026092507560047BC',reportNo:'AT-MHCU-2026-102',participantId:'P00005',submittedAt:'2026-09-25 07:56:00',lang:'id',name:'Rizky Pratama',sex:'Laki-laki (Male)',age:22,phone:'081377788899',email:'rizky.p@example.com',psychologist:'Valencia Yang, S.Psi, M.Psi, Psikolog',answers:'2222132132100332223200033233212333222132122222321201332342',db:{mhi:42.95,level:5,di:50,wi:35.71,bhi:43.33,wb:34,wiDims:[33.33,34.38,41.67],bhiDims:[42.86,40,50],ati:70.83,flagged:10}},
  {sessionId:'S202609250934007400',reportNo:'AT-MHCU-2026-103',participantId:'P00001',submittedAt:'2026-09-25 09:34:00',lang:'id',name:'Nadia Putri Lestari',sex:'Perempuan (Female)',age:27,phone:'081234567890',email:'nadia.lestari@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1011121122000122111200034433533343333323122321112212323224',db:{mhi:61.37,level:3,di:28.85,wi:58.93,bhi:46.67,wb:47,wiDims:[58.33,62.5,50],bhiDims:[53.57,35,50],ati:66.67,flagged:5}},
  {sessionId:'S202610010732007A84',reportNo:'AT-MHCU-2026-104',participantId:'P00006',submittedAt:'2026-10-01 07:32:00',lang:'en',name:'Ayu Kartika',sex:'Perempuan (Female)',age:35,phone:'082144556677',email:'ayu.kartika@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1221122222000122112210032332433342334233323122221222333444',db:{mhi:56.82,level:3,di:34.62,wi:50,bhi:53.33,wb:42,wiDims:[58.33,46.88,50],bhiDims:[57.14,45,58.33],ati:87.5,flagged:8}},
  {sessionId:'S2026100706290008F8',reportNo:'AT-MHCU-2026-105',participantId:'P00002',submittedAt:'2026-10-07 06:29:00',lang:'id',name:'Dimas Hidayat',sex:'Laki-laki (Male)',age:29,phone:'081955566677',email:'dimas.h@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'2110011122000111121200033433343433433243332233321213333333',db:{mhi:65.19,level:3,di:25,wi:57.14,bhi:61.67,wb:46,wiDims:[58.33,53.13,66.67],bhiDims:[64.29,45,83.33],ati:75,flagged:4}},
  {sessionId:'S202610110833007E05',reportNo:'AT-MHCU-2026-106',participantId:'P00004',submittedAt:'2026-10-11 08:33:00',lang:'id',name:'Sari Wulandari',sex:'Perempuan (Female)',age:24,phone:'085711223344',email:'sari.w@example.com',psychologist:'Putri Dewinta, M.Psi., Psikolog.',answers:'0111111121000211121100034323434344333333242143341112222243',db:{mhi:65.19,level:3,di:25,wi:57.14,bhi:61.67,wb:46,wiDims:[50,65.63,41.67],bhiDims:[64.29,50,75],ati:62.5,flagged:3}},
  {sessionId:'S20261016074300E482',reportNo:'AT-MHCU-2026-107',participantId:'P00005',submittedAt:'2026-10-16 07:43:00',lang:'id',name:'Rizky Pratama',sex:'Laki-laki (Male)',age:22,phone:'081377788899',email:'rizky.p@example.com',psychologist:'Valencia Yang, S.Psi, M.Psi, Psikolog',answers:'2121011222001222222200032333233332343222312331220212422433',db:{mhi:52.52,level:4,di:38.46,wi:46.43,bhi:46.67,wb:40,wiDims:[50,43.75,50],bhiDims:[57.14,35,41.67],ati:75,flagged:9}},
  {sessionId:'S2026102108570083B8',reportNo:'AT-MHCU-2026-108',participantId:'P00003',submittedAt:'2026-10-21 08:57:00',lang:'id',name:'Bima Saputra',sex:'Laki-laki (Male)',age:31,phone:'081298765431',email:'bima.saputra@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'2121111212000212122213023233233332433223222232231222323232',db:{mhi:52.37,level:3,di:40.38,wi:44.64,bhi:53.33,wb:39,wiDims:[33.33,43.75,58.33],bhiDims:[57.14,50,50],ati:62.5,flagged:9}},
  {sessionId:'S202610230921003FE6',reportNo:'AT-MHCU-2026-109',participantId:'P00001',submittedAt:'2026-10-23 09:21:00',lang:'id',name:'Nadia Putri Lestari',sex:'Perempuan (Female)',age:27,phone:'081234567890',email:'nadia.lestari@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1111011111000211101100033443344443444343223333231213324323',db:{mhi:71.4,level:2,di:19.23,wi:66.07,bhi:63.33,wb:51,wiDims:[66.67,62.5,75],bhiDims:[71.43,45,75],ati:70.83,flagged:1}},
  {sessionId:'S202610300719003B93',reportNo:'AT-MHCU-2026-110',participantId:'P00006',submittedAt:'2026-10-30 07:19:00',lang:'en',name:'Ayu Kartika',sex:'Perempuan (Female)',age:35,phone:'082144556677',email:'ayu.kartika@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1121111220000111111200033342335533333332133232321314323324',db:{mhi:64.09,level:3,di:26.92,wi:57.14,bhi:60,wb:46,wiDims:[50,53.13,75],bhiDims:[57.14,50,83.33],ati:70.83,flagged:4}},
  {sessionId:'S202611050616006D34',reportNo:'AT-MHCU-2026-111',participantId:'P00002',submittedAt:'2026-11-05 06:16:00',lang:'id',name:'Dimas Hidayat',sex:'Laki-laki (Male)',age:29,phone:'081955566677',email:'dimas.h@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1101110211000120011100044333334342443333232222232312233323',db:{mhi:67.55,level:2,di:19.23,wi:58.93,bhi:58.33,wb:47,wiDims:[58.33,59.38,58.33],bhiDims:[57.14,55,66.67],ati:66.67,flagged:2}},
  {sessionId:'S20261110082000E052',reportNo:'AT-MHCU-2026-112',participantId:'P00004',submittedAt:'2026-11-10 08:20:00',lang:'id',name:'Sari Wulandari',sex:'Perempuan (Female)',age:24,phone:'085711223344',email:'sari.w@example.com',psychologist:'Putri Dewinta, M.Psi., Psikolog.',answers:'1111111101000011110000043443334334434333332234443323333333',db:{mhi:73.85,level:1,di:15.38,wi:62.5,bhi:75,wb:49,wiDims:[75,56.25,66.67],bhiDims:[71.43,80,75],ati:75,flagged:0}},
  {sessionId:'S20261113073000453B',reportNo:'AT-MHCU-2026-113',participantId:'P00005',submittedAt:'2026-11-13 07:30:00',lang:'id',name:'Rizky Pratama',sex:'Laki-laki (Male)',age:22,phone:'081377788899',email:'rizky.p@example.com',psychologist:'Valencia Yang, S.Psi, M.Psi, Psikolog',answers:'1111212221000112122101043332322333433323232223220212334222',db:{mhi:56.54,level:3,di:32.69,wi:48.21,bhi:51.67,wb:41,wiDims:[58.33,40.63,58.33],bhiDims:[60.71,35,58.33],ati:66.67,flagged:7}},
  {sessionId:'S20261115061800F88E',reportNo:'AT-MHCU-2026-114',participantId:'P00007',submittedAt:'2026-11-15 06:18:00',lang:'id',name:'Larasati Dewi',sex:'Perempuan (Female)',age:41,phone:'081122233344',email:'laras.dewi@example.com',psychologist:'Ni Putu Mayda A. A, M.Psi., Psikolog.',answers:'0111110001000010110010054544344444354243234422222423423344',db:{mhi:77.46,level:2,di:17.31,wi:76.79,bhi:68.33,wb:57,wiDims:[91.67,75,66.67],bhiDims:[67.86,60,83.33],ati:83.33,flagged:1}},
  {sessionId:'S202611160541004D51',reportNo:'AT-MHCU-2026-115',participantId:'P00008',submittedAt:'2026-11-16 05:41:00',lang:'en',name:'Kevin Wijaya',sex:'Laki-laki (Male)',age:26,phone:'087812341234',email:'kevin.wijaya@example.com',psychologist:'Anggita Panjaitan, M.Psi., Psikolog',answers:'2121102121000111111100033332443234233333222133231112232322',db:{mhi:59.9,level:3,di:26.92,wi:50,bhi:53.33,wb:42,wiDims:[50,56.25,33.33],bhiDims:[60.71,40,58.33],ati:58.33,flagged:4}},
  {sessionId:'S202611170504008FC6',reportNo:'AT-MHCU-2026-116',participantId:'P00009',submittedAt:'2026-11-17 05:04:00',lang:'id',name:'Putri Anggraini',sex:'Perempuan (Female)',age:19,phone:'089612345678',email:'putri.ang@example.com',psychologist:'Valencia Yang, S.Psi, M.Psi, Psikolog',answers:'3332222222100232233300021232212222232221222223210112323332',db:{mhi:38.33,level:5,di:50,wi:25,bhi:41.67,wb:28,wiDims:[25,21.88,33.33],bhiDims:[50,25,50],ati:66.67,flagged:10}},
  {sessionId:'S202611180427006852',reportNo:'AT-MHCU-2026-117',participantId:'P00010',submittedAt:'2026-11-18 04:27:00',lang:'id',name:'Fajar Nugroho',sex:'Laki-laki (Male)',age:38,phone:'081311122233',email:'fajar.n@example.com',psychologist:'Gisella Tani Pratiwi, M.Psi., Psikolog',answers:'1121121121000121112103043323434433334243333343332223222222',db:{mhi:63.34,level:3,di:34.62,wi:57.14,bhi:71.67,wb:46,wiDims:[66.67,56.25,50],bhiDims:[75,60,83.33],ati:50,flagged:6}},
  {sessionId:'S20261118084400D7A5',reportNo:'AT-MHCU-2026-118',participantId:'P00003',submittedAt:'2026-11-18 08:44:00',lang:'id',name:'Bima Saputra',sex:'Laki-laki (Male)',age:31,phone:'081298765431',email:'bima.saputra@example.com',psychologist:'',answers:'2321222323000222222313033323233222332223222312211213423331',db:{mhi:44.61,level:3,di:51.92,wi:39.29,bhi:48.33,wb:36,wiDims:[41.67,40.63,33.33],bhiDims:[53.57,35,58.33],ati:66.67,flagged:11}},
  {sessionId:'S202611190236009B85',reportNo:'AT-MHCU-2026-119',participantId:'P00011',submittedAt:'2026-11-19 02:36:00',lang:'id',name:'Rani Maharani',sex:'Perempuan (Female)',age:16,phone:'081566677788',email:'rani.m@example.com',psychologist:'',answers:'1112122231000220212111034442433233323332333333333311343322',db:{mhi:59.43,level:3,di:36.54,wi:51.79,bhi:66.67,wb:43,wiDims:[58.33,50,50],bhiDims:[71.43,65,58.33],ati:70.83,flagged:8}},
  {sessionId:'S202611190313006757',reportNo:'AT-MHCU-2026-120',participantId:'P00012',submittedAt:'2026-11-19 03:13:00',lang:'id',name:'Andini Rahmawati',sex:'Perempuan (Female)',age:30,phone:'081244455566',email:'andini.r@example.com',psychologist:'',answers:'1110110111000110110100044443445444443344432434344413334423',db:{mhi:78.26,level:1,di:19.23,wi:73.21,bhi:83.33,wb:55,wiDims:[66.67,75,75],bhiDims:[85.71,80,83.33],ati:79.17,flagged:0}},
  {sessionId:'S202611190350008D4A',reportNo:'AT-MHCU-2026-121',participantId:'P00013',submittedAt:'2026-11-19 03:50:00',lang:'id',name:'Maya Salsabila',sex:'Perempuan (Female)',age:28,phone:'085233344455',email:'maya.salsa@example.com',psychologist:'',answers:'1221012231001212122200043232323334233432222324122112432333',db:{mhi:54.19,level:4,di:38.46,wi:46.43,bhi:55,wb:40,wiDims:[50,46.88,41.67],bhiDims:[67.86,35,58.33],ati:75,flagged:8}},
  {sessionId:'S2026112009080055DB',reportNo:'AT-MHCU-2026-122',participantId:'P00001',submittedAt:'2026-11-20 09:08:00',lang:'id',name:'Nadia Putri Lestari',sex:'Perempuan (Female)',age:27,phone:'081234567890',email:'nadia.lestari@example.com',psychologist:'Syazka Kirani Narindra, M.Psi., Psikolog.',answers:'1100012110000101112000044444444443544333333323430222222343',db:{mhi:76.08,level:2,di:17.31,wi:75,bhi:65,wb:56,wiDims:[75,71.88,83.33],bhiDims:[71.43,55,66.67],ati:66.67,flagged:2}},
]

const stored = (fx: Fx, lang: 'id' | 'en' = fx.lang): MhcuStoredSession => {
  const answers: Record<string, number> = {}
  MHCU_ITEMS.forEach((it, i) => {
    const ch = fx.answers[i] as string
    if (ch !== '-') answers[it.code] = Number(ch)
  })
  return { sessionId: fx.sessionId, reportNo: fx.reportNo, participantId: fx.participantId, submittedAt: fx.submittedAt, lang, name: fx.name, sex: fx.sex, age: fx.age, phone: fx.phone, email: fx.email, answers }
}
const fxOf = (reportNo: string): Fx => SESSIONS.find((s) => s.reportNo === reportNo) as Fx
const r1 = (v: number | null): number | null => (v === null ? null : Math.round(v * 10) / 10)

describe('the demo sessions re-scored from their answers equal the demo database', () => {
  for (const fx of SESSIONS) {
    it(`${fx.reportNo} ${fx.participantId} scores equal the stored scores`, () => {
      const r = scoreMhcu(stored(fx).answers)
      const near = (a: number | null, b: number) => expect(Math.abs((a as number) - b)).toBeLessThan(0.0051)
      near(r.mhi, fx.db.mhi)
      near(r.di, fx.db.di)
      near(r.wi, fx.db.wi)
      near(r.bhi, fx.db.bhi)
      near(r.ati.index, fx.db.ati)
      expect(r.level as number).toBe(fx.db.level)
      expect(r.wbTotal).toBe(fx.db.wb)
      r.wiDims.forEach((d, i) => near(d.score, fx.db.wiDims[i] as number))
      r.bhiDims.forEach((d, i) => near(d.score, fx.db.bhiDims[i] as number))
      expect(r.flaggedNonCritical).toBe(fx.db.flagged) // the demo counts the non-critical flagged domains
    })
  }
})

describe('text helpers', () => {
  it('formats numbers, dates and sex', () => {
    expect(formatOneDecimal(76.08, 'id')).toBe('76,1')
    expect(formatOneDecimal(4, 'id')).toBe('4,0')
    expect(formatOneDecimal(4.7, 'en')).toBe('4.7')
    expect(formatLongDate('2026-10-23 09:21:00', 'id')).toBe('23 Oktober 2026')
    expect(formatLongDate('2026-10-23T09:21:00', 'en')).toBe('23 October 2026')
    expect(formatLongDate('2026-03-05', 'id')).toBe('5 Maret 2026')
    expect(reportSex('Perempuan (Female)', 'id')).toBe('Perempuan')
    expect(reportSex('Perempuan (Female)', 'en')).toBe('Female')
    expect(reportSex('Laki-laki (Male)', 'en')).toBe('Male')
    expect(reportSex('Lainnya: non-biner', 'id')).toBe('Lainnya: non-biner')
  })

  it('reference range texts equal the report', () => {
    expect(referenceRangesText('di', 'id')).toBe('Minimal 0-9,9; Ringan 10-24,9; Sedang 25-49,9; Tinggi 50-100')
    expect(referenceRangesText('wi', 'id')).toBe('Sangat rendah 0-48,1; Rendah 48,2-55,2; Rata-rata 55,3-82; Tinggi 82,1-100')
    expect(referenceRangesText('bhi', 'en')).toBe('Very low 0-24.9; Low 25-49.9; Fair 50-74.9; High 75-100')
    expect(referenceRangesText('wi', 'en')).toBe('Very low 0-48.1; Low 48.2-55.2; Average 55.3-82; High 82.1-100')
  })

  it('level reasons', () => {
    const all = (o: Record<string, number>) => {
      const a: Record<string, number> = {}
      for (const it of MHCU_ITEMS) a[it.code] = it.part === 'wb' ? 5 : it.part === 'hb' ? 4 : 0
      return scoreMhcu({ ...a, ...o })
    }
    expect(buildLevelReason(all({})).en).toBe('Level 1 is assigned because the MHI is in the Good range and nothing else was triggered.')
    expect(buildLevelReason(all({ CC01: 3 })).id).toBe('Level 2 ditetapkan karena ada area yang mencapai ambang peninjauan, walaupun skor MHI berada pada rentang yang lebih baik.')
    expect(buildLevelReason(all({ CC11: 1 })).id).toContain('Level 5 ditetapkan karena ada jawaban 1 atau lebih pada item Pikiran Menyakiti Diri (CC11)')
  })

  it('an incomplete result gets the intro only and no numbers', () => {
    const r = scoreMhcu({})
    const h = buildHistory([{ sessionId: 'x', submittedAt: '2026-01-01 10:00:00', mhi: null, level: 1, di: null, wi: null, bhi: null }])
    expect(buildExplanation(r, h.waves, 'id')).not.toContain('MHI')
  })
})

/* ---------------- the eight demo documents ---------------- */

function inputFor(fx: MhcuClientReportData | MhcuPsychologistReportData, session: Fx, lang: 'id' | 'en', note: { recommendation: string; status: 'draft' | 'final'; finalizedBy: string | null }): MhcuReportBuildInput {
  const mine = SESSIONS.filter((s) => s.participantId === session.participantId)
  return {
    session: stored(session, lang),
    history: mine.map((s) => stored(s)),
    extras: {
      psychologist: { name: fx.header.psychologist.name, sipp: fx.header.psychologist.sipp },
      note: { recommendation: note.recommendation, status: note.status, finalizedBy: note.finalizedBy },
      reportDate: fx.header.reportDate,
    },
  }
}

const CLIENT_DOCS: [string, string, 'id' | 'en'][] = [
  ['c1', 'AT-MHCU-2026-114', 'id'],
  ['c1en', 'AT-MHCU-2026-115', 'en'],
  ['c5', 'AT-MHCU-2026-122', 'id'],
  ['c5en', 'AT-MHCU-2026-122', 'en'],
  ['c4r', 'AT-MHCU-2026-113', 'id'],
]

describe('client reports equal the demo documents (c1, c1en, c5, c5en, c4r)', () => {
  for (const [doc, reportNo, lang] of CLIENT_DOCS) {
    it(`${doc}`, () => {
      const fx = DEMO_CLIENT[doc] as MhcuClientReportData
      const got = buildClientReportData(inputFor(fx, fxOf(reportNo), lang, fx.note))
      expect(got.kind).toBe(fx.kind)
      // header (examinedAt: the demo fixtures carry a placeholder time; participantId P00000 is a placeholder on c1/c1en)
      expect(got.header.lang).toBe(fx.header.lang)
      expect(got.header.name).toBe(fx.header.name)
      expect(got.header.reportNo).toBe(fx.header.reportNo)
      if (fx.header.participantId !== 'P00000') expect(got.header.participantId).toBe(fx.header.participantId)
      expect(got.header.age).toBe(fx.header.age)
      expect(got.header.sex).toBe(fx.header.sex)
      expect(got.header.examinedAt.slice(0, 10)).toBe(fx.header.examinedAt.slice(0, 10))
      expect(got.header.waveNo).toBe(fx.header.waveNo)
      expect(got.header.waveCount).toBe(fx.header.waveCount)
      expect(got.header.period).toEqual(fx.header.period)
      expect(got.header.psychologist).toEqual(fx.header.psychologist)
      expect(got.header.clientContact).toEqual(fx.header.clientContact)
      expect(got.header.reportDate).toBe(fx.header.reportDate)
      // summary
      expect(r1(got.summary.mhi)).toBe(fx.summary.mhi)
      expect(got.summary.level).toBe(fx.summary.level)
      expect(got.summary.levelName).toEqual(fx.summary.levelName)
      expect(got.summary.band).toEqual(fx.summary.band)
      expect(got.summary.incomplete).toBe(fx.summary.incomplete)
      expect(got.summary.reason[lang]).toBe(fx.summary.reason[lang])
      // indices
      expect(got.indices.length).toBe(3)
      got.indices.forEach((row, i) => {
        const f = fx.indices[i] as (typeof fx.indices)[number]
        expect(row.key).toBe(f.key)
        expect(r1(row.value)).toBe(f.value)
        expect(row.category).toEqual(f.category)
        expect(row.higherIsBetter).toBe(f.higherIsBetter)
        expect(row.referenceRanges).toEqual(f.referenceRanges)
        if (f.previous === null) expect(row.previous).toBeNull()
        else {
          expect(row.previous?.waveNo).toBe(f.previous.waveNo)
          expect(r1(row.previous?.value ?? null)).toBe(f.previous.value)
          expect(row.previous?.change.deltaShown).toBe(f.previous.change.deltaShown)
          expect(row.previous?.change.significant).toBe(f.previous.change.significant)
          expect(row.previous?.change.word?.[lang]).toBe(f.previous.change.word?.[lang])
        }
      })
      // note: the explanation is generated, the recommendation is an input
      expect(got.note.explanation).toBe(fx.note.explanation)
      expect(got.note.recommendation).toBe(fx.note.recommendation)
      expect(got.note.status).toBe(fx.note.status)
      expect(got.note.finalizedBy).toBe(fx.note.finalizedBy)
      // progress
      if (fx.progress === null) {
        expect(got.progress).toBeNull()
        return
      }
      const p = got.progress as NonNullable<typeof got.progress>
      expect(p.waves.map((w) => ({ waveNo: w.waveNo, date: w.date, mhi: r1(w.mhi), level: w.level, di: r1(w.di), wi: r1(w.wi), bhi: r1(w.bhi) }))).toEqual(fx.progress.waves as never)
      expect(p.firstDate).toBe(fx.progress.firstDate)
      expect(p.lastDate).toBe(fx.progress.lastDate)
      expect(p.spanDays).toBe(fx.progress.spanDays)
      expect(p.waveCount).toBe(fx.progress.waveCount)
      expect(p.summary.levelFrom).toBe(fx.progress.summary.levelFrom)
      expect(p.summary.levelTo).toBe(fx.progress.summary.levelTo)
      expect(r1(p.summary.mhiFrom)).toBe(fx.progress.summary.mhiFrom)
      expect(r1(p.summary.mhiTo)).toBe(fx.progress.summary.mhiTo)
      for (const k of ['mhi', 'di', 'wi', 'bhi'] as const) {
        expect(p.firstToLast[k].deltaShown).toBe(fx.progress.firstToLast[k].deltaShown)
        expect(p.firstToLast[k].word?.[lang]).toBe(fx.progress.firstToLast[k].word?.[lang])
      }
      expect(p.firstToLast.level.text[lang]).toBe(fx.progress.firstToLast.level.text[lang])
      expect(p.firstToLast.level.word[lang]).toBe(fx.progress.firstToLast.level.word[lang])
    })
  }
})

const PSY_DOCS: [string, string, 'id' | 'en'][] = [
  ['p1', 'AT-MHCU-2026-114', 'id'],
  ['p5', 'AT-MHCU-2026-122', 'id'],
  ['p4r', 'AT-MHCU-2026-113', 'en'],
]

/** Percentile differences against the printed numbers of the demo (see mhcu-reference.test.ts) */
const percentileGaps: Record<string, number[]> = {}

describe('psychologist reports equal the demo documents (p1, p5, p4r)', () => {
  for (const [doc, reportNo, lang] of PSY_DOCS) {
    it(`${doc}`, () => {
      const fx = DEMO_PSY[doc] as MhcuPsychologistReportData
      const got = buildPsychologistReportData(inputFor(fx, fxOf(reportNo), lang, fx.clientNote))
      expect(got.kind).toBe(fx.kind)
      expect(got.header).toEqual({ ...fx.header, examinedAt: got.header.examinedAt })
      expect(got.header.examinedAt).toBe(fx.header.examinedAt)
      expect(got.summary.level).toBe(fx.summary.level)
      expect(r1(got.summary.mhi)).toBe(fx.summary.mhi)
      expect(got.summary.band).toEqual(fx.summary.band)
      expect(got.summary.reason[lang]).toBe(fx.summary.reason[lang])
      // rows
      expect(got.rows.length).toBe(fx.rows.length)
      const gaps: number[] = []
      got.rows.forEach((row, i) => {
        const f = fx.rows[i] as (typeof fx.rows)[number]
        expect(row.kind).toBe(f.kind)
        expect(row.key).toBe(f.key)
        expect(row.label[lang]).toBe(f.label[lang])
        expect(r1(row.value)).toBe(f.value)
        expect(row.range).toBe(f.range)
        expect(row.category?.[lang]).toBe(f.category?.[lang])
        expect(row.flagged).toBe(f.flagged)
        expect(row.higherIsBetter).toBe(f.higherIsBetter)
        expect(row.wbTotal).toBe(f.wbTotal)
        gaps.push((row.percentile as number) - (f.percentile as number))
      })
      percentileGaps[doc] = gaps
      expect(Math.max(...gaps.map(Math.abs))).toBeLessThanOrEqual(3)
      // reference, triggers
      expect(got.reference).toEqual(fx.reference)
      expect(got.triggers.triggers.map((t) => t[lang]).join(', ')).toBe(fx.triggers.triggers.map((t) => t[lang]).join(', '))
      expect(got.triggers.responseTime[lang]).toBe(fx.triggers.responseTime[lang])
      expect(got.triggers.followUp[lang]).toBe(fx.triggers.followUp[lang])
      // appendix: 58 answers as given
      expect(got.appendix.length).toBe(58)
      got.appendix.forEach((a, i) => {
        const f = fx.appendix[i] as (typeof fx.appendix)[number]
        expect(a.part).toBe(f.part)
        expect(a.n).toBe(f.n)
        expect(a.text[lang]).toBe(f.text[lang])
        expect(a.answer).toBe(f.answer)
      })
      expect(got.clientNote.recommendation).toBe(fx.clientNote.recommendation)
      expect(got.clientNote.status).toBe(fx.clientNote.status)
      expect(got.clientNote.finalizedBy).toBe(fx.clientNote.finalizedBy)
      // progress
      if (fx.progress === null) {
        expect(got.progress).toBeNull()
        return
      }
      const p = got.progress as NonNullable<typeof got.progress>
      expect(p.waves.map((w) => ({ ...w, mhi: r1(w.mhi), di: r1(w.di), wi: r1(w.wi), bhi: r1(w.bhi), wiDims: (w.wiDims ?? []).map(r1), bhiDims: (w.bhiDims ?? []).map(r1) }))).toEqual(fx.progress.waves as never)
      expect(p.firstDate).toBe(fx.progress.firstDate)
      expect(p.lastDate).toBe(fx.progress.lastDate)
      expect(p.waveCount).toBe(fx.progress.waveCount)
      expect(p.spanDays).toBe(doc === 'p5' ? 112 : 56) // the Designer's fixture has 0 here
      for (const k of ['mhi', 'di', 'wi', 'bhi'] as const) {
        expect(p.firstToLast[k].deltaShown).toBe(fx.progress.firstToLast[k].deltaShown)
        expect(p.firstToLast[k].word?.[lang]).toBe(fx.progress.firstToLast[k].word?.[lang])
      }
      expect(p.firstToLast.level.text[lang]).toBe(fx.progress.firstToLast.level.text[lang])
      p.firstToLast.wiDims?.forEach((d, i) => {
        expect(d.deltaShown).toBe(fx.progress?.firstToLast.wiDims?.[i]?.deltaShown as number)
        expect(d.word?.[lang]).toBe(fx.progress?.firstToLast.wiDims?.[i]?.word?.[lang] as string)
      })
      p.firstToLast.bhiDims?.forEach((d, i) => {
        expect(d.deltaShown).toBe(fx.progress?.firstToLast.bhiDims?.[i]?.deltaShown as number)
        expect(d.word?.[lang]).toBe(fx.progress?.firstToLast.bhiDims?.[i]?.word?.[lang] as string)
      })
      expect(p.firstToLast.domains?.map((d) => d.delta)).toEqual(fx.progress.firstToLast.domains?.map((d) => d.delta))
      expect(p.firstToLast.domains?.map((d) => d.word?.[lang].split(',')[0])).toEqual(fx.progress.firstToLast.domains?.map((d) => d.word?.[lang].split(',')[0]))
    })
  }

  it('the percentiles of the three psychologist reports are within 3 points of the printed ones', () => {
    const all = Object.values(percentileGaps).flat()
    expect(all.length).toBe(72)
    expect(all.filter((g) => g === 0).length).toBeGreaterThanOrEqual(39)
    expect(Math.max(...all.map(Math.abs))).toBeLessThanOrEqual(3)
  })
})

describe('builder behaviour', () => {
  const nadia = SESSIONS.filter((s) => s.participantId === 'P00001')
  const extras = { psychologist: null, note: null, reportDate: '2026-11-21' }

  it('a report for an earlier wave ignores later sessions', () => {
    const t3 = buildClientReportData({ session: stored(nadia[2] as Fx), history: nadia.map((s) => stored(s)), extras })
    expect(t3.header.waveNo).toBe(3)
    expect(t3.header.waveCount).toBe(3)
    expect(t3.progress?.waves.length).toBe(3)
    expect(t3.indices[0]?.previous?.waveNo).toBe(2)
  })

  it('the history may omit the current session and may be in any order', () => {
    const t5 = nadia[4] as Fx
    const a = buildClientReportData({ session: stored(t5), history: [...nadia].reverse().map((s) => stored(s)), extras })
    const b = buildClientReportData({ session: stored(t5), history: nadia.slice(0, 4).map((s) => stored(s)), extras })
    expect(b).toEqual(a)
  })

  it('a first check-up is a single report; without a psychologist or note the fields are empty, the status is draft', () => {
    const t1 = buildClientReportData({ session: stored(nadia[0] as Fx), history: [], extras })
    expect(t1.kind).toBe('client_single')
    expect(t1.progress).toBeNull()
    expect(t1.header.psychologist).toEqual({ name: '', sipp: null })
    expect(t1.note.status).toBe('draft')
    expect(t1.note.recommendation).toBe('')
    expect(t1.note.explanation).toContain('Pemeriksaan ini melihat')
  })

  it('sessions of other participants are ignored', () => {
    const t5 = nadia[4] as Fx
    const other = SESSIONS.filter((s) => s.participantId === 'P00005').map((s) => stored(s))
    const withOther = buildClientReportData({ session: stored(t5), history: [...nadia.map((s) => stored(s)), ...other], extras })
    const clean = buildClientReportData({ session: stored(t5), history: nadia.map((s) => stored(s)), extras })
    expect(withOther).toEqual(clean)
  })

  it('does not mutate its input', () => {
    const s = stored(nadia[4] as Fx)
    const copy = JSON.stringify(s)
    buildPsychologistReportData({ session: s, history: nadia.map((x) => stored(x)), extras })
    expect(JSON.stringify(s)).toBe(copy)
  })
})
