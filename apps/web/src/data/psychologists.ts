import { PSYCHOLOGISTS as PHOTOS } from '@/assets/images'

/**
 * Psychologist Team Data
 * 
 * This contains the structured data for each team member.
 * UI text is handled by i18n, this is for data that doesn't change between languages.
 */

export type PsychologistCategory = 'adultClinical' | 'childAdolescent' | 'educational'

export interface Psychologist {
    id: string
    name: string
    nickname: string
    title: string
    category: PsychologistCategory
    image: string
    specializations: string[]
    experience: string
    sipp: string
    reservationLink: string
    premiumLink: string
}

const WA_BASE = 'https://wa.me/6285156410912?text='

const createWaLink = (name: string, type: 'regular' | 'premium') => {
    const message = type === 'regular'
        ? `Halo admin Attentive.id, saya ingin melakukan reservasi sesi konsultasi dengan Psikolog ${name}. Saya menghubungi dari website Attentive.id. Mohon informasinya mengenai ketersediaan jadwal. Terima kasih. (rp)`
        : `Halo Admin Attentive.id, saya ingin melakukan reservasi sesi konsultasi premium dengan Psikolog ${name}, melalui website Attentive.id. (rp)`
    return WA_BASE + encodeURIComponent(message)
}

export const psychologists: Psychologist[] = [
    {
        id: 'syazka',
        name: 'Syazka Kirani Narindra',
        nickname: 'Syazka',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.syazka,
        specializations: [
            'Gangguan kepribadian',
            'Trauma',
            'Gangguan mood (Depresi, distimia, bipolar)',
            'ADHD',
            'Relasi interpersonal / hubungan romantis',
            'Gangguan kecemasan',
            'Pengembangan Diri',
            'OCD',
        ],
        experience: '6 Tahun',
        sipp: '20190974-2021-02-1552',
        reservationLink: createWaLink('Syazka', 'regular'),
        premiumLink: createWaLink('Syazka', 'premium'),
    },
    {
        id: 'gita',
        name: 'Anggita Panjaitan',
        nickname: 'Gita',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.gita,
        specializations: [
            'Trauma & isu terkait emosi',
            'ADHD Dewasa',
            'Gangguan Kecemasan',
            'Gangguan Kepribadian',
            'Relasi interpersonal/hubungan romantis',
            'Masalah terkait pekerjaan, karir, dan pengembangan diri',
            'Masalah terkait Gender',
            'Praktisi metode Brainspotting',
        ],
        experience: '5 Tahun',
        sipp: '20200657-2023-02-2669',
        reservationLink: createWaLink('Anggita', 'regular'),
        premiumLink: createWaLink('Anggita', 'premium'),
    },
    {
        id: 'mayda',
        name: 'Ni Putu Mayda A. A',
        nickname: 'Mayda',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.mayda,
        specializations: [
            'Hubungan romantis',
            'Masalah dalam hubungan interpersonal',
            'Masalah dalam hubungan keluarga',
            'Kecemasan',
            'Masalah mood dan emosi',
            'Pekerjaan dan karir',
            'Stres dan burnout',
            'Gangguan kepribadian',
        ],
        experience: '5 Tahun',
        sipp: '20191405-2024-02-3405',
        reservationLink: createWaLink('Ni Putu', 'regular'),
        premiumLink: createWaLink('Ni Putu', 'premium'),
    },
    {
        id: 'anggun',
        name: 'Anggriana Angguningtyas',
        nickname: 'Anggun',
        title: 'M.Psi., Psikolog',
        category: 'childAdolescent',
        image: PHOTOS.anggun,
        specializations: [
            'Gangguan perkembangan',
            'Gangguan belajar/ kecerdasan',
            'ADHD',
            'Autisme',
            'Masalah perilaku',
            'Relasi dan sosialisasi',
            'Regulasi emosi',
            'Trauma dan Stress Remaja',
        ],
        experience: '7 Tahun',
        sipp: '20161132-2024-01-4335',
        reservationLink: createWaLink('Anggriana', 'regular'),
        premiumLink: createWaLink('Anggriana', 'premium'),
    },
    {
        id: 'dinda',
        name: 'Risky Adinda',
        nickname: 'Dinda',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.dinda,
        specializations: [
            'Depresi',
            'Kecemasan',
            'Masalah mood dan emosi',
            'Masalah hubungan interpersonal',
            'Hubungan romantis dan pranikah',
            'Karier dan pendidikan',
            'Stress dan burnout',
            'Pengembangan diri',
        ],
        experience: '5 Tahun',
        sipp: '20200628-2020-01-1289',
        reservationLink: createWaLink('Risky Adinda', 'regular'),
        premiumLink: createWaLink('Risky Adinda', 'premium'),
    },
    {
        id: 'ilham',
        name: 'Ilham Anggi P',
        nickname: 'Ilham',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.ilham,
        specializations: [
            'Anxiety',
            'Insecurity & Overthinking',
            'Depresi',
            'Kesepian dan isu terkait hubungan intepersonal',
            'Regulasi emosi',
            'Stres kerja dan karir',
            'Pengembangan diri',
            'Hubungan romantis',
        ],
        experience: '6 Tahun',
        sipp: '20190006-2021-02-0709',
        reservationLink: createWaLink('Ilham', 'regular'),
        premiumLink: createWaLink('Ilham', 'premium'),
    },
    {
        id: 'nichi',
        name: 'Dwi Ningsih A',
        nickname: 'Dwi',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.nichi,
        specializations: [
            'Depresi',
            'Gangguan Mood dan Emosi',
            'Stress dan Burn Out',
            'Self Esteem',
            'Anxiety',
            'Pengembangan diri',
            'Family and Relationship',
            'Gangguan Kepribadian',
        ],
        experience: '4 Tahun',
        sipp: '20181094-2020-01-0404',
        reservationLink: createWaLink('Dwi', 'regular'),
        premiumLink: createWaLink('Dwi', 'premium'),
    },
    {
        id: 'dewinta',
        name: 'Putri Dewinta',
        nickname: 'Putri',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.dewinta,
        specializations: [
            'Kecemasan',
            'Gangguan kepribadian',
            'Pengembangan diri',
            'Pekerjaan & karir',
            'Regulasi emosi',
            'Relasi interpersonal/ hubungan romantis',
            'Gangguan mood',
            'ADHD',
        ],
        experience: '6 Tahun',
        sipp: '20180806-2021-02-1238',
        reservationLink: createWaLink('Putri', 'regular'),
        premiumLink: createWaLink('Putri', 'premium'),
    },
    {
        id: 'sekar',
        name: 'Sekarini Andika Permatasari',
        nickname: 'Sekar',
        title: 'M.Psi., Psikolog',
        category: 'educational',
        image: PHOTOS.sekar,
        specializations: [
            'Permasalahan belajar',
            'Kesiapan sekolah anak',
            'Stres, kecemasan, & pengendalian diri',
            'Hubungan pertemanan',
            'Pengasuhan anak',
            'Eksplorasi minat, bakat, & penjurusan',
            'Permasalahan & pengembangan karier',
            'Pengembangan potensi diri',
        ],
        experience: '>1 Tahun',
        sipp: '20231126-2024-01-3432',
        reservationLink: createWaLink('Sekarini', 'regular'),
        premiumLink: createWaLink('Sekarini', 'premium'),
    },
    {
        id: 'kia',
        name: 'Riskia Ramadhina',
        nickname: 'Riskia',
        title: 'M.Psi., Psikolog',
        category: 'educational',
        image: PHOTOS.kia,
        specializations: [
            'Kesiapan Sekolah Anak',
            'Anak Berkebutuhan Khusus (ABK)',
            'Motivasi & Performa Akademik',
            'Pola Asuh & Pengasuhan Anak',
            'Hubungan Orangtua & Anak',
            'Minat & Bakat',
            'Pengembangan Diri',
            'Bimbingan Karir',
        ],
        experience: '>1 Tahun',
        sipp: '20240002-2024-01-3466',
        reservationLink: createWaLink('Riskia', 'regular'),
        premiumLink: createWaLink('Riskia', 'premium'),
    },
    {
        id: 'disa',
        name: 'Disa Nisrina Listiani',
        nickname: 'Disa',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.disa,
        specializations: [
            'Kecemasan',
            'Depresi',
            'Gangguan Kepribadian',
            'Regulasi Emosi',
            'Manajemen Stres',
            'Transisi Kehidupan',
            'Pengembangan Diri',
            'Kehilangan dan Berduka',
        ],
        experience: '>1 Tahun',
        sipp: '20240760-2024-01-3829',
        reservationLink: createWaLink('Disa', 'regular'),
        premiumLink: createWaLink('Disa', 'premium'),
    },
    {
        id: 'jean',
        name: 'Jeanete Ophilia Papilaya',
        nickname: 'Jeanette',
        title: 'M.Psi., Psikolog',
        category: 'adultClinical',
        image: PHOTOS.jean,
        specializations: [
            'Penanganan Emosi',
            'Kecemasan',
            'Depresi',
            'Trauma',
            'Konseling Pra Nikah',
            'Konseling Keluarga',
            'Penanganan Masalah Relationship',
        ],
        experience: '16 Tahun',
        sipp: '440/3378/Dinkes/2020',
        reservationLink: createWaLink('Jeanete', 'regular'),
        premiumLink: createWaLink('Jeanete', 'premium'),
    },
]

// Helper to filter by category
export const getPsychologistsByCategory = (category: PsychologistCategory) =>
    psychologists.filter((p) => p.category === category)

// Get unique categories
export const getCategories = () =>
    [...new Set(psychologists.map((p) => p.category))] as PsychologistCategory[]
