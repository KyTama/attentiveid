/**
 * Mental Health Check-Up (MHCU / R-MHCU) Assessment Domain
 *
 * Pure item bank, submission validation and scoring for the MHCU questionnaire of
 * Biro Psikologi Attentive. Ported from the team's Apps Script pipeline
 * (RMHCU_AppsScript.gs, calculator "version latest", sheets Kunci + Hasil, manual v2.0).
 * No I/O and no clock access: every function is deterministic.
 *
 * Parts: A = CC (23 symptom items, 0-4), B = WB (14 WEMWBS items, 1-5),
 * C = HB (15 healthy-behaviour items, 0-4), D = ATI (6 Attentive Personality items, 0-4).
 * The old "NA" answer of Part C no longer exists; a skipped item is simply absent.
 */

export const MHCU_PARTS = ['cc', 'wb', 'hb', 'ati'] as const
export type MhcuPart = typeof MHCU_PARTS[number]

export const MHCU_PART_SIZE: Record<MhcuPart, number> = { cc: 23, wb: 14, hb: 15, ati: 6 }

/** Inclusive answer range per part. Part B (WEMWBS) is 1-5, every other part is 0-4. */
export const MHCU_ANSWER_RANGE: Record<MhcuPart, { min: number; max: number }> = {
  cc: { min: 0, max: 4 },
  wb: { min: 1, max: 5 },
  hb: { min: 0, max: 4 },
  ati: { min: 0, max: 4 },
}

/** Minimum answered items per part for the part to be scored (Kunci B10:B13). */
export const MHCU_MIN_ANSWERED: Record<MhcuPart, number> = { cc: 20, wb: 12, hb: 11, ati: 5 }

/** Index weights of the Mental Health Index (Kunci B6:B8, manual s.9). */
export const MHCU_WEIGHTS = { di: 0.4, wi: 0.4, bhi: 0.2 } as const

export interface MhcuItem {
  part: MhcuPart
  n: number
  /** Answer key used in the submission, e.g. CC01, WB14, HB05, ATI06 */
  code: string
  id: string
  en: string
}

/** Answer code of an item. Identical to code() of the participant form (CC01..CC23, WB01.., HB01.., ATI01..ATI06). */
export function mhcuCode(part: MhcuPart, n: number): string {
  const prefix = { cc: 'CC', wb: 'WB', hb: 'HB', ati: 'ATI' }[part]
  return prefix + (n < 10 ? '0' : '') + n
}

function item(part: MhcuPart, n: number, id: string, en: string): MhcuItem {
  return { part, n, code: mhcuCode(part, n), id, en }
}

