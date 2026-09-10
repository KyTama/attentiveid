import { Elysia } from 'elysia';
import { eq, sql } from 'drizzle-orm';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import { db as defaultDb } from '../db';
import { psychologists, landingAggregates, landingRevisions, articles, users } from '../db/schema';

export interface OverviewRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    db?: typeof defaultDb;
}

export const createOverviewRoutes = (dependencies: OverviewRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository,
    });
    const db = dependencies.db || defaultDb;

    return new Elysia({ name: 'overview-routes' })
        .use(roleGuard)
        .get(
            '/api/admin/overview/stats',
            async () => {
                try {
                    // Psychologists stats
                    const psychRows = await db
                        .select({
                            total: sql<number>`count(*)::int`,
                            active: sql<number>`count(*) filter (where ${psychologists.status} = 'active')::int`,
                            featured: sql<number>`count(*) filter (where ${psychologists.featured} = true)::int`
                        })
                        .from(psychologists);
                    const psychStats = psychRows[0] || { total: 0, active: 0, featured: 0 };

                    // Landing stats
                    const landingRows = await db
                        .select({
                            activeDraft: landingAggregates.activeDraftRevisionId,
                            publishedRevId: landingAggregates.publishedRevisionId,
                            updatedAt: landingAggregates.updatedAt
                        })
                        .from(landingAggregates)
                        .limit(1);

                    const landingData = landingRows[0];
                    const hasDraftChanges = Boolean(
                        landingData?.activeDraft && landingData.activeDraft !== landingData.publishedRevId
                    );

                    let lastPublishedAt: string | null = null;
                    if (landingData?.publishedRevId) {
                        const revRows = await db
                            .select({ publishedAt: landingRevisions.publishedAt })
                            .from(landingRevisions)
                            .where(eq(landingRevisions.id, landingData.publishedRevId))
                            .limit(1);
                        lastPublishedAt = revRows[0]?.publishedAt || landingData.updatedAt;
                    }

                    // Articles stats
                    const articleRows = await db
                        .select({
                            total: sql<number>`count(*)::int`,
                            published: sql<number>`count(*) filter (where ${articles.status} = 'published')::int`,
                            draft: sql<number>`count(*) filter (where ${articles.status} = 'draft')::int`,
                            review: sql<number>`count(*) filter (where ${articles.status} = 'review')::int`
                        })
                        .from(articles);
                    const articleStats = articleRows[0] || { total: 0, published: 0, draft: 0, review: 0 };

                    // Users stats
                    const userRows = await db
                        .select({
                            total: sql<number>`count(*)::int`,
                            admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
                            psychologists: sql<number>`count(*) filter (where ${users.role} = 'psychologist')::int`
                        })
                        .from(users);
                    const userStats = userRows[0] || { total: 0, admins: 0, psychologists: 0 };

                    return {
                        status: 'success',
                        data: {
                            psychologists: {
                                total: Number(psychStats.total || 0),
                                active: Number(psychStats.active || 0),
                                featured: Number(psychStats.featured || 0)
                            },
                            landing: {
                                publishedSections: 9,
                                hasDraftChanges,
                                lastPublishedAt
                            },
                            articles: {
                                total: Number(articleStats.total || 0),
                                published: Number(articleStats.published || 0),
                                draft: Number(articleStats.draft || 0),
                                review: Number(articleStats.review || 0)
                            },
                            staff: {
                                total: Number(userStats.total || 0),
                                admins: Number(userStats.admins || 0),
                                psychologists: Number(userStats.psychologists || 0)
                            }
                        }
                    };
                } catch (err: any) {
                    return {
                        status: 'error',
                        message: err.message || 'Failed to fetch overview stats.'
                    };
                }
            },
            {
                requireAuth: true
            }
        );
};
