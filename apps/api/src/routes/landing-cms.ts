import { Elysia } from 'elysia'
import {
  type LandingContentMutation,
  LandingContentMutationSchema,
  validateLandingContentMutation,
} from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import { createAdminCapability } from '../services/authorization-capability'
import type { AuthTokenService, AuthUserRepository } from './auth'

export interface LandingCmsRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  landingContentRepository?: {
    getDraftOrPublished?: () => Promise<LandingContentMutation | null>
  }
  contentTransitions?: any
}

export const createLandingCmsRoutes = (dependencies: LandingCmsRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({
    tokenService: dependencies.tokenService,
    userRepository: dependencies.userRepository,
  })

  return new Elysia({ name: 'landing-cms-routes' })
    .use(roleGuard)
    .get(
      '/api/admin/landing',
      async () => {
        if (dependencies.landingContentRepository?.getDraftOrPublished) {
          const content = await dependencies.landingContentRepository.getDraftOrPublished()
          if (content) {
            return { status: 'success', content }
          }
        }
        return { status: 'success', content: null }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Landing CMS'],
          summary: 'Get active landing content draft or published revision',
          description: 'Returns the full 9-section landing content mutation object for admin editor.',
        },
      }
    )
    .put(
      '/api/admin/landing/draft',
      async ({ body, currentUser, set }: any) => {
        const input: LandingContentMutation = body
        if (!validateLandingContentMutation(input)) {
          set.status = 400
          return { status: 'badRequest', message: 'Invalid landing content mutation payload or item bounds.' }
        }

        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)
          const revision = await dependencies.contentTransitions.createLandingDraft(adminCap, input)
          return { status: 'success', revision }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to save landing draft.' }
        }
      },
      {
        requireRole: ['admin'],
        body: LandingContentMutationSchema,
        detail: {
          tags: ['Landing CMS'],
          summary: 'Save active landing draft revision',
          description: 'Saves updated bilingual copy and repeaters as active draft revision.',
        },
      }
    )
    .post(
      '/api/admin/landing/publish',
      async ({ currentUser, set }: any) => {
        if (!dependencies.contentTransitions) {
          return { status: 'success' }
        }

        try {
          const adminCap = createAdminCapability(currentUser.id)
          await dependencies.contentTransitions.publishLandingRevision(adminCap, new Date().toISOString())
          return { status: 'success' }
        } catch (err: any) {
          set.status = 400
          return { status: 'error', message: err.message || 'Failed to publish landing content.' }
        }
      },
      {
        requireRole: ['admin'],
        detail: {
          tags: ['Landing CMS'],
          summary: 'Publish active landing draft revision live',
          description: 'Atomically updates published pointer to active draft revision.',
        },
      }
    )
}
