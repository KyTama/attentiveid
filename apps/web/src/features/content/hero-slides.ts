import type {
  HeroSlideItem,
  HeroSlideLayout,
  LandingContentMutation,
} from '@attentiveid/shared'

export type HeroLocale = 'id' | 'en'

export interface ResolvedHeroSlide {
  index: number
  id: string
  visible: boolean
  layout: HeroSlideLayout
  tabLabel: string
  tag: string
  headline: string
  description: string
  location?: string
  note?: string
  steps?: string[]
  chips?: string[]
  primaryCta: string
  primaryCtaUrl: string
  secondaryCta: string
  secondaryCtaUrl: string
  imageSrc: string
  imageAlt: string
}

export const HERO_SLIDE_LAYOUT_LABELS: Record<HeroSlideLayout, string> = {
  practice: 'Slide 1 · Our Practice (SIP Resmi)',
  'pet-garden': 'Slide 2 · Home & Pet Garden',
  big10: 'Slide 3 · Free Big 10 + Session',
  'scientific-brief': 'Slide 4 · Monthly Scientific Brief',
  'wisdom-ella': 'Slide 5 · Wisdom · Principal Psychologist (Ella)',
}

const DEFAULT_SLIDE_IMAGES: Record<HeroSlideLayout, { src: string; alt: { id: string; en: string } }> = {
  practice: {
    src: '/media/landing/hero-slide-1.jpg',
    alt: {
      id: 'Psikolog Attentive sedang mendampingi sesi konseling tatap muka',
      en: 'An Attentive psychologist in an in-person counseling session',
    },
  },
  'pet-garden': {
    src: '/images/hero-v3/slide-02-cat-main.jpg',
    alt: {
      id: 'Kucing penghuni ruang tunggu taman Attentive',
      en: 'White resident cat resting at Attentive pet garden',
    },
  },
  big10: {
    src: '/images/hero-v3/slide-03-big10-norm.png',
    alt: {
      id: 'Cuplikan laporan hasil Tes Kepribadian Big 10 Attentive',
      en: 'Big 10 Personality Test report excerpt against normative reference',
    },
  },
  'scientific-brief': {
    src: '/images/hero-v3/slide-04-brief-main.png',
    alt: {
      id: 'Cuplikan ringkasan riset ilmiah bulanan Attentive',
      en: 'Attentive Monthly Scientific Brief excerpt',
    },
  },
  'wisdom-ella': {
    src: '/images/hero-v3/slide-05-ella-portrait.jpg',
    alt: {
      id: 'Gisella Tani Pratiwi (Ella), M.Psi., Psikolog',
      en: 'Gisella Tani Pratiwi (Ella), M.Psi., Psikolog portrait',
    },
  },
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'hero-slide-1',
    visible: true,
    layout: 'practice',
    tabLabel: { id: 'Praktik kami', en: 'Our practice' },
    tag: { id: 'BIRO PSIKOLOGI KLINIS · BERIZIN RESMI', en: 'LICENSED CLINICAL PSYCHOLOGY BUREAU' },
    headline: {
      id: 'Biro Psikologi Klinis & Konseling **Profesional Berizin Resmi.**',
      en: 'Licensed Clinical Psychology Bureau & **Professional Counseling.**',
    },
    description: {
      id: 'Konsultasi tatap muka langsung di Jakarta, BSD, dan Malang, atau sesi daring privat bersama psikolog berlisensi SIP resmi.',
      en: 'Private in-person consultations in Jakarta, BSD, and Malang, or online video counseling with licensed psychologists.',
    },
    location: {
      id: 'Jakarta · BSD · Malang · Konseling video online',
      en: 'Jakarta · BSD · Malang · Online video counseling',
    },
    primaryCta: { id: 'Jadwalkan konsultasi', en: 'Book consultation' },
    primaryCtaUrl: 'https://booking.attentiveid.com/',
    secondaryCta: { id: 'Lihat layanan', en: 'Explore services' },
    secondaryCtaUrl: '/psychologists',
  },
  {
    id: 'hero-slide-2',
    visible: true,
    layout: 'pet-garden',
    tabLabel: { id: 'Taman & anabul', en: 'Pet garden' },
    tag: { id: 'RUMAH KAMI · TAMAN ANABUL', en: 'HOME · PET GARDEN' },
    headline: {
      id: 'Masuk saja. Anggap seperti **rumah sendiri.**',
      en: 'Come in. Make yourself **at home.**',
    },
    description: {
      id: 'Sudut hijau yang tenang, secangkir teh hangat, dan beberapa kucing penghuni yang suka menemanimu selagi menunggu. Tanpa perlu berpura-pura, tanpa terburu-buru.',
      en: 'Green corners, a cup of tea, and a few resident cats who like to keep you company while you wait. Nothing to perform, nothing to rush.',
    },
    note: {
      id: 'Alergi atau kurang nyaman dengan kucing? Beri tahu admin sebelum berkunjung.',
      en: 'Allergic or not a cat person? Tell our admin before you visit.',
    },
    primaryCta: { id: 'Lihat ruang kami', en: 'See our space' },
    primaryCtaUrl: '#locations',
    secondaryCta: { id: 'Jadwalkan sesi', en: 'Book a session' },
    secondaryCtaUrl: 'https://booking.attentiveid.com/',
  },
  {
    id: 'hero-slide-3',
    visible: true,
    layout: 'big10',
    tabLabel: { id: 'Big 10 + sesi gratis', en: 'Free Big 10 + session' },
    tag: { id: 'GRATIS · BIG 10 + SESI PERTAMA', en: 'FREE · BIG 10 + FIRST SESSION' },
    headline: {
      id: 'Kenali kepribadianmu. **Lalu ceritakan bersama.**',
      en: 'See your personality. **Then talk it through.**',
    },
    description: {
      id: 'Ikuti Tes Kepribadian Big 10 secara gratis. Lalu bawa hasilnya ke sesi pertama gratis bersama psikolog yang kami rekomendasikan sesuai kepribadian dan kebutuhanmu.',
      en: 'Take the Big 10 Personality Test for free. Then bring your results to a free first session with a psychologist we recommend for your personality and what you need.',
    },
    steps: [
      { id: 'Ikuti Tes Big 10', en: 'Take the Big 10' },
      { id: 'Dapatkan Tipe Attentive', en: 'Get your Attentive Type' },
      { id: 'Temui psikolog yang cocok', en: 'Meet your matched psychologist' },
    ],
    primaryCta: { id: 'Ikuti Big 10', en: 'Take the Big 10' },
    primaryCtaUrl: 'https://big10.attentiveid.com/',
    secondaryCta: { id: 'Klaim sesi pertamamu', en: 'Claim your first session' },
    secondaryCtaUrl: 'https://free-session.attentiveid.com',
  },
  {
    id: 'hero-slide-4',
    visible: true,
    layout: 'scientific-brief',
    tabLabel: { id: 'Ringkasan riset', en: 'Scientific brief' },
    tag: { id: 'RINGKASAN ILMIAH BULANAN', en: 'MONTHLY SCIENTIFIC BRIEF' },
    headline: {
      id: 'Riset ilmiah, **lebih mudah dicerna.**',
      en: 'Research, **made readable.**',
    },
    description: {
      id: 'Setiap bulan, kami merangkum literatur terkini dan riset akademik internasional yang kami lakukan menjadi satu ringkasan yang mudah dibaca serta praktis untuk keseharianmu.',
      en: 'Every month, we turn the literature we read and the international academic research we conduct into one brief: easy to read, and practical for your everyday life.',
    },
    chips: ['Sep · Being Liked', 'Nov · More Than Mine', 'Dec · How We Hold On'],
    primaryCta: { id: 'Baca brief terbaru', en: 'Read the latest brief' },
    primaryCtaUrl: '/sci-brief',
    secondaryCta: { id: 'Semua brief', en: 'All briefs' },
    secondaryCtaUrl: '/sci-brief',
  },
  {
    id: 'hero-slide-5',
    visible: true,
    layout: 'wisdom-ella',
    tabLabel: { id: 'Kenali Ella', en: 'Meet Ella' },
    tag: { id: 'WISDOM · PSIKOLOG PRINSIPAL', en: 'WISDOM · PRINCIPAL PSYCHOLOGIST' },
    headline: {
      id: 'Pendamping tenang untuk **cerita yang berat.**',
      en: 'Steady hands for **hard stories.**',
    },
    description: {
      id: 'Kenali Gisella Tani Pratiwi (Ella), M.Psi., Psikolog, Psikolog Prinsipal kami. Ia mendampingi remaja, dewasa muda, dan orang tua dalam pemulihan trauma serta regulasi emosi dengan pendekatan hangat dan trauma-informed.',
      en: 'Meet Gisella Tani Pratiwi (Ella), M.Psi., Psikolog, our Principal Psychologist. She supports adolescents, young adults, and parents through trauma recovery and emotional regulation, with a warm, trauma-informed approach.',
    },
    primaryCta: { id: 'Kenali Ella', en: 'Get to know Ella' },
    primaryCtaUrl: '/psychologists/gisella',
    secondaryCta: { id: 'Konsultasi dengan Ella', en: 'Book with Ella' },
    secondaryCtaUrl: 'https://booking.attentiveid.com/',
  },
]

