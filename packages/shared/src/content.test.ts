import { describe, expect, it } from 'bun:test'
import {
  ARTICLE_LIFECYCLE_STATES,
  ARTICLE_REVISION_STATES,
  LANDING_REPEATER_BOUNDS,
  LANDING_SECTION_ORDER,
  MEDIA_LIFECYCLE_STATES,
  PSYCHOLOGIST_LIFECYCLE_STATES,
  validateArticleDraftMutation,
  validateLandingContentMutation,
  validateMediaMutation,
  validateMediaReference,
  validateArticlePublicLookup,
  validatePsychologistMutation,
  validatePsychologistPublicLookup,
} from './content'

const localized = (id: string, en: string) => ({ id, en })

const stableItem = (id: string) => ({
  id,
  position: Number(id.match(/\d+$/)?.[0] ?? 1) - 1,
  title: localized(`Judul ${id}`, `Title ${id}`),
  description: localized(`Deskripsi ${id}`, `Description ${id}`),
})

const validLandingMutation = () => ({
  sections: [
    {
      key: 'hero',
      visible: true,
      headline: localized('Dukungan yang terasa dekat', 'Support that feels close'),
      description: localized('Mulai dari sini.', 'Start here.'),
      primaryCta: localized('Cari psikolog', 'Find a psychologist'),
      secondaryCta: localized('Kenali layanan', 'Explore services'),
    },
    {
      key: 'supportExplorer',
      visible: true,
      headline: localized('Temukan dukungan', 'Find support'),
      description: localized('Pilih kebutuhanmu.', 'Choose what you need.'),
      items: [stableItem('support-1'), stableItem('support-2'), stableItem('support-3')],
    },
    {
      key: 'carePromise',
      visible: true,
      headline: localized('Pendampingan tepercaya', 'Care you can trust'),
      description: localized('Bukti yang bermakna.', 'Meaningful proof.'),
      items: [stableItem('metric-1'), stableItem('metric-2'), stableItem('metric-3')],
    },
    {
      key: 'featuredPsychologists',
      visible: true,
      headline: localized('Psikolog kami', 'Our psychologists'),
      description: localized('Satu tim, satu sumber data.', 'One team, one source of truth.'),
    },
    {
      key: 'careJourney',
      visible: true,
      headline: localized('Langkah konsultasi', 'Your care journey'),
      description: localized('Alur yang jelas.', 'A clear path.'),
      items: [stableItem('journey-1'), stableItem('journey-2'), stableItem('journey-3')],
    },
    {
      key: 'clientStories',
      visible: true,
      headline: localized('Cerita klien', 'Client stories'),
      description: localized('Pengalaman nyata.', 'Real experiences.'),
      items: [stableItem('story-1'), stableItem('story-2'), stableItem('story-3')],
    },
    {
      key: 'consultationReassurance',
      visible: true,
      headline: localized('Konsultasi tanpa tekanan', 'Consultation without pressure'),
      description: localized('Kamu tetap memegang kendali.', 'You remain in control.'),
    },
    {
      key: 'frequentlyAskedQuestions',
      visible: true,
      headline: localized('Pertanyaan umum', 'Frequently asked questions'),
      description: localized('Jawaban sebelum memulai.', 'Answers before you begin.'),
      items: [stableItem('faq-1'), stableItem('faq-2'), stableItem('faq-3')],
    },
    {
      key: 'closingInvitation',
      visible: true,
      headline: localized('Siap memulai?', 'Ready to begin?'),
      description: localized('Hubungi tim kami.', 'Contact our team.'),
      primaryCta: localized('Mulai konsultasi', 'Start a consultation'),
      contact: localized('WhatsApp Attentive.id', 'Attentive.id WhatsApp'),
    },
  ],
})

