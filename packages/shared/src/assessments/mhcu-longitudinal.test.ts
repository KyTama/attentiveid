import { describe, expect, it } from 'bun:test'
import {
  MHCU_SIGNIFICANT_CHANGE,
  buildHistories,
  buildHistory,
  calendarDaysBetween,
  compareDomain,
  compareIndex,
  compareLevel,
  compareMetric,
  compareWaves,
  formatSignedChange,
  matchParticipant,
  normalizeEmail,
  normalizePhone,
  wideRow,
  type MhcuSessionInput,
} from './mhcu-longitudinal'

/* Fixtures: the fictional database of the team's v7 demo (RMHCU_Demo_Lengkap_v7.html): 13 participants, 29 sessions.
   `exp` holds the demo's own wave_no / days_since_* / prev_session_id / delta_* columns; WIDE is what the demo's wide() view prints. */

interface Fx extends MhcuSessionInput {
  participantId: string
  email: string
  phone: string
  exp: {
    waveNo: number
    daysSinceFirst: number
    daysSincePrev: number | null
    prevSessionId: string | null
    deltaMhi: number | null
    deltaDi: number | null
    deltaWi: number | null
    deltaBhi: number | null
    deltaLevel: number | null
  }
}

const SESSIONS: Fx[] = [
  {participantId:'P00001',sessionId:'S20260731100000454B',reportCode:'AT-MHCU-2026-094',submittedAt:'2026-07-31 10:00:00',email:'nadia.lestari@example.com',phone:'081234567890',mhi:46.08,level:3,di:40.38,wi:33.93,bhi:43.33,wiDims:[41.67,28.13,41.67],bhiDims:[50,20,66.67],domains:[2,2,1,3,2,0,0,2,2,3,2,2,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00002',sessionId:'S202608120655008AF4',reportCode:'AT-MHCU-2026-095',submittedAt:'2026-08-12 06:55:00',email:'dimas.h@example.com',phone:'081955566677',mhi:62.32,level:3,di:28.85,wi:57.14,bhi:55,wiDims:[50,59.38,58.33],bhiDims:[57.14,50,58.33],domains:[1,2,1,2,1,0,0,1,1,2,1,2,1],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00003',sessionId:'S20260822092300385C',reportCode:'AT-MHCU-2026-096',submittedAt:'2026-08-22 09:23:00',email:'bima.saputra@example.com',phone:'081298765431',mhi:73.77,level:2,di:23.08,wi:75,bhi:65,wiDims:[83.33,71.88,75],bhiDims:[71.43,60,58.33],domains:[1,1,0,1,1,0,0,1,1,1,1,1,3],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00001',sessionId:'S202608280947000EC4',reportCode:'AT-MHCU-2026-097',submittedAt:'2026-08-28 09:47:00',email:'nadia.lestari@example.com',phone:'081234567890',mhi:54.11,level:3,di:34.62,wi:48.21,bhi:43.33,wiDims:[50,46.88,50],bhiDims:[42.86,30,66.67],domains:[2,2,2,2,2,0,0,2,1,2,1,2,0],exp:{waveNo:2,daysSinceFirst:28,daysSincePrev:28,prevSessionId:'S20260731100000454B',deltaMhi:8.03,deltaDi:-5.76,deltaWi:14.28,deltaBhi:0,deltaLevel:0}},
  {participantId:'P00002',sessionId:'S20260909064200C8D0',reportCode:'AT-MHCU-2026-098',submittedAt:'2026-09-09 06:42:00',email:'dimas.h@example.com',phone:'081955566677',mhi:49.57,level:3,di:38.46,wi:35.71,bhi:53.33,wiDims:[33.33,37.5,33.33],bhiDims:[67.86,35,50],domains:[2,3,2,2,2,0,0,1,2,2,2,2,0],exp:{waveNo:2,daysSinceFirst:28,daysSincePrev:28,prevSessionId:'S202608120655008AF4',deltaMhi:-12.75,deltaDi:9.61,deltaWi:-21.43,deltaBhi:-1.67,deltaLevel:0}},
  {participantId:'P00004',sessionId:'S20260911084600D121',reportCode:'AT-MHCU-2026-099',submittedAt:'2026-09-11 08:46:00',email:'sari.w@example.com',phone:'085711223344',mhi:70.74,level:2,di:17.31,wi:62.5,bhi:63.33,wiDims:[50,62.5,75],bhiDims:[60.71,60,75],domains:[1,1,1,2,1,0,0,0,1,1,0,1,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00005',sessionId:'S20260918080900E9FB',reportCode:'AT-MHCU-2026-100',submittedAt:'2026-09-18 08:09:00',email:'rizky.p@example.com',phone:'081377788899',mhi:32,level:5,di:61.54,wi:23.21,bhi:36.67,wiDims:[16.67,25,25],bhiDims:[46.43,25,33.33],domains:[4,2,2,3,3,2,0,3,4,3,3,3,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00003',sessionId:'S20260921091000BDCC',reportCode:'AT-MHCU-2026-101',submittedAt:'2026-09-21 09:10:00',email:'bima.saputra@example.com',phone:'081298765431',mhi:64.68,level:4,di:32.69,wi:66.07,bhi:56.67,wiDims:[66.67,68.75,58.33],bhiDims:[53.57,60,58.33],domains:[2,1,1,2,1,0,1,1,2,1,1,1,3],exp:{waveNo:2,daysSinceFirst:30,daysSincePrev:30,prevSessionId:'S20260822092300385C',deltaMhi:-9.09,deltaDi:9.61,deltaWi:-8.93,deltaBhi:-8.33,deltaLevel:2}},
  {participantId:'P00005',sessionId:'S2026092507560047BC',reportCode:'AT-MHCU-2026-102',submittedAt:'2026-09-25 07:56:00',email:'rizky.p@example.com',phone:'081377788899',mhi:42.95,level:5,di:50,wi:35.71,bhi:43.33,wiDims:[33.33,34.38,41.67],bhiDims:[42.86,40,50],domains:[2,2,2,3,3,1,0,3,3,2,2,3,0],exp:{waveNo:2,daysSinceFirst:7,daysSincePrev:7,prevSessionId:'S20260918080900E9FB',deltaMhi:10.95,deltaDi:-11.54,deltaWi:12.5,deltaBhi:6.66,deltaLevel:0}},
  {participantId:'P00001',sessionId:'S202609250934007400',reportCode:'AT-MHCU-2026-103',submittedAt:'2026-09-25 09:34:00',email:'nadia.lestari@example.com',phone:'081234567890',mhi:61.37,level:3,di:28.85,wi:58.93,bhi:46.67,wiDims:[58.33,62.5,50],bhiDims:[53.57,35,50],domains:[1,1,1,2,2,0,0,1,2,2,1,2,0],exp:{waveNo:3,daysSinceFirst:56,daysSincePrev:28,prevSessionId:'S202608280947000EC4',deltaMhi:7.26,deltaDi:-5.77,deltaWi:10.72,deltaBhi:3.34,deltaLevel:0}},
  {participantId:'P00006',sessionId:'S202610010732007A84',reportCode:'AT-MHCU-2026-104',submittedAt:'2026-10-01 07:32:00',email:'ayu.kartika@example.com',phone:'082144556677',mhi:56.82,level:3,di:34.62,wi:50,bhi:53.33,wiDims:[58.33,46.88,50],bhiDims:[57.14,45,58.33],domains:[2,2,1,2,2,0,0,1,2,2,1,2,1],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00002',sessionId:'S2026100706290008F8',reportCode:'AT-MHCU-2026-105',submittedAt:'2026-10-07 06:29:00',email:'dimas.h@example.com',phone:'081955566677',mhi:65.19,level:3,di:25,wi:57.14,bhi:61.67,wiDims:[58.33,53.13,66.67],bhiDims:[64.29,45,83.33],domains:[2,1,0,1,2,0,0,1,1,1,2,2,0],exp:{waveNo:3,daysSinceFirst:56,daysSincePrev:28,prevSessionId:'S20260909064200C8D0',deltaMhi:15.62,deltaDi:-13.46,deltaWi:21.43,deltaBhi:8.34,deltaLevel:0}},
  {participantId:'P00004',sessionId:'S202610110833007E05',reportCode:'AT-MHCU-2026-106',submittedAt:'2026-10-11 08:33:00',email:'sari.w@example.com',phone:'085711223344',mhi:65.19,level:3,di:25,wi:57.14,bhi:61.67,wiDims:[50,65.63,41.67],bhiDims:[64.29,50,75],domains:[1,1,1,1,2,0,0,2,1,1,2,1,0],exp:{waveNo:2,daysSinceFirst:30,daysSincePrev:30,prevSessionId:'S20260911084600D121',deltaMhi:-5.55,deltaDi:7.69,deltaWi:-5.36,deltaBhi:-1.66,deltaLevel:1}},
  {participantId:'P00005',sessionId:'S20261016074300E482',reportCode:'AT-MHCU-2026-107',submittedAt:'2026-10-16 07:43:00',email:'rizky.p@example.com',phone:'081377788899',mhi:52.52,level:4,di:38.46,wi:46.43,bhi:46.67,wiDims:[50,43.75,50],bhiDims:[57.14,35,41.67],domains:[2,2,1,2,2,0,1,2,2,2,2,2,0],exp:{waveNo:3,daysSinceFirst:28,daysSincePrev:21,prevSessionId:'S2026092507560047BC',deltaMhi:9.57,deltaDi:-11.54,deltaWi:10.72,deltaBhi:3.34,deltaLevel:-1}},
  {participantId:'P00003',sessionId:'S2026102108570083B8',reportCode:'AT-MHCU-2026-108',submittedAt:'2026-10-21 08:57:00',email:'bima.saputra@example.com',phone:'081298765431',mhi:52.37,level:3,di:40.38,wi:44.64,bhi:53.33,wiDims:[33.33,43.75,58.33],bhiDims:[57.14,50,50],domains:[2,2,1,2,2,0,0,2,1,2,2,2,3],exp:{waveNo:3,daysSinceFirst:60,daysSincePrev:30,prevSessionId:'S20260921091000BDCC',deltaMhi:-12.31,deltaDi:7.69,deltaWi:-21.43,deltaBhi:-3.34,deltaLevel:-1}},
  {participantId:'P00001',sessionId:'S202610230921003FE6',reportCode:'AT-MHCU-2026-109',submittedAt:'2026-10-23 09:21:00',email:'nadia.lestari@example.com',phone:'081234567890',mhi:71.4,level:2,di:19.23,wi:66.07,bhi:63.33,wiDims:[66.67,62.5,75],bhiDims:[71.43,45,75],domains:[1,1,1,1,1,0,0,2,1,1,0,1,0],exp:{waveNo:4,daysSinceFirst:84,daysSincePrev:28,prevSessionId:'S202609250934007400',deltaMhi:10.03,deltaDi:-9.62,deltaWi:7.14,deltaBhi:16.66,deltaLevel:-1}},
  {participantId:'P00006',sessionId:'S202610300719003B93',reportCode:'AT-MHCU-2026-110',submittedAt:'2026-10-30 07:19:00',email:'ayu.kartika@example.com',phone:'082144556677',mhi:64.09,level:3,di:26.92,wi:57.14,bhi:60,wiDims:[50,53.13,75],bhiDims:[57.14,50,83.33],domains:[1,2,1,2,2,0,0,1,1,1,1,2,0],exp:{waveNo:2,daysSinceFirst:29,daysSincePrev:29,prevSessionId:'S202610010732007A84',deltaMhi:7.27,deltaDi:-7.7,deltaWi:7.14,deltaBhi:6.67,deltaLevel:0}},
  {participantId:'P00002',sessionId:'S202611050616006D34',reportCode:'AT-MHCU-2026-111',submittedAt:'2026-11-05 06:16:00',email:'dimas.h@example.com',phone:'081955566677',mhi:67.55,level:2,di:19.23,wi:58.93,bhi:58.33,wiDims:[58.33,59.38,58.33],bhiDims:[57.14,55,66.67],domains:[1,0,1,2,1,0,0,1,2,0,1,1,0],exp:{waveNo:4,daysSinceFirst:85,daysSincePrev:29,prevSessionId:'S2026100706290008F8',deltaMhi:2.36,deltaDi:-5.77,deltaWi:1.79,deltaBhi:-3.34,deltaLevel:-1}},
  {participantId:'P00004',sessionId:'S20261110082000E052',reportCode:'AT-MHCU-2026-112',submittedAt:'2026-11-10 08:20:00',email:'sari.w@example.com',phone:'085711223344',mhi:73.85,level:1,di:15.38,wi:62.5,bhi:75,wiDims:[75,56.25,66.67],bhiDims:[71.43,80,75],domains:[1,1,1,1,1,0,0,0,1,1,1,0,0],exp:{waveNo:3,daysSinceFirst:60,daysSincePrev:30,prevSessionId:'S202610110833007E05',deltaMhi:8.66,deltaDi:-9.62,deltaWi:5.36,deltaBhi:13.33,deltaLevel:-2}},
  {participantId:'P00005',sessionId:'S20261113073000453B',reportCode:'AT-MHCU-2026-113',submittedAt:'2026-11-13 07:30:00',email:'rizky.p@example.com',phone:'081377788899',mhi:56.54,level:3,di:32.69,wi:48.21,bhi:51.67,wiDims:[58.33,40.63,58.33],bhiDims:[60.71,35,58.33],domains:[1,1,2,2,2,0,0,1,1,2,2,2,1],exp:{waveNo:4,daysSinceFirst:56,daysSincePrev:28,prevSessionId:'S20261016074300E482',deltaMhi:4.02,deltaDi:-5.77,deltaWi:1.78,deltaBhi:5,deltaLevel:-1}},
  {participantId:'P00007',sessionId:'S20261115061800F88E',reportCode:'AT-MHCU-2026-114',submittedAt:'2026-11-15 06:18:00',email:'laras.dewi@example.com',phone:'081122233344',mhi:77.46,level:2,di:17.31,wi:76.79,bhi:68.33,wiDims:[91.67,75,66.67],bhiDims:[67.86,60,83.33],domains:[1,1,1,1,1,0,0,0,1,1,1,0,1],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00008',sessionId:'S202611160541004D51',reportCode:'AT-MHCU-2026-115',submittedAt:'2026-11-16 05:41:00',email:'kevin.wijaya@example.com',phone:'087812341234',mhi:59.9,level:3,di:26.92,wi:50,bhi:53.33,wiDims:[50,56.25,33.33],bhiDims:[60.71,40,58.33],domains:[2,2,1,2,2,0,0,1,1,1,1,1,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00009',sessionId:'S202611170504008FC6',reportCode:'AT-MHCU-2026-116',submittedAt:'2026-11-17 05:04:00',email:'putri.ang@example.com',phone:'089612345678',mhi:38.33,level:5,di:50,wi:25,bhi:41.67,wiDims:[25,21.88,33.33],bhiDims:[50,25,50],domains:[3,3,2,2,2,1,0,2,3,2,3,3,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00010',sessionId:'S202611180427006852',reportCode:'AT-MHCU-2026-117',submittedAt:'2026-11-18 04:27:00',email:'fajar.n@example.com',phone:'081311122233',mhi:63.34,level:3,di:34.62,wi:57.14,bhi:71.67,wiDims:[66.67,56.25,50],bhiDims:[75,60,83.33],domains:[1,2,1,2,2,0,0,1,2,1,1,2,3],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00003',sessionId:'S20261118084400D7A5',reportCode:'AT-MHCU-2026-118',submittedAt:'2026-11-18 08:44:00',email:'bima.saputra@example.com',phone:'081298765431',mhi:44.61,level:3,di:51.92,wi:39.29,bhi:48.33,wiDims:[41.67,40.63,33.33],bhiDims:[53.57,35,58.33],domains:[3,2,2,3,3,0,0,2,2,2,2,3,3],exp:{waveNo:4,daysSinceFirst:88,daysSincePrev:28,prevSessionId:'S2026102108570083B8',deltaMhi:-7.76,deltaDi:11.54,deltaWi:-5.35,deltaBhi:-5,deltaLevel:0}},
  {participantId:'P00011',sessionId:'S202611190236009B85',reportCode:'AT-MHCU-2026-119',submittedAt:'2026-11-19 02:36:00',email:'rani.m@example.com',phone:'081566677788',mhi:59.43,level:3,di:36.54,wi:51.79,bhi:66.67,wiDims:[58.33,50,50],bhiDims:[71.43,65,58.33],domains:[1,1,2,2,3,0,0,2,2,2,1,2,1],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00012',sessionId:'S202611190313006757',reportCode:'AT-MHCU-2026-120',submittedAt:'2026-11-19 03:13:00',email:'andini.r@example.com',phone:'081244455566',mhi:78.26,level:1,di:19.23,wi:73.21,bhi:83.33,wiDims:[66.67,75,75],bhiDims:[85.71,80,83.33],domains:[1,1,1,1,1,0,0,1,1,1,1,1,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00013',sessionId:'S202611190350008D4A',reportCode:'AT-MHCU-2026-121',submittedAt:'2026-11-19 03:50:00',email:'maya.salsa@example.com',phone:'085233344455',mhi:54.19,level:4,di:38.46,wi:46.43,bhi:55,wiDims:[50,46.88,41.67],bhiDims:[67.86,35,58.33],domains:[2,2,1,2,3,0,1,2,1,2,2,2,0],exp:{waveNo:1,daysSinceFirst:0,daysSincePrev:null,prevSessionId:null,deltaMhi:null,deltaDi:null,deltaWi:null,deltaBhi:null,deltaLevel:null}},
  {participantId:'P00001',sessionId:'S2026112009080055DB',reportCode:'AT-MHCU-2026-122',submittedAt:'2026-11-20 09:08:00',email:'nadia.lestari@example.com',phone:'081234567890',mhi:76.08,level:2,di:17.31,wi:75,bhi:65,wiDims:[75,71.88,83.33],bhiDims:[71.43,55,66.67],domains:[1,0,0,2,1,0,0,1,0,1,1,2,0],exp:{waveNo:5,daysSinceFirst:112,daysSincePrev:28,prevSessionId:'S202610230921003FE6',deltaMhi:4.68,deltaDi:-1.92,deltaWi:8.93,deltaBhi:1.67,deltaLevel:0}},
]

const PARTICIPANTS = [
  {id:'P00001',email:'nadia.lestari@example.com',phone:'081234567890',n:5},
  {id:'P00002',email:'dimas.h@example.com',phone:'081955566677',n:4},
  {id:'P00003',email:'bima.saputra@example.com',phone:'081298765431',n:4},
  {id:'P00004',email:'sari.w@example.com',phone:'085711223344',n:3},
  {id:'P00005',email:'rizky.p@example.com',phone:'081377788899',n:4},
  {id:'P00006',email:'ayu.kartika@example.com',phone:'082144556677',n:2},
  {id:'P00007',email:'laras.dewi@example.com',phone:'081122233344',n:1},
  {id:'P00008',email:'kevin.wijaya@example.com',phone:'087812341234',n:1},
  {id:'P00009',email:'putri.ang@example.com',phone:'089612345678',n:1},
  {id:'P00010',email:'fajar.n@example.com',phone:'081311122233',n:1},
  {id:'P00011',email:'rani.m@example.com',phone:'081566677788',n:1},
  {id:'P00012',email:'andini.r@example.com',phone:'081244455566',n:1},
  {id:'P00013',email:'maya.salsa@example.com',phone:'085233344455',n:1},
]

/** demo wide(): header row then one row per participant (T1..T5 per index, then the last-minus-first change) */
const WIDE: (string | number)[][] = [
  ['participant_id','name','n','first_date','last_date','days','MHI_T1','MHI_T2','MHI_T3','MHI_T4','MHI_T5','Level_T1','Level_T2','Level_T3','Level_T4','Level_T5','DI_T1','DI_T2','DI_T3','DI_T4','DI_T5','WI_T1','WI_T2','WI_T3','WI_T4','WI_T5','BHI_T1','BHI_T2','BHI_T3','BHI_T4','BHI_T5','MHI_change','Level_change','DI_change','WI_change','BHI_change'],
  ['P00001','Nadia Putri Lestari',5,'2026-07-31','2026-11-20',112,46.08,54.11,61.37,71.4,76.08,3,3,3,2,2,40.38,34.62,28.85,19.23,17.31,33.93,48.21,58.93,66.07,75,43.33,43.33,46.67,63.33,65,30,-1,-23.07,41.07,21.67],
  ['P00002','Dimas Hidayat',4,'2026-08-12','2026-11-05',85,62.32,49.57,65.19,67.55,'',3,3,3,2,'',28.85,38.46,25,19.23,'',57.14,35.71,57.14,58.93,'',55,53.33,61.67,58.33,'',5.23,-1,-9.62,1.79,3.33],
  ['P00003','Bima Saputra',4,'2026-08-22','2026-11-18',88,73.77,64.68,52.37,44.61,'',2,4,3,3,'',23.08,32.69,40.38,51.92,'',75,66.07,44.64,39.29,'',65,56.67,53.33,48.33,'',-29.16,1,28.84,-35.71,-16.67],
  ['P00004','Sari Wulandari',3,'2026-09-11','2026-11-10',60,70.74,65.19,73.85,'','',2,3,1,'','',17.31,25,15.38,'','',62.5,57.14,62.5,'','',63.33,61.67,75,'','',3.11,-1,-1.93,0,11.67],
  ['P00005','Rizky Pratama',4,'2026-09-18','2026-11-13',56,32,42.95,52.52,56.54,'',5,5,4,3,'',61.54,50,38.46,32.69,'',23.21,35.71,46.43,48.21,'',36.67,43.33,46.67,51.67,'',24.54,-2,-28.85,25,15],
  ['P00006','Ayu Kartika',2,'2026-10-01','2026-10-30',29,56.82,64.09,'','','',3,3,'','','',34.62,26.92,'','','',50,57.14,'','','',53.33,60,'','','',7.27,0,-7.7,7.14,6.67],
  ['P00007','Larasati Dewi',1,'2026-11-15','2026-11-15',0,77.46,'','','','',2,'','','','',17.31,'','','','',76.79,'','','','',68.33,'','','','','','','','',''],
  ['P00008','Kevin Wijaya',1,'2026-11-16','2026-11-16',0,59.9,'','','','',3,'','','','',26.92,'','','','',50,'','','','',53.33,'','','','','','','','',''],
  ['P00009','Putri Anggraini',1,'2026-11-17','2026-11-17',0,38.33,'','','','',5,'','','','',50,'','','','',25,'','','','',41.67,'','','','','','','','',''],
  ['P00010','Fajar Nugroho',1,'2026-11-18','2026-11-18',0,63.34,'','','','',3,'','','','',34.62,'','','','',57.14,'','','','',71.67,'','','','','','','','',''],
  ['P00011','Rani Maharani',1,'2026-11-19','2026-11-19',0,59.43,'','','','',3,'','','','',36.54,'','','','',51.79,'','','','',66.67,'','','','','','','','',''],
  ['P00012','Andini Rahmawati',1,'2026-11-19','2026-11-19',0,78.26,'','','','',1,'','','','',19.23,'','','','',73.21,'','','','',83.33,'','','','','','','','',''],
  ['P00013','Maya Salsabila',1,'2026-11-19','2026-11-19',0,54.19,'','','','',4,'','','','',38.46,'','','','',46.43,'','','','',55,'','','','','','','','',''],
]

const byId = (id: string): Fx[] => SESSIONS.filter((s) => s.participantId === id)
const toInput = (s: Fx): MhcuSessionInput => {
  const { participantId: _p, email: _e, phone: _ph, exp: _x, ...rest } = s
  return rest
}
/** Deterministic shuffle so the tests prove the input order does not matter */
const shuffled = <T,>(list: readonly T[]): T[] => {
  const out = [...list]
  let seed = 7
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    const j = seed % (i + 1)
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

describe('participant matching', () => {
  const known = PARTICIPANTS.map((p) => ({ participantId: p.id, emailNorm: p.email, phoneNorm: p.phone }))

  it('the demo has 13 participants and 29 sessions', () => {
    expect(PARTICIPANTS.length).toBe(13)
    expect(SESSIONS.length).toBe(29)
    expect(PARTICIPANTS.reduce((n, p) => n + p.n, 0)).toBe(29)
  })

  it('normalises e-mail (trim, lower case) and phone (08... format)', () => {
    expect(normalizeEmail('  Nadia.Lestari@Example.COM ')).toBe('nadia.lestari@example.com')
    expect(normalizeEmail('   ')).toBeNull()
    expect(normalizeEmail(undefined)).toBeNull()
    expect(normalizePhone('0812-3456-7890')).toBe('081234567890')
    expect(normalizePhone('+62 812 3456 7890')).toBe('081234567890')
    expect(normalizePhone('6281234567890')).toBe('081234567890')
    expect(normalizePhone('81234567890')).toBe('081234567890')
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone(null)).toBeNull()
  })

  it('every demo session is matched to its own participant by e-mail', () => {
    for (const s of SESSIONS) {
      expect(matchParticipant(known, { email: s.email, phone: '' })).toEqual({ participantId: s.participantId, matchedBy: 'email' })
    }
  })

  it('e-mail typed with other capitals/spaces still matches; a phone-only match is used when the e-mail is new', () => {
    expect(matchParticipant(known, { email: ' NADIA.LESTARI@example.com ', phone: '0899' })?.participantId).toBe('P00001')
    expect(matchParticipant(known, { email: 'new.address@example.com', phone: '+62 812-3456-7890' })).toEqual({ participantId: 'P00001', matchedBy: 'phone' })
    expect(matchParticipant(known, { email: '', phone: '6281955566677' })).toEqual({ participantId: 'P00002', matchedBy: 'phone' })
  })

  it('the e-mail match wins over a phone number that belongs to somebody else', () => {
    expect(matchParticipant(known, { email: 'dimas.h@example.com', phone: '081234567890' })).toEqual({ participantId: 'P00002', matchedBy: 'email' })
  })

  it('an unknown person matches nobody', () => {
    expect(matchParticipant(known, { email: 'nobody@example.com', phone: '085000000000' })).toBeNull()
    expect(matchParticipant(known, {})).toBeNull()
    expect(matchParticipant([], { email: 'a@b.co', phone: '081234567890' })).toBeNull()
  })

  it('every session of the demo carries the e-mail and phone of its participant', () => {
    for (const s of SESSIONS) {
      const p = PARTICIPANTS.find((x) => x.id === s.participantId)
      expect(normalizeEmail(s.email)).toBe(p?.email as string)
      expect(normalizePhone(s.phone)).toBe(p?.phone as string)
    }
  })
})

describe('wave numbering, days and deltas equal the demo database', () => {
  it('calendar days between submissions', () => {
    expect(calendarDaysBetween('2026-07-31 10:00:00', '2026-08-28 09:47:00')).toBe(28)
    expect(calendarDaysBetween('2026-09-25T07:56:00', '2026-10-16 07:43:00')).toBe(21)
    expect(calendarDaysBetween('2026-11-20 23:59:59', '2026-11-20 00:00:01')).toBe(0)
  })

  for (const id of PARTICIPANTS.map((p) => p.id)) {
    it(`${id}: wave_no, days_since_first/prev, prev_session_id and every delta (input shuffled)`, () => {
      const rows = byId(id)
      const history = buildHistory(shuffled(rows).map(toInput), id)
      expect(history.n).toBe(rows.length)
      history.waves.forEach((w) => {
        const fx = rows.find((r) => r.sessionId === w.sessionId) as Fx
        expect(w.waveNo).toBe(fx.exp.waveNo)
        expect(w.daysSinceFirst).toBe(fx.exp.daysSinceFirst)
        expect(w.daysSincePrev).toBe(fx.exp.daysSincePrev)
        expect(w.prevSessionId).toBe(fx.exp.prevSessionId)
        expect(w.delta.mhi).toBe(fx.exp.deltaMhi)
        expect(w.delta.di).toBe(fx.exp.deltaDi)
        expect(w.delta.wi).toBe(fx.exp.deltaWi)
        expect(w.delta.bhi).toBe(fx.exp.deltaBhi)
        expect(w.delta.level).toBe(fx.exp.deltaLevel)
      })
    })
  }

  it('buildHistories groups all 29 sessions into the 13 participants', () => {
    const histories = buildHistories(shuffled(SESSIONS).map((s) => ({ ...toInput(s), participantId: s.participantId })))
    expect(histories.map((h) => h.participantId)).toEqual(PARTICIPANTS.map((p) => p.id))
    expect(histories.map((h) => h.n)).toEqual(PARTICIPANTS.map((p) => p.n))
  })

  it('an empty history is safe', () => {
    const h = buildHistory([])
    expect(h.n).toBe(0)
    expect(h.waves).toEqual([])
    expect(h.spanDays).toBe(0)
  })
})

describe('wide_by_wave view equals the demo', () => {
  const histories = buildHistories(SESSIONS.map((s) => ({ ...toInput(s), participantId: s.participantId })))
  const maxWaves = Math.max(...histories.map((h) => h.n))

  it('has up to 5 waves', () => {
    expect(maxWaves).toBe(5)
  })

  for (const row of WIDE.slice(1)) {
    it(`${row[0]}: T1..T5 per index, span in days and last-minus-first change`, () => {
      const h = histories.find((x) => x.participantId === row[0]) as (typeof histories)[number]
      const w = wideRow(h, maxWaves)
      const head = WIDE[0] as string[]
      const cell = (name: string): string | number => row[head.indexOf(name)] as string | number
      const series = (prefix: string): (number | null)[] => Array.from({ length: maxWaves }, (_, i) => {
        const v = cell(`${prefix}_T${i + 1}`)
        return v === '' ? null : (v as number)
      })
      const change = (name: string): number | null => (cell(`${name}_change`) === '' ? null : (cell(`${name}_change`) as number))
      expect(w.n).toBe(cell('n') as number)
      expect(w.firstDate).toBe(cell('first_date') as string)
      expect(w.lastDate).toBe(cell('last_date') as string)
      expect(w.days).toBe(cell('days') as number)
      expect(w.mhi).toEqual(series('MHI'))
      expect(w.level).toEqual(series('Level'))
      expect(w.di).toEqual(series('DI'))
      expect(w.wi).toEqual(series('WI'))
      expect(w.bhi).toEqual(series('BHI'))
      expect(w.change).toEqual({ mhi: change('MHI'), level: change('Level'), di: change('DI'), wi: change('WI'), bhi: change('BHI') })
    })
  }
})

describe('change wording: boundaries', () => {
  it('5 points is the line between slightly and clearly, both directions, both polarities', () => {
    expect(MHCU_SIGNIFICANT_CHANGE).toBe(5)
    expect(compareIndex(50, 54.99, true).kind).toBe('slightly_better')
    expect(compareIndex(50, 55, true).kind).toBe('clearly_better')
    expect(compareIndex(50, 45.01, true).kind).toBe('slightly_worse')
    expect(compareIndex(50, 45, true).kind).toBe('clearly_worse')
    expect(compareIndex(40, 35.01, false).kind).toBe('slightly_better') // DI down = better
    expect(compareIndex(40, 35, false).kind).toBe('clearly_better')
    expect(compareIndex(40, 44.99, false).kind).toBe('slightly_worse')
    expect(compareIndex(40, 45, false).kind).toBe('clearly_worse')
  })

  it('float noise at exactly 5 points still counts as clearly (51.67 - 46.67)', () => {
    expect(compareIndex(46.67, 51.67, true).kind).toBe('clearly_better')
  })

  it('a change that prints as 0.0 is stable; missing values give no verdict', () => {
    expect(compareIndex(66.67, 66.67, true).kind).toBe('stable')
    expect(compareIndex(50, 50.04, true).kind).toBe('stable')
    expect(compareIndex(50, 50.06, true).kind).toBe('slightly_better')
    expect(compareIndex(null, 50, true)).toMatchObject({ kind: null, word: null, delta: null, significant: false })
    expect(compareMetric('mhi', 50, null).kind).toBeNull()
  })

  it('formats signed changes as the reports print them', () => {
    expect(formatSignedChange(8.9, 'id')).toBe('+8,9')
    expect(formatSignedChange(-23.1, 'id')).toBe('-23,1')
    expect(formatSignedChange(0, 'id')).toBe('0,0')
    expect(formatSignedChange(30, 'en')).toBe('+30.0')
    expect(formatSignedChange(null, 'en')).toBe('-')
  })

  it('level changes and domain changes', () => {
    expect(compareLevel(3, 2)).toMatchObject({ delta: -1, direction: 'down', text: { id: 'Turun 1 level', en: 'Down 1 level' }, word: { id: 'Membaik', en: 'Improved' } })
    expect(compareLevel(5, 3).text.id).toBe('Turun 2 level')
    expect(compareLevel(2, 4)).toMatchObject({ direction: 'up', text: { id: 'Naik 2 level', en: 'Up 2 level' }, word: { id: 'Memburuk', en: 'Worse' } })
    expect(compareLevel(2, 2).word.id).toBe('Tetap')
    // Substance Use (domain 13) threshold is 1; Depression (domain 1) threshold is 2
    expect(compareDomain(1, 3, 2).word?.id).toBe('Membaik, masih di atas ambang')
    expect(compareDomain(1, 2, 1).word?.id).toBe('Membaik')
    expect(compareDomain(1, 1, 2).word?.en).toBe('Worse, still at/above threshold')
    expect(compareDomain(13, 0, 0).word?.id).toBe('Tetap')
    expect(compareDomain(13, 1, 1).word?.id).toBe('Tetap, masih di atas ambang')
    expect(compareDomain(1, null, 2).word).toBeNull()
  })
})

describe('numbers printed in the demo reports', () => {
  const waves = (id: string) => buildHistory(byId(id).map(toInput), id).waves

  it('c5 / p5 (Nadia, P00001, T5): previous (T4) -> latest, and T1 -> T5', () => {
    const w = waves('P00001')
    const prev = compareWaves(w[3] as (typeof w)[number], w[4] as (typeof w)[number])
    expect(formatSignedChange(prev.di.deltaShown, 'id')).toBe('-1,9')
    expect(prev.di.word?.id).toBe('Sedikit membaik')
    expect(formatSignedChange(prev.wi.deltaShown, 'id')).toBe('+8,9')
    expect(prev.wi.word?.id).toBe('Membaik bermakna')
    expect(formatSignedChange(prev.bhi.deltaShown, 'id')).toBe('+1,7')
    expect(prev.bhi.word?.id).toBe('Sedikit membaik')
    expect(prev.mhi.delta).toBeCloseTo(4.68, 9) // "naik 4,7 poin"
    expect(prev.mhi.deltaShown).toBe(4.7)

    const all = compareWaves(w[0] as (typeof w)[number], w[4] as (typeof w)[number])
    expect(formatSignedChange(all.mhi.deltaShown, 'id')).toBe('+30,0')
    expect(all.mhi.word?.id).toBe('Membaik bermakna')
    expect(formatSignedChange(all.di.deltaShown, 'id')).toBe('-23,1')
    expect(all.di.word?.id).toBe('Membaik bermakna')
    expect(formatSignedChange(all.wi.deltaShown, 'id')).toBe('+41,1')
    expect(formatSignedChange(all.bhi.deltaShown, 'id')).toBe('+21,7')
    expect(all.level.text.id).toBe('Turun 1 level')
    expect(all.level.word.id).toBe('Membaik')
    expect(all.wiDims.map((d) => formatSignedChange(d.deltaShown, 'id'))).toEqual(['+33,3', '+43,8', '+41,7'])
    expect(all.bhiDims.map((d) => formatSignedChange(d.deltaShown, 'id'))).toEqual(['+21,4', '+35,0', '0,0'])
    expect(all.bhiDims[2]?.word?.id).toBe('Relatif tetap')
    expect(all.domains.map((d) => d.word?.id)).toEqual([
      'Membaik', 'Membaik', 'Membaik', 'Membaik, masih di atas ambang', 'Membaik', 'Tetap', 'Tetap',
      'Membaik', 'Membaik', 'Membaik', 'Membaik', 'Tetap, masih di atas ambang', 'Tetap',
    ])
    expect(all.domains.map((d) => d.delta)).toEqual([-1, -2, -1, -1, -1, 0, 0, -1, -2, -2, -1, 0, 0])
    expect(buildHistory(byId('P00001').map(toInput)).spanDays).toBe(112)
    expect(w.map((x) => x.mhi)).toEqual([46.08, 54.11, 61.37, 71.4, 76.08]) // 46,1 54,1 61,4 71,4 76,1
  })

  it('c4r (Rizky, P00005, T4): T3 -> T4 and T1 -> T4', () => {
    const w = waves('P00005')
    expect(w.length).toBe(4)
    const prev = compareWaves(w[2] as (typeof w)[number], w[3] as (typeof w)[number])
    expect(formatSignedChange(prev.di.deltaShown, 'id')).toBe('-5,8')
    expect(prev.di.word?.id).toBe('Membaik bermakna')
    expect(formatSignedChange(prev.wi.deltaShown, 'id')).toBe('+1,8')
    expect(prev.wi.word?.id).toBe('Sedikit membaik')
    expect(formatSignedChange(prev.bhi.deltaShown, 'id')).toBe('+5,0')
    expect(prev.bhi.word?.id).toBe('Membaik bermakna')
    const all = compareWaves(w[0] as (typeof w)[number], w[3] as (typeof w)[number])
    expect(formatSignedChange(all.mhi.deltaShown, 'id')).toBe('+24,5')
    expect(formatSignedChange(all.di.deltaShown, 'id')).toBe('-28,8')
    expect(formatSignedChange(all.wi.deltaShown, 'id')).toBe('+25,0')
    expect(formatSignedChange(all.bhi.deltaShown, 'id')).toBe('+15,0')
    expect(all.level.text.id).toBe('Turun 2 level')
    expect(all.level.text.en).toBe('Down 2 level')
    expect(all.mhi.word?.en).toBe('Clearly improved')
    expect(buildHistory(byId('P00005').map(toInput)).spanDays).toBe(56)
  })

  it('p1 / c1 (Larasati, P00007): a single measurement has no change and no previous wave', () => {
    const h = buildHistory(byId('P00007').map(toInput), 'P00007')
    expect(h.n).toBe(1)
    expect(h.waves[0]?.waveNo).toBe(1)
    expect(h.waves[0]?.delta).toEqual({ mhi: null, di: null, wi: null, bhi: null, level: null })
    expect(wideRow(h, 5).change.mhi).toBeNull()
  })

  it('a worsening person reads as worse: Bima (P00003) T2 -> T3', () => {
    const w = waves('P00003')
    const c = compareWaves(w[1] as (typeof w)[number], w[2] as (typeof w)[number])
    expect(c.mhi.kind).toBe('clearly_worse') // 64.68 -> 52.37
    expect(c.di.kind).toBe('clearly_worse') // DI went up 7.69
    expect(c.level.direction).toBe('down')
  })
})
