import { eq, max, sql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
    validateLandingContentMutation,
    type LandingContentMutation,
    type LocalizedText
} from '@attentiveid/shared';
import { mapLandingSectionMutation } from '../repositories/landing-content.repository';
import * as schema from './schema';

const localized = (id: string, en: string): LocalizedText => ({ id, en });
const item = (
    id: string,
    position: number,
    titleId: string,
    titleEn: string,
    descriptionId: string,
    descriptionEn: string
) => ({
    id,
    position,
    title: localized(titleId, titleEn),
    description: localized(descriptionId, descriptionEn)
});

export const landingSeedContent = {
    sections: [
        {
            key: 'hero',
            visible: true,
            headline: localized(
                'Biro Psikologi Klinis & Konseling Profesional Berizin Resmi',
                'Licensed Clinical Psychology Bureau & Professional Counseling'
            ),
            description: localized(
                'Konsultasi tatap muka langsung di Jakarta, BSD, dan Malang, atau sesi daring privat bersama psikolog berlisensi SIP resmi.',
                'Private in-person consultations in Jakarta, BSD, and Malang, or online video counseling with licensed psychologists.'
            ),
            primaryCta: localized('Jadwalkan Konsultasi', 'Book Consultation'),
            secondaryCta: localized('Lihat Layanan', 'Explore Services'),
            items: [
                item('sessions-delivered', 0, 'Sesi terlaksana', 'Sessions delivered', '3.000+', '3,000+'),
                item('psychologist-count', 1, 'Psikolog', 'Psychologists', '18', '18'),
                item('google-rating', 2, 'Rating Google', 'Google rating', '5,0', '5.0'),
                item('google-reviews', 3, 'Ulasan Google', 'Google reviews', '53', '53')
            ]
        },
        {
            key: 'supportExplorer',
            visible: true,
            headline: localized('Area Layanan & Dukungan Psikologi', 'Psychology Support & Care Areas'),
            description: localized(
                'Pilih fokus dukungan yang paling relevan dengan kondisi emosional atau kebutuhan evaluasi Anda saat ini.',
                'Select the focus area most relevant to your current emotional state or assessment needs.'
            ),
            items: [
                item('individual-counseling', 0, 'Konseling individual', 'Individual counseling', 'Ruang privat untuk kecemasan, suasana hati, trauma, kepercayaan diri, regulasi emosi, dan pengembangan diri.', 'A private space for anxiety, mood, trauma, self-esteem, emotional regulation, and personal growth.'),
                item('couples-relationships', 1, 'Pasangan dan relasi', 'Couples and relationships', 'Dukungan untuk komunikasi, kepercayaan, konflik, persiapan pernikahan, dan pola relasi yang ingin diubah.', 'Support for communication, trust, conflict, premarital concerns, and changing relationship patterns.'),
                item('child-adolescent', 2, 'Anak dan remaja', 'Child and adolescent support', 'Dukungan sesuai usia untuk perkembangan, emosi, perilaku, pembelajaran, relasi sosial, dan kebutuhan keluarga.', 'Age-appropriate support for development, emotions, behavior, learning, social relationships, and family concerns.'),
                item('family-therapy', 3, 'Terapi keluarga', 'Family therapy', 'Ruang terpandu untuk memahami konflik berulang, membangun kembali kedekatan, dan menemukan cara yang lebih sehat.', 'A guided space for families to understand recurring conflict, rebuild connection, and find healthier ways forward.'),
                item('psychological-assessment', 4, 'Asesmen psikologis', 'Psychological assessment', 'Asesmen terstruktur untuk memahami kekuatan, kebutuhan, pola belajar, atau langkah lanjutan yang sesuai.', 'Structured assessment to better understand strengths, needs, learning patterns, or the next suitable step.'),
                item('career-work', 5, 'Karier dan pekerjaan', 'Career and work', 'Dukungan untuk burnout, stres kerja, arah karier, kepercayaan diri, pengambilan keputusan, dan perkembangan profesional.', 'Support for burnout, workplace stress, career direction, confidence, decision-making, and professional growth.')
            ]
        },
        {
            key: 'carePromise',
            visible: true,
            headline: localized('Komitmen Layanan Attentive.id', 'Attentive.id Care Promise'),
            description: localized(
                'Protokol klinis terukur demi rasa aman dan kejelasan progres konseling Anda.',
                'Structured clinical protocols ensuring safety, clarity, and measurable progress.'
            ),
            items: [
                item('no-judgment', 0, 'Tanpa menghakimi. Tanpa berasumsi.', 'No judgment. No assumptions.', 'Ruang privat agar ceritamu bisa didengar tanpa tekanan.', 'A private space where your concerns can be heard without pressure.'),
                item('shaped-around-you', 1, 'Dukungan yang mengikuti dirimu.', 'Care shaped around you.', 'Kebutuhan, kesiapan, preferensi, dan batasanmu memandu proses.', 'Your needs, readiness, preferences, and boundaries guide the process.'),
                item('human-connection', 2, 'Seseorang yang bisa terhubung denganmu.', 'Someone you can connect with.', 'Temukan profesional dengan pengalaman yang sesuai dengan kebutuhanmu.', 'Explore professionals whose experience fits what you want to work through.'),
                item('evidence-empathy', 3, 'Berbasis ilmu, tetap penuh empati.', 'Evidence with empathy.', 'Layanan psikologi profesional yang disampaikan dengan hangat dan hormat.', 'Professional psychological care delivered with warmth and respect.')
            ]
        },
        {
            key: 'featuredPsychologists',
            visible: true,
            headline: localized(
                'Tim Psikolog Profesional Kami',
                'Our Professional Psychologist Team'
            ),
            description: localized(
                'Kenali latar belakang pendidikan, spesialisasi kasus, dan nomor izin praktik para praktisi kami.',
                'Explore clinical credentials, specialized focus areas, and license details of our therapists.'
            )
        },
        {
            key: 'careJourney',
            visible: true,
            headline: localized('Tahapan Langkah Konsultasi', 'Your Care Journey Steps'),
            description: localized(
                'Tiga langkah terstruktur untuk memulai sesi pertama Anda.',
                'Three clear steps to begin your first counseling session.'
            ),
            items: [
                item('find-your-fit', 0, '1. Pilih Psikolog', '1. Choose Therapist', 'Telusuri profil berdasarkan keahlian dan lokasi cabang.', 'Review profiles matching your concern and preferred branch.'),
                item('choose-how-to-meet', 1, '2. Tentukan Jadwal', '2. Schedule Slot', 'Pilih tanggal, jam, serta format tatap muka atau daring.', 'Select your preferred time slot and session format.'),
                item('connect-at-your-pace', 2, '3. Jalani Sesi Privat', '3. Attend Session', 'Sesi 60 menit terarah di ruang privat atau tautan video aman.', 'A focused 60-minute session held in private suites or via encrypted video.')
            ]
        },
        {
            key: 'clientStories',
            visible: true,
            headline: localized('Refleksi Klien Kami', 'Client Reflections & Outcomes'),
            description: localized(
                'Cerita nyata dari klien yang telah menyelesaikan rangkaian sesi konseling bersama Attentive.',
                'Direct accounts from individuals who completed structured counseling with our psychologists.'
            ),
            items: [
                item('online-counseling-28', 0, 'Kejelasan Menghadapi Kecemasan', 'Clarity Amid Anxiety', 'Membantu saya memahami akar pola overthinking dan menemukan strategi coping yang realistis.', 'Helped me pinpoint anxiety triggers and develop practical, grounded coping routines.'),
                item('offline-psychotherapy-24', 1, 'Ruang Aman untuk Berproses', 'A Structured Sanctuary', 'Sesi yang menghargai ritme emosi tanpa dipaksa cepat-cepat pulih sebelum siap.', 'A thoughtful pace that respected my readiness without rushing the process.'),
                item('online-psychotherapy-31', 2, 'Dukungan Karir & Keputusan Sulit', 'Workplace Direction', 'Sangat membantu dalam mengurai burnout kerja dan menata kembali batas kerja-pribadi.', 'Crucial support for untangling professional burnout and restoring healthy boundaries.')
            ]
        },
        {
            key: 'consultationReassurance',
            visible: true,
            headline: localized('Informasi Biaya & Konsultasi', 'Consultation Pricing & Details'),
            description: localized(
                'Biaya transparan tanpa biaya tersembunyi.',
                'Transparent fees with no hidden costs.'
            ),
            sessionLabel: localized('Sesi Konsultasi Individu (60 Menit)', 'Individual Counseling Session (60 Mins)'),
            price: localized('Rp 250.000', 'IDR 250,000'),
            priceUnit: localized('/sesi', '/session'),
            primaryCta: localized('Reservasi Sesi Sekarang', 'Book Session Now')
        },
        {
            key: 'frequentlyAskedQuestions',
            visible: true,
            headline: localized('Pertanyaan Umum (FAQ)', 'Frequently Asked Questions'),
            description: localized(
                'Jawaban atas pertanyaan yang sering diajukan calon klien.',
                'Answers to common questions from prospective clients.'
            ),
            items: [
                item('choosing-a-psychologist', 0, 'Bagaimana cara memilih psikolog yang tepat?', 'How do I know which psychologist is right for me?', 'Mulailah dari hal yang ingin kamu bahas, lalu lihat pengalaman dan pendekatan tiap psikolog. Kalau masih ragu, admin kami dapat membantu mempersempit pilihan melalui WhatsApp.', 'Begin with the concern you want to work through, then review each psychologist\'s experience and approach. If you are still unsure, our admin can help narrow the options through WhatsApp.'),
                item('unsure-what-you-need', 1, 'Bolehkah berkonsultasi meski belum tahu pasti masalah saya?', 'Can I talk to someone even if I am not sure what I need help with?', 'Tentu. Kamu tidak membutuhkan diagnosis atau masalah yang sudah terdefinisi dengan sempurna. Menceritakan apa yang terasa sulit belakangan ini sudah cukup untuk memulai.', 'Yes. You do not need a diagnosis or a perfectly defined problem before reaching out. Describing what has been difficult lately is enough to begin.'),
                item('online-and-in-person', 2, 'Apakah sesi tersedia online dan tatap muka?', 'Are sessions available online and in person?', 'Ya. Konsultasi online tersedia, dan sesi tatap muka dapat dijadwalkan di lokasi Jakarta atau BSD sesuai ketersediaan psikolog.', 'Yes. Online consultations are available, and in-person sessions can be arranged at our Jakarta and BSD locations depending on psychologist availability.'),
                item('cultural-background', 3, 'Apakah psikolog dapat memahami latar budaya dan pengalaman saya?', 'Will my psychologist understand my cultural background and experience?', 'Kamu dapat melihat area pengalaman di setiap profil dan menyampaikan preferensi yang penting kepada admin. Hubungan terapeutik yang nyaman merupakan bagian penting dari proses.', 'You can review areas of experience in each profile and ask the admin about preferences that matter to you. A comfortable therapeutic relationship is an important part of the process.'),
                item('privacy-confidentiality', 4, 'Apakah sesi bersifat privat dan rahasia?', 'Are sessions private and confidential?', 'Sesi dilakukan secara privat dan kerahasiaan profesional berlaku sesuai batas praktik psikologi serta kewajiban keselamatan yang relevan.', 'Sessions are conducted in a private setting and professional confidentiality applies within the boundaries of psychological practice and applicable safety obligations.'),
                item('first-session', 5, 'Apa yang terjadi pada sesi pertama?', 'What happens during the first session?', 'Sesi pertama biasanya berfokus untuk memahami keluhan, tujuan, latar belakang yang relevan, dan bentuk dukungan yang mungkin berguna. Kamu juga dapat menilai apakah hubungannya terasa cocok.', 'The first session usually focuses on understanding your concerns, goals, relevant background, and what kind of support may be useful. You can also decide whether the connection feels right.')
            ]
        },
        {
            key: 'closingInvitation',
            visible: true,
            headline: localized('Siap Memulai Langkah Pertama Anda?', 'Ready to Take Your First Step?'),
            description: localized(
                'Jangan ragu menghubungi tim kami untuk pertanyaan lebih lanjut.',
                'Do not hesitate to reach out to our team for further inquiries.'
            ),
            primaryCta: localized('Konsultasi Sekarang', 'Consult Now'),
            contact: localized('WhatsApp: +62 851-5641-0912 | Email: contact@attentiveid.com', 'WhatsApp: +62 851-5641-0912 | Email: contact@attentiveid.com')
        }
    ]
} satisfies LandingContentMutation;

