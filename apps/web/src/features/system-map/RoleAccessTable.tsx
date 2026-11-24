import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  ACTION_ACCESS,
  LEVEL_TEXT,
  PAGE_ACCESS,
  ROLE_LABEL,
  ROLE_SUMMARY,
  type AccessRow,
  type Level,
  type Role,
} from '../dashboard/role-access'

const ROLES: Role[] = ['superadmin', 'admin', 'psychologist']

const CELL: Record<Level, string> = {
  all: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  own: 'bg-amber-50 text-amber-800 border-amber-200',
  none: 'bg-slate-50 text-slate-400 border-slate-200',
}

function Cell({ level }: { level: Level }) {
  return (
    <span className={`inline-block min-w-[5.5rem] rounded-full border px-2 py-0.5 text-center text-[11px] font-semibold ${CELL[level]}`}>
      {level === 'none' ? '—' : LEVEL_TEXT[level]}
    </span>
  )
}

function Table({ title, rows }: { title: string; rows: readonly AccessRow[] }) {
  let lastArea = ''
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="px-4 pt-4 text-left text-base font-bold text-slate-900">{title}</caption>
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-4 py-2 font-semibold" scope="col">Halaman / tindakan</th>
            {ROLES.map((role) => (
              <th className="px-3 py-2 text-center font-semibold" key={role} scope="col">
                {ROLE_LABEL[role]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const showArea = row.area !== lastArea
            lastArea = row.area
            return (
              <Fragment key={row.id}>
                {showArea && (
                  <tr className="bg-slate-50">
                    <th className="px-4 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500" colSpan={4} scope="colgroup">
                      {row.area}
                    </th>
                  </tr>
                )}
                <tr className="border-t border-slate-100 align-top">
                  <th className="px-4 py-2 font-medium text-slate-900" scope="row">
                    {row.route ? (
                      <Link className="hover:underline" to={row.route}>
                        {row.label}
                      </Link>
                    ) : (
                      row.label
                    )}
                    {row.note && <span className="mt-0.5 block text-xs font-normal text-slate-500">{row.note}</span>}
                  </th>
                  {ROLES.map((role) => (
                    <td className="px-3 py-2 text-center" key={role}>
                      <Cell level={row[role]} />
                    </td>
                  ))}
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Who can open which page and do which action, for each role. Data lives in features/dashboard/role-access.ts. */
export function RoleAccessTable() {
  return (
    <section aria-labelledby="role-access-heading" className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900" id="role-access-heading">
          Akses per peran
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Tabel siapa boleh membuka halaman apa dan melakukan apa. Menu yang tidak boleh dibuka tidak tampil, dan server tetap memeriksa peran di setiap permintaan.
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          {ROLES.map((role) => (
            <div className="rounded-xl border border-slate-200 p-3" key={role}>
              <dt className="text-sm font-bold text-slate-900">{ROLE_LABEL[role]}</dt>
              <dd className="mt-1 text-xs text-slate-600">{ROLE_SUMMARY[role]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Cell level="all" /> penuh</span>
          <span className="inline-flex items-center gap-1.5"><Cell level="own" /> hanya yang ditugaskan atau miliknya</span>
          <span className="inline-flex items-center gap-1.5"><Cell level="none" /> tidak bisa</span>
        </p>
      </div>
      <Table rows={PAGE_ACCESS} title="Halaman portal" />
      <Table rows={ACTION_ACCESS} title="Tindakan penting" />
    </section>
  )
}