/** The 58 items in form order (text exactly as on the participant form). */
export const MHCU_ITEMS: readonly MhcuItem[] = [
  item('cc', 1,
    'Kurang berminat atau kurang merasa senang dalam melakukan berbagai hal?',
    'Little interest or pleasure in doing things?'),
  item('cc', 2,
    'Merasa sedih, murung, tertekan, atau putus asa?',
    'Feeling down, depressed, or hopeless?'),
  item('cc', 3,
    'Merasa lebih mudah kesal, uring-uringan, atau marah dibanding biasanya?',
    'Feeling more irritated, grouchy, or angry than usual?'),
  item('cc', 4,
    'Tidur lebih sedikit dari biasanya, tetapi tetap merasa sangat berenergi?',
    'Sleeping less than usual, but still have a lot of energy?'),
  item('cc', 5,
    'Memulai jauh lebih banyak proyek/kegiatan dari biasanya, atau melakukan hal-hal yang lebih berisiko dari biasanya?',
    'Starting lots more projects than usual or doing more risky things than usual?'),
  item('cc', 6,
    'Merasa gugup, cemas, takut, khawatir, atau tegang?',
    'Feeling nervous, anxious, frightened, worried, or on edge?'),
  item('cc', 7,
    'Merasa panik atau ketakutan?',
    'Feeling panic or being frightened?'),
  item('cc', 8,
    'Menghindari situasi yang membuat Anda cemas?',
    'Avoiding situations that make you anxious?'),
  item('cc', 9,
    'Rasa sakit atau nyeri yang tidak jelas penyebabnya (misalnya di kepala, punggung, sendi, perut, kaki)?',
    'Unexplained aches and pains (e.g., head, back, joints, abdomen, legs)?'),
  item('cc', 10,
    'Merasa bahwa penyakit atau keluhan Anda tidak ditanggapi dengan cukup serius?',
    'Feeling that your illnesses are not being taken seriously enough?'),
  item('cc', 11,
    'Pikiran untuk benar-benar menyakiti diri sendiri?',
    'Thoughts of actually hurting yourself?'),
  item('cc', 12,
    'Mendengar hal-hal yang tidak dapat didengar orang lain, seperti suara-suara padahal tidak ada siapa pun di sekitar Anda?',
    'Hearing things other people couldn\'t hear, such as voices even when no one was around?'),
  item('cc', 13,
    'Merasa bahwa ada orang yang dapat mendengar pikiran Anda, atau bahwa Anda dapat mendengar apa yang sedang dipikirkan orang lain?',
    'Feeling that someone could hear your thoughts, or that you could hear what another person was thinking?'),
  item('cc', 14,
    'Masalah tidur yang memengaruhi kualitas tidur Anda secara keseluruhan?',
    'Problems with sleep that affected your sleep quality over all?'),
  item('cc', 15,
    'Masalah dengan daya ingat (misalnya mempelajari informasi baru) atau dengan orientasi tempat (misalnya menemukan jalan pulang)?',
    'Problems with memory (e.g., learning new information) or with location (e.g., finding your way home)?'),
  item('cc', 16,
    'Pikiran, dorongan, atau bayangan tidak menyenangkan yang berulang kali muncul di benak Anda?',
    'Unpleasant thoughts, urges, or images that repeatedly enter your mind?'),
  item('cc', 17,
    'Merasa terdorong untuk melakukan perilaku atau aktivitas mental tertentu secara berulang-ulang?',
    'Feeling driven to perform certain behaviors or mental acts over and over again?'),
  item('cc', 18,
    'Merasa terlepas atau berjarak dari diri sendiri, tubuh Anda, lingkungan fisik di sekitar Anda, atau ingatan-ingatan Anda?',
    'Feeling detached or distant from yourself, your body, your physical surroundings, or your memories?'),
  item('cc', 19,
    'Tidak tahu siapa diri Anda sebenarnya atau apa yang Anda inginkan dalam hidup?',
    'Not knowing who you really are or what you want out of life?'),
  item('cc', 20,
    'Tidak merasa dekat dengan orang lain atau tidak menikmati hubungan Anda dengan mereka?',
    'Not feeling close to other people or enjoying your relationships with them?'),
  item('cc', 21,
    'Minum setidaknya 4 gelas minuman beralkohol jenis apa pun dalam satu hari?',
    'Drinking at least 4 drinks of any kind of alcohol in a single day?'),
  item('cc', 22,
    'Merokok (rokok jenis apa pun, cerutu, atau pipa), atau menggunakan tembakau hirup atau tembakau kunyah?',
    'Smoking any cigarettes, a cigar, or pipe, or using snuff or chewing tobacco?'),
  item('cc', 23,
    'Menggunakan obat-obatan berikut ATAS KEMAUAN SENDIRI, yaitu tanpa resep dokter, dalam jumlah lebih banyak atau lebih lama dari yang diresepkan [misalnya obat pereda nyeri (seperti Vicodin), stimulan (seperti Ritalin atau Adderall), obat penenang atau obat tidur (seperti pil tidur atau Valium), atau zat seperti ganja, kokain atau crack, club drugs (seperti ekstasi), halusinogen (seperti LSD), heroin, inhalan atau pelarut (seperti lem), atau metamfetamin (seperti sabu)]?',
    'Using any of the following medicines ON YOUR OWN, that is, without a doctor\'s prescription, in greater amounts or longer than prescribed [e.g., painkillers (like Vicodin), stimulants (like Ritalin or Adderall), sedatives or tranquilizers (like sleeping pills or Valium), or drugs like marijuana, cocaine or crack, club drugs (like ecstasy), hallucinogens (like LSD), heroin, inhalants or solvents (like glue), or methamphetamine (like speed)]?'),
  item('wb', 1,
    'Saya merasa optimis tentang masa depan',
    'I\'ve been feeling optimistic about the future'),
  item('wb', 2,
    'Saya merasa berguna',
    'I\'ve been feeling useful'),
  item('wb', 3,
    'Saya merasa santai',
    'I\'ve been feeling relaxed'),
  item('wb', 4,
    'Saya merasa tertarik pada orang lain',
    'I\'ve been feeling interested in other people'),
  item('wb', 5,
    'Saya memiliki energi yang berlebih/cukup (I\'ve had energy to spare)',
    'I\'ve had energy to spare'),
  item('wb', 6,
    'Saya mampu menghadapi masalah dengan baik',
    'I\'ve been dealing with problems well'),
  item('wb', 7,
    'Saya dapat berpikir dengan jernih',
    'I\'ve been thinking clearly'),
  item('wb', 8,
    'Saya merasa baik tentang diri saya',
    'I\'ve been feeling good about myself'),
  item('wb', 9,
    'Saya merasa dekat dengan orang lain',
    'I\'ve been feeling close to other people'),
  item('wb', 10,
    'Saya merasa percaya diri',
    'I\'ve been feeling confident'),
  item('wb', 11,
    'Saya mampu mengambil keputusan sendiri tentang berbagai hal',
    'I\'ve been able to make up my own mind about things'),
  item('wb', 12,
    'Saya merasa dicintai',
    'I\'ve been feeling loved'),
  item('wb', 13,
    'Saya tertarik pada hal-hal baru',
    'I\'ve been interested in new things'),
  item('wb', 14,
    'Saya merasa ceria',
    'I\'ve been feeling cheerful'),
  item('hb', 1,
    'Bangun pagi',
    'Wake up early'),
  item('hb', 2,
    'Bekerja (termasuk tugas sekolah/kuliah atau kerja lepasan)',
    'Work (including school or university assignments)'),
  item('hb', 3,
    'Tidur pada jam teratur',
    'Go to bed at regular times'),
  item('hb', 4,
    'Mandi',
    'Take a bath or shower'),
  item('hb', 5,
    'Berdoa (salat/gereja/meditasi)',
    'Engage in spiritual practices (e.g., prayer, worship services, meditation)'),
  item('hb', 6,
    'Berolahraga',
    'Exercise'),
  item('hb', 7,
    'Merapihkan kamar',
    'Tidy up your room'),
  item('hb', 8,
    'Makan pada waktu yang teratur',
    'Eat meals at regular times'),
  item('hb', 9,
    'Makan sayur',
    'Eat vegetables'),
  item('hb', 10,
    'Makan bersama orang terdekat (keluarga, pasangan, teman)',
    'Eating together with people close to you (e.g., family, partner, friends)'),
  item('hb', 11,
    'Mengobrol santai dengan teman (nongkrong, mengobrol di warung, berbincang saat istirahat)',
    'Chatting casually with friends (e.g., hanging out, chatting at a food stall, talking during breaks)'),
  item('hb', 12,
    'Menyapa tetangga saat bertemu',
    'Greet neighbors when you see them'),
  item('hb', 13,
    'Membantu orang lain (membantu pekerjaan kecil, bersedekah, berdonasi)',
    'Help others (e.g., helping with small tasks, giving to charity, making donations)'),
  item('hb', 14,
    'Ikut kegiatan warga (misalnya arisan, pengajian, kerja bakti, pertemuan RT)',
    'Participate in community activities (e.g., arisan, religious gatherings, neighborhood clean-ups, local meetings)'),
  item('hb', 15,
    'Melakukan hobi yang disukai',
    'Engage in hobbies you enjoy'),
  item('ati', 1,
    'Saya mendengarkan orang lain dengan sungguh-sungguh.',
    'I listen to others attentively.'),
  item('ati', 2,
    'Saya menaruh perhatian pada masalah orang lain seolah-olah itu masalah saya sendiri.',
    'I pay attention to other people\'s problems as if they were my own.'),
  item('ati', 3,
    'Saya menyadari apa yang sedang saya lakukan.',
    'I am aware of what I am doing.'),
  item('ati', 4,
    'Saya bisa mengelola informasi yang banyak dan kompleks.',
    'I can handle large amounts of complex information.'),
  item('ati', 5,
    'Saya bertekad menyampaikan apa yang saya pikirkan sejelas mungkin.',
    'I am determined to articulate my thoughts as clearly as possible.'),
  item('ati', 6,
    'Saya dapat melihat keindahan dalam hal-hal yang sering luput dari perhatian orang lain.',
    'I can see beauty in things that others might not notice.'),
]

