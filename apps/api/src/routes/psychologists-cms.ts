import { Elysia, t } from 'elysia'
import {
  validateFullPsychologistMutation,
  type FullPsychologistMutation,
  PSYCHOLOGIST_LIFECYCLE_STATES
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import type { AuthTokenService, AuthUserRepository } from './auth'

export interface PsychologistsCmsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  psychologistsRepository: {
    listAdmin?: (query: {
      status?: any
      search?: string
      supportArea?: any
      limit?: number
      offset?: number
    }) => Promise<{ psychologists: any[]; total: number }>
    getAdminById?: (id: string) => Promise<any | null>
    saveAdmin?: (id: string | undefined, input: FullPsychologistMutation) => Promise<any>
    updateStatusAdmin?: (id: string, status: any) => Promise<any | null>
  }
}

const lifecycleStatusSchema = t.Union([
  t.Literal('draft'),
  t.Literal('active'),
  t.Literal('inactive'),
  t.Literal('archived')
])

export const createPsychologistsCmsRoutes = (dependencies: PsychologistsCmsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })

  return new Elysia({ name: 'psychologists-cms-routes' })
    .use(roleGuard)
    .get(
      '/api/admin/psychologists',
      async ({ query }: any) => {
        const status = query.status ? query.status : undefined
        const search = query.search ? String(query.search) : undefined
        const supportArea = query.supportArea ? query.supportArea : undefined
        const limit = query.limit ? Math.min(100, Math.max(1, Number(query.limit))) : 20
        const offset = query.offset ? Math.max(0, Number(query.offset)) : 0

        if (!dependencies.psychologistsRepository.listAdmin) {
          return { status: 'success', psychologists: [], total: 0 }
        }

        const result = await dependencies.psychologistsRepository.listAdmin({
          status,
          search,
          supportArea,
          limit,
          offset
        })

        return { status: 'success', psychologists: result.psychologists, total: result.total }
      },
      {
        requireRole: ['admin'],
        query: t.Object({
          status: t.Optional(t.String()),
          search: t.Optional(t.String()),
          supportArea: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String())
        }),
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'List psychologists for CMS admin',
          description: 'Returns paginated list of psychologists with status & search filters.',
        },
      }
    )
    .get(
      '/api/admin/psychologists/:id',
      async ({ params: { id }, set }: any) => {
        if (!dependencies.psychologistsRepository.getAdminById) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }
        const psychologist = await dependencies.psychologistsRepository.getAdminById(id)
        if (!psychologist) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }
        return { status: 'success', psychologist }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Get psychologist profile by ID',
          description: 'Returns full canonical psychologist profile for admin editing.',
        },
      }
    )
    .post(
      '/api/admin/psychologists',
      async ({ body, set }: any) => {
        const input: FullPsychologistMutation = body
        if (!validateFullPsychologistMutation(input)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid psychologist mutation payload.' }
        }

        if (!dependencies.psychologistsRepository.saveAdmin) {
          set.status = 500
          return { status: 'error', message: 'Repository saveAdmin not available.' }
        }

        try {
          const psychologist = await dependencies.psychologistsRepository.saveAdmin(undefined, input)
          set.status = 201
          return { status: 'success', psychologist }
        } catch (error: any) {
          set.status = 500
          return { status: 'error', message: error?.message || 'Failed to create psychologist profile.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Create psychologist profile',
          description: 'Creates a new psychologist profile with full relations and translations.',
        },
      }
    )
    .put(
      '/api/admin/psychologists/:id',
      async ({ params: { id }, body, set }: any) => {
        const input: FullPsychologistMutation = body
        if (!validateFullPsychologistMutation(input)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid psychologist mutation payload.' }
        }

        if (!dependencies.psychologistsRepository.getAdminById || !dependencies.psychologistsRepository.saveAdmin) {
          set.status = 500
          return { status: 'error', message: 'Repository methods not available.' }
        }

        const existing = await dependencies.psychologistsRepository.getAdminById(id)
        if (!existing) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        try {
          const psychologist = await dependencies.psychologistsRepository.saveAdmin(id, input)
          return { status: 'success', psychologist }
        } catch (error: any) {
          set.status = 500
          return { status: 'error', message: error?.message || 'Failed to update psychologist profile.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Update psychologist profile',
          description: 'Updates an existing psychologist profile with full relations and translations.',
        },
      }
    )
    .patch(
      '/api/admin/psychologists/:id/status',
      async ({ params: { id }, body, set }: any) => {
        const status = body?.status
        if (!status || !PSYCHOLOGIST_LIFECYCLE_STATES.includes(status)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid status value.' }
        }

        if (!dependencies.psychologistsRepository.updateStatusAdmin) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        const psychologist = await dependencies.psychologistsRepository.updateStatusAdmin(id, status)
        if (!psychologist) {
          set.status = 404
          return { status: 'notFound', message: 'Psychologist profile not found.' }
        }

        return { status: 'success', psychologist }
      },
      {
        requireRole: ['admin'],
        body: t.Object({
          status: lifecycleStatusSchema
        }),
        detail: {
          tags: ['Psychologists CMS'],
          summary: 'Update psychologist status',
          description: 'Updates the lifecycle status of a psychologist (draft, active, inactive, archived).',
        },
      }
    )
}
