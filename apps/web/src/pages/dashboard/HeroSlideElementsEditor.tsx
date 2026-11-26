import { useState } from 'react'
import type { HeroSlideItem, LandingMedia } from '@attentiveid/shared'
import { HERO_ELEMENTS, type HeroElement } from '@/features/content/hero-elements'
import { normalizeMediaReference } from '@/features/content/hero-slides'

type Override = NonNullable<HeroSlideItem['elements']>[number]
type Language = 'id' | 'en'

const LANGUAGE_NAMES: Record<Language, string> = { id: 'Indonesia', en: 'English' }
const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-gold-500'

/** Replace one part's override; an override with nothing left in it is dropped, so the part is built-in again. */
export function withElement(slide: HeroSlideItem, key: string, change: Partial<Override>): HeroSlideItem {
  const current = slide.elements?.find((element) => element.key === key)
  const next: Override = { ...current, ...change, key }
  if (!next.hidden) delete next.hidden
  if (next.text === undefined) delete next.text
  if (next.media === undefined) delete next.media
  const others = (slide.elements ?? []).filter((element) => element.key !== key)
  const elements = next.hidden || next.text || next.media ? [...others, next] : others
  return { ...slide, elements }
}

interface Props {
  slide: HeroSlideItem
  /** Apply a change to the slide as it is now (uploads finish later, after other typing). */
  onChange: (update: (slide: HeroSlideItem) => HeroSlideItem) => void
  upload: (file: File, name: string) => Promise<LandingMedia>
}

/** The slide's English photo, and a switch / wording / picture for every part of the slide. */
export function HeroSlideElementsEditor({ slide, onChange, upload }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const overrides = new Map((slide.elements ?? []).map((element) => [element.key, element]))

  const send = async (name: string, file: File, apply: (media: LandingMedia) => void) => {
    setError(null)
    if (!file.type.startsWith('image/')) return setError('Hanya file gambar (WebP, PNG, JPG) yang diperbolehkan.')
    if (file.size > 5 * 1024 * 1024) return setError('Ukuran gambar maksimal 5 MB.')
    setBusy(name)
    try {
      apply(await upload(file, name))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal mengunggah gambar.')
    } finally {
      setBusy(null)
    }
  }

  const picture = (name: string, label: string, current: string | undefined, apply: (media: LandingMedia) => void, reset: (() => void) | null) => (
    <div className="flex flex-wrap items-center gap-3">
      {current && <img alt="" className="h-10 w-14 rounded border border-slate-200 object-cover" src={current} />}
      <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus-within:ring-2 focus-within:ring-gold-500">
        {busy === name ? 'Mengunggah...' : label}
        <input
          accept="image/webp,image/png,image/jpeg"
          aria-label={label}
          className="sr-only"
          disabled={busy !== null}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void send(name, file, apply)
          }}
          type="file"
        />
      </label>
      {reset && (
        <button className="cursor-pointer text-xs font-semibold text-slate-500 underline" onClick={reset} type="button">
          Kembali ke bawaan
        </button>
      )}
    </div>
  )

  const wording = (element: HeroElement) => {
    const own = overrides.get(element.key)?.text
    const long = element.key === 'focusList' || element.key === 'quoteText' || (element.text?.id.length ?? 0) > 30 || element.text?.id.includes('\n')
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {(['id', 'en'] as const).map((language) => {
          const props = {
            'aria-label': `${element.label} (${LANGUAGE_NAMES[language]})`,
            className: inputClass,
            // The built-in wording is shown as the value, so staff edit the real text instead of retyping it.
            value: own?.[language] ?? element.text?.[language] ?? '',
            onChange: (event: { target: { value: string } }) => {
              const base = own ?? element.text ?? { id: '', en: '' }
              const text = { ...base, [language]: event.target.value }
              onChange((current) => withElement(current, element.key, { text: text.id || text.en ? text : undefined }))
            },
          }
          return long ? <textarea key={language} rows={3} {...props} /> : <input key={language} type="text" {...props} />
        })}
        {own && element.text && (
          <button
            className="cursor-pointer justify-self-start text-xs font-semibold text-slate-500 underline"
            onClick={() => onChange((current) => withElement(current, element.key, { text: undefined }))}
            type="button"
          >
            Kembali ke teks bawaan
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-800">Foto utama versi English (opsional)</p>
        <p className="text-[11px] text-slate-500">Foto di atas dipakai situs bahasa Indonesia. Kalau di sini kosong, situs English memakai foto yang sama.</p>
        {picture(
          'photo-en',
          'Unggah foto English',
          normalizeMediaReference(slide.mediaEn?.reference) ?? undefined,
          (media) => onChange((current) => ({ ...current, mediaEn: media })),
          slide.mediaEn ? () => onChange(({ mediaEn: _removed, ...rest }) => rest) : null,
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-800">Semua elemen slide</p>
        <p className="text-[11px] text-slate-500">Hilangkan centang untuk menyembunyikan. Tata letak tidak berubah.</p>
        {error && <p className="mt-2 text-xs font-semibold text-rose-700" role="alert">{error}</p>}
        <ul className="mt-2 divide-y divide-slate-100">
          {HERO_ELEMENTS[slide.layout ?? 'practice'].map((element) => (
            <li className="space-y-2 py-2.5" key={element.key}>
              {element.kind === 'block' ? (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    checked={!overrides.get(element.key)?.hidden}
                    className="size-4"
                    onChange={(event) => {
                      const hidden = !event.target.checked
                      onChange((current) => withElement(current, element.key, { hidden }))
                    }}
                    type="checkbox"
                  />
                  Tampilkan: {element.label}
                </label>
              ) : (
                <p className="text-[11px] font-semibold text-slate-500">{element.label}</p>
              )}
              {element.kind === 'text' && wording(element)}
              {element.kind === 'image' &&
                picture(
                  element.key,
                  element.label,
                  normalizeMediaReference(overrides.get(element.key)?.media?.reference) ?? element.src,
                  (media) => onChange((current) => withElement(current, element.key, { media })),
                  overrides.get(element.key)?.media ? () => onChange((current) => withElement(current, element.key, { media: undefined })) : null,
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