export function getDefaultHeroSlideItems(): HeroSlideItem[] {
  return DEFAULT_HERO_SLIDES.map((slide) => structuredClone(slide))
}

export function normalizeMediaReference(ref?: string | null): string | null {
  if (!ref) return null
  return ref.startsWith('/') || ref.startsWith('http') ? ref : `/${ref}`
}

/** Merge persisted CMS slideItems onto the canonical 5 v3 slides. */
export function buildMergedHeroSlideItems(
  heroSection?: Partial<Extract<LandingContentMutation['sections'][number], { key: 'hero' }>> | null
): HeroSlideItem[] {
  const customSlides = heroSection?.slideItems
  return DEFAULT_HERO_SLIDES.map((base, index) => {
    const saved = customSlides?.[index]
    const merged: HeroSlideItem = {
      ...structuredClone(base),
      ...(saved ? structuredClone(saved) : {}),
      id: saved?.id || base.id,
      layout: saved?.layout || base.layout,
      visible: saved?.visible !== undefined ? saved.visible : true,
    }

    if (index === 0 && heroSection) {
      merged.headline = saved?.headline || heroSection.headline || merged.headline
      merged.description = saved?.description || heroSection.description || merged.description
      merged.primaryCta = saved?.primaryCta || heroSection.primaryCta || merged.primaryCta
      merged.secondaryCta = saved?.secondaryCta || heroSection.secondaryCta || merged.secondaryCta
      if (saved?.primaryCtaUrl === undefined && heroSection.primaryCtaUrl !== undefined) {
        merged.primaryCtaUrl = heroSection.primaryCtaUrl
      }
      if (saved?.secondaryCtaUrl === undefined && heroSection.secondaryCtaUrl !== undefined) {
        merged.secondaryCtaUrl = heroSection.secondaryCtaUrl
      }
      if (!saved?.media && heroSection.media) {
        merged.media = heroSection.media
      }
    }

    return merged
  })
}

