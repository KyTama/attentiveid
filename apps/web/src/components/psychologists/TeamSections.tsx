import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TEAM_GROUP_LABELS, TEAM_GROUPS, type TeamMemberDto } from '@attentiveid/shared'
import { listTeam } from '@/features/team/service'

/** The team behind the practice, by sub-section. Nothing is shown until names are filled in. */
export function TeamSections() {
  const { i18n } = useTranslation()
  const locale = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const [members, setMembers] = useState<TeamMemberDto[]>([])

  useEffect(() => {
    let active = true
    void listTeam().then((list) => {
      if (active) setMembers(list)
    })
    return () => {
      active = false
    }
  }, [])

  if (members.length === 0) return null

  return (
    <section aria-labelledby="team-heading" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight text-secondary" id="team-heading">
        {locale === 'id' ? 'Tim kami' : 'Our team'}
      </h2>
      {TEAM_GROUPS.map((group) => {
        const people = members.filter((member) => member.team === group)
        if (people.length === 0) return null
        return (
          <div className="mt-8" key={group}>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#946a22]">{TEAM_GROUP_LABELS[group][locale]}</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {people.map((person) => (
                <li className="flex items-center gap-3 rounded-2xl border border-secondary/10 bg-white p-4" key={person.id}>
                  {person.photoUrl ? (
                    <img alt="" className="size-14 shrink-0 rounded-full object-cover" height="56" loading="lazy" src={person.photoUrl} width="56" />
                  ) : (
                    <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-[#f1e9da] font-bold text-secondary">
                      {person.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold text-secondary">{person.name}</span>
                    <span className="block text-sm text-secondary/70">{locale === 'id' ? person.roleId : person.roleEn}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