export interface LandingSeedDatabase {
    bootstrap(content: LandingContentMutation): Promise<'seeded' | 'unchanged'>;
}

export const seedLanding = async (
    database: LandingSeedDatabase,
    content: LandingContentMutation = landingSeedContent
) => {
    if (!validateLandingContentMutation(content)) {
        throw new Error('Invalid landing seed content.');
    }

    try {
        return { status: await database.bootstrap(content) };
    } catch {
        throw new Error('Landing seed failed.');
    }
};

export const createDrizzleLandingSeedDatabase = (
    database: PostgresJsDatabase<typeof schema>
): LandingSeedDatabase => ({
    bootstrap: (content) => database.transaction(async (transaction) => {
        await transaction.insert(schema.landingAggregates)
            .values({ singletonKey: true })
            .onConflictDoNothing({ target: schema.landingAggregates.singletonKey });

        const [aggregate] = await transaction.select({
            id: schema.landingAggregates.id,
            activeDraftRevisionId: schema.landingAggregates.activeDraftRevisionId,
            publishedRevisionId: schema.landingAggregates.publishedRevisionId
        }).from(schema.landingAggregates)
            .where(eq(schema.landingAggregates.singletonKey, true))
            .for('update')
            .limit(1);

        if (!aggregate) throw new Error('Landing aggregate missing.');
        if (aggregate.activeDraftRevisionId || aggregate.publishedRevisionId) return 'unchanged';

        const [sequence] = await transaction.select({ value: max(schema.landingRevisions.revisionNumber) })
            .from(schema.landingRevisions)
            .where(eq(schema.landingRevisions.aggregateId, aggregate.id));
        const publishedAt = new Date().toISOString();
        const [revision] = await transaction.insert(schema.landingRevisions).values({
            aggregateId: aggregate.id,
            basedOnRevisionId: null,
            revisionNumber: (sequence?.value ?? 0) + 1,
            status: 'published',
            publishedAt
        }).returning({ id: schema.landingRevisions.id });

        if (!revision) throw new Error('Landing revision insert failed.');

        for (const [position, sectionInput] of content.sections.entries()) {
            const mapped = mapLandingSectionMutation(sectionInput, position);
            const [section] = await transaction.insert(schema.landingSections).values({
                landingRevisionId: revision.id,
                ...mapped.section
            }).returning({ id: schema.landingSections.id });

            if (!section) throw new Error('Landing section insert failed.');

            await transaction.insert(schema.landingSectionTranslations).values(
                mapped.translations.map((translation) => ({ sectionId: section.id, ...translation }))
            );

            for (const itemInput of mapped.items) {
                const [landingItem] = await transaction.insert(schema.landingItems).values({
                    sectionId: section.id,
                    position: itemInput.position
                }).returning({ id: schema.landingItems.id });

                if (!landingItem) throw new Error('Landing item insert failed.');

                await transaction.insert(schema.landingItemTranslations).values(
                    itemInput.translations.map((translation) => ({ itemId: landingItem.id, ...translation }))
                );
            }
        }

        await transaction.update(schema.landingAggregates).set({
            publishedRevisionId: revision.id,
            updatedAt: sql`now()`
        }).where(eq(schema.landingAggregates.id, aggregate.id));

        return 'seeded';
    })
});

const runLandingSeed = async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is required to seed landing content.');
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
        const result = await seedLanding(createDrizzleLandingSeedDatabase(database));
        console.info(result.status === 'seeded'
            ? 'Published initial landing content.'
            : 'Landing content already initialized.');
    } catch {
        console.error('Landing seed failed.');
        process.exitCode = 1;
    } finally {
        await queryClient.end();
    }
};

if (import.meta.main) {
    await runLandingSeed();
}
