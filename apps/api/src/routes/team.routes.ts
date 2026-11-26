import { Elysia, t } from 'elysia'
import { validateTeamMember } from '@attentiveid/shared'
import { createRoleGuardPlugin } from '../security/role-guard'
import type { AuthTokenService, AuthUserRepository } from './auth'
import type { TeamRepository } from '../repositories/team.repository'

export interface TeamRoutesDependencies {
  tokenService: Pick<AuthTokenService, 'verifyAccessToken'>
  userRepository: Pick<AuthUserRepository, 'findById'>
  teamRepository: TeamRepository
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const missing = { status: 'notFound', message: 'Anggota tim tidak ditemukan.' }
const invalid = { status: 'badRequest', message: 'Data anggota tim belum valid.' }

export const createTeamRoutes = (dependencies: TeamRoutesDependencies) => {
  const roleGuard = createRoleGuardPlugin({ tokenService: dependencies.tokenService, userRepository: dependencies.userRepository })
  const repository = dependencies.teamRepository

  return new Elysia({ name: 'team-routes' })
    .use(roleGuard)
    .get('/api/content/team', async () => ({ status: 'success', members: (await repository.list()).filter((member) => member.visible) }), {
      detail: { tags: ['Team'], summary: 'Team members shown on Our Practitioners' },
    })
    .get('/api/admin/team', async () => ({ status: 'success', members: await repository.list() }), {
      requireRole: ['admin'],
      detail: { tags: ['Team CMS'], summary: 'List all team members' },
    })
    .post(
      '/api/admin/team',
      async ({ body, set }: any) => {
        const parsed = validateTeamMember(body)
        if (!parsed.ok) {
          set.status = 400
          return { ...invalid, errors: parsed.errors }
        }
        set.status = 201
        return { status: 'success', member: await repository.create(parsed.value) }
      },
      { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Team CMS'], summary: 'Add a team member' } },
    )
    .put(
      '/api/admin/team/:id',
      async ({ params: { id }, body, set }: any) => {
        const parsed = validateTeamMember(body)
        if (!parsed.ok) {
          set.status = 400
          return { ...invalid, errors: parsed.errors }
        }
        const member = UUID.test(id) ? await repository.update(id, parsed.value) : null
        if (!member) {
          set.status = 404
          return missing
        }
        return { status: 'success', member }
      },
      { requireRole: ['admin'], body: t.Any(), detail: { tags: ['Team CMS'], summary: 'Change a team member' } },
    )
    .delete(
      '/api/admin/team/:id',
      async ({ params: { id }, set }: any) => {
        if (!UUID.test(id) || !(await repository.remove(id))) {
          set.status = 404
          return missing
        }
        return { status: 'success' }
      },
      { requireRole: ['admin'], detail: { tags: ['Team CMS'], summary: 'Remove a team member' } },
    )
}
