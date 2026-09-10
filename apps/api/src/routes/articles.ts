import { Elysia, t } from 'elysia'
import {
  type ArticleDraftMutation,
  type ArticlePublicLookup,
  validateArticleDraftMutation,
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import { createPsychologistAuthorCapability, createAdminCapability } from '../services/authorization-capability'
import type { AuthTokenService, AuthUserRepository } from './auth'

export interface ArticleRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  articlesRepository: {
    getPublishedBySlug(slug: string): Promise<ArticlePublicLookup>
    listPublishedArticles?: (options: { limit?: number; offset?: number }) => Promise<any>
    listManageableArticles?: (options: { psychologistId?: string; role?: string }) => Promise<any>
  }
  contentTransitions?: any
}

export const createArticleRoutes = (dependencies: ArticleRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })

  return new Elysia({ name: 'article-routes' })
    .use(roleGuard)
    .get(
      '/api/content/articles/:slug',
      async ({ params: { slug }, set }) => {
        const result = await dependencies.articlesRepository.getPublishedBySlug(slug)
        if (result.status === 'notFound') {
          set.status = 404
          return { status: 'notFound', message: 'Article not found.' }
        }
        return { status: 'success', article: result.article }
      },
      {
        detail: {
          tags: ['Articles'],
          summary: 'Get published article by slug',
          description: 'Returns published article details for public reading.',
        },
      }
    )
    .get(
      '/api/content/articles',
      async ({ query }) => {
        const limit = query.limit ? Math.min(50, Math.max(1, Number(query.limit))) : 10
        const offset = query.offset ? Math.max(0, Number(query.offset)) : 0
        if (dependencies.articlesRepository.listPublishedArticles) {
          const list = await dependencies.articlesRepository.listPublishedArticles({ limit, offset })
          return { status: 'success', articles: list.articles || [], total: list.total || 0 }
        }
        return { status: 'success', articles: [], total: 0 }
      },
      {
        query: t.Object({
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
          locale: t.Optional(t.String()),
        }),
        detail: {
          tags: ['Articles'],
          summary: 'List published articles',
          description: 'Returns paginated published articles for public directory.',
        },
      }
    )
    .get(
      '/api/admin/articles',
      async ({ currentUser }: any) => {
        if (!dependencies.articlesRepository.listManageableArticles) {
          return { status: 'success', articles: [] }
        }
        const filter = currentUser.role === 'admin'
          ? { role: 'admin' }
          : { psychologistId: currentUser.psychologistId || '', role: 'psychologist' }
        const articles = await dependencies.articlesRepository.listManageableArticles(filter)
        return { status: 'success', articles }
      },
      {
        requireRole: ['admin', 'psychologist'],
        detail: {
          tags: ['Articles CMS'],
          summary: 'List manageable articles for CMS',
          description: 'Returns all articles for admin or author-specific articles for psychologists.',
        },
      }
    )
    .post(
      '/api/admin/articles',
      async ({ body, currentUser, set }: any) => {
        const input: ArticleDraftMutation = body
        if (!validateArticleDraftMutation(input)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid article draft payload.' }
        }

        if (!dependencies.contentTransitions) {
          set.status = 201
          return { status: 'success', articleId: 'mock-article-id', slug: input.slug }
        }

        try {
          const authorCap = createPsychologistAuthorCapability(currentUser.psychologistId || currentUser.id)
          const result = await dependencies.contentTransitions.createArticleDraft(authorCap, input)
          set.status = 201
          return { status: 'success', article: result.article, revision: result.revision }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to create article draft.' }
        }
      },
      {
        requireRole: ['admin', 'psychologist'],
        body: t.Object({
          slug: t.String({ minLength: 1, maxLength: 160 }),
          title: t.Object({ id: t.String(), en: t.String() }),
          summary: t.Object({ id: t.String(), en: t.String() }),
          body: t.Object({ id: t.String(), en: t.String() }),
        }),
        detail: {
          tags: ['Articles CMS'],
          summary: 'Create article draft',
          description: 'Creates a new article aggregate and initial draft revision.',
        },
      }
    )
    .post(
      '/api/admin/articles/:id/submit',
      async ({ params: { id }, currentUser, set }: any) => {
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }
        try {
          const authorCap = createPsychologistAuthorCapability(currentUser.psychologistId || currentUser.id)
          await dependencies.contentTransitions.submitArticleRevision(authorCap, id, new Date().toISOString())
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to submit article for review.' }
        }
      },
      {
        requireRole: ['admin', 'psychologist'],
        detail: {
          tags: ['Articles CMS'],
          summary: 'Submit article revision for review',
          description: 'Transitions draft revision to inReview state.',
        },
      }
    )
    .post(
      '/api/admin/articles/:id/approve',
      async ({ params: { id }, currentUser, set }: any) => {
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }
        try {
          const adminCap = createAdminCapability(currentUser.id)
          await dependencies.contentTransitions.approveArticleRevision(adminCap, id, new Date().toISOString())
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to approve article revision.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Articles CMS'],
          summary: 'Approve & publish article revision',
          description: 'Admin approves revision and publishes article.',
        },
      }
    )
    .post(
      '/api/admin/articles/:id/reject',
      async ({ params: { id }, currentUser, set }: any) => {
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }
        try {
          const adminCap = createAdminCapability(currentUser.id)
          await dependencies.contentTransitions.rejectArticleRevision(adminCap, id)
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to reject article revision.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Articles CMS'],
          summary: 'Reject article revision',
          description: 'Admin rejects article revision back to draft.',
        },
      }
    )
}