export function mhcuItemsOf(part: MhcuPart): MhcuItem[] {
  return MHCU_ITEMS.filter((it) => it.part === part)
}

const ITEM_BY_CODE: ReadonlyMap<string, MhcuItem> = new Map(MHCU_ITEMS.map((it) => [it.code, it]))

/* ============================== SCORING KEY ============================== */

interface DomainDef {
  items: number[]
  /** Review threshold: a domain score at or above it is flagged (Kunci rows 32-44) */
  threshold: number
  id: string
  en: string
  /** Level forced by this critical domain: CC11 = Level 5, CC12/13 = Level 4 */
  critical?: 4 | 5
}

export const MHCU_DOMAINS: readonly DomainDef[] = [
  { items: [1, 2], threshold: 2, id: 'Depresi', en: 'Depression' },
  { items: [3], threshold: 2, id: 'Kemarahan', en: 'Anger' },
  { items: [4, 5], threshold: 2, id: 'Mania', en: 'Mania' },
  { items: [6, 7, 8], threshold: 2, id: 'Kecemasan', en: 'Anxiety' },
  { items: [9, 10], threshold: 2, id: 'Gejala Somatik', en: 'Somatic Symptoms' },
  { items: [11], threshold: 1, id: 'Pikiran Menyakiti Diri', en: 'Thoughts of Hurting Oneself', critical: 5 },
  { items: [12, 13], threshold: 1, id: 'Gejala Psikotik', en: 'Psychosis-related Experiences', critical: 4 },
  { items: [14], threshold: 2, id: 'Masalah Tidur', en: 'Sleep Problems' },
  { items: [15], threshold: 2, id: 'Memori', en: 'Memory' },
  { items: [16, 17], threshold: 2, id: 'Pikiran & Perilaku Berulang', en: 'Repetitive Thoughts & Behavior' },
  { items: [18], threshold: 2, id: 'Disosiasi', en: 'Dissociation' },
  { items: [19, 20], threshold: 2, id: 'Fungsi Kepribadian', en: 'Personality Functioning' },
  { items: [21, 22, 23], threshold: 1, id: 'Penggunaan Zat', en: 'Substance Use' },
]

interface DimensionDef {
  id: string
  en: string
  items: number[]
}

export const MHCU_WI_DIMENSIONS: readonly DimensionDef[] = [
  { id: 'Afek Positif', en: 'Positive Affect', items: [1, 3, 14] },
  { id: 'Fungsi Positif', en: 'Positive Functioning', items: [2, 5, 6, 7, 8, 10, 11, 13] },
  { id: 'Relasi Positif', en: 'Positive Relationships', items: [4, 9, 12] },
]

export const MHCU_BHI_DIMENSIONS: readonly DimensionDef[] = [
  { id: 'Self-care & Rutinitas', en: 'Self-care & Routine', items: [1, 3, 4, 6, 7, 8, 9] },
  { id: 'Koneksi Sosial', en: 'Social Connection', items: [10, 11, 12, 13, 14] },
  { id: 'Aktivitas Bermakna', en: 'Meaningful Activity', items: [2, 5, 15] },
]

export const MHCU_ATI_ASPECTS = [
  'Attentive Listening',
  'Empathic Concern',
  'Mindful Awareness',
  'Cognitive Engagement',
  'Clarity of Expression',
  'Aesthetic Sensitivity',
] as const

