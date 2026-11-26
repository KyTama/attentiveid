import { asc, eq, sql } from 'drizzle-orm'
import type { TeamMemberDto, TeamMemberInput } from '@attentiveid/shared'
import { db as defaultDb } from '../db'
import { teamMembers } from '../db/schema'

export interface TeamRepository {
  list(): Promise<TeamMemberDto[]>
  create(input: TeamMemberInput): Promise<TeamMemberDto>
  update(id: string, input: TeamMemberInput): Promise<TeamMemberDto | null>
  remove(id: string): Promise<boolean>
}

const toDto = (row: typeof teamMembers.$inferSelect): TeamMemberDto => ({
  id: row.id,
  team: row.team as TeamMemberDto['team'],
  name: row.name,
  roleId: row.roleId,
  roleEn: row.roleEn,
  photoUrl: row.photoUrl,
  sortOrder: row.sortOrder,
  visible: row.visible,
})

export const createTeamRepository = (database: typeof defaultDb = defaultDb): TeamRepository => ({
  async list() {
    const rows = await database.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.name))
    return rows.map(toDto)
  },
  async create(input) {
    const [row] = await database.insert(teamMembers).values(input).returning()
    return toDto(row!)
  },
  async update(id, input) {
    const [row] = await database.update(teamMembers).set({ ...input, updatedAt: sql`now()` }).where(eq(teamMembers.id, id)).returning()
    return row ? toDto(row) : null
  },
  async remove(id) {
    const rows = await database.delete(teamMembers).where(eq(teamMembers.id, id)).returning({ id: teamMembers.id })
    return rows.length > 0
  },
})