describe('shared content contracts', () => {
  it('locks the approved landing section order and design-safe repeater bounds', () => {
    expect(LANDING_SECTION_ORDER).toEqual([
      'hero',
      'supportExplorer',
      'carePromise',
      'featuredPsychologists',
      'careJourney',
      'clientStories',
      'consultationReassurance',
      'frequentlyAskedQuestions',
      'closingInvitation',
    ])
    expect(LANDING_REPEATER_BOUNDS).toEqual({
      supportExplorer: { min: 3, max: 6 },
      carePromise: { min: 3, max: 4 },
      careJourney: { min: 3, max: 5 },
      clientStories: { min: 3, max: 8 },
      frequentlyAskedQuestions: { min: 3, max: 10 },
    })
  })

  it('accepts one fixed-order bilingual landing aggregate', () => {
    expect(validateLandingContentMutation(validLandingMutation())).toBe(true)
  })

  it('rejects reordered sections and incomplete bilingual copy', () => {
    const reordered = validLandingMutation()
    ;[reordered.sections[0], reordered.sections[1]] = [reordered.sections[1]!, reordered.sections[0]!]

    const incomplete = validLandingMutation()
    Reflect.deleteProperty(incomplete.sections[0]!.headline, 'en')

    expect(validateLandingContentMutation(reordered)).toBe(false)
    expect(validateLandingContentMutation(incomplete)).toBe(false)
  })

  it('rejects repeater underflow, overflow, duplicate identity, and duplicate positions', () => {
    const underflow = validLandingMutation()
    underflow.sections[1]!.items = underflow.sections[1]!.items!.slice(0, 2)

    const overflow = validLandingMutation()
    overflow.sections[2]!.items = Array.from({ length: 5 }, (_, index) => stableItem(`metric-${index}`))

    const duplicateIdentity = validLandingMutation()
    duplicateIdentity.sections[4]!.items![1]!.id = duplicateIdentity.sections[4]!.items![0]!.id

    const duplicatePosition = validLandingMutation()
    duplicatePosition.sections[5]!.items![1]!.position = duplicatePosition.sections[5]!.items![0]!.position

    expect(validateLandingContentMutation(underflow)).toBe(false)
    expect(validateLandingContentMutation(overflow)).toBe(false)
    expect(validateLandingContentMutation(duplicateIdentity)).toBe(false)
    expect(validateLandingContentMutation(duplicatePosition)).toBe(false)
  })

  it('exposes complete lifecycle vocabulary and public lookup discriminants', () => {
    expect(PSYCHOLOGIST_LIFECYCLE_STATES).toEqual(['draft', 'active', 'inactive', 'archived'])
    expect(ARTICLE_LIFECYCLE_STATES).toEqual(['draft', 'published', 'unpublished', 'archived'])
    expect(ARTICLE_REVISION_STATES).toEqual(['draft', 'inReview', 'approved', 'rejected'])
    expect(MEDIA_LIFECYCLE_STATES).toEqual(['active', 'orphaned', 'deleted'])
    expect(validatePsychologistPublicLookup({
      status: 'unavailable',
      psychologist: { slug: 'syazka', name: 'Syazka Kirani Narindra', nickname: 'Syazka' },
    })).toBe(true)
    expect(validatePsychologistPublicLookup({ status: 'notFound' })).toBe(true)
    expect(validatePsychologistPublicLookup({ status: 'not-found' })).toBe(false)
    expect(validateArticlePublicLookup({ status: 'notFound' })).toBe(true)
  })

  it('allowlists mutation fields and rejects privileged lifecycle or audit over-posting', () => {
    const psychologist = {
      slug: 'syazka',
      name: 'Syazka Kirani Narindra',
      nickname: 'Syazka',
      credential: 'M.Psi., Psikolog',
      supportArea: 'adultClinical',
      specializations: ['Trauma'],
      experienceYears: 6,
      licenseNumber: '20190974-2021-02-1552',
      bookingUrl: 'https://wa.me/6285156410912',
      featured: true,
      featuredOrder: 1,
    }
    const article = {
      slug: 'mengenal-kecemasan',
      title: localized('Mengenal kecemasan', 'Understanding anxiety'),
      summary: localized('Ringkasan.', 'Summary.'),
      body: localized('Isi artikel.', 'Article body.'),
    }
    const landing = validLandingMutation()

    expect(validatePsychologistMutation(psychologist)).toBe(true)
    expect(validatePsychologistMutation({ ...psychologist, status: 'active' })).toBe(false)
    expect(validateArticleDraftMutation(article)).toBe(true)
    expect(validateArticleDraftMutation({ ...article, ownerPsychologistId: crypto.randomUUID() })).toBe(false)
    expect(validateArticleDraftMutation({ ...article, reviewerId: crypto.randomUUID() })).toBe(false)
    expect(validateLandingContentMutation({ ...landing, publishedRevisionId: crypto.randomUUID() })).toBe(false)
    expect(validateLandingContentMutation({ ...landing, tokenDigest: 'secret' })).toBe(false)
  })

  it('accepts approved object keys and allowlisted HTTPS media hosts', () => {
    const policy = { publicHosts: ['cdn.attentive.id', 'media.attentive.id'] }

    expect(validateMediaReference('media/psychologists/syazka/profile.webp', policy)).toBe(true)
    expect(validateMediaReference('https://cdn.attentive.id/psychologists/syazka.webp', policy)).toBe(true)
    expect(validateMediaMutation({
      reference: 'media/psychologists/syazka/profile.webp',
      width: 800,
      height: 1000,
      alt: localized('Potret Syazka', 'Portrait of Syazka'),
    }, policy)).toBe(true)
  })

  it('rejects credentials, unsafe schemes, protocol-relative URLs, private hosts, and traversal keys', () => {
    const policy = { publicHosts: ['cdn.attentive.id', 'localhost', '127.0.0.1'] }
    const unsafeReferences = [
      'http://cdn.attentive.id/image.webp',
      '//cdn.attentive.id/image.webp',
      'https://user:password@cdn.attentive.id/image.webp',
      'https://localhost/image.webp',
      'https://127.0.0.1/image.webp',
      'https://169.254.169.254/latest/meta-data',
      'https://10.0.0.1/image.webp',
      'https://cdn.attentive.id/%E0%A4%A',
      'javascript:alert(1)',
      '/media/image.webp',
      'media/../secret.txt',
      'uploads/image.webp',
    ]

    for (const reference of unsafeReferences) {
      expect(validateMediaReference(reference, policy), reference).toBe(false)
    }
  })

  it('keeps the shared contract runtime neutral and provider neutral', async () => {
    const source = await Bun.file(new URL('./content.ts', import.meta.url)).text()

    expect(source).not.toMatch(/from\s+['"][^'"]*(?:apps\/|@\/)/)
    expect(source).not.toMatch(/aws|s3|tencent|cloudflare|azure|gcp/i)
  })
})