/** The Scientific Brief slide used to point at /articles; saved content may still say so. */
const legacyBriefUrl = (layout: HeroSlideLayout, url: string | undefined) =>
  layout === 'scientific-brief' && (!url || url === '/articles') ? '/sci-brief' : (url ?? '')

export function resolveHeroSlides(
  heroSection: Partial<Extract<LandingContentMutation['sections'][number], { key: 'hero' }>> | undefined | null,
  locale: HeroLocale
): ResolvedHeroSlide[] {
  const merged = buildMergedHeroSlideItems(heroSection)

  return merged.map((item, index) => {
    const layout = item.layout || DEFAULT_HERO_SLIDES[index]?.layout || 'practice'
    const fallbackMedia = DEFAULT_SLIDE_IMAGES[layout]
    const customRef = normalizeMediaReference(item.media?.reference)
    const imageSrc = customRef || fallbackMedia.src

    return {
      index,
      id: item.id,
      visible: item.visible !== false,
      layout,
      tabLabel: item.tabLabel?.[locale] || item.tabLabel?.id || DEFAULT_HERO_SLIDES[index]?.tabLabel?.[locale] || '',
      tag: item.tag?.[locale] || item.tag?.id || '',
      headline: item.headline?.[locale] || item.headline?.id || '',
      description: item.description?.[locale] || item.description?.id || '',
      location: item.location?.[locale] || item.location?.id,
      note: item.note?.[locale] || item.note?.id,
      steps: item.steps?.map((s) => s[locale] || s.id),
      chips: item.chips,
      primaryCta: item.primaryCta?.[locale] || item.primaryCta?.id || '',
      primaryCtaUrl: legacyBriefUrl(layout, item.primaryCtaUrl),
      secondaryCta: item.secondaryCta?.[locale] || item.secondaryCta?.id || '',
      secondaryCtaUrl: legacyBriefUrl(layout, item.secondaryCtaUrl),
      imageSrc,
      imageAlt: item.media?.alt?.[locale] || fallbackMedia.alt[locale],
    }
  })
}
