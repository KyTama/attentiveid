import { count, sql } from 'drizzle-orm';
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
type PsychologistTier = typeof schema.psychologistTierEnum.enumValues[number];
type PracticeBranch = typeof schema.practiceBranchEnum.enumValues[number];
type PsychologistStatus = typeof schema.psychologistStatusEnum.enumValues[number];

export interface PsychologistSeedFixture {
    slug: string;
    status: PsychologistStatus;
    tier: PsychologistTier;
    primaryBranch: PracticeBranch;
    acceptingNewClients: boolean;
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
    status: PsychologistStatus;
    tier: PsychologistTier;
    primaryBranch: PracticeBranch;
    acceptingNewClients: boolean;
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

export interface PsychologistBootstrapDatabase extends PsychologistSeedDatabase {
    countPsychologists(): Promise<number>;
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

const fixture = (input: Omit<PsychologistSeedFixture, 'profile' | 'supportAreas' | 'status' | 'tier' | 'primaryBranch' | 'acceptingNewClients'> & {
    supportArea: SupportArea;
    status?: PsychologistStatus;
    tier?: PsychologistTier;
    primaryBranch?: PracticeBranch;
    acceptingNewClients?: boolean;
}): PsychologistSeedFixture => ({
    ...input,
    status: input.status ?? 'active',
    tier: input.tier ?? 'mid',
    primaryBranch: input.primaryBranch ?? 'tbi',
    acceptingNewClients: input.acceptingNewClients ?? true,
    supportAreas: [{ supportArea: input.supportArea, primary: true }],
    profile: profileCopy(input.name, input.credential, input.supportArea)
});

export const psychologistSeedFixtures: readonly PsychologistSeedFixture[] = [
    fixture({
        slug: 'syazka',
        name: 'Syazka Kirani Narindra',
        nickname: 'Syazka',
        credential: 'M.Psi., Psikolog',
        tier: 'senior',
        primaryBranch: 'tbi',
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
        tier: 'senior',
        primaryBranch: 'tbi',
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
        tier: 'senior',
        primaryBranch: 'tbi',
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
        tier: 'principal',
        primaryBranch: 'tbi',
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
        tier: 'senior',
        primaryBranch: 'tbi',
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
        tier: 'senior',
        primaryBranch: 'multiple',
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
        tier: 'senior',
        primaryBranch: 'multiple',
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
        tier: 'senior',
        primaryBranch: 'tbi',
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
        licenseNumber: 'STR 132482119-3084079 (SIPP Proses Perpanjangan)',
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
        tier: 'senior_mid',
        primaryBranch: 'tbi',
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
        status: 'inactive',
        tier: 'senior_mid',
        primaryBranch: 'tbi',
        acceptingNewClients: false,
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
        tier: 'senior_mid',
        primaryBranch: 'tbi',
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
        tier: 'principal',
        primaryBranch: 'online_only',
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
        licenseNumber: 'SIPPK 503/446/826/SIPPK/DPMPTSP/X/2025 (s.d. 2030)',
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
,
    fixture({
        slug: 'andri',
        name: 'Mohammad Andri Khaeranu',
        nickname: 'Andri',
        credential: 'M.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'tbi',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Gangguan emosi', 'Emotional concerns'),
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Masalah relasi', 'Relationship concerns'),
            localizedLabel('Kecemasan akademik', 'Academic anxiety'),
            localizedLabel('Pengembangan diri', 'Personal development'),
            localizedLabel('Kecemasan dalam karir', 'Career anxiety')
        ],
        experienceYears: 1,
        licenseNumber: 'SIPP 20250389-2025-0371',
        bookingUrl: bookingUrl('Andri', 'regular'),
        premiumBookingUrl: bookingUrl('Andri', 'premium'),
        featured: true,
        featuredOrder: 12,
        media: {
            reference: 'media/psychologists/andri.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Mohammad Andri Khaeranu', en: 'Profile photo of Mohammad Andri Khaeranu' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'jessica',
        name: 'Jessica Raphaela',
        nickname: 'Jessica',
        credential: 'M.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Masalah akademik dan pekerjaan', 'Academic and work concerns'),
            localizedLabel('Non-suicidal self-injury / self-harm', 'Self-harm and non-suicidal self-injury'),
            localizedLabel('Pengelolaan emosi', 'Emotional regulation'),
            localizedLabel('Pengembangan dan penyesuaian diri', 'Personal development and life adjustment'),
            localizedLabel('Relasi interpersonal', 'Interpersonal relationships'),
            localizedLabel('Stres dan burnout', 'Stress and burnout')
        ],
        experienceYears: 1,
        licenseNumber: 'SIPP 20241501-2024-2097',
        bookingUrl: bookingUrl('Jessica', 'regular'),
        premiumBookingUrl: bookingUrl('Jessica', 'premium'),
        featured: true,
        featuredOrder: 13,
        media: {
            reference: 'media/psychologists/jessica.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Jessica Raphaela', en: 'Profile photo of Jessica Raphaela' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'valencia',
        name: 'Valencia Yang',
        nickname: 'Valencia',
        credential: 'M.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Stres dan gejala somatik', 'Stress and somatic symptoms'),
            localizedLabel('Depresi', 'Depression'),
            localizedLabel('OCD', 'OCD'),
            localizedLabel('Konflik hubungan personal / romantis', 'Personal and romantic relationship conflicts'),
            localizedLabel('ADHD', 'ADHD'),
            localizedLabel('Self-harm / Suicidal thoughts', 'Self-harm and suicidal ideation'),
            localizedLabel('Adiksi pornografi', 'Pornography addiction')
        ],
        experienceYears: 1,
        licenseNumber: 'SIPP 20241724-2025-0075',
        bookingUrl: bookingUrl('Valencia', 'regular'),
        premiumBookingUrl: bookingUrl('Valencia', 'premium'),
        featured: true,
        featuredOrder: 14,
        media: {
            reference: 'media/psychologists/valencia.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Valencia Yang', en: 'Profile photo of Valencia Yang' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'audria',
        name: 'Audria Putri Salsabila Syarif',
        nickname: 'Audri',
        credential: 'S.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Stres kerja dan karir', 'Work and career stress'),
            localizedLabel('Masalah hubungan romantis', 'Romantic relationship concerns'),
            localizedLabel('Masalah gender / identitas diri', 'Gender and identity concerns'),
            localizedLabel('Masalah mood', 'Mood concerns'),
            localizedLabel('Masalah relasi sosial', 'Social relationship concerns'),
            localizedLabel('Manajemen stres', 'Stress management'),
            localizedLabel('Trauma', 'Trauma'),
            localizedLabel('Depresi', 'Depression')
        ],
        experienceYears: 1,
        licenseNumber: 'Lulusan Baru Profesi UI (Proses SIPP/STR)',
        bookingUrl: bookingUrl('Audri', 'regular'),
        premiumBookingUrl: bookingUrl('Audri', 'premium'),
        featured: true,
        featuredOrder: 15,
        media: {
            reference: 'media/psychologists/audria.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Audria Putri Salsabila Syarif', en: 'Profile photo of Audria Putri Salsabila Syarif' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'farahdilla',
        name: 'Farahdilla',
        nickname: 'Farah',
        credential: 'S.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Self-worth', 'Self-worth'),
            localizedLabel('Relasi (pasangan, keluarga, pertemanan)', 'Relationships (couples, family, peers)'),
            localizedLabel('Regulasi emosi', 'Emotional regulation'),
            localizedLabel('Grief', 'Grief and loss'),
            localizedLabel('Karier & akademik', 'Career and academics')
        ],
        experienceYears: 1,
        licenseNumber: 'STR HIMPSI STR20252151-2026-0368',
        bookingUrl: bookingUrl('Farah', 'regular'),
        premiumBookingUrl: bookingUrl('Farah', 'premium'),
        featured: true,
        featuredOrder: 16,
        media: {
            reference: 'media/psychologists/farahdilla.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Farahdilla', en: 'Profile photo of Farahdilla' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'angelina',
        name: 'Angelina Gabriella Suliyanto',
        nickname: 'Angel',
        credential: 'S.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Kepercayaan diri', 'Self-confidence'),
            localizedLabel('Regulasi emosi', 'Emotional regulation'),
            localizedLabel('Hubungan interpersonal (teman, keluarga, pasangan)', 'Interpersonal relationships'),
            localizedLabel('Pengembangan diri', 'Personal development'),
            localizedLabel('Kecemasan', 'Anxiety'),
            localizedLabel('Grieving', 'Grief and mourning'),
            localizedLabel('Masalah karir & akademik', 'Career and academic concerns')
        ],
        experienceYears: 1,
        licenseNumber: 'STR HIMPSI STR20252165-2026-0352',
        bookingUrl: bookingUrl('Angel', 'regular'),
        premiumBookingUrl: bookingUrl('Angel', 'premium'),
        featured: true,
        featuredOrder: 17,
        media: {
            reference: 'media/psychologists/angelina.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Angelina Gabriella Suliyanto', en: 'Profile photo of Angelina Gabriella Suliyanto' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'gisella',
        name: 'Gisella Tani Pratiwi',
        nickname: 'Gisella',
        credential: 'M.Psi., Psikolog',
        status: 'draft',
        acceptingNewClients: false,
        tier: 'principal',
        primaryBranch: 'tbi',
        supportArea: 'childAdolescent',
        specializations: [
            localizedLabel('Trauma masa kanak-kanak dan kompleks', 'Complex and childhood trauma'),
            localizedLabel('Depresi dan isu suicidality pada remaja', 'Adolescent depression and suicidality'),
            localizedLabel('Pola asuh dan parenting remaja', 'Adolescent parenting'),
            localizedLabel('Masalah emosi, sosial, dan perilaku anak/remaja', 'Child and adolescent emotional-social-behavioral issues'),
            localizedLabel('Kekerasan berbasis gender dan seksual', 'Gender-based and sexual violence'),
            localizedLabel('Praktisi Brainspotting dan Mindfulness', 'Brainspotting and mindfulness practitioner'),
            localizedLabel('Art therapy untuk anak dan remaja', 'Art therapy for children and adolescents'),
            localizedLabel('Pendekatan CBT', 'CBT approach')
        ],
        experienceYears: 15,
        licenseNumber: 'STR Kemenkes HM00001710655511 (SIPPK Proses)',
        bookingUrl: bookingUrl('Gisella', 'regular'),
        premiumBookingUrl: bookingUrl('Gisella', 'premium'),
        featured: true,
        featuredOrder: 18,
        media: {
            reference: 'media/psychologists/gisella.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Gisella Tani Pratiwi', en: 'Profile photo of Gisella Tani Pratiwi' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'farhan',
        name: 'Farhan ‘Afif Arrahul',
        nickname: 'Farhan',
        credential: 'S.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'bsd',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Permasalahan akademik dan sekolah', 'Academic and school concerns'),
            localizedLabel('Karier dan pekerjaan', 'Career and work concerns'),
            localizedLabel('Relasi sosial dan pertemanan', 'Social and peer relationships'),
            localizedLabel('Hubungan romantis', 'Romantic relationships'),
            localizedLabel('Manajemen stres', 'Stress management'),
            localizedLabel('Pengembangan diri dan potensi', 'Self-development and personal growth'),
            localizedLabel('Eksplorasi minat, bakat, dan jurusan', 'Interest, aptitude, and major exploration')
        ],
        experienceYears: 1,
        licenseNumber: 'STR & SILP UGM (Tersedia by Request)',
        bookingUrl: bookingUrl('Farhan', 'regular'),
        premiumBookingUrl: bookingUrl('Farhan', 'premium'),
        featured: true,
        featuredOrder: 19,
        media: {
            reference: 'media/psychologists/farhan.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Farhan ‘Afif Arrahul', en: 'Profile photo of Farhan ‘Afif Arrahul' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'grace',
        name: 'Grace Eka',
        nickname: 'Grace',
        credential: 'S.Psi., M.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'online_only',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Stres dan regulasi emosi', 'Stress and emotional regulation'),
            localizedLabel('Overthinking dan kecemasan', 'Overthinking and anxiety'),
            localizedLabel('Gangguan depresi', 'Depressive disorders'),
            localizedLabel('Masalah interpersonal (pasangan, keluarga, pertemanan)', 'Interpersonal concerns'),
            localizedLabel('Penyesuaian hidup (life adjustment)', 'Life adjustment'),
            localizedLabel('Pengembangan diri (insecurity, self-esteem)', 'Personal development and self-esteem'),
            localizedLabel('Pendampingan psikologis prenatal & postpartum', 'Prenatal and postpartum psychological support')
        ],
        experienceYears: 1,
        licenseNumber: 'SIPP 20251626-2025-01-1501',
        bookingUrl: bookingUrl('Grace', 'regular'),
        premiumBookingUrl: bookingUrl('Grace', 'premium'),
        featured: true,
        featuredOrder: 20,
        media: {
            reference: 'media/psychologists/grace.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Grace Eka', en: 'Profile photo of Grace Eka' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'dominika',
        name: 'Dominika Arthalia Ayunda Putri',
        nickname: 'Dominika',
        credential: 'M.Psi., Psikolog',
        tier: 'senior',
        primaryBranch: 'tbi',
        supportArea: 'educational',
        specializations: [
            localizedLabel('Anak berkebutuhan khusus dan kesulitan belajar', 'Additional needs and learning difficulties'),
            localizedLabel('Kesiapan sekolah', 'School readiness'),
            localizedLabel('Pemeriksaan bakat minat dan konseling karir', 'Aptitude assessment and career counseling'),
            localizedLabel('Pola asuh orang tua', 'Parenting'),
            localizedLabel('Masalah perilaku dan motivasi belajar', 'Behavioral issues and learning motivation'),
            localizedLabel('Pemeriksaan tumbuh kembang anak', 'Child developmental screening')
        ],
        experienceYears: 4,
        licenseNumber: 'SIPP 20210020-2022-01-2265',
        bookingUrl: bookingUrl('Dominika', 'regular'),
        premiumBookingUrl: bookingUrl('Dominika', 'premium'),
        featured: true,
        featuredOrder: 21,
        media: {
            reference: 'media/psychologists/dominika.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Dominika Arthalia Ayunda Putri', en: 'Profile photo of Dominika Arthalia Ayunda Putri' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'nuzul',
        name: 'Annisah Nurul Azizah',
        nickname: 'Nuzul',
        credential: 'M.Psi., Psikolog',
        tier: 'mid',
        primaryBranch: 'malang',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Relasi romantis & interpersonal', 'Romantic and interpersonal relationships'),
            localizedLabel('Gangguan kepribadian & pola kepribadian', 'Personality disorders and patterns'),
            localizedLabel('Trauma & kekerasan pada perempuan', 'Trauma and violence recovery'),
            localizedLabel('Isu gender & identitas', 'Gender and identity issues'),
            localizedLabel('Remaja & pencarian identitas diri', 'Adolescent identity development'),
            localizedLabel('Kecemasan & depresi', 'Anxiety and depression')
        ],
        experienceYears: 1,
        licenseNumber: 'SIPP 20251606-2025-01-1503 (STR-PK TO00001944176240)',
        bookingUrl: bookingUrl('Nuzul', 'regular'),
        premiumBookingUrl: bookingUrl('Nuzul', 'premium'),
        featured: true,
        featuredOrder: 22,
        media: {
            reference: 'media/psychologists/nuzul.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Annisah Nurul Azizah', en: 'Profile photo of Annisah Nurul Azizah' },
            mimeType: 'image/webp'
        }
    }),
    fixture({
        slug: 'haykal',
        name: 'Dr. Haykal Hafizul Arifin',
        nickname: 'Haykal',
        credential: 'S.Psi., M.Si.',
        tier: 'consultant',
        primaryBranch: 'tbi',
        supportArea: 'adultClinical',
        specializations: [
            localizedLabel('Makna dan tujuan hidup (Meaning in Life)', 'Meaning and purpose in life'),
            localizedLabel('Berpikir kritis (Critical Thinking)', 'Critical thinking'),
            localizedLabel('Struktur dan dinamika kepribadian', 'Personality structure'),
            localizedLabel('Efikasi diri dan prokrastinasi', 'Self-efficacy and procrastination'),
            localizedLabel('Metode riset dan psikologi eksperimen', 'Research methods and experimental psychology'),
            localizedLabel('Pengendalian diri (Self Control)', 'Self-control'),
            localizedLabel('Studi ekstremisme kekerasan', 'Violent extremism research'),
            localizedLabel('Kebebasan dan otonomi diri', 'Freedom and personal autonomy')
        ],
        experienceYears: 12,
        licenseNumber: 'Peneliti & Konsultan Psikologi Sosial (Non-Klinis)',
        bookingUrl: bookingUrl('Haykal', 'regular'),
        premiumBookingUrl: bookingUrl('Haykal', 'premium'),
        featured: true,
        featuredOrder: 23,
        media: {
            reference: 'media/psychologists/haykal.webp',
            width: 600,
            height: 750,
            alt: { id: 'Foto profil Dr. Haykal Hafizul Arifin', en: 'Profile photo of Dr. Haykal Hafizul Arifin' },
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
        tier: candidate.tier,
        primaryBranch: candidate.primaryBranch,
        acceptingNewClients: candidate.acceptingNewClients,
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
        && ['draft', 'active', 'inactive', 'archived'].includes(candidate.status)
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
                    tier: candidate.tier,
                    primaryBranch: candidate.primaryBranch,
                    acceptingNewClients: candidate.acceptingNewClients,
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

export async function bootstrapPsychologists(
    database: PsychologistBootstrapDatabase,
    fixtures: readonly PsychologistSeedFixture[] = psychologistSeedFixtures
): Promise<{ status: 'seeded' | 'unchanged'; result?: PsychologistSeedResult }> {
    if (await database.countPsychologists() > 0) return { status: 'unchanged' };

    return {
        status: 'seeded',
        result: await seedPsychologists(database, fixtures)
    };
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
                        tier: input.tier,
                        primaryBranch: input.primaryBranch,
                        acceptingNewClients: input.acceptingNewClients,
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

export const createDrizzlePsychologistBootstrapDatabase = (
    database: PostgresJsDatabase<typeof schema>
): PsychologistBootstrapDatabase => ({
    ...createDrizzlePsychologistSeedDatabase(database),
    countPsychologists: async () => {
        const [result] = await database.select({ total: count() }).from(schema.psychologists);
        return result?.total ?? 0;
    }
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
        const force = process.argv.includes('--force') || process.argv.includes('--upsert');
        const bootstrapDb = createDrizzlePsychologistBootstrapDatabase(database);
        const result = force
            ? { status: 'seeded' as const, result: await seedPsychologists(bootstrapDb) }
            : await bootstrapPsychologists(bootstrapDb);
        console.info(result.status === 'seeded'
            ? `Seeded ${result.result?.psychologists ?? 0} psychologist records.`
            : 'Psychologist content already initialized.');
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
