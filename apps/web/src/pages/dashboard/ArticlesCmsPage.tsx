export function ArticlesCmsPage() {
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Articles Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Write, review, approve, and publish psychological articles.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center text-slate-500">
        Articles management tools will be mounted here.
      </div>
    </div>
  )
}
