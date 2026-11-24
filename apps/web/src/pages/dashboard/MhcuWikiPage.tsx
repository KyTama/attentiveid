import { Link } from 'react-router-dom'
import { AlertTriangle, Info } from 'lucide-react'
import { MHCU_WIKI, type Pair, type WikiBlock } from '@/features/wiki/mhcu-wiki'
import { useTx } from '@/features/i18n/use-tx'

function Block({ block, pick }: { block: WikiBlock; pick: (pair: Pair) => string }) {
  switch (block.kind) {
    case 'p':
      return <p className="max-w-3xl text-sm leading-relaxed text-slate-700">{pick(block.text)}</p>
    case 'steps':
      return (
        <ol className="max-w-3xl space-y-2">
          {block.items.map((item, index) => (
            <li className="flex gap-3 text-sm leading-relaxed text-slate-700" key={index}>
              <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{pick(item)}</span>
            </li>
          ))}
        </ol>
      )
    case 'bullets':
      return (
        <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
          {block.items.map((item, index) => (
            <li key={index}>{pick(item)}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                {block.head.map((cell, index) => (
                  <th className="px-3 py-2 font-semibold" key={index} scope="col">
                    {pick(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr className="border-t border-slate-100 align-top" key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th className="px-3 py-2 font-semibold text-slate-900" key={cellIndex} scope="row">
                        {pick(cell)}
                      </th>
                    ) : (
                      <td className="px-3 py-2 text-slate-700" key={cellIndex}>
                        {pick(cell)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'note': {
      const warn = block.tone === 'warn'
      const Icon = warn ? AlertTriangle : Info
      return (
        <p
          className={`flex max-w-3xl items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
            warn ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-navy-100 bg-navy-50 text-navy-900'
          }`}
        >
          <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{pick(block.text)}</span>
        </p>
      )
    }
    case 'link':
      return (
        <Link className="text-sm font-semibold text-navy-700 underline underline-offset-2" to={block.to}>
          {pick(block.text)}
        </Link>
      )
  }
}

/** Staff wiki for the Mental Health Check-Up: the whole process in order, with a contents list on the side. */
export function MhcuWikiPage() {
  const { isEn, tx } = useTx()
  const pick = (pair: Pair) => (isEn ? pair[1] : pair[0])

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tx('Wiki & Panduan', 'Wiki & guides')}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Wiki MHCU: Mental Health Check-Up', 'MHCU wiki: Mental Health Check-Up')}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          {tx(
            'Panduan langkah demi langkah untuk staf: dari klien mengisi formulir sampai laporan lengkap dirilis. Wiki sistem lainnya akan ditambahkan di sini.',
            'A step-by-step guide for staff: from the client filling in the form to the full report being released. Wikis for the other systems will be added here.',
          )}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={tx('Daftar isi', 'Contents')} className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">{tx('Daftar isi', 'Contents')}</p>
          <ol className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
            {MHCU_WIKI.map((section, index) => (
              <li key={section.id}>
                <a
                  className="block rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 lg:border-transparent lg:bg-transparent"
                  href={`#${section.id}`}
                >
                  {index + 1}. {pick(section.title)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-5">
          {MHCU_WIKI.map((section, index) => (
            <section
              aria-labelledby={`wiki-${section.id}`}
              className="scroll-mt-20 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5"
              id={section.id}
              key={section.id}
            >
              <h2 className="text-lg font-bold text-slate-900" id={`wiki-${section.id}`}>
                {index + 1}. {pick(section.title)}
              </h2>
              {section.blocks.map((block, blockIndex) => (
                <Block block={block} key={blockIndex} pick={pick} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