type CategoryKind = 'di' | 'wi' | 'bhi' | 'ati'

/** Category lower bounds (Kunci section 7). All but the WI bounds (Warwick raw 41/45/60) are provisional per Kunci A2. */
export const MHCU_CATEGORIES: Record<CategoryKind, { lo: number[]; id: string[]; en: string[] }> = {
  di: { lo: [0, 10, 25, 50], id: ['Minimal', 'Ringan', 'Sedang', 'Tinggi'], en: ['Minimal', 'Mild', 'Moderate', 'High'] },
  wi: { lo: [0, 48.2, 55.3, 82.1], id: ['Sangat rendah', 'Rendah', 'Rata-rata', 'Tinggi'], en: ['Very low', 'Low', 'Average', 'High'] },
  bhi: { lo: [0, 25, 50, 75], id: ['Sangat kurang', 'Kurang', 'Cukup', 'Baik'], en: ['Very low', 'Low', 'Fair', 'High'] },
  ati: { lo: [0, 37.5, 62.5, 87.5], id: ['Rendah', 'Sedang', 'Tinggi', 'Sangat tinggi'], en: ['Low', 'Moderate', 'High', 'Very high'] },
}

/** MHI band lower bounds and the level of each band (Kunci rows 63-66). */
export const MHCU_MHI_LO = [0, 40, 55, 70] as const
export const MHCU_MHI_LEVEL = [4, 3, 2, 1] as const
export const MHCU_MHI_BANDS = {
  id: ['Perlu perhatian serius', 'Perhatian', 'Dipantau', 'Baik'],
  en: ['Needs serious attention', 'Attention', 'Monitoring', 'Good'],
} as const

export interface MhcuLevelDef {
  id: string
  en: string
  /** Name used in the status line when it differs from `id` (Kunci row 73) */
  statusId?: string
  responseTimeId: string
  responseTimeEn: string
  actionId: string
  actionEn: string
}

/** Final levels 1-5 (Kunci rows 69-73). Indonesian is the team text; English is a translation by the build. */
export const MHCU_LEVELS: Record<1 | 2 | 3 | 4 | 5, MhcuLevelDef> = {
  1: {
    id: 'Baik', en: 'Good', responseTimeId: 'Rutin', responseTimeEn: 'Routine',
    actionId: 'Umpan balik umum dan psikoedukasi; skrining ulang berkala (mis. 6 bulan).',
    actionEn: 'General feedback and psychoeducation; periodic re-screening (e.g. every 6 months).',
  },
  2: {
    id: 'Perlu Dipantau', en: 'Needs Monitoring', responseTimeId: '2 minggu', responseTimeEn: '2 weeks',
    actionId: 'Psikolog meninjau domain/item yang ditandai; tawarkan konseling (First Free Session); skrining ulang 2-4 minggu.',
    actionEn: 'The psychologist reviews the flagged domains/items; offer counselling (First Free Session); re-screen in 2-4 weeks.',
  },
  3: {
    id: 'Perlu Perhatian', en: 'Needs Attention', responseTimeId: '1 minggu', responseTimeEn: '1 week',
    actionId: 'Rekomendasikan sesi konseling dan asesmen lanjutan untuk domain yang ditandai.',
    actionEn: 'Recommend a counselling session and further assessment of the flagged domains.',
  },
  4: {
    id: 'Perlu Perhatian Serius', en: 'Needs Serious Attention', responseTimeId: '3 hari kerja', responseTimeEn: '3 working days',
    actionId: 'Psikolog menghubungi secara proaktif; asesmen klinis menyeluruh; pertimbangkan rujukan psikiater.',
    actionEn: 'The psychologist makes proactive contact; thorough clinical assessment; consider a psychiatrist referral.',
  },
  5: {
    id: 'Prioritas', en: 'Priority', statusId: 'Prioritas (item kritis)', responseTimeId: 'Hari yang sama', responseTimeEn: 'Same day',
    actionId: 'Hubungi hari yang sama; asesmen risiko bunuh diri; susun safety plan; rujuk layanan darurat bila risiko tinggi.',
    actionEn: 'Make contact the same day; suicide-risk assessment; build a safety plan; refer to emergency services if the risk is high.',
  },
}

/* ============================== SCORING ============================== */

/** Answers keyed by item code (CC01..). Absent, null, non-integer or out-of-range values count as "not answered". */
export type MhcuAnswers = Readonly<Record<string, number | null | undefined>>

type Slot = number | null

export interface MhcuDomainResult {
  /** 1-13 */
  n: number
  id: string
  en: string
  items: number[]
  threshold: number
  critical: 4 | 5 | null
  /** Highest item of the domain (0-4); null when none of its items was answered */
  score: number | null
  flagged: boolean
}

export interface MhcuDimensionResult {
  id: string
  en: string
  items: number[]
  /** 0-100, null when it cannot be computed */
  score: number | null
}

export interface MhcuCategory {
  index: number
  id: string
  en: string
}

export type MhcuTriggerKind = 'critmissing' | 'cc11' | 'psy' | 'ndom' | 'severe' | 'wb' | 'mhilow' | 'none'

export interface MhcuTrigger {
  k: MhcuTriggerKind
  /** Number shown in the reason text (score, count, WEMWBS total, rounded MHI) */
  v?: number
  /** WEMWBS review level (2 = possible, 3 = probable depression indication) */
  lvl?: 2 | 3
}

