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
    shortBio?: string
    biography?: string
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
        shortBio: 'Gita is an Adult Clinical Psychologist with a deep curiosity for people and the stories beneath their patterns. Warm, candid, and reflective, she sees therapy as a space to make sense of what keeps returning, understand ourselves with greater tenderness, and slowly create more freedom in choosing how we want to live.',
        biography: 'There are moments in life when we begin to notice that some things keep finding their way back to us. A familiar feeling in a different relationship, the same fear wearing a different face, or a question about ourselves that quietly follows us from one chapter of life to another. Sometimes nothing is terribly wrong. We simply arrive at a point where the way we have always understood ourselves no longer feels enough.\n\nThese are the kinds of conversations Anggita Hotna Panjaitan, or Gita, finds especially meaningful.\n\nGita is an Adult Clinical Psychologist with a particular interest in the inner workings of adulthood: emotions, relationships, personality, trauma, ADHD, identity, work, and the often-complicated process of becoming more at home with oneself. She works with adults experiencing anxiety and mood difficulties, ADHD-related concerns, personality and relational dynamics, trauma, self-development, family and romantic relationship issues, and workplace stress.\n\nBut psychology is only one of the languages through which Gita understands people.\n\nA lifelong observer of human stories, she has an enduring love for books, writing, culture, travel, and deep conversations. She is interested in the seemingly ordinary things through which people often reveal something important about who they are. Her professional journey has been similarly varied, spanning clinical practice, organizational psychology, research, corporate mental health, writing, psychoeducation, and public speaking. She has also worked beyond the therapy room as an author and mental-health source for Indonesian media.\n\nPerhaps because of this, Gita rarely sees people as a collection of symptoms to be fixed. She is interested in the story underneath them: where a pattern came from, what once made it necessary, why it keeps returning, and whether it still belongs in the life someone wants to build.\n\nHer therapeutic style is warm and deeply curious, but also candid. Sessions with Gita can move between difficult emotions, psychological patterns, practical questions, unexpected connections, and occasionally humour. She believes therapy can be compassionate without avoiding uncomfortable truths, and psychologically deep without becoming detached from real life.\n\nFor Gita, good therapy is not about telling someone who they should become. It is about helping them understand themselves deeply enough to have more freedom in deciding who they want to be.',
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
        shortBio: 'Dwi Ningsih (Nichi) is a clinical psychologist supporting young people through emotional struggles, relationship dynamics, and life transitions. Her approach is warm, practical, and tailored to help clients discover their inner strengths.',
        biography: 'Hello, I am Nichi.\n\nI believe that you do not always need someone to tell you what to do or how to fix your life. Sometimes, you simply need a safe space to pause, put your thoughts into words, and see yourself a little more clearly. As a psychologist, I see counseling as a collaborative process where I accompany you in understanding what you are going through, making sense of your thoughts and emotions, and finding resources that can help you move forward.\n\nI have been working with young people since the beginning of my professional journey, conducting hundreds of counseling sessions and supporting people through a wide range of concerns—from everyday struggles, relationship and academic concerns, anxiety and emotional difficulties, to more complex clinical challenges (depression, anxiety, bipolar, personality disorder, psychotic disorder). These experiences have taught me that no two people experience life in exactly the same way, and therefore, counseling should not be a one-size-fits-all process.\n\nMy approach is warm, empathetic, practical, and flexible, while remaining grounded in psychological principles. I hope our sessions can become a space where you feel safe enough to be vulnerable, understood without judgment, and supported as you discover your own answers. I may walk beside you, but ultimately, you are the one who knows your life best—and you are the one who makes the change.',
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
        experience: '3 Tahun',
        sipp: '20240760-2024-01-3829',
        reservationLink: createWaLink('Disa', 'regular'),
        premiumLink: createWaLink('Disa', 'premium'),
    },
    {
        id: 'gisella',
        name: 'Gisella Tani Pratiwi',
        nickname: 'Ella',
        title: 'M.Psi., Psikolog',
        category: 'childAdolescent',
        image: '/media/psychologists/gisella.webp',
        specializations: [
            'Trauma masa kanak-kanak dan kompleks',
            'Depresi dan isu suicidality pada remaja',
            'Pola asuh dan parenting remaja',
            'Masalah emosi, sosial, dan perilaku anak/remaja',
            'Kekerasan berbasis gender dan seksual',
            'Praktisi Brainspotting dan Mindfulness',
            'Art therapy untuk anak dan remaja',
            'Pendekatan CBT',
        ],
        experience: '15 Tahun',
        sipp: 'STR Kemenkes HM00001710655511 (SIPPK Proses)',
        reservationLink: createWaLink('Gisella', 'regular'),
        premiumLink: createWaLink('Gisella', 'premium'),
        shortBio: "Gisella Tani Pratiwi (Ella) is a clinical psychologist practicing since 2010. She supports adolescents, young adults, and parents through trauma recovery, emotional regulation, and self-empowerment with a warm, non-judgmental approach.",
        biography: "I am a clinical psychologist who has been practicing since 2010, with a particular interest in supporting adolescents and young adults through difficult emotional and life experiences. I work with concerns including depression, emotional regulation difficulties, suicidal thoughts and behaviors, trauma, including complex and childhood trauma, experiences of violence involving women and children, burnout, and self-care. I also support parents navigating concerns related to their teenage or young adult children and their changing emotional needs.\n\nI believe that every person has the capacity for agency, recovery, and growth, even after painful or traumatic experiences. At the same time, some experiences can feel deeply overwhelming, and seeking professional support can be an important part of healing. I see therapy as a space to better understand ourselves, process difficult experiences, and reconnect with a more genuine and empowered sense of self. My approach is warm and trauma-informed, drawing from Brainspotting, mindfulness, and art therapy, alongside my training in DBT, Psychological First Aid, and suicide intervention and assessment, including CAMS and ASIST.\n\nMy professional experience spans clinical, educational, and psychosocial settings, including providing psychological and psychosocial support for the United Nations and International Organization for Migration (IOM) across the Asia-Pacific region, as well as working in trauma recovery and child protection. I hold a Bachelor's degree in Psychology from Atma Jaya Catholic University and a Master's and Professional degree in Clinical Psychology from Universitas Indonesia. I hope to create a safe and compassionate space where clients can feel understood, process what they have been through, and move forward with greater agency and self-understanding.",
    },
    {
        id: 'dominika',
        name: 'Dominika Arthalia Ayunda Putri',
        nickname: 'Domi',
        title: 'M.Psi., Psikolog',
        category: 'educational',
        image: '/media/psychologists/dominika.webp',
        specializations: [
            'Anak berkebutuhan khusus dan kesulitan belajar',
            'Kesiapan sekolah',
            'Pemeriksaan bakat minat dan konseling karir',
            'Pola asuh orang tua',
            'Masalah perilaku dan motivasi belajar',
            'Pemeriksaan tumbuh kembang anak',
        ],
        experience: '4 Tahun',
        sipp: 'SIPP 20210020-2022-01-2265',
        reservationLink: createWaLink('Dominika', 'regular'),
        premiumLink: createWaLink('Dominika', 'premium'),
        shortBio: "Dominika Arthalia (Domi) is an educational psychologist working with children, adolescents, and families on learning challenges, motivation, and parenting dynamics. Her holistic approach nurtures every learner to thrive at their own unique pace.",
        biography: "Dominika Arthalia A. P., M.Psi., Psikolog (Domi)\nEducational Psychologist\n\nDomi is an educational psychologist who works with children from preschool age through adolescence, as well as young adults. She has experience supporting children with special needs, learning difficulties, motivation challenges, and concerns related to school readiness and learning. She also provides psychological assessments such as aptitude and interest assessments, school readiness assessments, and other assessments to help children and families better understand their strengths, needs, and potential.\n\nDomi believes that a child’s learning and development are shaped not only by their learning methods or abilities, but also by their home environment, relationships, and family dynamics. A warm and supportive environment gives children the space to explore themselves, understand how they learn best, and develop their potential, while stressful or conflict-filled environments can make it harder for them to do so.\n\nWith experience across schools, child development centers, psychological services, and educational programs, Domi takes a holistic approach to understanding children's challenges. She also works with parents, particularly when parent-child dynamics may be affecting a child's learning, motivation, or academic performance. Her goal is not only to understand what a child is struggling with, but also to look at the broader context around them and identify ways to support their development.\n\nDomi completed her Bachelor's degree in Psychology at Universitas Indonesia in 2015 and her Master's & Professional degree in Educational Psychology in 2022. She aims to create a supportive space where children and parents can better understand their needs and work together toward the child's optimal development.",
    },
]

// Helper to filter by category
export const getPsychologistsByCategory = (category: PsychologistCategory) =>
    psychologists.filter((p) => p.category === category)

// Get unique categories
export const getCategories = () =>
    [...new Set(psychologists.map((p) => p.category))] as PsychologistCategory[]
