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
                'Dukungan dimulai saat kamu merasa dipahami.',
                'Support starts with feeling understood.'
            ),
            description: localized(
                'Setiap cerita berbeda. Kami meluangkan waktu untuk memahami kamu sebelum membantu menemukan dukungan psikologis yang terasa tepat.',
                'Every story is different. We take the time to understand you before helping you find psychological support that feels right for you.'
            ),
            primaryCta: localized('Temukan psikologmu', 'Find your psychologist'),
            secondaryCta: localized('Lihat pilihan dukungan', 'Explore support options'),
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
            headline: localized('Apa yang sedang memenuhi pikiranmu?', 'What has been on your mind?'),
            description: localized(
                'Kamu tidak harus langsung tahu jenis bantuan yang tepat. Mulailah dari area yang paling dekat dengan pengalamanmu.',
                'You do not need to know exactly what kind of support to ask for. Begin with the area closest to your experience.'
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
            headline: localized('Dukungan yang dimulai dari kamu.', 'Care that starts with you.'),
            description: localized(
                'Tidak ada dua orang yang menjalani hidup dengan cara yang sama. Peran kami adalah mendengarkan, membuat proses lebih jelas, dan membantu kamu memilih dukungan dengan yakin.',
                'No two people move through life in the same way. Our role is to listen carefully, make the process clearer, and help you choose support with confidence.'
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
                'Temukan seseorang yang benar-benar bisa diajak bicara.',
                'Find someone you can actually talk to.'
            ),
            description: localized(
                'Setiap psikolog membawa pengalaman dan area fokus yang berbeda. Kenali seluruh tim, nomor izin praktik, dan kebutuhan yang biasa mereka dampingi.',
                'Every psychologist brings different experience and areas of focus. Review the complete team, their practice license, and the concerns they commonly support.'
            )
        },
        {
            key: 'careJourney',
            visible: true,
            headline: localized('Mulai dengan cara yang terasa tepat untukmu.', 'Start in the way that feels right for you.'),
            description: localized(
                'Kamu tidak harus memahami semuanya sebelum sesi pertama. Pilih titik awal yang terasa paling nyaman.',
                'You do not need everything figured out before your first session. Choose the entry point that feels most comfortable.'
            ),
            items: [
                item('find-your-fit', 0, 'Temukan kecocokanmu', 'Find your fit', 'Jelajahi area dukungan atau profil psikolog tanpa perlu terburu-buru mengambil keputusan.', 'Explore support areas or browse psychologist profiles without rushing a decision.'),
                item('choose-how-to-meet', 1, 'Pilih cara bertemu', 'Choose how to meet', 'Pilih format online atau tatap muka dan tanyakan jadwal melalui WhatsApp.', 'Pick an online or in-person format and ask about the available schedule through WhatsApp.'),
                item('connect-at-your-pace', 2, 'Terhubung sesuai ritmemu', 'Connect at your pace', 'Percakapan pertama membantu memahami tujuanmu dan apakah hubungan terapeutiknya terasa tepat.', 'Your first conversation is a space to understand what you want from support and whether the fit feels right.')
            ]
        },
        {
            key: 'clientStories',
            visible: true,
            headline: localized('Cerita yang dibagikan klien kami.', 'What our clients have shared.'),
            description: localized(
                'Pengalaman nyata dari orang-orang yang pernah kami dampingi dalam perjalanannya.',
                'Real experiences from people we have supported on their journey.'
            ),
            items: [
                item('online-counseling-28', 0, 'Client - Online Counseling, 28 y.o.', 'Client - Online Counseling, 28 y.o.', 'Patient and adaptive in handling clients with fluctuating commitment and progress, consistently providing tools that are feasible and actionable.', 'Patient and adaptive in handling clients with fluctuating commitment and progress, consistently providing tools that are feasible and actionable.'),
                item('offline-psychotherapy-24', 1, 'Client - Offline Psychotherapy, 24 y.o.', 'Client - Offline Psychotherapy, 24 y.o.', 'Going therapy here, was a truly bittersweet journey for me. It was very challenging but very deeply moving and growing for me… I always tell me friends about going here, and always recommend them to go here as #1 reference.', 'Going therapy here, was a truly bittersweet journey for me. It was very challenging but very deeply moving and growing for me… I always tell me friends about going here, and always recommend them to go here as #1 reference.'),
                item('online-psychotherapy-31', 2, 'Client - Online Psychotherapy, 31 y.o.', 'Client - Online Psychotherapy, 31 y.o.', 'The psychologist shows great understanding of my needs, avoiding pressure and allowing me to progress at my own pace. They provide a safe and comfortable space for me to share my thoughts and feelings.', 'The psychologist shows great understanding of my needs, avoiding pressure and allowing me to progress at my own pace. They provide a safe and comfortable space for me to share my thoughts and feelings.')
            ]
        },
        {
            key: 'consultationReassurance',
            visible: true,
            headline: localized('Ketahui prosesnya sebelum memulai.', 'Know what to expect before you begin.'),
            description: localized(
                'Memulai terapi sudah menjadi keputusan yang berarti. Proses dan biaya seharusnya memberi kejelasan, bukan menambah kekhawatiran.',
                'Starting therapy is already a meaningful decision. The process and pricing should be another source of clarity, not uncertainty.'
            ),
            sessionLabel: localized('Konsultasi online mulai dari', 'Online consultation starts from'),
            price: localized('Rp475.000', 'IDR 475,000'),
            priceUnit: localized('per sesi konsultasi', 'per consultation session'),
            primaryCta: localized('Tanya jadwal dan biaya', 'Ask about schedule and pricing')
        },
        {
            key: 'frequentlyAskedQuestions',
            visible: true,
            headline: localized('Tidak apa-apa kalau masih punya pertanyaan.', 'It is okay to have questions.'),
            description: localized(
                'Memulai dukungan psikologis bisa terasa asing. Berikut jawaban jelas untuk hal-hal yang sering ditanyakan di awal.',
                'Starting psychological support can feel unfamiliar. Here are clear answers to the things people often ask first.'
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
            headline: localized('Mulai dari tempatmu sekarang.', 'Start wherever you are.'),
            description: localized(
                'Kamu tidak membutuhkan kata-kata yang sempurna, diagnosis, atau jawaban untuk semuanya. Kamu hanya membutuhkan tempat untuk memulai.',
                'You do not need the right words, a diagnosis, or everything figured out. You just need somewhere to begin.'
            ),
            primaryCta: localized('Temukan psikologmu', 'Find your psychologist'),
            contact: localized('Ngobrol dengan kami dulu', 'Chat with us first')
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