export interface MhcuResult {
  /** Answered item counts per part */
  answered: Record<MhcuPart, number>
  domains: MhcuDomainResult[]
  /** Names (Indonesian, as the calculator) of the flagged domains, critical ones included */
  flaggedDomains: string[]
  /** Flagged domains that are not critical (Hasil U) */
  flaggedNonCritical: number
  /** Highest score among non-critical domains (Hasil W) */
  maxNonCritical: number

  /** Distress Index 0-100 (higher = worse) */
  di: number | null
  diCategory: MhcuCategory | null

  /** WEMWBS total 14-70, prorated for 12-13 answers */
  wbTotal: number | null
  /** Well-being Index 0-100 */
  wi: number | null
  wiCategory: MhcuCategory | null
  wiDims: MhcuDimensionResult[]

  /** Behavioral Health Index 0-100 */
  bhi: number | null
  bhiCategory: MhcuCategory | null
  bhiDims: MhcuDimensionResult[]

  /** Mental Health Index 0-100 = 0.4 (100 - DI) + 0.4 WI + 0.2 BHI */
  mhi: number | null
  mhiBand: { index: number; id: string; en: string } | null
  /** Level 1-4 of the MHI band alone */
  mhiLevel: 1 | 2 | 3 | 4 | null

  /** Attentive Personality Index, reported separately from the MHI */
  ati: { total: number | null; index: number | null; category: MhcuCategory | null }
  atiAspects: {
    highest: string | null
    lowest: string | null
    items: { n: number; name: string; score: number | null }[]
  }

  /** Red-flag rules: R1 critical item (5 / 4 / 0), R2 domains (3 / 2 / 0), R3 WEMWBS (3 / 2 / 0) */
  redFlags: { r1: 0 | 4 | 5; r2: 0 | 2 | 3; r3: 0 | 2 | 3 }

  /** Final level 1-5: highest of the MHI level and R1/R2/R3 */
  level: 1 | 2 | 3 | 4 | 5
  levelName: { id: string; en: string }
  followUp: { responseTimeId: string; responseTimeEn: string; actionId: string; actionEn: string }
  /** Status line as in the calculator (Indonesian) and its English counterpart */
  status: string
  statusEn: string

  triggers: MhcuTrigger[]
  /** Trigger texts in both languages ("Pemicu" column of the calculator) */
  reasons: { id: string; en: string }[]

  /** True when the MHI cannot be computed (DI, WI or BHI missing for lack of answers) */
  incomplete: boolean
  /** True when any of the critical items CC11-CC13 is unanswered */
  criticalMissing: boolean
  /** True when all 58 items are answered */
  complete: boolean
  /** "Lengkap" or "Cek: A x/23, B x/14, C x/15, D x/6" */
  completeness: string
}

const isNum = (v: Slot | undefined): v is number => typeof v === 'number' && !Number.isNaN(v)
const numsOf = (arr: readonly Slot[]): number[] => arr.filter(isNum)
const meanOf = (arr: readonly number[]): number | null =>
  arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null
const pick = (arr: readonly Slot[], items: readonly number[]): Slot[] => items.map((i) => arr[i - 1] ?? null)

function categoryOf(kind: CategoryKind, v: number | null): MhcuCategory | null {
  if (v === null) return null
  const cat = MHCU_CATEGORIES[kind]
  let k = 0
  for (let i = 0; i < cat.lo.length; i++) if (v >= (cat.lo[i] ?? 0)) k = i
  return { index: k, id: cat.id[k] ?? '', en: cat.en[k] ?? '' }
}

function bandIndexOf(mhi: number): number {
  let k = 0
  for (let i = 0; i < MHCU_MHI_LO.length; i++) if (mhi >= (MHCU_MHI_LO[i] ?? 0)) k = i
  return k
}

function slotsOf(answers: MhcuAnswers, part: MhcuPart): Slot[] {
  const range = MHCU_ANSWER_RANGE[part]
  const out: Slot[] = []
  for (let n = 1; n <= MHCU_PART_SIZE[part]; n++) {
    const v = answers[mhcuCode(part, n)]
    out.push(typeof v === 'number' && Number.isInteger(v) && v >= range.min && v <= range.max ? v : null)
  }
  return out
}

/** Reason text of a trigger. Indonesian reproduces the calculator's "Pemicu" column word for word; English is a translation. */
export function mhcuTriggerText(t: MhcuTrigger, lang: 'id' | 'en'): string {
  const id = lang === 'id'
  switch (t.k) {
    case 'critmissing':
      return id ? 'ITEM KRITIS CC11-CC13 KOSONG, konfirmasi langsung' : 'CRITICAL ITEMS CC11-CC13 MISSING, confirm directly'
    case 'cc11':
      return id ? `Pikiran menyakiti diri (CC11 = ${t.v})` : `Thoughts of hurting oneself (CC11 = ${t.v})`
    case 'psy':
      return id ? `Gejala psikotik (skor ${t.v})` : `Psychosis-related experiences (score ${t.v})`
    case 'ndom':
      return id ? `${t.v} domain di atas ambang` : `${t.v} domain(s) at or above threshold`
    case 'severe':
      return id ? 'ada domain berat (skor 4)' : 'a domain with a severe score (4)'
    case 'wb':
      if (id) return `total well-being ${t.v}` + (t.lvl === 3 ? ' (indikasi depresi probable)' : ' (indikasi depresi possible)')
      return `WEMWBS total ${t.v}` + (t.lvl === 3
        ? ' (<=40; Warwick benchmark: probable depression indication)'
        : ' (41-44; Warwick benchmark: possible depression indication)')
    case 'mhilow':
      return id ? `MHI rendah (${t.v})` : `low MHI (${t.v})`
    case 'none':
      return id ? 'Tidak ada pemicu' : 'No trigger'
  }
}

