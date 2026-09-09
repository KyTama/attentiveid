import { sql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
    CONTENT_LOCALES,
    validateMediaMutation,
    validatePsychologistMutation,
    type LocalizedText
} from '@attentiveid/shared';
import * as schema from './schema';

type ContentLocale = typeof CONTENT_LOCALES[number];
type SupportArea = typeof schema.psychologistSupportAreaEnum.enumValues[number];

export interface PsychologistSeedFixture {
    slug: string;
    status: 'active';
    name: string;
    nickname: string;
    credential: string;
    supportAreas: readonly {
        supportArea: SupportArea;
        primary: boolean;
    }[];
    specializations: readonly {
        label: LocalizedText;
    }[];
    experienceYears: number;
    licenseNumber: string;
    bookingUrl: string;
    premiumBookingUrl: string;
    featured: boolean;
    featuredOrder: number;
    profile: {
        biography: LocalizedText;
        availabilityMessage: LocalizedText;
    };
    media: {
        reference: string;
        width: number;
        height: number;
        alt: LocalizedText;
        mimeType: 'image/webp';
    };
}

interface PsychologistInput {
    slug: string;
    status: 'active';
    name: string;
    nickname: string;
    featured: boolean;
    featuredOrder: number;
}

interface ProfileInput {
    psychologistId: string;
    credential: string;
    experienceYears: number;
    licenseNumber: string;
    bookingUrl: string;
    premiumBookingUrl: string;
}

interface ProfileTranslationInput {
    psychologistId: string;
    locale: ContentLocale;
    biography: string;
    availabilityMessage: string;
}

interface SupportAreaInput {
    psychologistId: string;
    supportArea: SupportArea;
    primary: boolean;
    position: number;
}

interface SpecializationInput {
    psychologistId: string;
    position: number;
}

interface SpecializationTranslationInput {
    specializationId: string;
    locale: ContentLocale;
    label: string;
}

interface MediaObjectInput {
    reference: string;
    width: number;
    height: number;
    alt: LocalizedText;
    mimeType: 'image/webp';
}

interface MediaAttachmentInput {
    psychologistId: string;
    mediaObjectId: string;
    role: 'profilePhoto';
    position: 0;
}

export interface PsychologistSeedTransaction {
    upsertPsychologist(input: PsychologistInput): Promise<string>;
    upsertProfile(input: ProfileInput): Promise<void>;
    upsertProfileTranslation(input: ProfileTranslationInput): Promise<void>;
    upsertSupportArea(input: SupportAreaInput): Promise<void>;
    upsertSpecialization(input: SpecializationInput): Promise<string>;
    upsertSpecializationTranslation(input: SpecializationTranslationInput): Promise<void>;
    upsertMediaObject(input: MediaObjectInput): Promise<string>;
    upsertMediaAttachment(input: MediaAttachmentInput): Promise<void>;
}

export interface PsychologistSeedDatabase {
    transaction<Result>(operation: (transaction: PsychologistSeedTransaction) => Promise<Result>): Promise<Result>;
}

export interface PsychologistSeedResult {
    psychologists: number;
    profiles: number;
    profileTranslations: number;
    supportAreas: number;
    specializations: number;
    specializationTranslations: number;
    mediaObjects: number;
    mediaAttachments: number;
}

const bookingBaseUrl = 'https://wa.me/6285156410912?text=';
const mediaReferencePolicy = { publicHosts: [] } as const;
const supportAreaNames: Record<SupportArea, LocalizedText> = {
    adultClinical: { id: 'psikologi klinis dewasa', en: 'adult clinical psychology' },
    childAdolescent: { id: 'psikologi anak dan remaja', en: 'child and adolescent psychology' },
    educational: { id: 'psikologi pendidikan', en: 'educational psychology' }
};

const bookingUrl = (name: string, type: 'regular' | 'premium') => {
    const message = type === 'regular'
        ? `Halo admin Attentive.id, saya ingin melakukan reservasi sesi konsultasi dengan Psikolog ${name}. Saya menghubungi dari website Attentive.id. Mohon informasinya mengenai ketersediaan jadwal. Terima kasih. (rp)`
        : `Halo Admin Attentive.id, saya ingin melakukan reservasi sesi konsultasi premium dengan Psikolog ${name}, melalui website Attentive.id. (rp)`;
    return bookingBaseUrl + encodeURIComponent(message);
};

