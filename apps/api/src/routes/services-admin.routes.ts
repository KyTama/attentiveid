import { Elysia, t } from 'elysia';
import {
    DATA_ISSUE_STATUSES,
    INTERNAL_COST_KINDS,
    INTERNAL_PRICE_STATUSES,
    SERVICE_BRANCHES,
    SERVICE_LIFECYCLE_STATUSES,
    SERVICE_MODALITIES,
    SERVICE_PRICING_MODELS,
    SERVICE_PROGRAM_STATUSES,
    SERVICE_PROGRAM_TYPES,
    SERVICE_TYPES,
    SERVICE_VISIBILITIES
} from '@attentiveid/shared';
import type { db as defaultDb } from '../db';
import { createServicesInternalRepository, type ServicesInternalRepository } from '../repositories/services-internal.repository';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';

export interface ServicesAdminRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    servicesInternalRepository?: ServicesInternalRepository;
    db?: typeof defaultDb;
}

const lifecycleStatusUnion = t.Union(SERVICE_LIFECYCLE_STATUSES.map((s) => t.Literal(s)));
const visibilityUnion = t.Union(SERVICE_VISIBILITIES.map((v) => t.Literal(v)));
const serviceTypeUnion = t.Union(SERVICE_TYPES.map((v) => t.Literal(v)));
const pricingModelUnion = t.Union(SERVICE_PRICING_MODELS.map((v) => t.Literal(v)));
const modalityUnion = t.Union(SERVICE_MODALITIES.map((v) => t.Literal(v)));
const branchUnion = t.Union([...SERVICE_BRANCHES.map((b) => t.Literal(b)), t.Null()]);