/** All trigger texts joined with ", " (the calculator's "Pemicu" cell). */
export function mhcuTriggersText(result: Pick<MhcuResult, 'triggers'>, lang: 'id' | 'en'): string {
  return result.triggers.map((t) => mhcuTriggerText(t, lang)).join(', ')
}

const r1 = (v: number): number => Math.round(v * 10) / 10

/**
 * Score a set of answers. Mirrors score_() of the Apps Script (Hasil columns H..AY row by row).
 * Never throws: unanswered or invalid answers are left out, and indices that lack enough answers are null.
 */
export function scoreMhcu(answers: MhcuAnswers): MhcuResult {
  const cc = slotsOf(answers, 'cc')
  const wb = slotsOf(answers, 'wb')
  const hb = slotsOf(answers, 'hb')
  const ati = slotsOf(answers, 'ati')
  const answered: Record<MhcuPart, number> = {
    cc: numsOf(cc).length,
    wb: numsOf(wb).length,
    hb: numsOf(hb).length,
    ati: numsOf(ati).length,
  }

  // Part A: a domain scores its highest answered item (Hasil H:T). Tobacco (CC22) counts in Substance Use (Kunci B14 = 1).
  const domains: MhcuDomainResult[] = MHCU_DOMAINS.map((dm, i) => {
    const vals = numsOf(pick(cc, dm.items))
    const score = vals.length ? Math.max(...vals) : null
    return {
      n: i + 1,
      id: dm.id,
      en: dm.en,
      items: [...dm.items],
      threshold: dm.threshold,
      critical: dm.critical ?? null,
      score,
      flagged: score !== null && score >= dm.threshold,
    }
  })
  const flaggedNonCritical = domains.filter((d) => d.critical === null && d.flagged).length // Hasil U
  const maxNonCritical = Math.max(0, ...domains.filter((d) => d.critical === null).map((d) => d.score ?? 0)) // Hasil W
  const present = domains.map((d) => d.score).filter(isNum)
  const diMean = meanOf(present)
  const di = answered.cc < MHCU_MIN_ANSWERED.cc || diMean === null ? null : (diMean / 4) * 100 // Hasil X

  // Part B: WEMWBS total, prorated for 12-13 answers (Hasil Z), WI and its dimensions (AA:AE)
  const wbMean = meanOf(numsOf(wb))
  const wbTotal = answered.wb < MHCU_MIN_ANSWERED.wb || wbMean === null ? null : Math.round(wbMean * 14 + 1e-9)
  const wi = wbTotal === null ? null : ((wbTotal - 14) / 56) * 100
  const wiDims: MhcuDimensionResult[] = MHCU_WI_DIMENSIONS.map((dm) => {
    const m = meanOf(numsOf(pick(wb, dm.items)))
    return { id: dm.id, en: dm.en, items: [...dm.items], score: wbTotal === null || m === null ? null : ((m - 1) / 4) * 100 }
  })

  // Part C: BHI, unanswered items excluded (Hasil AF:AK)
  const hbMean = meanOf(numsOf(hb))
  const bhi = answered.hb < MHCU_MIN_ANSWERED.hb || hbMean === null ? null : (hbMean / 4) * 100
  const bhiDims: MhcuDimensionResult[] = MHCU_BHI_DIMENSIONS.map((dm) => {
    const m = meanOf(numsOf(pick(hb, dm.items)))
    return { id: dm.id, en: dm.en, items: [...dm.items], score: m === null ? null : (m / 4) * 100 }
  })

  // MHI and decision (Hasil AL:AT)
  const mhi = di === null || wi === null || bhi === null
    ? null
    : MHCU_WEIGHTS.di * (100 - di) + MHCU_WEIGHTS.wi * wi + MHCU_WEIGHTS.bhi * bhi
  const mhiBandIndex = mhi === null ? null : bandIndexOf(mhi)
  const mhiLevel = mhiBandIndex === null ? null : (MHCU_MHI_LEVEL[mhiBandIndex] ?? null)

  const cc11 = domains[5]?.score ?? null
  const psy = domains[6]?.score ?? null
  const cc11Flag = cc11 !== null && cc11 >= (domains[5]?.threshold ?? 1)
  const psyFlag = psy !== null && psy >= (domains[6]?.threshold ?? 1)
  const rule1: 0 | 4 | 5 = cc11Flag ? 5 : psyFlag ? 4 : 0
  const rule2: 0 | 2 | 3 = flaggedNonCritical >= 3 || maxNonCritical >= 4 ? 3 : flaggedNonCritical >= 1 ? 2 : 0
  const rule3: 0 | 2 | 3 = wbTotal === null ? 0 : wbTotal <= 40 ? 3 : wbTotal <= 44 ? 2 : 0
  const level = Math.max(mhiLevel ?? 0, rule1, rule2, rule3, 1) as 1 | 2 | 3 | 4 | 5
  const incomplete = mhi === null
  const criticalMissing = numsOf(pick(cc, [11, 12, 13])).length < 3
  const lv = MHCU_LEVELS[level]
  const statusName = lv.statusId ?? lv.id
  const status = incomplete ? (level <= 1 ? 'DATA BELUM LENGKAP' : `${statusName}, data belum lengkap`) : statusName
  const statusEn = incomplete ? (level <= 1 ? 'INCOMPLETE DATA' : `${lv.en}, incomplete data`) : lv.en

  const triggers: MhcuTrigger[] = []
  if (criticalMissing) triggers.push({ k: 'critmissing' })
  if (rule1 === 5 && cc11 !== null) triggers.push({ k: 'cc11', v: cc11 })
  if (psyFlag && psy !== null) triggers.push({ k: 'psy', v: psy })
  if (flaggedNonCritical > 0) triggers.push({ k: 'ndom', v: flaggedNonCritical })
  if (maxNonCritical >= 4) triggers.push({ k: 'severe' })
  if (rule3 !== 0 && wbTotal !== null) triggers.push({ k: 'wb', v: wbTotal, lvl: rule3 })
  if (mhi !== null && mhiLevel !== null && mhiLevel >= 2) triggers.push({ k: 'mhilow', v: r1(mhi) })
  if (level === 1 && !criticalMissing) triggers.push({ k: 'none' })

  // Part D: ATI-6 (Hasil AU:AY). Five answers are prorated as mean x 6 (Kunci B13).
  const atiMean = meanOf(numsOf(ati))
  const atiTotal = answered.ati < MHCU_MIN_ANSWERED.ati || atiMean === null ? null : atiMean * 6
  const atiIndex = atiTotal === null ? null : (atiTotal / 24) * 100
  const atiVals = numsOf(ati)
  const atiHighIdx = atiTotal === null ? -1 : ati.indexOf(Math.max(...atiVals))
  const atiLowIdx = atiTotal === null ? -1 : ati.indexOf(Math.min(...atiVals))

  const complete = answered.cc === 23 && answered.wb === 14 && answered.hb === 15 && answered.ati === 6
  const completeness = complete
    ? 'Lengkap'
    : `Cek: A ${answered.cc}/23, B ${answered.wb}/14, C ${answered.hb}/15, D ${answered.ati}/6`

  return {
    answered,
    domains,
    flaggedDomains: domains.filter((d) => d.flagged).map((d) => d.id),
    flaggedNonCritical,
    maxNonCritical,
    di,
    diCategory: categoryOf('di', di),
    wbTotal,
    wi,
    wiCategory: categoryOf('wi', wi),
    wiDims,
    bhi,
    bhiCategory: categoryOf('bhi', bhi),
    bhiDims,
    mhi,
    mhiBand: mhiBandIndex === null
      ? null
      : { index: mhiBandIndex, id: MHCU_MHI_BANDS.id[mhiBandIndex] ?? '', en: MHCU_MHI_BANDS.en[mhiBandIndex] ?? '' },
    mhiLevel: mhiLevel as MhcuResult['mhiLevel'],
    ati: { total: atiTotal, index: atiIndex, category: categoryOf('ati', atiIndex) },
    atiAspects: {
      highest: atiHighIdx >= 0 ? (MHCU_ATI_ASPECTS[atiHighIdx] ?? null) : null,
      lowest: atiLowIdx >= 0 ? (MHCU_ATI_ASPECTS[atiLowIdx] ?? null) : null,
      items: MHCU_ATI_ASPECTS.map((name, i) => ({ n: i + 1, name, score: ati[i] ?? null })),
    },
    redFlags: { r1: rule1, r2: rule2, r3: rule3 },
    level,
    levelName: { id: lv.id, en: lv.en },
    followUp: {
      responseTimeId: lv.responseTimeId,
      responseTimeEn: lv.responseTimeEn,
      actionId: lv.actionId,
      actionEn: lv.actionEn,
    },
    status,
    statusEn,
    triggers,
    reasons: triggers.map((t) => ({ id: mhcuTriggerText(t, 'id'), en: mhcuTriggerText(t, 'en') })),
    incomplete,
    criticalMissing,
    complete,
    completeness,
  }
}

