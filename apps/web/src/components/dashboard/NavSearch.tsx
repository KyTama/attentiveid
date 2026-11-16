import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronRight, Search, X } from 'lucide-react'
import { searchNav, type NavSearchItem } from '../../features/dashboard/nav-search'

interface NavSearchProps {
  items: readonly NavSearchItem[]
  /** Called with the chosen menu path; the caller navigates. */
  onSelect: (to: string) => void
  /** Only the desktop box listens for the "/" and Ctrl/Cmd+K shortcuts. */
  enableShortcut?: boolean
}

/** Type-ahead search over the portal menus: suggestions appear as you type, Enter or click opens one. */
export function NavSearch({ items, onSelect, enableShortcut = false }: NavSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const results = useMemo(() => searchNav(items, query), [items, query])
  const showPanel = open && query.trim().length > 0

  useEffect(() => {
    if (!enableShortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]')
      const isShortcut = (event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)
      if (!isShortcut) return
      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enableShortcut])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const choose = (item: NavSearchItem) => {
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
    onSelect(item.to)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => (results.length ? (current + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (results.length ? (current - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      if (showPanel && results[active]) {
        event.preventDefault()
        choose(results[active])
      }
    } else if (event.key === 'Escape') {
      if (query) setQuery('')
      else inputRef.current?.blur()
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-controls={showPanel ? listId : undefined}
          aria-expanded={showPanel}
          aria-label="Cari menu portal"
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-14 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-100"
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari menu..."
          ref={inputRef}
          role="combobox"
          type="text"
          value={query}
        />
        {query ? (
          <button
            aria-label="Hapus pencarian"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            type="button"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : enableShortcut ? (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-400">
            /
          </kbd>
        ) : null}
      </div>

      {showPanel && (
        <ul
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          id={listId}
          role="listbox"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-slate-500" role="presentation">
              Tidak ada menu untuk "{query.trim()}". Coba kata lain, mis. "booking", "artikel", atau "thumbnail".
            </li>
          ) : (
            results.map((item, index) => (
              <li
                aria-selected={index === active}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 ${index === active ? 'bg-gold-50' : 'hover:bg-slate-50'}`}
                id={`${listId}-${index}`}
                key={item.to}
                onClick={() => choose(item)}
                onMouseEnter={() => setActive(index)}
                role="option"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">{item.label}</span>
                  {item.trail.length > 0 && (
                    <span className="block truncate text-xs text-slate-500">{item.trail.join(' › ')}</span>
                  )}
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
