import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Clock, Monitor, Building2, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react'
import {
  BOOKING_ASSESSMENT_FEE,
  matchPsychologists,
  type BookingPsychologistCatalogItem,
  type IntakeClientCategory,
  type IntakeConcernId,
  type IntakeGenderPreference,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { BOOKING_TEXT, type BookingLang } from '../booking-i18n'

type LevelKey = 'all' | 'mid' | 'senior_mid' | 'senior' | 'principal'

const LEVEL_OPTIONS: {
  value: LevelKey
  labelId: string
  labelEn: string
  color: string
}[] = [
  { value: 'all', labelId: 'Semua', labelEn: 'All', color: '#6f7884' },
  { value: 'mid', labelId: 'Mid Level (< 1 Tahun)', labelEn: 'Mid Level (< 1 Year)', color: '#5b9bd5' },
  { value: 'senior_mid', labelId: 'Senior-Mid (> 2 Tahun)', labelEn: 'Senior-Mid (> 2 Years)', color: '#70ad47' },
  { value: 'senior', labelId: 'Senior (> 4 Tahun)', labelEn: 'Senior (> 4 Years)', color: '#d8a74d' },
  { value: 'principal', labelId: 'Principal & Konsultan (≥ 8 Tahun)', labelEn: 'Principal & Consultant (≥ 8 Years)', color: '#1c2b51' },
]

function tierMeta(tier: string): { shortLabel: string; color: string; group: Exclude<LevelKey, 'all'> } {
  const normalized = tier.trim().toLowerCase()
  if (normalized === 'mid') return { shortLabel: 'Mid', color: '#5b9bd5', group: 'mid' }
  if (normalized === 'senior_mid') return { shortLabel: 'Sr-Mid', color: '#70ad47', group: 'senior_mid' }
  if (normalized === 'senior') return { shortLabel: 'Senior', color: '#d8a74d', group: 'senior' }
  if (normalized === 'consultant') return { shortLabel: 'Konsultan', color: '#1c2b51', group: 'principal' }
  return { shortLabel: 'Principal', color: '#1c2b51', group: 'principal' }
}

function formatCurrency(val: number | null): string {
  if (val == null) return '—'
  return `Rp ${val.toLocaleString('id-ID')}`
}

export interface SelectedPsychologistMeta {
  id: string
  slug: string
  name: string
  rate: number
  availableMalang: boolean
  primaryBranch: BookingPsychologistCatalogItem['primaryBranch']
  scheduleMon: string | null
  scheduleTue: string | null
  scheduleWed: string | null
  scheduleThu: string | null
  scheduleFri: string | null
  scheduleSat: string | null
  scheduleSun: string | null
}

interface PsychologistPickerProps {
  lang: BookingLang
  mode: 'online' | 'offline' | ''
  psychologists: BookingPsychologistCatalogItem[]
  loading: boolean
  loadError: string | null
  onRetry: () => void
  selectedId: string
  selectedSlug: string
  onSelect: (meta: SelectedPsychologistMeta | null) => void
  isNewClient: boolean
  appliesNewClientFee?: boolean
  fixedRateOverride?: number | null
  concernId?: IntakeConcernId | ''
  clientCategory?: IntakeClientCategory | ''
  genderPreference?: IntakeGenderPreference | ''
}

export function PsychologistPicker({
  lang,
  mode,
  psychologists,
  loading,
  loadError,
  onRetry,
  selectedId,
  selectedSlug,
  onSelect,
  isNewClient,
  appliesNewClientFee = true,
  fixedRateOverride = null,
  concernId,
  clientCategory,
  genderPreference,
}: PsychologistPickerProps) {
  const t = BOOKING_TEXT[lang]
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<LevelKey>('all')

  const matchedIds = useMemo(() => {
    if (!concernId || psychologists.length === 0) return new Set<string>()
    const maleSlugs = new Set(['ilham', 'farhan', 'andri', 'haykal'])
    const results = matchPsychologists(
      {
        concernId,
        clientCategory: clientCategory || undefined,
        genderPreference: genderPreference || undefined,
      },
      psychologists.map((p) => ({
        id: p.slug,
        name: p.name,
        nickname: p.nickname,
        title: p.credential,
        category: p.supportArea,
        gender: maleSlugs.has(p.slug) ? 'male' : 'female',
        specializations: p.specializations[lang],
        experience: p.experienceYears,
      })),
      { maxResults: 3 },
    )
    return new Set(results.map((r) => r.psychologist.id))
  }, [concernId, clientCategory, genderPreference, psychologists, lang])

  const filtered = useMemo(() => {
    const base =
      levelFilter === 'all'
        ? psychologists
        : psychologists.filter((p) => tierMeta(p.tier).group === levelFilter)

    if (matchedIds.size === 0) return base
    return [...base].sort((a, b) => {
      const aMatch = matchedIds.has(a.slug) ? 1 : 0
      const bMatch = matchedIds.has(b.slug) ? 1 : 0
      return bMatch - aMatch
    })
  }, [psychologists, levelFilter, matchedIds])

  if (loading) {
    return (
      <div className="mt-4 space-y-3" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-[#e6dfd3] bg-white p-4">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-full bg-[#e6dfd3] shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-[#e6dfd3] rounded w-2/3" />
                <div className="h-3 bg-[#e6dfd3] rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
        <p className="text-center text-[12.5px] text-[#6f7884]">{t.loadingPsychologists}</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mt-4 p-5 rounded-2xl border border-red-200 bg-red-50/70 text-center space-y-3">
        <p className="text-[13px] text-red-800">{loadError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-[#1c2b51] text-white text-xs font-bold cursor-pointer"
        >
          {t.retryLoad}
        </button>
      </div>
    )
  }

  if (psychologists.length === 0) {
    return (
      <div className="mt-4 p-5 rounded-2xl border border-[#e6dfd3] bg-[#f8f5ee] text-center">
        <p className="text-[13px] text-[#6f7884]">{t.noPsychologistsFound}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="border border-[#e1dbd0] rounded-[15px] bg-white p-4">
        <div className="text-[13px] font-extrabold text-[#1c2b51] mb-1">{t.levelHeading}</div>
        <p className="text-[12px] text-[#6f7884] leading-snug mb-3">{t.levelSubtitle}</p>
        <div className="flex flex-wrap gap-1.5">
          {LEVEL_OPTIONS.map((opt) => {
            const active = levelFilter === opt.value
            return (
              <motion.button
                key={opt.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={INTERACTIVE_SPRING}
                onClick={() => setLevelFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border cursor-pointer transition-colors ${
                  active
                    ? 'border-[#d8a74d] bg-[#fffcf4] text-[#1c2b51] shadow-xs'
                    : 'border-[#e1dbd0] bg-[#f8f5ee] text-[#6f7884] hover:border-[#c5bfb3]'
                }`}
              >
                {opt.value !== 'all' && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                )}
                <span>{lang === 'id' ? opt.labelId : opt.labelEn}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="text-xs uppercase tracking-[.09em] font-extrabold text-[#1c2b51] mb-2">
        {t.psychProfileTitle}
      </div>

      {filtered.length === 0 && (
        <div className="p-5 rounded-2xl border border-[#e6dfd3] bg-[#f8f5ee] text-center">
          <p className="text-[13px] text-[#6f7884]">{t.noPsychologistsAtLevel}</p>
        </div>
      )}

      {filtered.map((p) => {
        const isSelected = selectedId === p.id || (selectedSlug !== '' && selectedSlug === p.slug)
        const isExpanded = expandedId === p.id
        const isRecommendedMatch = matchedIds.has(p.slug)
        const baseRate = fixedRateOverride !== null ? fixedRateOverride : (mode === 'offline' ? p.offlineRate : p.onlineRate)
        const showNewClientFee = isNewClient && appliesNewClientFee
        const displayRate = showNewClientFee && baseRate != null ? baseRate + BOOKING_ASSESSMENT_FEE : baseRate
        const meta = tierMeta(p.tier)

        const locations: string[] = []
        if (p.availableOnline) locations.push('Online')
        if (p.availableTbi) locations.push('Tanjung Barat')
        if (p.availableBsd) locations.push('BSD')
        if (p.availableMalang) locations.push('Malang')

        const expertiseList = p.specializations[lang]
        const bioText = p.shortBio?.[lang] || p.shortBio?.id || ''

        const emitSelect = () =>
          onSelect({
            id: p.id,
            slug: p.slug,
            name: p.name,
            rate: baseRate ?? 0,
            availableMalang: p.availableMalang,
            primaryBranch: p.primaryBranch,
            scheduleMon: p.scheduleMon,
            scheduleTue: p.scheduleTue,
            scheduleWed: p.scheduleWed,
            scheduleThu: p.scheduleThu,
            scheduleFri: p.scheduleFri,
            scheduleSat: p.scheduleSat,
            scheduleSun: p.scheduleSun,
          })

        return (
          <div
            key={p.id}
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isSelected
                ? 'border-[#d8a74d] bg-[#fffcf4] shadow-[0_0_0_2px_rgba(216,167,77,.12)]'
                : 'border-[#e6dfd3] bg-white hover:border-[#d6bd87]'
            }`}
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setExpandedId(isExpanded ? null : p.id)}
              className="w-full text-left p-4 flex items-start gap-3 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#f0ebe2] shrink-0 overflow-hidden flex items-center justify-center">
                {p.media?.url ? (
                  <img
                    src={p.media.url}
                    alt={p.media.alt[lang] || p.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-14 h-14 object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#b5a78a]" aria-hidden="true" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#1c2b51] leading-tight">{p.name}</span>
                      {isRecommendedMatch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fdf3d7] text-[#8d6108] text-[10px] font-extrabold">
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          {t.topMatchBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#6f7884] mt-0.5">{p.credential}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    {displayRate != null && (
                      <span className="text-[12px] font-extrabold text-[#1c2b51] bg-[#f0ebe2] px-2 py-1 rounded-lg whitespace-nowrap tabular-nums">
                        {formatCurrency(displayRate)}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6f7884]" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6f7884]" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5f5a50] bg-[#f3ede4] px-1.5 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.shortLabel}
                  </span>
                  {expertiseList.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="inline-block text-[10px] font-bold text-[#5f5a50] bg-[#f3ede4] px-1.5 py-0.5 rounded-md truncate max-w-[150px]"
                    >
                      {area}
                    </span>
                  ))}
                  {expertiseList.length > 3 && (
                    <span className="inline-block text-[10px] font-bold text-[#6f7884] bg-[#f3ede4] px-1.5 py-0.5 rounded-md">
                      +{expertiseList.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={INTERACTIVE_SPRING}
                  className="px-4 pb-4 pt-0 border-t border-[#eee9e0] overflow-hidden"
                >
                  {bioText && <p className="text-[12.5px] text-[#555e68] leading-relaxed mt-3 mb-3">{bioText}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] mt-3">
                    <div className="flex items-center gap-1.5 text-[#6f7884]">
                      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-[#1c2b51]">{t.durationLabel}:</span> {p.consultationDuration}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6f7884]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-[#1c2b51]">{t.availableAt}:</span> {locations.join(', ')}
                    </div>
                    {fixedRateOverride === null && p.onlineRate != null && (
                      <div className="flex items-center gap-1.5 text-[#6f7884]">
                        <Monitor className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-[#1c2b51]">{t.rateOnline}:</span>{' '}
                        <span className="tabular-nums">{formatCurrency(p.onlineRate)}</span>
                      </div>
                    )}
                    {fixedRateOverride === null && p.offlineRate != null && (
                      <div className="flex items-center gap-1.5 text-[#6f7884]">
                        <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold text-[#1c2b51]">{t.rateOffline}:</span>{' '}
                        <span className="tabular-nums">{formatCurrency(p.offlineRate)}</span>
                      </div>
                    )}
                  </div>

                  {showNewClientFee && baseRate != null && (
                    <div className="mt-3 p-3 rounded-xl bg-[#fdf8ed] border border-[#ead8ae]">
                      <div className="flex justify-between text-[12px] text-[#6f7884]">
                        <span>{fixedRateOverride !== null ? t.summaryServiceRate : t.baseRateLabel}</span>
                        <span className="font-semibold text-[#1c2b51] tabular-nums">{formatCurrency(baseRate)}</span>
                      </div>
                      <div className="flex justify-between text-[12px] text-[#6f7884] mt-1">
                        <span>{t.assessmentFeeLabel}</span>
                        <span className="font-semibold text-[#1c2b51] tabular-nums">
                          {formatCurrency(BOOKING_ASSESSMENT_FEE)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[12.5px] mt-1.5 pt-1.5 border-t border-[#ead8ae]">
                        <span className="font-bold text-[#1c2b51]">{t.totalLabel}</span>
                        <span className="font-extrabold text-[#b47f1f] tabular-nums">
                          {formatCurrency(baseRate + BOOKING_ASSESSMENT_FEE)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-[#1c2b51] mb-1">{t.expertiseLabel}</div>
                    <div className="flex flex-wrap gap-1">
                      {expertiseList.map((area) => (
                        <span
                          key={area}
                          className="inline-block text-[10.5px] font-semibold text-[#5f5a50] bg-[#f3ede4] px-2 py-0.5 rounded-lg"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={INTERACTIVE_SPRING}
                    onClick={(e) => {
                      e.stopPropagation()
                      emitSelect()
                    }}
                    className={`mt-4 w-full py-2.5 rounded-xl text-[13px] font-extrabold cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c2b51] text-white'
                        : 'bg-[#d8a74d] text-[#1c2b51] shadow-[0_4px_12px_rgba(216,167,77,.2)]'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        {t.selected}
                      </span>
                    ) : (
                      t.selectThisPsychologist
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {isSelected && !isExpanded && (
              <div className="px-4 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#b47f1f]">
                  <Check className="w-3.5 h-3.5" />
                  {t.selected}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="text-[11px] font-bold text-[#6f7884] hover:text-[#1c2b51] cursor-pointer"
                >
                  {t.changeSelection}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