/* ============================== SUBMISSION VALIDATION ============================== */

export const MHCU_LANGS = ['id', 'en'] as const
export type MhcuLang = typeof MHCU_LANGS[number]
export const MHCU_CONSENTS = ['research', 'no_research'] as const
export type MhcuConsent = typeof MHCU_CONSENTS[number]

export const MHCU_LIMITS = {
  nameMax: 120,
  sexMax: 80,
  phoneMax: 40,
  emailMax: 254,
  consentVersionMax: 40,
  ackMaxItems: 10,
  ackItemMax: 40,
  rawMax: 200,
  inviteMax: 128,
  ageMin: 1,
  ageMax: 120,
  durationMaxSec: 7 * 24 * 3600,
} as const

export interface MhcuSubmission {
  lang: MhcuLang
  consent: MhcuConsent
  consentVersion: string
  ack: string[]
  /** True when the participant is under 18 (derived from age; a client claim of true is kept) */
  guardian: boolean
  name: string
  sex: string
  age: number
  phone: string
  email: string
  /** Known codes only, validated against the range of their part */
  answers: Record<string, number>
  /** Free text of the chosen answer per known code (optional, may be empty) */
  raw: Record<string, string>
  invite: string
  durationSec: number | null
}

export type MhcuValidation =
  | { ok: true; value: MhcuSubmission }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c < 32 || c === 127) return true
  }
  return false
}