export const createServicesAdminRoutes = (dependencies: ServicesAdminRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repo = dependencies.servicesInternalRepository
        ?? createServicesInternalRepository(dependencies.db);

    return new Elysia({ name: 'services-admin-routes' })
        .use(roleGuard)
        .get(
            '/api/admin/services/overview',
            async ({ set }: any) => {
                set.headers['Cache-Control'] = 'no-store';
                return repo.getOverviewAndCatalog();
            },
            {
                requireRole: 'superadmin',
                detail: { tags: ['Admin'], summary: 'Superadmin services & internal financial overview' }
            }
        )
        .get(
            '/api/admin/services/preview-catalog',
            async ({ query, set }: any) => {
                const locale: 'id' | 'en' = query.locale === 'en' ? 'en' : 'id';
                set.headers['Cache-Control'] = 'no-store';
                return repo.listSuperadminPreviewCatalog(locale);
            },
            {
                requireRole: 'superadmin',
                query: t.Object({ locale: t.Optional(t.Union([t.Literal('id'), t.Literal('en')])) }),
                detail: { tags: ['Admin'], summary: 'Superadmin full 53-product internal demo catalog' }
            }
        )
        .get(
            '/api/admin/services/preview-catalog/:slug',
            async ({ params, query, set }: any) => {
                const locale: 'id' | 'en' = query.locale === 'en' ? 'en' : 'id';
                const detail = await repo.getSuperadminPreviewBySlug(params.slug, locale);
                if (!detail) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Service not found' };
                }
                set.headers['Cache-Control'] = 'no-store';
                return detail;
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ slug: t.String({ minLength: 1 }) }),
                query: t.Object({ locale: t.Optional(t.Union([t.Literal('id'), t.Literal('en')])) }),
                detail: { tags: ['Admin'], summary: 'Superadmin internal service detail preview' }
            }
        )
        .post(
            '/api/admin/services',
            async ({ body, currentUser, set }: any) => {
                const saved = await repo.upsertService({ id: currentUser.id, email: currentUser.email }, body);
                set.status = 201;
                return { status: 'success', data: saved };
            },
            {
                requireRole: 'superadmin',
                body: t.Object({
                    slug: t.String({ minLength: 1 }),
                    categorySlug: t.String({ minLength: 1 }),
                    subgroupSlug: t.Optional(t.Union([t.String(), t.Null()])),
                    serviceType: serviceTypeUnion,
                    pricingModel: pricingModelUnion,
                    status: lifecycleStatusUnion,
                    visibility: visibilityUnion,
                    appliesNewClientFee: t.Boolean(),
                    isAssessment: t.Boolean(),
                    isFeaturedSpotlight: t.Boolean(),
                    position: t.Optional(t.Integer({ minimum: 0 })),
                    externalUrl: t.Optional(t.Union([t.String(), t.Null()])),
                    defaultConcernId: t.Optional(t.Union([t.String(), t.Null()])),
                    defaultClientCategory: t.Optional(t.Union([t.String(), t.Null()])),
                    audiences: t.Optional(t.Array(t.String())),
                    nameId: t.String({ minLength: 1 }),
                    nameEn: t.Optional(t.String()),
                    fullNameId: t.Optional(t.Union([t.String(), t.Null()])),
                    fullNameEn: t.Optional(t.Union([t.String(), t.Null()])),
                    badgeId: t.Optional(t.Union([t.String(), t.Null()])),
                    badgeEn: t.Optional(t.Union([t.String(), t.Null()])),
                    shortSummaryId: t.Optional(t.Union([t.String(), t.Null()])),
                    shortSummaryEn: t.Optional(t.Union([t.String(), t.Null()])),
                    benefitId: t.Optional(t.Union([t.String(), t.Null()])),
                    benefitEn: t.Optional(t.Union([t.String(), t.Null()])),
                    introductionId: t.Optional(t.Union([t.String(), t.Null()])),
                    introductionEn: t.Optional(t.Union([t.String(), t.Null()])),
                    targetAudienceId: t.Optional(t.Union([t.String(), t.Null()])),
                    targetAudienceEn: t.Optional(t.Union([t.String(), t.Null()])),
                    whatIsMeasuredId: t.Optional(t.Union([t.String(), t.Null()])),
                    whatIsMeasuredEn: t.Optional(t.Union([t.String(), t.Null()])),
                    durationInfoId: t.Optional(t.Union([t.String(), t.Null()])),
                    durationInfoEn: t.Optional(t.Union([t.String(), t.Null()])),
                    locationInfoId: t.Optional(t.Union([t.String(), t.Null()])),
                    locationInfoEn: t.Optional(t.Union([t.String(), t.Null()])),
                    resultsExplanationId: t.Optional(t.Union([t.String(), t.Null()])),
                    resultsExplanationEn: t.Optional(t.Union([t.String(), t.Null()])),
                    scientificBasisId: t.Optional(t.Union([t.String(), t.Null()])),
                    scientificBasisEn: t.Optional(t.Union([t.String(), t.Null()])),
                    processStepsId: t.Optional(t.Array(t.String())),
                    processStepsEn: t.Optional(t.Array(t.String())),
                    termsId: t.Optional(t.Array(t.String())),
                    termsEn: t.Optional(t.Array(t.String())),
                    linkedPsychologistSlugs: t.Optional(t.Array(t.String())),
                    variants: t.Optional(
                        t.Array(
                            t.Object({
                                id: t.Optional(t.String()),
                                slug: t.String({ minLength: 1 }),
                                status: lifecycleStatusUnion,
                                visibility: visibilityUnion,
                                nameId: t.String({ minLength: 1 }),
                                nameEn: t.Optional(t.String()),
                                descriptionId: t.Optional(t.Union([t.String(), t.Null()])),
                                descriptionEn: t.Optional(t.Union([t.String(), t.Null()])),
                                unitLabelId: t.Optional(t.Union([t.String(), t.Null()])),
                                unitLabelEn: t.Optional(t.Union([t.String(), t.Null()])),
                                durationLabelId: t.Optional(t.Union([t.String(), t.Null()])),
                                durationLabelEn: t.Optional(t.Union([t.String(), t.Null()])),
                                modalities: t.Array(modalityUnion),
                                branch: t.Optional(branchUnion),
                                priceOnRequest: t.Optional(t.Boolean()),
                                publicPriceAmount: t.Optional(t.Union([t.Number(), t.Null()])),
                                publicPriceMax: t.Optional(t.Union([t.Number(), t.Null()]))
                            })
                        )
                    )
                })
            }
        )
        .patch(
            '/api/admin/services/:id',
            async ({ params, body, currentUser }: any) => {
                const saved = await repo.upsertService(
                    { id: currentUser.id, email: currentUser.email },
                    { ...body, id: params.id }
                );
                return { status: 'success', data: saved };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) }),
                body: t.Object({
                    slug: t.String({ minLength: 1 }),
                    categorySlug: t.String({ minLength: 1 }),
                    subgroupSlug: t.Optional(t.Union([t.String(), t.Null()])),
                    serviceType: serviceTypeUnion,
                    pricingModel: pricingModelUnion,
                    status: lifecycleStatusUnion,
                    visibility: visibilityUnion,
                    appliesNewClientFee: t.Boolean(),
                    isAssessment: t.Boolean(),
                    isFeaturedSpotlight: t.Boolean(),
                    position: t.Optional(t.Integer({ minimum: 0 })),
                    externalUrl: t.Optional(t.Union([t.String(), t.Null()])),
                    defaultConcernId: t.Optional(t.Union([t.String(), t.Null()])),
                    defaultClientCategory: t.Optional(t.Union([t.String(), t.Null()])),
                    audiences: t.Optional(t.Array(t.String())),
                    nameId: t.String({ minLength: 1 }),
                    nameEn: t.Optional(t.String()),
                    fullNameId: t.Optional(t.Union([t.String(), t.Null()])),
                    fullNameEn: t.Optional(t.Union([t.String(), t.Null()])),
                    badgeId: t.Optional(t.Union([t.String(), t.Null()])),
                    badgeEn: t.Optional(t.Union([t.String(), t.Null()])),
                    shortSummaryId: t.Optional(t.Union([t.String(), t.Null()])),
                    shortSummaryEn: t.Optional(t.Union([t.String(), t.Null()])),
                    benefitId: t.Optional(t.Union([t.String(), t.Null()])),
                    benefitEn: t.Optional(t.Union([t.String(), t.Null()])),
                    introductionId: t.Optional(t.Union([t.String(), t.Null()])),
                    introductionEn: t.Optional(t.Union([t.String(), t.Null()])),
                    targetAudienceId: t.Optional(t.Union([t.String(), t.Null()])),
                    targetAudienceEn: t.Optional(t.Union([t.String(), t.Null()])),
                    whatIsMeasuredId: t.Optional(t.Union([t.String(), t.Null()])),
                    whatIsMeasuredEn: t.Optional(t.Union([t.String(), t.Null()])),
                    durationInfoId: t.Optional(t.Union([t.String(), t.Null()])),
                    durationInfoEn: t.Optional(t.Union([t.String(), t.Null()])),
                    locationInfoId: t.Optional(t.Union([t.String(), t.Null()])),
                    locationInfoEn: t.Optional(t.Union([t.String(), t.Null()])),
                    resultsExplanationId: t.Optional(t.Union([t.String(), t.Null()])),
                    resultsExplanationEn: t.Optional(t.Union([t.String(), t.Null()])),
                    scientificBasisId: t.Optional(t.Union([t.String(), t.Null()])),
                    scientificBasisEn: t.Optional(t.Union([t.String(), t.Null()])),
                    processStepsId: t.Optional(t.Array(t.String())),
                    processStepsEn: t.Optional(t.Array(t.String())),
                    termsId: t.Optional(t.Array(t.String())),
                    termsEn: t.Optional(t.Array(t.String())),
                    linkedPsychologistSlugs: t.Optional(t.Array(t.String())),
                    variants: t.Optional(
                        t.Array(
                            t.Object({
                                id: t.Optional(t.String()),
                                slug: t.String({ minLength: 1 }),
                                status: lifecycleStatusUnion,
                                visibility: visibilityUnion,
                                nameId: t.String({ minLength: 1 }),
                                nameEn: t.Optional(t.String()),
                                descriptionId: t.Optional(t.Union([t.String(), t.Null()])),
                                descriptionEn: t.Optional(t.Union([t.String(), t.Null()])),
                                unitLabelId: t.Optional(t.Union([t.String(), t.Null()])),
                                unitLabelEn: t.Optional(t.Union([t.String(), t.Null()])),
                                durationLabelId: t.Optional(t.Union([t.String(), t.Null()])),
                                durationLabelEn: t.Optional(t.Union([t.String(), t.Null()])),
                                modalities: t.Array(modalityUnion),
                                branch: t.Optional(branchUnion),
                                priceOnRequest: t.Optional(t.Boolean()),
                                publicPriceAmount: t.Optional(t.Union([t.Number(), t.Null()])),
                                publicPriceMax: t.Optional(t.Union([t.Number(), t.Null()]))
                            })
                        )
                    )
                })
            }
        )
        .post(
            '/api/admin/services/:id/duplicate',
            async ({ params, currentUser, set }: any) => {
                const duplicated = await repo.duplicateService({ id: currentUser.id, email: currentUser.email }, params.id);
                if (!duplicated) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Service not found' };
                }
                set.status = 201;
                return { status: 'success', data: duplicated };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) })
            }
        )
        .put(
            '/api/admin/services/:id/costs',
            async ({ params, body, currentUser }: any) => {
                const saved = await repo.upsertInternalCost(
                    { id: currentUser.id, email: currentUser.email },
                    { ...body, serviceId: params.id }
                );
                return { status: 'success', data: saved };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) }),
                body: t.Object({
                    variantId: t.Optional(t.Union([t.String(), t.Null()])),
                    psychologistId: t.Optional(t.Union([t.String(), t.Null()])),
                    recordKind: t.Union(INTERNAL_COST_KINDS.map((k) => t.Literal(k))),
                    recordStatus: t.Union(INTERNAL_PRICE_STATUSES.map((s) => t.Literal(s))),
                    amount: t.Union([t.Number({ minimum: 0 }), t.Null()]),
                    amountMax: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
                    unitLabel: t.Optional(t.Union([t.String(), t.Null()])),
                    effectiveDate: t.Optional(t.Union([t.String(), t.Null()])),
                    label: t.Optional(t.Union([t.String(), t.Null()])),
                    note: t.Optional(t.Union([t.String(), t.Null()])),
                    promoteToBerlaku: t.Optional(t.Boolean())
                })
            }
        )
        .post(
            '/api/admin/services/programs',
            async ({ body, currentUser, set }: any) => {
                const saved = await repo.saveProgram({ id: currentUser.id, email: currentUser.email }, body);
                set.status = 201;
                return { status: 'success', data: saved };
            },
            {
                requireRole: 'superadmin',
                body: t.Object({
                    id: t.Optional(t.String()),
                    slug: t.String({ minLength: 1 }),
                    programType: t.Union(SERVICE_PROGRAM_TYPES.map((v) => t.Literal(v))),
                    status: t.Union(SERVICE_PROGRAM_STATUSES.map((v) => t.Literal(v))),
                    startsOn: t.String({ minLength: 10 }),
                    endsOn: t.String({ minLength: 10 }),
                    nameId: t.String({ minLength: 1 }),
                    nameEn: t.Optional(t.String()),
                    badgeId: t.Optional(t.Union([t.String(), t.Null()])),
                    badgeEn: t.Optional(t.Union([t.String(), t.Null()])),
                    prices: t.Array(
                        t.Object({
                            variantId: t.String({ minLength: 1 }),
                            promoAmount: t.Number({ minimum: 0 }),
                            noteId: t.Optional(t.Union([t.String(), t.Null()])),
                            noteEn: t.Optional(t.Union([t.String(), t.Null()]))
                        })
                    )
                })
            }
        )
        .patch(
            '/api/admin/services/programs/:id/status',
            async ({ params, body, currentUser, set }: any) => {
                const ok = await repo.updateProgramStatus(
                    { id: currentUser.id, email: currentUser.email },
                    params.id,
                    body.status
                );
                if (!ok) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Program not found' };
                }
                return { status: 'success' };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) }),
                body: t.Object({ status: t.Union(SERVICE_PROGRAM_STATUSES.map((v) => t.Literal(v))) })
            }
        )
        .patch(
            '/api/admin/services/psychologists/:id',
            async ({ params, body, currentUser, set }: any) => {
                const ok = await repo.updatePsychologistMatrix(
                    { id: currentUser.id, email: currentUser.email },
                    params.id,
                    body
                );
                if (!ok) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Psychologist not found' };
                }
                return { status: 'success' };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) }),
                body: t.Object({
                    onlineRate: t.Union([t.Number({ minimum: 0 }), t.Null()]),
                    offlineRate: t.Union([t.Number({ minimum: 0 }), t.Null()]),
                    availableOnline: t.Boolean(),
                    availableTbi: t.Boolean(),
                    availableBsd: t.Boolean(),
                    availableMalang: t.Boolean(),
                    acceptingNewClients: t.Boolean(),
                    linkedServiceSlugs: t.Array(t.String())
                })
            }
        )
        .patch(
            '/api/admin/services/issues/:id',
            async ({ params, body, currentUser, set }: any) => {
                const ok = await repo.updateIssueStatus(
                    { id: currentUser.id, email: currentUser.email },
                    params.id,
                    body.status,
                    body.resolution
                );
                if (!ok) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Data issue not found' };
                }
                return { status: 'success' };
            },
            {
                requireRole: 'superadmin',
                params: t.Object({ id: t.String({ minLength: 1 }) }),
                body: t.Object({
                    status: t.Union(DATA_ISSUE_STATUSES.map((s) => t.Literal(s))),
                    resolution: t.Optional(t.Union([t.String(), t.Null()]))
                })
            }
        )
        .get(
            '/api/admin/services/export.csv',
            async ({ set }: any) => {
                const csv = await repo.exportLedgerCsv();
                set.headers['Content-Type'] = 'text/csv; charset=utf-8';
                set.headers['Content-Disposition'] = 'attachment; filename="attentive-services-ledger.csv"';
                set.headers['Cache-Control'] = 'no-store';
                return csv;
            },
            {
                requireRole: 'superadmin',
                detail: { tags: ['Admin'], summary: 'Export internal service pricing & margin ledger CSV' }
            }
        );
};