const localizedLabel = (id: string, en: string) => ({ label: { id, en } });

const profileCopy = (name: string, credential: string, supportArea: SupportArea) => ({
    biography: {
        id: `${name}, ${credential}, menyediakan dukungan dalam bidang ${supportAreaNames[supportArea].id}.`,
        en: `${name}, ${credential}, provides support in ${supportAreaNames[supportArea].en}.`
    },
    availabilityMessage: {
        id: 'Hubungi admin Attentive.id untuk informasi ketersediaan jadwal.',
        en: 'Contact the Attentive.id admin for current schedule availability.'
    }
});

const fixture = (input: Omit<PsychologistSeedFixture, 'profile' | 'status' | 'supportAreas'> & {
    supportArea: SupportArea;
}): PsychologistSeedFixture => ({
    ...input,
    status: 'active',
    supportAreas: [{ supportArea: input.supportArea, primary: true }],
    profile: profileCopy(input.name, input.credential, input.supportArea)
});

export const psychologistSeedFixtures: readonly PsychologistSeedFixture[] = [
    fixture({
        slug: 'syazka',
        name: 'Syazka Kirani Narindra',
        nickname: 'Syazka',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Gangguan kepribadian', 'Personality disorders'),
            localizedLabel('Trauma', 'Trauma'),
            localizedLabel('Gangguan mood (Depresi, distimia, bipolar)', 'Mood disorders (depression, dysthymia, bipolar disorder)'),
            localizedLabel('ADHD', 'ADHD'),
            localizedLabel('Relasi interpersonal / hubungan romantis', 'Interpersonal and romantic relationships'),
            localizedLabel('Gangguan kecemasan', 'Anxiety disorders'),
            localizedLabel('Pengembangan Diri', 'Personal development'),
            localizedLabel('OCD', 'OCD')
        ],
        experienceYears: 6,
        licenseNumber: '20190974-2021-02-1552',
        bookingUrl: bookingUrl('Syazka', 'regular'),
        premiumBookingUrl: bookingUrl('Syazka', 'premium'),
        featured: true,
        featuredOrder: 0,
        media: {
            reference: 'media/psychologists/syazka.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Syazka Kirani Narindra', en: 'Profile photo of Syazka Kirani Narindra' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'gita',
        name: 'Anggita Panjaitan',
        nickname: 'Gita',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Trauma & isu terkait emosi', 'Trauma and emotional concerns'),
            localizedLabel('ADHD Dewasa', 'Adult ADHD'),
            localizedLabel('Gangguan Kecemasan', 'Anxiety disorders'),
            localizedLabel('Gangguan Kepribadian', 'Personality disorders'),
            localizedLabel('Relasi interpersonal/hubungan romantis', 'Interpersonal and romantic relationships'),
            localizedLabel('Masalah terkait pekerjaan, karir, dan pengembangan diri', 'Work, career, and personal development concerns'),
            localizedLabel('Masalah terkait Gender', 'Gender-related concerns'),
            localizedLabel('Praktisi metode Brainspotting', 'Brainspotting practitioner')
        ],
        experienceYears: 5,
        licenseNumber: '20200657-2023-02-2669',
        bookingUrl: bookingUrl('Anggita', 'regular'),
        premiumBookingUrl: bookingUrl('Anggita', 'premium'),
        featured: true,
        featuredOrder: 1,
        media: {
            reference: 'media/psychologists/gita.webp',
            width: 2230,
            height: 2974,
            alt: { id: 'Foto profil Anggita Panjaitan', en: 'Profile photo of Anggita Panjaitan' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'mayda',
        name: 'Ni Putu Mayda A. A',
        nickname: 'Mayda',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Hubungan romantis', 'Romantic relationships'),
            localizedLabel('Masalah dalam hubungan interpersonal', 'Interpersonal relationship concerns'),
            localizedLabel('Masalah dalam hubungan keluarga', 'Family relationship concerns'),
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Masalah mood dan emosi', 'Mood and emotional concerns'),
            localizedLabel('Pekerjaan dan karir', 'Work and career'),
            localizedLabel('Stres dan burnout', 'Stress and burnout'),
            localizedLabel('Gangguan kepribadian', 'Personality disorders')
        ],
        experienceYears: 5,
        licenseNumber: '20191405-2024-02-3405',
        bookingUrl: bookingUrl('Ni Putu', 'regular'),
        premiumBookingUrl: bookingUrl('Ni Putu', 'premium'),
        featured: true,
        featuredOrder: 2,
        media: {
            reference: 'media/psychologists/mayda.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Ni Putu Mayda A. A', en: 'Profile photo of Ni Putu Mayda A. A' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'anggun',
        name: 'Anggriana Angguningtyas',
        nickname: 'Anggun',
        credential: 'M.Psi., Psikolog',
        supportArea: 'childAdolescent',
        specializations: [
            localizedLabel('Gangguan perkembangan', 'Developmental disorders'),
            localizedLabel('Gangguan belajar/ kecerdasan', 'Learning and intellectual difficulties'),
            localizedLabel('ADHD', 'ADHD'),
            localizedLabel('Autisme', 'Autism'),
            localizedLabel('Masalah perilaku', 'Behavioral concerns'),
            localizedLabel('Relasi dan sosialisasi', 'Relationships and socialization'),
            localizedLabel('Regulasi emosi', 'Emotional regulation'),
            localizedLabel('Trauma dan Stress Remaja', 'Adolescent trauma and stress')
        ],
        experienceYears: 7,
        licenseNumber: '20161132-2024-01-4335',
        bookingUrl: bookingUrl('Anggriana', 'regular'),
        premiumBookingUrl: bookingUrl('Anggriana', 'premium'),
        featured: true,
        featuredOrder: 3,
        media: {
            reference: 'media/psychologists/anggun.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Anggriana Angguningtyas', en: 'Profile photo of Anggriana Angguningtyas' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'dinda',
        name: 'Risky Adinda',
        nickname: 'Dinda',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Masalah mood dan emosi', 'Mood and emotional concerns'),
            localizedLabel('Masalah hubungan interpersonal', 'Interpersonal relationship concerns'),
            localizedLabel('Hubungan romantis dan pranikah', 'Romantic and premarital relationships'),
            localizedLabel('Karier dan pendidikan', 'Career and education'),
            localizedLabel('Stress dan burnout', 'Stress and burnout'),
            localizedLabel('Pengembangan diri', 'Personal development')
        ],
        experienceYears: 5,
        licenseNumber: '20200628-2020-01-1289',
        bookingUrl: bookingUrl('Risky Adinda', 'regular'),
        premiumBookingUrl: bookingUrl('Risky Adinda', 'premium'),
        featured: true,
        featuredOrder: 4,
        media: {
            reference: 'media/psychologists/dinda.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Risky Adinda', en: 'Profile photo of Risky Adinda' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'ilham',
        name: 'Ilham Anggi P',
        nickname: 'Ilham',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Anxiety', 'Anxiety'),
            localizedLabel('Insecurity & Overthinking', 'Insecurity and overthinking'),
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('Kesepian dan isu terkait hubungan intepersonal', 'Loneliness and interpersonal relationship concerns'),
            localizedLabel('Regulasi emosi', 'Emotional regulation'),
            localizedLabel('Stres kerja dan karir', 'Work and career stress'),
            localizedLabel('Pengembangan diri', 'Personal development'),
            localizedLabel('Hubungan romantis', 'Romantic relationships')
        ],
        experienceYears: 6,
        licenseNumber: '20190006-2021-02-0709',
        bookingUrl: bookingUrl('Ilham', 'regular'),
        premiumBookingUrl: bookingUrl('Ilham', 'premium'),
        featured: true,
        featuredOrder: 5,
        media: {
            reference: 'media/psychologists/ilham.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Ilham Anggi P', en: 'Profile photo of Ilham Anggi P' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'nichi',
        name: 'Dwi Ningsih A',
        nickname: 'Dwi',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('Gangguan Mood dan Emosi', 'Mood and emotional disorders'),
            localizedLabel('Stress dan Burn Out', 'Stress and burnout'),
            localizedLabel('Self Esteem', 'Self-esteem'),
            localizedLabel('Anxiety', 'Anxiety'),
            localizedLabel('Pengembangan diri', 'Personal development'),
            localizedLabel('Family and Relationship', 'Family and relationships'),
            localizedLabel('Gangguan Kepribadian', 'Personality disorders')
        ],
        experienceYears: 4,
        licenseNumber: '20181094-2020-01-0404',
        bookingUrl: bookingUrl('Dwi', 'regular'),
        premiumBookingUrl: bookingUrl('Dwi', 'premium'),
        featured: true,
        featuredOrder: 6,
        media: {
            reference: 'media/psychologists/nichi.webp',
            width: 3023,
            height: 4031,
            alt: { id: 'Foto profil Dwi Ningsih A', en: 'Profile photo of Dwi Ningsih A' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'dewinta',
        name: 'Putri Dewinta',
        nickname: 'Putri',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Gangguan kepribadian', 'Personality disorders'),
            localizedLabel('Pengembangan diri', 'Personal development'),
            localizedLabel('Pekerjaan & karir', 'Work and career'),
            localizedLabel('Regulasi emosi', 'Emotional regulation'),
            localizedLabel('Relasi interpersonal/ hubungan romantis', 'Interpersonal and romantic relationships'),
            localizedLabel('Gangguan mood', 'Mood disorders'),
            localizedLabel('ADHD', 'ADHD')
        ],
        experienceYears: 6,
        licenseNumber: '20180806-2021-02-1238',
        bookingUrl: bookingUrl('Putri', 'regular'),
        premiumBookingUrl: bookingUrl('Putri', 'premium'),
        featured: true,
        featuredOrder: 7,
        media: {
            reference: 'media/psychologists/dewinta.webp',
            width: 725,
            height: 968,
            alt: { id: 'Foto profil Putri Dewinta', en: 'Profile photo of Putri Dewinta' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'sekar',
        name: 'Sekarini Andika Permatasari',
        nickname: 'Sekar',
        credential: 'M.Psi., Psikolog',
        supportArea: 'educational',
        specializations: [
            localizedLabel('Permasalahan belajar', 'Learning concerns'),
            localizedLabel('Kesiapan sekolah anak', 'School readiness'),
            localizedLabel('Stres, kecemasan, & pengendalian diri', 'Stress, anxiety, and self-regulation'),
            localizedLabel('Hubungan pertemanan', 'Peer relationships'),
            localizedLabel('Pengasuhan anak', 'Parenting'),
            localizedLabel('Eksplorasi minat, bakat, & penjurusan', 'Interest, aptitude, and study-path exploration'),
            localizedLabel('Permasalahan & pengembangan karier', 'Career concerns and development'),
            localizedLabel('Pengembangan potensi diri', 'Personal potential development')
        ],
        experienceYears: 1,
        licenseNumber: '20231126-2024-01-3432',
        bookingUrl: bookingUrl('Sekarini', 'regular'),
        premiumBookingUrl: bookingUrl('Sekarini', 'premium'),
        featured: true,
        featuredOrder: 8,
        media: {
            reference: 'media/psychologists/sekar.webp',
            width: 2995,
            height: 3994,
            alt: { id: 'Foto profil Sekarini Andika Permatasari', en: 'Profile photo of Sekarini Andika Permatasari' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'kia',
        name: 'Riskia Ramadhina',
        nickname: 'Riskia',
        credential: 'M.Psi., Psikolog',
        supportArea: 'educational',
        specializations: [
            localizedLabel('Kesiapan Sekolah Anak', 'School readiness'),
            localizedLabel('Anak Berkebutuhan Khusus (ABK)', 'Children with additional needs'),
            localizedLabel('Motivasi & Performa Akademik', 'Academic motivation and performance'),
            localizedLabel('Pola Asuh & Pengasuhan Anak', 'Parenting approaches'),
            localizedLabel('Hubungan Orangtua & Anak', 'Parent-child relationships'),
            localizedLabel('Minat & Bakat', 'Interests and aptitudes'),
            localizedLabel('Pengembangan Diri', 'Personal development'),
            localizedLabel('Bimbingan Karir', 'Career guidance')
        ],
        experienceYears: 1,
        licenseNumber: '20240002-2024-01-3466',
        bookingUrl: bookingUrl('Riskia', 'regular'),
        premiumBookingUrl: bookingUrl('Riskia', 'premium'),
        featured: true,
        featuredOrder: 9,
        media: {
            reference: 'media/psychologists/kia.webp',
            width: 2800,
            height: 3734,
            alt: { id: 'Foto profil Riskia Ramadhina', en: 'Profile photo of Riskia Ramadhina' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'disa',
        name: 'Disa Nisrina Listiani',
        nickname: 'Disa',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('Gangguan Kepribadian', 'Personality disorders'),
            localizedLabel('Regulasi Emosi', 'Emotional regulation'),
            localizedLabel('Manajemen Stres', 'Stress management'),
            localizedLabel('Transisi Kehidupan', 'Life transitions'),
            localizedLabel('Pengembangan Diri', 'Personal development'),
            localizedLabel('Kehilangan dan Berduka', 'Loss and grief')
        ],
        experienceYears: 1,
        licenseNumber: '20240760-2024-01-3829',
        bookingUrl: bookingUrl('Disa', 'regular'),
        premiumBookingUrl: bookingUrl('Disa', 'premium'),
        featured: true,
        featuredOrder: 10,
        media: {
            reference: 'media/psychologists/disa.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Disa Nisrina Listiani', en: 'Profile photo of Disa Nisrina Listiani' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'jean',
        name: 'Jeanete Ophilia Papilaya',
        nickname: 'Jeanette',
        credential: 'M.Psi., Psikolog',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Penanganan Emosi', 'Emotional support'),
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('Trauma', 'Trauma'),
            localizedLabel('Konseling Pra Nikah', 'Premarital counseling'),
            localizedLabel('Konseling Keluarga', 'Family counseling'),
            localizedLabel('Penanganan Masalah Relationship', 'Relationship concerns')
        ],
        experienceYears: 16,
        licenseNumber: '440/3378/Dinkes/2020',
        bookingUrl: bookingUrl('Jeanete', 'regular'),
        premiumBookingUrl: bookingUrl('Jeanete', 'premium'),
        featured: true,
        featuredOrder: 11,
        media: {
            reference: 'media/psychologists/jean.webp',
            width: 971,
            height: 1280,
            alt: { id: 'Foto profil Jeanete Ophilia Papilaya', en: 'Profile photo of Jeanete Ophilia Papilaya' },
            mimeType: 'image/webp'
        }
    })
];

const isSafeBookingUrl = (value: string) => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:'
            && url.hostname === 'wa.me'
            && url.username === ''
            && url.password === '';
    } catch {
        return false;
    }
};

const isLocalizedTextComplete = (value: LocalizedText) => value.id.trim() !== '' && value.en.trim() !== '';

const isValidFixture = (candidate: PsychologistSeedFixture) => {
    const supportAreaIds = new Set(candidate.supportAreas.map(({ supportArea }) => supportArea));
    const primarySupportAreas = candidate.supportAreas.filter(({ primary }) => primary);
    const mutation = {
        slug: candidate.slug,
        name: candidate.name,
        nickname: candidate.nickname,
        credential: candidate.credential,
        supportArea: candidate.supportAreas[0]?.supportArea,
        specializations: candidate.specializations.map(({ label }) => label.id),
        experienceYears: candidate.experienceYears,
        licenseNumber: candidate.licenseNumber,
        bookingUrl: candidate.bookingUrl,
        featured: candidate.featured,
        featuredOrder: candidate.featuredOrder
    };
    const media = {
        reference: candidate.media.reference,
        width: candidate.media.width,
        height: candidate.media.height,
        alt: candidate.media.alt
    };

    return validatePsychologistMutation(mutation)
        && candidate.status === 'active'
        && candidate.supportAreas.length > 0
        && supportAreaIds.size === candidate.supportAreas.length
        && primarySupportAreas.length === 1
        && candidate.specializations.every(({ label }) => isLocalizedTextComplete(label))
        && isLocalizedTextComplete(candidate.profile.biography)
        && isLocalizedTextComplete(candidate.profile.availabilityMessage)
        && isSafeBookingUrl(candidate.bookingUrl)
        && isSafeBookingUrl(candidate.premiumBookingUrl)
        && candidate.media.mimeType === 'image/webp'
        && validateMediaMutation(media, mediaReferencePolicy);
};

const validateFixtures = (fixtures: readonly PsychologistSeedFixture[]) => {
    const slugs = new Set(fixtures.map(({ slug }) => slug));
    const featuredOrders = new Set(fixtures.map(({ featuredOrder }) => featuredOrder));
    const mediaReferences = new Set(fixtures.map(({ media }) => media.reference));

    if (fixtures.length === 0
        || slugs.size !== fixtures.length
        || featuredOrders.size !== fixtures.length
        || mediaReferences.size !== fixtures.length
        || fixtures.some((candidate) => !isValidFixture(candidate))) {
        throw new Error('Invalid psychologist seed fixture.');
    }
};

const seedResult = (fixtures: readonly PsychologistSeedFixture[]): PsychologistSeedResult => {
    const supportAreas = fixtures.reduce((total, candidate) => total + candidate.supportAreas.length, 0);
    const specializations = fixtures.reduce((total, candidate) => total + candidate.specializations.length, 0);

    return {
        psychologists: fixtures.length,
        profiles: fixtures.length,
        profileTranslations: fixtures.length * CONTENT_LOCALES.length,
        supportAreas,
        specializations,
        specializationTranslations: specializations * CONTENT_LOCALES.length,
        mediaObjects: fixtures.length,
        mediaAttachments: fixtures.length
    };
};

export async function seedPsychologists(
    database: PsychologistSeedDatabase,
    fixtures: readonly PsychologistSeedFixture[] = psychologistSeedFixtures
): Promise<PsychologistSeedResult> {
    validateFixtures(fixtures);

    try {
        return await database.transaction(async (transaction) => {
            for (const candidate of fixtures) {
                const psychologistId = await transaction.upsertPsychologist({
                    slug: candidate.slug,
                    status: candidate.status,
                    name: candidate.name,
                    nickname: candidate.nickname,
                    featured: candidate.featured,
                    featuredOrder: candidate.featuredOrder
                });

                await transaction.upsertProfile({
                    psychologistId,
                    credential: candidate.credential,
                    experienceYears: candidate.experienceYears,
                    licenseNumber: candidate.licenseNumber,
                    bookingUrl: candidate.bookingUrl,
                    premiumBookingUrl: candidate.premiumBookingUrl
                });

                for (const locale of CONTENT_LOCALES) {
                    await transaction.upsertProfileTranslation({
                        psychologistId,
                        locale,
                        biography: candidate.profile.biography[locale],
                        availabilityMessage: candidate.profile.availabilityMessage[locale]
                    });
                }

                for (const [position, supportArea] of candidate.supportAreas.entries()) {
                    await transaction.upsertSupportArea({
                        psychologistId,
                        supportArea: supportArea.supportArea,
                        primary: supportArea.primary,
                        position
                    });
                }

                for (const [position, specialization] of candidate.specializations.entries()) {
                    const specializationId = await transaction.upsertSpecialization({ psychologistId, position });
                    for (const locale of CONTENT_LOCALES) {
                        await transaction.upsertSpecializationTranslation({
                            specializationId,
                            locale,
                            label: specialization.label[locale]
                        });
                    }
                }

                const mediaObjectId = await transaction.upsertMediaObject(candidate.media);
                await transaction.upsertMediaAttachment({
                    psychologistId,
                    mediaObjectId,
                    role: 'profilePhoto',
                    position: 0
                });
            }

            return seedResult(fixtures);
        });
    } catch {
        throw new Error('Psychologist seed failed.');
    }
}

export const createDrizzlePsychologistSeedDatabase = (
    database: PostgresJsDatabase<typeof schema>
): PsychologistSeedDatabase => ({
    transaction: (operation) => database.transaction(async (transaction) => operation({
        upsertPsychologist: async (input) => {
            const [record] = await transaction
                .insert(schema.psychologists)
                .values(input)
                .onConflictDoUpdate({
                    target: schema.psychologists.slug,
                    set: {
                        status: input.status,
                        name: input.name,
                        nickname: input.nickname,
                        featured: input.featured,
                        featuredOrder: input.featuredOrder,
                        updatedAt: sql`now()`
                    }
                })
                .returning({ id: schema.psychologists.id });

            if (!record) throw new Error('Psychologist upsert returned no row.');
            return record.id;
        },
        upsertProfile: async (input) => {
            await transaction
                .insert(schema.psychologistProfiles)
                .values(input)
                .onConflictDoUpdate({
                    target: schema.psychologistProfiles.psychologistId,
                    set: {
                        credential: input.credential,
                        experienceYears: input.experienceYears,
                        licenseNumber: input.licenseNumber,
                        bookingUrl: input.bookingUrl,
                        premiumBookingUrl: input.premiumBookingUrl,
                        updatedAt: sql`now()`
                    }
                });
        },
        upsertProfileTranslation: async (input) => {
            await transaction
                .insert(schema.psychologistProfileTranslations)
                .values(input)
                .onConflictDoUpdate({
                    target: [
                        schema.psychologistProfileTranslations.psychologistId,
                        schema.psychologistProfileTranslations.locale
                    ],
                    set: {
                        biography: input.biography,
                        availabilityMessage: input.availabilityMessage
                    }
                });
        },
        upsertSupportArea: async (input) => {
            await transaction
                .insert(schema.psychologistSupportAreas)
                .values(input)
                .onConflictDoUpdate({
                    target: [schema.psychologistSupportAreas.psychologistId, schema.psychologistSupportAreas.supportArea],
                    set: {
                        primary: input.primary,
                        position: input.position
                    }
                });
        },
        upsertSpecialization: async (input) => {
            const [record] = await transaction
                .insert(schema.psychologistSpecializations)
                .values(input)
                .onConflictDoUpdate({
                    target: [
                        schema.psychologistSpecializations.psychologistId,
                        schema.psychologistSpecializations.position
                    ],
                    set: { position: input.position }
                })
                .returning({ id: schema.psychologistSpecializations.id });

            if (!record) throw new Error('Specialization upsert returned no row.');
            return record.id;
        },
        upsertSpecializationTranslation: async (input) => {
            await transaction
                .insert(schema.psychologistSpecializationTranslations)
                .values(input)
                .onConflictDoUpdate({
                    target: [
                        schema.psychologistSpecializationTranslations.specializationId,
                        schema.psychologistSpecializationTranslations.locale
                    ],
                    set: { label: input.label }
                });
        },
        upsertMediaObject: async (input) => {
            const [record] = await transaction
                .insert(schema.mediaObjects)
                .values({
                    objectKey: input.reference,
                    width: input.width,
                    height: input.height,
                    altId: input.alt.id,
                    altEn: input.alt.en,
                    mimeType: input.mimeType,
                    lifecycle: 'active',
                    orphanedAt: null
                })
                .onConflictDoUpdate({
                    target: schema.mediaObjects.objectKey,
                    set: {
                        width: input.width,
                        height: input.height,
                        altId: input.alt.id,
                        altEn: input.alt.en,
                        mimeType: input.mimeType,
                        lifecycle: 'active',
                        orphanedAt: null,
                        updatedAt: sql`now()`
                    }
                })
                .returning({ id: schema.mediaObjects.id });

            if (!record) throw new Error('Media upsert returned no row.');
            return record.id;
        },
        upsertMediaAttachment: async (input) => {
            await transaction
                .insert(schema.mediaAttachments)
                .values(input)
                .onConflictDoUpdate({
                    target: [
                        schema.mediaAttachments.psychologistId,
                        schema.mediaAttachments.role,
                        schema.mediaAttachments.position
                    ],
                    targetWhere: sql`${schema.mediaAttachments.psychologistId} is not null and ${schema.mediaAttachments.detachedAt} is null`,
                    set: {
                        mediaObjectId: input.mediaObjectId,
                        detachedAt: null
                    }
                });
        }
    }))
});

const runPsychologistSeed = async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is required to seed psychologists.');
        process.exitCode = 1;
        return;
    }

    let parsedDatabaseUrl: URL;
    try {
        parsedDatabaseUrl = new URL(databaseUrl);
    } catch {
        console.error('DATABASE_URL must be a valid PostgreSQL URL.');
        process.exitCode = 1;
        return;
    }

    if (parsedDatabaseUrl.protocol !== 'postgres:' && parsedDatabaseUrl.protocol !== 'postgresql:') {
        console.error('DATABASE_URL must use the postgres or postgresql protocol.');
        process.exitCode = 1;
        return;
    }

    const queryClient = postgres(databaseUrl, { max: 1 });
    const database = drizzle(queryClient, { schema });

    try {
        const result = await seedPsychologists(createDrizzlePsychologistSeedDatabase(database));
        console.info(`Seeded ${result.psychologists} psychologist records.`);
    } catch {
        console.error('Psychologist seed failed.');
        process.exitCode = 1;
    } finally {
        await queryClient.end();
    }
};

if (import.meta.main) {
    await runPsychologistSeed();
}