function textField(body: Record<string, unknown>, key: string, max: number, label = key): { value: string } | { error: string } {
  const v = body[key]
  if (typeof v !== 'string') return { error: `${label} must be a string` }
  const t = v.trim()
  if (!t) return { error: `${label} is required` }
  if (t.length > max) return { error: `${label} is too long (max ${max} characters)` }
  if (hasControlChars(t)) return { error: `${label} contains invalid characters` }
  return { value: t }
}

/**
 * Strictly validate the body the participant form posts. Unknown keys are ignored (the caller handles the
 * honeypot field `website`). Returns a normalised submission or the first error found.
 */
export function validateMhcuSubmission(body: unknown): MhcuValidation {
  if (!isPlainObject(body)) return { ok: false, error: 'body must be an object' }
  const fail = (error: string): MhcuValidation => ({ ok: false, error })

  const lang = body.lang
  if (lang !== 'id' && lang !== 'en') return fail("lang must be 'id' or 'en'")
  // The form's "yes, including research" choice is sent as 'full'; it is stored as 'research'.
  const rawConsent = body.consent === 'full' ? 'research' : body.consent
  if (rawConsent !== 'research' && rawConsent !== 'no_research') return fail("consent must be 'full' (research allowed) or 'no_research'")
  const consent: MhcuConsent = rawConsent

  const cv = textField(body, 'consent_version', MHCU_LIMITS.consentVersionMax)
  if ('error' in cv) return fail(cv.error)

  if (!Array.isArray(body.ack)) return fail('ack must be an array')
  if (body.ack.length > MHCU_LIMITS.ackMaxItems) return fail('ack has too many entries')
  const ack: string[] = []
  for (const a of body.ack) {
    if (typeof a !== 'string' || !a || a.length > MHCU_LIMITS.ackItemMax || hasControlChars(a)) return fail('ack entries must be short strings')
    ack.push(a)
  }

  if (body.guardian !== undefined && typeof body.guardian !== 'boolean') return fail('guardian must be a boolean')

  const name = textField(body, 'name', MHCU_LIMITS.nameMax)
  if ('error' in name) return fail(name.error)
  const sex = textField(body, 'sex', MHCU_LIMITS.sexMax)
  if ('error' in sex) return fail(sex.error)

  const age = body.age
  if (typeof age !== 'number' || !Number.isInteger(age) || age < MHCU_LIMITS.ageMin || age > MHCU_LIMITS.ageMax) {
    return fail(`age must be a whole number from ${MHCU_LIMITS.ageMin} to ${MHCU_LIMITS.ageMax}`)
  }

  const phone = textField(body, 'phone', MHCU_LIMITS.phoneMax)
  if ('error' in phone) return fail(phone.error)
  const digits = phone.value.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 15) return fail('phone must have 9 to 15 digits')

  const email = textField(body, 'email', MHCU_LIMITS.emailMax)
  if ('error' in email) return fail(email.error)
  if (!EMAIL_RE.test(email.value)) return fail('email is not valid')

  // answers: known codes only, each an integer within the range of its part
  if (!isPlainObject(body.answers)) return fail('answers must be an object')
  const answers: Record<string, number> = {}
  const count: Record<MhcuPart, number> = { cc: 0, wb: 0, hb: 0, ati: 0 }
  for (const [code, v] of Object.entries(body.answers)) {
    const it = ITEM_BY_CODE.get(code)
    if (!it) continue
    const range = MHCU_ANSWER_RANGE[it.part]
    if (typeof v !== 'number' || !Number.isInteger(v) || v < range.min || v > range.max) {
      return fail(`answer ${code} must be a whole number from ${range.min} to ${range.max}`)
    }
    answers[code] = v
    count[it.part]++
  }
  for (const part of MHCU_PARTS) {
    if (count[part] < MHCU_MIN_ANSWERED[part]) {
      return fail(`part ${part.toUpperCase()} needs at least ${MHCU_MIN_ANSWERED[part]} of ${MHCU_PART_SIZE[part]} answers`)
    }
  }

  // raw (optional): text of the chosen answer per known code
  const raw: Record<string, string> = {}
  if (body.raw !== undefined && body.raw !== null) {
    if (!isPlainObject(body.raw)) return fail('raw must be an object')
    for (const [code, v] of Object.entries(body.raw)) {
      if (!ITEM_BY_CODE.has(code)) continue
      if (typeof v !== 'string' || v.length > MHCU_LIMITS.rawMax || hasControlChars(v)) return fail(`raw ${code} must be a short string`)
      raw[code] = v
    }
  }

  let invite = ''
  if (body.invite !== undefined && body.invite !== null) {
    if (typeof body.invite !== 'string' || body.invite.length > MHCU_LIMITS.inviteMax || hasControlChars(body.invite)) {
      return fail('invite must be a short string')
    }
    invite = body.invite
  }

  let durationSec: number | null = null
  const dur = body.duration_sec
  if (dur !== undefined && dur !== null && dur !== '') {
    if (typeof dur !== 'number' || !Number.isFinite(dur) || dur < 0 || dur > MHCU_LIMITS.durationMaxSec) {
      return fail('duration_sec must be a number of seconds')
    }
    durationSec = Math.round(dur)
  }

  return {
    ok: true,
    value: {
      lang,
      consent,
      consentVersion: cv.value,
      ack,
      guardian: age < 18 || body.guardian === true,
      name: name.value,
      sex: sex.value,
      age,
      phone: phone.value,
      email: email.value,
      answers,
      raw,
      invite,
      durationSec,
    },
  }
}
