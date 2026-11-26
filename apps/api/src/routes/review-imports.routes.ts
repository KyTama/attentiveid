import { Elysia, t } from 'elysia'
import { createRoleGuardPlugin } from '../security/role-guard'
import type { AuthTokenService, AuthUserRepository } from './auth'
import type { ReviewImportsRepository } from '../repositories/review-imports.repository'
import type { ReviewSheet } from '../services/review-sheet'

export interface ReviewImportsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  reviewImportsRepository: ReviewImportsRepository
  /** Absent when Google Drive is not configured. */
  reviewSheet?: ReviewSheet
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const createReviewImportsRoutes = (dependencies: ReviewImportsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({ tokenService: dependencies.tokenService, userRepository: dependencies.userRepository })
  const repository = dependencies.reviewImportsRepository

  return new Elysia({ name: 'review-imports-routes' })
    .use(roleGuard)
    .get(
      '/api/admin/reviews',
      async () => ({
        status: 'success',
        configured: Boolean(dependencies.reviewSheet),
        sheetUrl: dependencies.reviewSheet?.url() ?? '',
        reviews: await repository.listNew(),
      }),
      { requireRole: ['admin'], detail: { tags: ['Reviews'], summary: 'Imported reviews waiting for a decision' } },
    )
    .post(
      '/api/admin/reviews/import',
      async ({ set }: any) => {
        if (!dependencies.reviewSheet) {
          set.status = 503
          return { status: 'unavailable', message: 'Google Drive belum dikonfigurasi.' }
        }
        try {
          const result = await dependencies.reviewSheet.importNow()
          return { status: 'success', ...result, sheetUrl: dependencies.reviewSheet.url() }
        } catch (error) {
          console.error('[reviews] Import failed:', error instanceof Error ? error.message : 'error')
          set.status = 502
          return { status: 'error', message: 'Sheet tidak bisa dibaca. Coba lagi.' }
        }
      },
      { requireRole: ['admin'], detail: { tags: ['Reviews'], summary: 'Read the review Sheet now' } },
    )
    .put(
      '/api/admin/reviews/:id',
      async ({ params: { id }, body, set }: any) => {
        const status = body?.status
        if (status !== 'shown' && status !== 'dismissed') {
          set.status = 400
          return { status: 'badRequest', message: 'Status tidak valid.' }
        }
        if (!UUID.test(id) || !(await repository.setStatus(id, status))) {
          set.status = 404
          return { status: 'notFound', message: 'Ulasan tidak ditemukan.' }
        }
        return { status: 'success' }
      },
      { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Reviews'], summary: 'Mark an imported review' } },
    )
}
