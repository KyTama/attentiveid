import { TextCursorInput } from 'lucide-react'

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-1 inline-block rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        Experimental
      </div>
      <h1 className="text-2xl font-bold text-slate-900" data-route-heading tabIndex={-1}>
        {title}
      </h1>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  )
}

export function ExperimentalFormsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader title="Forms" description="Formulir yang sedang diuji coba." />
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <TextCursorInput className="size-8 text-slate-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-slate-900">Belum ada form.</p>
        <p className="max-w-sm text-xs text-slate-500">Bagian ini masih kosong.</p>
      </div>
    </div>
  )
}
