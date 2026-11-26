/** Team sub-sections on the Our Practitioners page. */
export const TEAM_GROUPS = ['psych', 'scientist', 'counsel', 'ops', 'advisor'] as const
export type TeamGroup = typeof TEAM_GROUPS[number]

export const TEAM_GROUP_LABELS: Record<TeamGroup, { id: string; en: string }> = {
  psych: { id: 'Psikolog', en: 'Psychologists' },
  scientist: { id: 'Ilmuwan', en: 'Scientists' },
  counsel: { id: 'Konselor', en: 'Counselors' },
  ops: { id: 'Operasional', en: 'Operations' },
  advisor: { id: 'Penasihat', en: 'Advisors' },
}

export interface TeamMemberInput {
  team: TeamGroup
  name: string
  roleId: string
  roleEn: string
  /** A picture on this site ("/media/...") or an https address; empty shows initials. */
  photoUrl: string | null
  sortOrder: number
  visible: boolean
}

export interface TeamMemberDto extends TeamMemberInput {
  id: string
}

export type TeamMemberValidation =
  | { ok: true; value: TeamMemberInput }
  | { ok: false; errors: Partial<Record<keyof TeamMemberInput, string>> }

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const validateTeamMember = (input: unknown): TeamMemberValidation => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<keyof TeamMemberInput, string>> = {}
  const team = text(raw.team) as TeamGroup
  if (!TEAM_GROUPS.includes(team)) errors.team = 'Pilih tim.'
  const name = text(raw.name)
  if (name.length < 2 || name.length > 120) errors.name = 'Nama wajib diisi (2 sampai 120 huruf).'
  const roleId = text(raw.roleId)
  const roleEn = text(raw.roleEn) || roleId
  if (roleId.length > 160) errors.roleId = 'Maks 160 huruf.'
  if (roleEn.length > 160) errors.roleEn = 'Maks 160 huruf.'
  const photoUrl = text(raw.photoUrl)
  // Browsers read "\" as "/" and drop tabs and line breaks, so either could turn "/..." into another site's address.
  if (photoUrl && (photoUrl.length > 500 || /[\\\s\u0000-\u001f]/.test(photoUrl) || !/^(\/(?!\/)|https:\/\/)/.test(photoUrl))) errors.photoUrl = 'Alamat foto harus diawali / atau https://.'
  const sortOrder = Number(raw.sortOrder ?? 0)
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) errors.sortOrder = 'Urutan harus angka 0 sampai 9999.'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { team, name, roleId, roleEn, photoUrl: photoUrl || null, sortOrder, visible: raw.visible !== false } }
}
