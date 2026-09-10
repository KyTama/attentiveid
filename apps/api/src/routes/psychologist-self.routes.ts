import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import { db as defaultDb } from '../db';
import {
    psychologists,
    psychologistProfiles,
    psychologistProfileTranslations,
    psychologistSpecializations,
    psychologistSpecializationTranslations
} from '../db/schema';

export interface PsychologistSelfDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    db?: typeof defaultDb;
}

export const createPsychologistSelfRoutes = (dependencies: PsychologistSelfDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository,
    });
    const db = dependencies.db || defaultDb;

    return new Elysia({ name: 'psychologist-self-routes' })
        .use(roleGuard)
        .get(
            '/api/psychologist/my-profile',
            async ({ currentUser, set }: any) => {
                if (!currentUser?.psychologistId) {
                    set.status = 404;
                    return {
                        status: 'not_found',
                        message: 'Akun Anda belum terhubung dengan profil psikolog di direktori.'
                    };
                }

                const psychId = currentUser.psychologistId;
                const psychRows = await db
                    .select()
                    .from(psychologists)
                    .where(eq(psychologists.id, psychId))
                    .limit(1);

                const psych = psychRows[0];
                if (!psych) {
                    set.status = 404;
                    return {
                        status: 'not_found',
                        message: 'Data psikolog tidak ditemukan di database.'
                    };
                }

                // Profile details
                const profileRows = await db
                    .select()
                    .from(psychologistProfiles)
                    .where(eq(psychologistProfiles.psychologistId, psychId))
                    .limit(1);
                const profile = profileRows[0];

                // Translations
                const transRows = await db
                    .select()
                    .from(psychologistProfileTranslations)
                    .where(eq(psychologistProfileTranslations.psychologistId, psychId));

                const bioId = transRows.find(t => t.locale === 'id')?.biography || '';
                const bioEn = transRows.find(t => t.locale === 'en')?.biography || '';

                // Specializations
                const specRows = await db
                    .select({
                        id: psychologistSpecializations.id,
                        order: psychologistSpecializations.position,
                        locale: psychologistSpecializationTranslations.locale,
                        label: psychologistSpecializationTranslations.label
                    })
                    .from(psychologistSpecializations)
                    .leftJoin(
                        psychologistSpecializationTranslations,
                        eq(psychologistSpecializations.id, psychologistSpecializationTranslations.specializationId)
                    )
                    .where(eq(psychologistSpecializations.psychologistId, psychId));

                // Group specializations by ID
                const specMap = new Map<string, { id: string; labelId: string; labelEn: string; order: number }>();
                for (const row of specRows) {
                    if (!specMap.has(row.id)) {
                        specMap.set(row.id, { id: row.id, labelId: '', labelEn: '', order: row.order });
                    }
                    const item = specMap.get(row.id)!;
                    if (row.locale === 'id') item.labelId = row.label || '';
                    if (row.locale === 'en') item.labelEn = row.label || '';
                }

                return {
                    status: 'success',
                    data: {
                        id: psych.id,
                        slug: psych.slug,
                        name: psych.name,
                        nickname: psych.nickname,
                        status: psych.status,
                        featured: psych.featured,
                        credential: profile?.credential || '',
                        experienceYears: profile?.experienceYears || 0,
                        licenseNumber: profile?.licenseNumber || '',
                        bookingUrl: profile?.bookingUrl || '',
                        premiumBookingUrl: profile?.premiumBookingUrl || '',
                        biography: {
                            id: bioId,
                            en: bioEn
                        },
                        specializations: Array.from(specMap.values()).sort((a, b) => a.order - b.order)
                    }
                };
            },
            {
                requireAuth: true
            }
        )
        .put(
            '/api/psychologist/my-profile',
            async ({ currentUser, body, set }: any) => {
                if (!currentUser?.psychologistId) {
                    set.status = 404;
                    return {
                        status: 'not_found',
                        message: 'Akun Anda belum terhubung dengan profil psikolog di direktori.'
                    };
                }

                const psychId = currentUser.psychologistId;

                try {
                    // Update main profile
                    await db
                        .update(psychologistProfiles)
                        .set({
                            credential: body.credential,
                            experienceYears: Number(body.experienceYears) || 0,
                            licenseNumber: body.licenseNumber,
                            bookingUrl: body.bookingUrl,
                            premiumBookingUrl: body.premiumBookingUrl || null,
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(psychologistProfiles.psychologistId, psychId));

                    // Update translations
                    if (body.biography) {
                        if (typeof body.biography.id === 'string') {
                            await db
                                .insert(psychologistProfileTranslations)
                                .values({
                                    psychologistId: psychId,
                                    locale: 'id',
                                    biography: body.biography.id,
                                    updatedAt: new Date().toISOString()
                                })
                                .onConflictDoUpdate({
                                    target: [
                                        psychologistProfileTranslations.psychologistId,
                                        psychologistProfileTranslations.locale
                                    ],
                                    set: {
                                        biography: body.biography.id,
                                        updatedAt: new Date().toISOString()
                                    }
                                });
                        }

                        if (typeof body.biography.en === 'string') {
                            await db
                                .insert(psychologistProfileTranslations)
                                .values({
                                    psychologistId: psychId,
                                    locale: 'en',
                                    biography: body.biography.en,
                                    updatedAt: new Date().toISOString()
                                })
                                .onConflictDoUpdate({
                                    target: [
                                        psychologistProfileTranslations.psychologistId,
                                        psychologistProfileTranslations.locale
                                    ],
                                    set: {
                                        biography: body.biography.en,
                                        updatedAt: new Date().toISOString()
                                    }
                                });
                        }
                    }

                    return {
                        status: 'success',
                        message: 'Profil pribadi Anda berhasil diperbarui!'
                    };
                } catch (err: any) {
                    set.status = 500;
                    return {
                        status: 'error',
                        message: err.message || 'Gagal memperbarui profil pribadi.'
                    };
                }
            },
            {
                requireAuth: true,
                body: t.Object({
                    credential: t.String(),
                    experienceYears: t.Number(),
                    licenseNumber: t.String(),
                    bookingUrl: t.String(),
                    premiumBookingUrl: t.Optional(t.String()),
                    biography: t.Optional(t.Object({
                        id: t.Optional(t.String()),
                        en: t.Optional(t.String())
                    }))
                })
            }
        );
};
