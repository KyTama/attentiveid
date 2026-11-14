import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ExternalLink, MessageCircle, Phone } from 'lucide-react'
import {
  BOOKING_ASSESSMENT_FEE,
  BOOKING_BRANCH_LABELS,
  BOOKING_MARKETING_SOURCES,
  buildBookingWhatsAppMessage,
  buildWeekSchedule,
  detectCrisisKeywords,
  EMERGENCY_CRISIS_HOTLINES,
  filterScheduleByLocation,
  getEarliestBookingDateWib,
  INTAKE_CLIENT_CATEGORIES,
  INTAKE_CONCERNS,
  isValidEmail,
  isValidPhoneDigits,
  normalizeBookingBranch,
  resolveBookingWhatsAppRouting,
  type BookingClientStatus,
  type BookingConsultationMode,
  type BookingPhysicalBranch,
  type BookingPsychologistCatalogItem,
  type BookingPsychologistChoice,
  type IntakeClientCategory,
  type IntakeConcernId,
  type IntakeGenderPreference,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { captureAttribution, type Attribution } from '../attribution'
import { BOOKING_TEXT, TERMS_CONTENT, type BookingLang } from '../booking-i18n'
import { fetchBookingPsychologists, submitPublicBooking } from '../service'
import { COUNTRIES, getCityLabel, getGmtOffset, localToWib } from '../timezone-data'
import { MobileBrand } from './BrandPanel'
import {
  Actions,
  FormField,
  Note,
  PrimaryBtn,
  RadioChoice,
  SecondaryBtn,
  SelectInput,
  StepBody,
  StepHeader,
  TextArea,
  TextInput,
} from './FormPrimitives'
import { PsychologistPicker, type SelectedPsychologistMeta } from './PsychologistPicker'
import { BrandDatePicker, TimePicker } from './SchedulePicker'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export interface BookingPrefillParams {
  psychologistSlug?: string
  concernId?: string
  mode?: string
  location?: string
  clientStatus?: string
}

export interface BookingFormData {
  clientStatus: BookingClientStatus | ''
  name: string
  whatsapp: string
  email: string
  country: string
  cityRegion: string
  age: string
  gender: string
  clientCategory: IntakeClientCategory | ''
  genderPreference: IntakeGenderPreference
  concern: IntakeConcernId | ''
  concernNote: string
  isCrisisManual: boolean
  mode: BookingConsultationMode | ''
  location: BookingPhysicalBranch | ''
  psychChoice: BookingPsychologistChoice | ''
  psychologist: string
  psychologistSlug: string
  psychologistName: string
  psychologistRate: number
  psychologistMalang: boolean
  psychologistPrimaryBranch: BookingPsychologistCatalogItem['primaryBranch'] | ''
  psychScheduleMon: string
  psychScheduleTue: string
  psychScheduleWed: string
  psychScheduleThu: string
  psychScheduleFri: string
  psychScheduleSat: string
  psychScheduleSun: string
  date1: string
  time1: string
  date2: string
  time2: string
  date3: string
  time3: string
  agree: boolean
  marketingSource: string
  referrer: string
  website: string // honeypot
}

const INITIAL_DATA: BookingFormData = {
  clientStatus: '',
  name: '',
  whatsapp: '',
  email: '',
  country: 'indonesia',
  cityRegion: 'id-wib',
  age: '',
  gender: '',
  clientCategory: 'individual',
  genderPreference: 'any',
  concern: '',
  concernNote: '',
  isCrisisManual: false,
  mode: '',
  location: '',
  psychChoice: '',
  psychologist: '',
  psychologistSlug: '',
  psychologistName: '',
  psychologistRate: 0,
  psychologistMalang: false,
  psychologistPrimaryBranch: '',
  psychScheduleMon: '',
  psychScheduleTue: '',
  psychScheduleWed: '',
  psychScheduleThu: '',
  psychScheduleFri: '',
  psychScheduleSat: '',
  psychScheduleSun: '',
  date1: '',
  time1: '',
  date2: '',
  time2: '',
  date3: '',
  time3: '',
  agree: false,
  marketingSource: '',
  referrer: '',
  website: '',
}

const STORAGE_KEY = 'attentive_booking_draft'
const STEP_KEY = 'attentive_booking_step'

const VALID_CONCERN_IDS = new Set<string>(INTAKE_CONCERNS.map((c) => c.id))

function buildInitialState(prefill?: BookingPrefillParams): { data: BookingFormData; step: number } {
  let baseData = { ...INITIAL_DATA }
  let baseStep = 1

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const stepRaw = window.localStorage.getItem(STEP_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BookingFormData>
      baseData = { ...INITIAL_DATA, ...parsed, website: '' }
      const parsedStep = stepRaw ? Number.parseInt(stepRaw, 10) : 1
      baseStep = parsedStep >= 1 && parsedStep <= 6 ? parsedStep : 1
    }
  } catch {
    // ignore storage read issues
  }

  if (prefill) {
    if (prefill.concernId && VALID_CONCERN_IDS.has(prefill.concernId)) {
      baseData.concern = prefill.concernId as IntakeConcernId
    }
    if (prefill.clientStatus === 'new' || prefill.clientStatus === 'returning') {
      baseData.clientStatus = prefill.clientStatus
    }
    if (prefill.mode === 'online' || prefill.mode === 'offline') {
      baseData.mode = prefill.mode
    }
    const normalizedBranch = normalizeBookingBranch(prefill.location)
    if (normalizedBranch) {
      baseData.location = normalizedBranch
      if (!baseData.mode) baseData.mode = 'offline'
    }
    if (prefill.psychologistSlug) {
      baseData.psychChoice = 'self'
      baseData.psychologistSlug = prefill.psychologistSlug.trim().toLowerCase()
    }
  }

  return { data: baseData, step: baseStep }
}

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`

export function BookingForm({
  lang,
  onLangChange,
  prefill,
}: {
  lang: BookingLang
  onLangChange: (l: BookingLang) => void
  prefill?: BookingPrefillParams
}) {
  const initial = useMemo(() => buildInitialState(prefill), [prefill])
  const [step, setStep] = useState<number>(initial.step)
  const [data, setData] = useState<BookingFormData>(initial.data)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [utm] = useState<Attribution>(() => captureAttribution())
  const [confirmation, setConfirmation] = useState<{
    bookingCode: string
    waUrl: string
  } | null>(null)

  const [catalog, setCatalog] = useState<BookingPsychologistCatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const t = BOOKING_TEXT[lang]

  const loadCatalog = useCallback(async (mode?: string, location?: string) => {
    setCatalogLoading(true)
    setCatalogError(null)
    try {
      const items = await fetchBookingPsychologists({
        mode: mode || undefined,
        location: location || undefined,
      })
      setCatalog(items)
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : t.loadingPsychologists)
    } finally {
      setCatalogLoading(false)
    }
  }, [t.loadingPsychologists])

  useEffect(() => {
    void loadCatalog(data.mode || undefined, data.mode === 'offline' ? data.location || undefined : undefined)
  }, [data.mode, data.location, loadCatalog])

  // Auto-resolve URL-prefilled psychologist slug against live catalog
  useEffect(() => {
    if (!data.psychologistSlug || data.psychologist || catalog.length === 0) return
    const matched = catalog.find((p) => p.slug === data.psychologistSlug)
    if (!matched) return

    const effectiveMode: BookingConsultationMode =
      data.mode || (matched.availableOnline ? 'online' : 'offline')
    const rate = effectiveMode === 'offline' ? matched.offlineRate ?? 0 : matched.onlineRate ?? 0

    setData((prev) => ({
      ...prev,
      mode: prev.mode || effectiveMode,
      psychologist: matched.id,
      psychologistName: matched.name,
      psychologistRate: rate,
      psychologistMalang: matched.availableMalang,
      psychologistPrimaryBranch: matched.primaryBranch,
      psychScheduleMon: matched.scheduleMon ?? '',
      psychScheduleTue: matched.scheduleTue ?? '',
      psychScheduleWed: matched.scheduleWed ?? '',
      psychScheduleThu: matched.scheduleThu ?? '',
      psychScheduleFri: matched.scheduleFri ?? '',
      psychScheduleSat: matched.scheduleSat ?? '',
      psychScheduleSun: matched.scheduleSun ?? '',
    }))
  }, [catalog, data.psychologistSlug, data.psychologist, data.mode])

  useEffect(() => {
    if (step === 7) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      window.localStorage.setItem(STEP_KEY, String(step))
    } catch {
      // ignore storage errors
    }
  }, [data, step])

  const set = useCallback(<K extends keyof BookingFormData>(k: K, v: BookingFormData[K]) => {
    setErrorMsg(null)
    setData((prev) => ({ ...prev, [k]: v }))
  }, [])

  const applySelectedPsychologist = useCallback((meta: SelectedPsychologistMeta | null) => {
    setErrorMsg(null)
    setData((prev) => ({
      ...prev,
      psychologist: meta?.id ?? '',
      psychologistSlug: meta?.slug ?? '',
      psychologistName: meta?.name ?? '',
      psychologistRate: meta?.rate ?? 0,
      psychologistMalang: meta?.availableMalang ?? false,
      psychologistPrimaryBranch: meta?.primaryBranch ?? '',
      psychScheduleMon: meta?.scheduleMon ?? '',
      psychScheduleTue: meta?.scheduleTue ?? '',
      psychScheduleWed: meta?.scheduleWed ?? '',
      psychScheduleThu: meta?.scheduleThu ?? '',
      psychScheduleFri: meta?.scheduleFri ?? '',
      psychScheduleSat: meta?.scheduleSat ?? '',
      psychScheduleSun: meta?.scheduleSun ?? '',
    }))
  }, [])

  const clearSelectedPsychologist = useCallback(() => {
    applySelectedPsychologist(null)
  }, [applySelectedPsychologist])

  const goTo = useCallback((n: number) => {
    setErrorMsg(null)
    setStep(n)
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }, [])

  const isNewClient = data.clientStatus === 'new'

  const validate = (): boolean => {
    if (step === 1) {
      if (!data.clientStatus) {
        setErrorMsg(t.requiredAlert)
        return false
      }
      if (!data.name.trim() || !data.whatsapp.trim() || !data.email.trim()) {
        setErrorMsg(t.fieldAlert)
        return false
      }
      if (!isValidPhoneDigits(data.whatsapp.trim())) {
        setErrorMsg(t.invalidWhatsappAlert)
        return false
      }
      if (!isValidEmail(data.email.trim())) {
        setErrorMsg(t.invalidEmailAlert)
        return false
      }
      if (!data.country || !data.cityRegion) {
        setErrorMsg(t.fieldAlert)
        return false
      }
    }
    if (step === 2 && isNewClient) {
      const ageNum = Number(data.age)
      if (!data.age || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 100) {
        setErrorMsg(t.invalidAgeAlert)
        return false
      }
      if (!data.gender || !data.concern) {
        setErrorMsg(t.fieldAlert)
        return false
      }
    }
    if (step === 3) {
      if (!data.mode) {
        setErrorMsg(t.requiredAlert)
        return false
      }
      if (data.mode === 'offline' && !data.location) {
        setErrorMsg(t.fieldAlert)
        return false
      }
      if (!data.psychChoice) {
        setErrorMsg(t.requiredAlert)
        return false
      }
      if ((data.psychChoice === 'self' || data.psychChoice === 'previous') && !data.psychologist && !data.psychologistSlug) {
        setErrorMsg(t.fieldAlert)
        return false
      }
    }
    if (step === 4) {
      if (!data.date1 || !data.time1) {
        setErrorMsg(t.fieldAlert)
        return false
      }
    }
    if (step === 5) {
      if (!data.agree) {
        setErrorMsg(t.termsAlert)
        return false
      }
    }
    return true
  }

  const next = () => {
    if (!validate()) return
    if (step === 1 && data.clientStatus === 'returning') {
      goTo(3)
      return
    }
    goTo(step + 1)
  }

  const prev = () => {
    if (step === 3 && data.clientStatus === 'returning') {
      goTo(1)
      return
    }
    goTo(step - 1)
  }

  const reviewAndGo = () => {
    if (validate()) goTo(6)
  }

  const toWibTime = useCallback(
    (timeStr: string): string => {
      if (!timeStr) return ''
      const [h, m] = timeStr.split(':').map(Number)
      const gmtOffset = getGmtOffset(data.cityRegion)
      if (gmtOffset === 7) return timeStr
      const wib = localToWib(h || 0, m || 0, gmtOffset)
      return `${String(wib.hour).padStart(2, '0')}:${String(wib.minute).padStart(2, '0')}`
    },
    [data.cityRegion],
  )

  const cityLabelId = getCityLabel(data.cityRegion, 'id')
  const cityLabelCurrent = getCityLabel(data.cityRegion, lang)
  const selectedConcernObj = INTAKE_CONCERNS.find((c) => c.id === data.concern)
  const concernLabel = selectedConcernObj ? selectedConcernObj.title[lang] : '—'

  const locationLabel =
    data.mode === 'offline'
      ? data.location
        ? BOOKING_BRANCH_LABELS[lang][data.location]
        : '—'
      : t.online

  const psychLabel =
    data.psychChoice === 'recommended'
      ? t.recommendedAttentive
      : data.psychChoice === 'previous'
        ? `${t.previousPsychSummary}: ${data.psychologistName || '—'}`
        : data.psychologistName || '—'

  const fmtScheduleReview = (d: string, ti: string) => {
    if (!d || !ti) return '—'
    const [y, m, dd] = d.split('-')
    const gmtOffset = getGmtOffset(data.cityRegion)
    if (gmtOffset === 7) return `${dd}-${m}-${y} · ${ti} WIB`
    const wibTime = toWibTime(ti)
    const shortCity = cityLabelCurrent.split('(')[0].trim().split('/')[0].trim()
    return `${dd}-${m}-${y} · ${ti} (${shortCity}) / ${wibTime} WIB`
  }

  const handleSubmit = async () => {
    if (!data.marketingSource) {
      setErrorMsg(t.requiredAlert)
      return
    }
    if (!data.clientStatus || !data.mode || !data.psychChoice) {
      setErrorMsg(t.requiredAlert)
      return
    }

    setErrorMsg(null)
    setSubmitting(true)

    try {
      const fmtDate = (d: string) => {
        const [y, m, dd] = d.split('-')
        return `${dd}-${m}-${y}`
      }
      const gmtOffset = getGmtOffset(data.cityRegion)
      const scheduleStr = (d: string, time: string) => {
        if (!d || !time) return ''
        const wibTime = toWibTime(time)
        const dateStr = fmtDate(d)
        if (gmtOffset === 7) return `${dateStr} · ${wibTime} WIB`
        const shortCity = cityLabelId.split('(')[0].trim().split('/')[0].trim()
        return `${dateStr} · ${wibTime} WIB (Klien: ${time} ${shortCity}/GMT+${gmtOffset})`
      }

      const scheduleOption1 = scheduleStr(data.date1, data.time1)
      const scheduleOption2 = scheduleStr(data.date2, data.time2)
      const scheduleOption3 = scheduleStr(data.date3, data.time3)

      const result = await submitPublicBooking({
        language: lang,
        clientStatus: data.clientStatus,
        name: data.name.trim(),
        whatsapp: data.whatsapp.trim(),
        email: data.email.trim(),
        countryRegion: `${data.country} / ${cityLabelId}`,
        age: data.age ? Number.parseInt(data.age, 10) : undefined,
        gender: data.gender || undefined,
        serviceType: 'Personal',
        concernId: data.concern || undefined,
        concernCategory: selectedConcernObj ? selectedConcernObj.title.id : undefined,
        clientCategory: data.clientCategory || undefined,
        genderPreference: data.genderPreference,
        concernNote: data.concernNote.trim() || undefined,
        consultationMode: data.mode,
        location: data.mode === 'offline' ? data.location || null : null,
        psychologistChoice: data.psychChoice,
        psychologistSlug: data.psychologistSlug || undefined,
        psychologistId: data.psychologist || undefined,
        selectedPsychologistName: data.psychologistName || undefined,
        scheduleOption1,
        scheduleOption2: scheduleOption2 || undefined,
        scheduleOption3: scheduleOption3 || undefined,
        marketingSource: data.marketingSource,
        referrer: data.referrer.trim() || undefined,
        utmSource: utm.utmSource || undefined,
        utmMedium: utm.utmMedium || undefined,
        utmCampaign: utm.utmCampaign || undefined,
        utmContent: utm.utmContent || undefined,
        utmTerm: utm.utmTerm || undefined,
        campaignId: utm.campaignId || undefined,
        adsetId: utm.adsetId || undefined,
        adId: utm.adId || undefined,
        website: data.website || undefined,
      })

      if (!result.ok) {
        const firstFieldError = result.errors ? Object.values(result.errors).find(Boolean) : undefined
        setErrorMsg(firstFieldError || result.message)
        return
      }

      const fallbackRouting = resolveBookingWhatsAppRouting({
        mode: data.mode,
        location: data.location,
        psychChoice: data.psychChoice,
        availableMalang: data.psychologistMalang,
        primaryBranch: data.psychologistPrimaryBranch || null,
      })
      const waTargetNumber = result.data.whatsappRouting?.whatsappNumber || fallbackRouting.whatsappNumber

      const psychChoiceLabel =
        data.psychChoice === 'recommended'
          ? 'Rekomendasi Attentive'
          : data.psychChoice === 'previous'
            ? 'Psikolog sebelumnya'
            : 'Pilih sendiri'

      const waMsg = buildBookingWhatsAppMessage({
        lang,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        clientStatus: data.clientStatus,
        concernLabel: selectedConcernObj ? selectedConcernObj.title[lang] : null,
        consultationMode: data.mode,
        location: data.mode === 'offline' ? (data.location as BookingPhysicalBranch) || null : null,
        psychChoiceLabel,
        selectedPsychologist: data.psychologistName || null,
        scheduleOption1,
        scheduleOption2: scheduleOption2 || null,
        scheduleOption3: scheduleOption3 || null,
        baseRate: result.data.baseRate,
        assessmentFee: result.data.assessmentFee,
        totalRate: result.data.totalRate,
        bookingCode: result.data.bookingCode,
      })

      const waUrl = `https://wa.me/${waTargetNumber}?text=${encodeURIComponent(waMsg)}`

      const leadKey = `attentive_lead_sent_${result.data.id}`
      try {
        if (window.fbq && !window.sessionStorage.getItem(leadKey)) {
          window.sessionStorage.setItem(leadKey, '1')
          window.fbq('track', 'Lead', {}, { eventID: result.data.id })
        }
      } catch {
        // ignore sessionStorage/fbq failure
      }

      try {
        window.open?.(waUrl, '_blank', 'noopener,noreferrer')
      } catch {
        // popup blocked; user can still click CTA in Step 7
      }

      try {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(STEP_KEY)
      } catch {
        // ignore storage clear error
      }

      setConfirmation({
        bookingCode: result.data.bookingCode,
        waUrl,
      })
      goTo(7)
    } finally {
      setSubmitting(false)
    }
  }

  const resetBooking = () => {
    setConfirmation(null)
    setData({ ...INITIAL_DATA })
    goTo(1)
  }

  const genderOpts = [
    { value: '', label: t.selectGender },
    { value: 'male', label: t.male },
    { value: 'female', label: t.female },
    { value: 'other', label: t.otherGender },
  ]

  const progressWidth = `${(Math.min(step, 6) / 6) * 100}%`
  const stepLabel = step === 7 ? t.done : `${t.step} ${step} ${t.of} 6`

  return (
    <main className="min-w-0 px-4 sm:px-7 pb-16 pt-0 lg:pt-9">
      <MobileBrand lang={lang} />
      <div className="max-w-[780px] mx-auto">
        <div className="flex justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h1 data-route-heading tabIndex={-1} className="text-[14px] font-extrabold text-[#1c2b51] tracking-[.01em] outline-none">
              {t.formTitle}
            </h1>
            <div className="text-xs text-[#6f7884] mt-0.5">{stepLabel}</div>
          </div>
          <div className="flex gap-0.5 p-0.5 border border-[#ddd6ca] rounded-[11px] bg-white shadow-[0_4px_12px_rgba(28,43,81,.05)]">
            <button
              type="button"
              onClick={() => onLangChange('id')}
              className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-extrabold transition-colors cursor-pointer ${
                lang === 'id' ? 'bg-[#1c2b51] text-white' : 'text-[#6f7884]'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-extrabold transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-[#1c2b51] text-white' : 'text-[#6f7884]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="h-[5px] bg-[#e6dfd3] rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #d8a74d, #dbb45d)' }}
            initial={false}
            animate={{ width: progressWidth }}
            transition={INTERACTIVE_SPRING}
          />
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={INTERACTIVE_SPRING}
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-800 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visually hidden honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={data.website}
          onChange={(e) => set('website', e.target.value)}
          className="sr-only"
        />

        <div className="bg-[rgba(255,253,249,.95)] border border-[rgba(231,224,212,.94)] rounded-[22px] shadow-[0_18px_50px_rgba(28,43,81,.12)] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={INTERACTIVE_SPRING}
            >
              {step === 1 && <Step1 data={data} set={set} t={t} next={next} lang={lang} />}
              {step === 2 && <Step2 data={data} set={set} t={t} next={next} prev={prev} genderOpts={genderOpts} lang={lang} />}
              {step === 3 && (
                <Step3
                  data={data}
                  set={set}
                  t={t}
                  next={next}
                  prev={prev}
                  lang={lang}
                  catalog={catalog}
                  catalogLoading={catalogLoading}
                  catalogError={catalogError}
                  onRetryCatalog={() =>
                    loadCatalog(data.mode || undefined, data.mode === 'offline' ? data.location || undefined : undefined)
                  }
                  onSelectPsychologist={applySelectedPsychologist}
                  onClearPsychologist={clearSelectedPsychologist}
                />
              )}
              {step === 4 && <Step4 data={data} set={set} t={t} next={next} prev={prev} lang={lang} />}
              {step === 5 && <Step5 data={data} set={set} t={t} lang={lang} reviewAndGo={reviewAndGo} prev={prev} />}
              {step === 6 && (
                <Step6
                  data={data}
                  set={set}
                  t={t}
                  lang={lang}
                  prev={() => goTo(5)}
                  submit={handleSubmit}
                  submitting={submitting}
                  concernLabel={concernLabel}
                  psychLabel={psychLabel}
                  locationLabel={locationLabel}
                  cityLabel={cityLabelCurrent}
                  fmtSchedule={fmtScheduleReview}
                  isNewClient={isNewClient}
                />
              )}
              {step === 7 && (
                <Step7
                  t={t}
                  bookingCode={confirmation?.bookingCode ?? ''}
                  waUrl={confirmation?.waUrl ?? '#'}
                  onReset={resetBooking}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

type SetFn = <K extends keyof BookingFormData>(k: K, v: BookingFormData[K]) => void
type TFn = Record<string, string>

function Step1({ data, set, t, next, lang }: { data: BookingFormData; set: SetFn; t: TFn; next: () => void; lang: BookingLang }) {
  const selectedCountry = COUNTRIES.find((c) => c.value === data.country)
  const cityOptions = selectedCountry?.cities ?? []
  const countrySelectOpts = [
    { value: '', label: t.selectCountry },
    ...COUNTRIES.map((c) => ({ value: c.value, label: lang === 'en' ? c.labelEn : c.labelId })),
  ]
  const citySelectOpts = [
    { value: '', label: t.selectCity },
    ...cityOptions.map((c) => ({ value: c.value, label: lang === 'en' ? c.labelEn : c.labelId })),
  ]

  const handleCountryChange = (v: string) => {
    set('country', v)
    const country = COUNTRIES.find((c) => c.value === v)
    if (country && country.cities.length === 1) {
      set('cityRegion', country.cities[0]!.value)
    } else {
      set('cityRegion', '')
    }
    set('time1', '')
    set('time2', '')
    set('time3', '')
  }

  return (
    <>
      <StepHeader eyebrow={t.welcome} title={t.startTitle} lead={t.startLead} />
      <StepBody>
        <div className="mt-5">
          <span className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
            {t.returningQ} <span className="text-[#d8a74d] font-black">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RadioChoice
              name="client_status"
              value="new"
              checked={data.clientStatus === 'new'}
              onChange={(v) => set('clientStatus', v as BookingClientStatus)}
              title={t.newClient}
              desc={t.newClientDesc}
            />
            <RadioChoice
              name="client_status"
              value="returning"
              checked={data.clientStatus === 'returning'}
              onChange={(v) => set('clientStatus', v as BookingClientStatus)}
              title={t.oldClient}
              desc={t.oldClientDesc}
            />
          </div>
        </div>
        <FormField id="booking-name" label={t.fullName} required>
          <TextInput id="booking-name" value={data.name} onChange={(v) => set('name', v)} placeholder={t.fullNamePh} />
        </FormField>
        <FormField id="booking-whatsapp" label={t.whatsapp} required>
          <TextInput
            id="booking-whatsapp"
            value={data.whatsapp}
            onChange={(v) => set('whatsapp', v.replace(/[^\d+\s-]/g, '').slice(0, 20))}
            placeholder={t.whatsappPh}
            inputMode="tel"
            maxLength={20}
          />
        </FormField>
        <FormField id="booking-email" label={t.email} required>
          <TextInput
            id="booking-email"
            value={data.email}
            onChange={(v) => set('email', v)}
            placeholder={t.emailPh}
            type="email"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5">
          <FormField id="booking-country" label={t.country} required>
            <SelectInput id="booking-country" value={data.country} onChange={handleCountryChange} options={countrySelectOpts} />
          </FormField>
          <FormField id="booking-city" label={t.cityRegion} required>
            <SelectInput
              id="booking-city"
              value={data.cityRegion}
              onChange={(v) => {
                set('cityRegion', v)
                set('time1', '')
                set('time2', '')
                set('time3', '')
              }}
              options={citySelectOpts}
            />
          </FormField>
        </div>

        <Actions>
          <span />
          <PrimaryBtn onClick={next}>{t.continue}</PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step2({
  data,
  set,
  t,
  next,
  prev,
  genderOpts,
  lang,
}: {
  data: BookingFormData
  set: SetFn
  t: TFn
  next: () => void
  prev: () => void
  genderOpts: { value: string; label: string }[]
  lang: BookingLang
}) {
  const concernOpts = [
    { value: '', label: t.selectConcern },
    ...INTAKE_CONCERNS.map((c) => ({ value: c.id, label: c.title[lang] })),
  ]

  const categoryLabels: Record<IntakeClientCategory, string> = {
    individual: t.catIndividual,
    couple: t.catCouple,
    child_teen: t.catChildTeen,
    family: t.catFamily,
  }

  const genderPrefOpts = [
    { value: 'any', label: t.genderAny },
    { value: 'female', label: t.genderFemale },
    { value: 'male', label: t.genderMale },
  ]

  const crisisDetected = useMemo(
    () => detectCrisisKeywords(data.concernNote).isCrisisDetected,
    [data.concernNote],
  )
  const effectiveCrisis = data.isCrisisManual || crisisDetected

  return (
    <>
      <StepHeader eyebrow={t.aboutYou} title={t.needsTitle} lead={t.needsLead} />
      <StepBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5">
          <FormField id="booking-age" label={t.age} required>
            <TextInput
              id="booking-age"
              value={data.age}
              onChange={(v) => set('age', v)}
              placeholder={t.agePh}
              type="number"
              min={1}
              max={100}
            />
          </FormField>
          <FormField id="booking-gender" label={t.gender} required>
            <SelectInput id="booking-gender" value={data.gender} onChange={(v) => set('gender', v)} options={genderOpts} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5">
          <FormField id="booking-client-category" label={t.clientCategoryLabel}>
            <SelectInput
              id="booking-client-category"
              value={data.clientCategory}
              onChange={(v) => set('clientCategory', v as IntakeClientCategory)}
              options={INTAKE_CLIENT_CATEGORIES.map((id) => ({ value: id, label: categoryLabels[id] }))}
            />
          </FormField>
          <FormField id="booking-gender-pref" label={t.genderPrefLabel}>
            <SelectInput
              id="booking-gender-pref"
              value={data.genderPreference}
              onChange={(v) => set('genderPreference', v as IntakeGenderPreference)}
              options={genderPrefOpts}
            />
          </FormField>
        </div>

        <FormField id="booking-concern" label={t.concernLabel} required>
          <SelectInput
            id="booking-concern"
            value={data.concern}
            onChange={(v) => set('concern', v as IntakeConcernId)}
            options={concernOpts}
          />
        </FormField>

        <FormField id="booking-story" label={t.storyLabel}>
          <TextArea id="booking-story" value={data.concernNote} onChange={(v) => set('concernNote', v)} placeholder={t.storyPh} />
        </FormField>

        <Note>{t.privacyNote}</Note>

        <div className="mt-4 pt-3 border-t border-[#e8e1d5]">
          <label className="flex items-start gap-2.5 text-[12.5px] text-[#555e68] cursor-pointer">
            <input
              type="checkbox"
              checked={data.isCrisisManual}
              onChange={(e) => set('isCrisisManual', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#ccc5ba] accent-red-600 shrink-0"
            />
            <span>{t.crisisCheckbox}</span>
          </label>

          <AnimatePresence>
            {effectiveCrisis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={INTERACTIVE_SPRING}
                className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2.5 overflow-hidden"
              >
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t.crisisAlertTitle}</span>
                </div>
                <p className="text-red-800 leading-relaxed">{t.crisisAlertLead}</p>
                <div className="space-y-1.5 pt-1">
                  {EMERGENCY_CRISIS_HOTLINES.map((hotline) => (
                    <a
                      key={hotline.name}
                      href={hotline.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-red-200 text-red-900 hover:bg-red-100/60 transition-colors font-medium"
                    >
                      <span>{hotline.name}</span>
                      <span className="flex items-center gap-1 font-bold text-red-700 underline">
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        {hotline.number}
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Actions>
          <SecondaryBtn onClick={prev}>{t.back}</SecondaryBtn>
          <PrimaryBtn onClick={next}>{t.continue}</PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step3({
  data,
  set,
  t,
  next,
  prev,
  lang,
  catalog,
  catalogLoading,
  catalogError,
  onRetryCatalog,
  onSelectPsychologist,
  onClearPsychologist,
}: {
  data: BookingFormData
  set: SetFn
  t: TFn
  next: () => void
  prev: () => void
  lang: BookingLang
  catalog: BookingPsychologistCatalogItem[]
  catalogLoading: boolean
  catalogError: string | null
  onRetryCatalog: () => void
  onSelectPsychologist: (meta: SelectedPsychologistMeta | null) => void
  onClearPsychologist: () => void
}) {
  const isNewClient = data.clientStatus === 'new'
  const branches: {
    value: BookingPhysicalBranch
    name: string
    address: string
    mapUrl: string
  }[] = [
    {
      value: 'tbi',
      name: BOOKING_BRANCH_LABELS[lang].tbi,
      address: 'Jl. Teratai IV Blok C No. 4, Kompleks Perumahan Tanjung Barat Indah, Jakarta Selatan.',
      mapUrl: 'https://maps.app.goo.gl/S4c64p9QjU8YdyVv5',
    },
    {
      value: 'bsd',
      name: BOOKING_BRANCH_LABELS[lang].bsd,
      address: 'Delrey BizTown BSD Unit B8–9 Lt. 2, Jl. Lkr Botanika Utara, Lengkong Kulon, Pagedangan, Kabupaten Tangerang.',
      mapUrl: 'https://maps.app.goo.gl/Sc3KTubKtNBaa1EK8',
    },
    {
      value: 'malang',
      name: BOOKING_BRANCH_LABELS[lang].malang,
      address: 'Grand Arumba B17, Jl. Grand Arumba Blk. B No.17, Tunggulwulung, Lowokwaru, Kota Malang, Jawa Timur.',
      mapUrl: 'https://maps.app.goo.gl/CtYY4S8BeSfk2DZe6',
    },
  ]

  return (
    <>
      <StepHeader eyebrow={t.sessionPref} title={t.sessionTitle} lead={t.sessionLead} />
      <StepBody>
        <div className="mt-5">
          <span className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
            {t.method} <span className="text-[#d8a74d] font-black">*</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RadioChoice
              name="mode"
              value="online"
              checked={data.mode === 'online'}
              onChange={(v) => {
                set('mode', v as BookingConsultationMode)
                set('location', '')
                onClearPsychologist()
              }}
              title="Online"
              desc={t.onlineDesc}
            />
            <RadioChoice
              name="mode"
              value="offline"
              checked={data.mode === 'offline'}
              onChange={(v) => {
                set('mode', v as BookingConsultationMode)
                onClearPsychologist()
              }}
              title="Offline"
              desc={t.offlineDesc}
            />
          </div>
        </div>

        {data.mode === 'offline' && (
          <div className="mt-4">
            <span className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
              {t.chooseLocation} <span className="text-[#d8a74d] font-black">*</span>
            </span>
            <div className="space-y-2">
              {branches.map((loc) => {
                const active = data.location === loc.value
                return (
                  <motion.div
                    key={loc.value}
                    whileHover={{ y: -1 }}
                    transition={INTERACTIVE_SPRING}
                    className={`rounded-[14px] p-3.5 border transition-colors ${
                      active
                        ? 'border-[#d8a74d] bg-[#fffcf4] shadow-[0_0_0_2px_rgba(216,167,77,.12)]'
                        : 'border-[#e2ddd4] bg-[#f6f5f1] hover:border-[#c9c1b3]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        set('location', loc.value)
                        onClearPsychologist()
                      }}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-[13px] text-[#1c2b51]">{loc.name}</strong>
                          <p className="mt-0.5 text-[12.5px] text-[#59616c] leading-relaxed">{loc.address}</p>
                        </div>
                        {active && (
                          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#d8a74d] flex items-center justify-center text-white text-[11px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[12px] text-[#b47f1f] font-bold hover:underline"
                    >
                      <span>Maps</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-7 mb-3 text-xs uppercase tracking-[.09em] font-extrabold text-[#1c2b51]">
          {t.psychologist}
        </div>

        <div className="p-4 rounded-2xl bg-[#f8f2e5] border border-[#ead8ae]">
          <span className="inline-block mb-2 px-2 py-1 rounded-full bg-[#d8a74d] text-[#1c2b51] text-[10px] font-black tracking-[.08em] uppercase">
            {t.recommended}
          </span>
          <h3 className="text-[#1c2b51] text-[15px] font-bold">{t.matchingTitle}</h3>
          <p className="mt-1.5 text-[#666057] text-[13px] leading-relaxed">{t.matchingText}</p>
        </div>

        <div className="mt-5">
          <span className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
            {t.psychChoice} <span className="text-[#d8a74d] font-black">*</span>
          </span>
          <div className="space-y-3">
            <RadioChoice
              name="psych"
              value="recommended"
              checked={data.psychChoice === 'recommended'}
              onChange={(v) => {
                set('psychChoice', v as BookingPsychologistChoice)
                onClearPsychologist()
              }}
              title={t.matchMe}
              desc={t.matchMeDesc}
            />
            <RadioChoice
              name="psych"
              value="previous"
              checked={data.psychChoice === 'previous'}
              onChange={(v) => {
                set('psychChoice', v as BookingPsychologistChoice)
                onClearPsychologist()
              }}
              title={t.previousPsych}
              desc={t.previousPsychDesc}
              hidden={data.clientStatus !== 'returning'}
            />
            <RadioChoice
              name="psych"
              value="self"
              checked={data.psychChoice === 'self'}
              onChange={(v) => {
                set('psychChoice', v as BookingPsychologistChoice)
                onClearPsychologist()
              }}
              title={t.chooseMyself}
              desc={t.chooseMyselfDesc}
            />
          </div>
        </div>

        {data.psychChoice === 'previous' && (
          <div className="mt-4">
            <FormField id="previous-psychologist" label={t.previousPsychSelect} required>
              <SelectInput
                id="previous-psychologist"
                value={data.psychologist}
                onChange={(v) => {
                  const p = catalog.find((ps) => ps.id === v)
                  if (!p) {
                    onSelectPsychologist(null)
                    return
                  }
                  const rate = (data.mode === 'offline' ? p.offlineRate : p.onlineRate) ?? 0
                  onSelectPsychologist({
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    rate,
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
                }}
                options={[
                  { value: '', label: catalogLoading ? t.loadingPsychologists : t.previousPsychSelect },
                  ...catalog.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </FormField>
          </div>
        )}

        {data.psychChoice === 'self' && (
          <>
            {isNewClient && (
              <div className="mt-4 p-3.5 rounded-[14px] bg-[#fef3c7] border border-[#f0d580] text-[13px] text-[#92710a] leading-relaxed">
                {t.assessmentBanner}
              </div>
            )}
            <PsychologistPicker
              lang={lang}
              mode={data.mode}
              psychologists={catalog}
              loading={catalogLoading}
              loadError={catalogError}
              onRetry={onRetryCatalog}
              selectedId={data.psychologist}
              selectedSlug={data.psychologistSlug}
              onSelect={onSelectPsychologist}
              isNewClient={isNewClient}
              concernId={data.concern}
              clientCategory={data.clientCategory}
              genderPreference={data.genderPreference}
            />
          </>
        )}

        <Actions>
          <SecondaryBtn onClick={prev}>{t.back}</SecondaryBtn>
          <PrimaryBtn onClick={next}>{t.continue}</PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step4({ data, set, t, next, prev, lang }: { data: BookingFormData; set: SetFn; t: TFn; next: () => void; prev: () => void; lang: BookingLang }) {
  const minDateISO = useMemo(() => getEarliestBookingDateWib(), [])

  const rawSchedule = useMemo(() => {
    if (!data.psychologist) return undefined
    return buildWeekSchedule(
      data.psychScheduleMon,
      data.psychScheduleTue,
      data.psychScheduleWed,
      data.psychScheduleThu,
      data.psychScheduleFri,
      data.psychScheduleSat,
      data.psychScheduleSun,
    )
  }, [
    data.psychologist,
    data.psychScheduleMon,
    data.psychScheduleTue,
    data.psychScheduleWed,
    data.psychScheduleThu,
    data.psychScheduleFri,
    data.psychScheduleSat,
    data.psychScheduleSun,
  ])

  const schedule = useMemo(() => {
    if (!rawSchedule) return undefined
    return filterScheduleByLocation(rawSchedule, data.mode, data.location)
  }, [rawSchedule, data.mode, data.location])

  const gmtOffset = getGmtOffset(data.cityRegion)
  const cityLabel = getCityLabel(data.cityRegion, lang)

  const scheduleBlock = (
    idPrefix: string,
    label: string,
    required: boolean,
    dateKey: 'date1' | 'date2' | 'date3',
    timeKey: 'time1' | 'time2' | 'time3',
  ) => (
    <div className="mt-3 border border-[#e1dbd0] bg-white rounded-[15px] p-4">
      <div className="text-[#1c2b51] text-[13px] font-extrabold mb-2.5">
        {label} {required && <span className="text-[#d8a74d] font-black">*</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <BrandDatePicker
          id={`${idPrefix}-date`}
          value={data[dateKey]}
          onChange={(v) => {
            set(dateKey, v)
            set(timeKey, '')
          }}
          lang={lang}
          minDate={minDateISO}
          schedule={schedule}
        />
        <TimePicker
          id={`${idPrefix}-time`}
          date={data[dateKey]}
          value={data[timeKey]}
          onChange={(v) => set(timeKey, v)}
          placeholder={t.selectTime}
          lang={lang}
          schedule={schedule}
          gmtOffset={gmtOffset}
        />
      </div>
    </div>
  )

  return (
    <>
      <StepHeader eyebrow={t.schedule} title={t.scheduleTitle} lead={t.scheduleLead} />
      <StepBody>
        {gmtOffset !== 7 && (
          <div className="p-3 rounded-xl bg-[#eef4f1] border border-[#d0e0d7] text-[12.5px] text-[#51665d] leading-relaxed">
            {t.localTimeNote}: <strong>{cityLabel}</strong>
          </div>
        )}
        {scheduleBlock('schedule-1', t.primaryChoice, true, 'date1', 'time1')}
        {scheduleBlock('schedule-2', t.secondChoice, false, 'date2', 'time2')}
        {scheduleBlock('schedule-3', t.thirdChoice, false, 'date3', 'time3')}
        <Note>{t.scheduleNote}</Note>
        <Actions>
          <SecondaryBtn onClick={prev}>{t.back}</SecondaryBtn>
          <PrimaryBtn onClick={next}>{t.continue}</PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step5({ data, set, t, lang, reviewAndGo, prev }: { data: BookingFormData; set: SetFn; t: TFn; lang: BookingLang; reviewAndGo: () => void; prev: () => void }) {
  const sections = TERMS_CONTENT[lang]
  return (
    <>
      <StepHeader eyebrow={t.beforeSubmit} title={t.termsTitle} lead={t.termsLead} />
      <StepBody>
        <div className="max-h-[320px] overflow-auto border border-[#e1dbd0] rounded-[15px] p-4 bg-white text-[#555e68] text-[12.5px] leading-[1.62] space-y-3">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-[#1c2b51] text-[13px] font-bold mb-1">{section.heading}</h3>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
        <label className="flex items-start gap-2.5 mt-4 p-3.5 rounded-[13px] bg-[#f8f5ee] border border-[#e4ddd1] cursor-pointer">
          <input
            type="checkbox"
            checked={data.agree}
            onChange={(e) => set('agree', e.target.checked)}
            className="w-[18px] h-[18px] mt-0.5 accent-[#d8a74d] shrink-0"
          />
          <span className="text-[13px] leading-relaxed font-semibold text-[#1c2b51]">{t.agreeTerms}</span>
        </label>
        <Actions>
          <SecondaryBtn onClick={prev}>{t.back}</SecondaryBtn>
          <PrimaryBtn onClick={reviewAndGo}>{t.reviewBooking}</PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step6({
  data,
  set,
  t,
  lang,
  prev,
  submit,
  submitting,
  concernLabel,
  psychLabel,
  locationLabel,
  cityLabel,
  fmtSchedule,
  isNewClient,
}: {
  data: BookingFormData
  set: SetFn
  t: TFn
  lang: BookingLang
  prev: () => void
  submit: () => void
  submitting: boolean
  concernLabel: string
  psychLabel: string
  locationLabel: string
  cityLabel: string
  fmtSchedule: (d: string, ti: string) => string
  isNewClient: boolean
}) {
  const baseRate = data.psychologistRate || 0
  const assessmentFee = isNewClient && baseRate > 0 ? BOOKING_ASSESSMENT_FEE : 0
  const totalRate = baseRate + assessmentFee
  const countryLabel =
    COUNTRIES.find((c) => c.value === data.country)?.[lang === 'en' ? 'labelEn' : 'labelId'] ?? data.country

  const rows: [string, string][] = [
    [t.summaryStatus, data.clientStatus === 'new' ? t.statusNew : t.statusReturning],
    [t.summaryName, data.name],
    [t.summaryWhatsapp, data.whatsapp],
    [t.summaryEmail, data.email],
    [t.summaryCountryCity, `${countryLabel || '—'} / ${cityLabel || '—'}`],
    [t.summaryConcern, data.clientStatus === 'new' ? concernLabel : t.previousData],
    [t.summaryMode, data.mode === 'online' ? 'Online' : 'Offline'],
    [t.summaryLocation, locationLabel],
    [t.summaryPsychologist, psychLabel],
    [t.summarySchedule1, fmtSchedule(data.date1, data.time1)],
    [t.summarySchedule2, fmtSchedule(data.date2, data.time2)],
    [t.summarySchedule3, fmtSchedule(data.date3, data.time3)],
  ]

  const priceRows: [string, string][] =
    baseRate > 0
      ? [
          [t.summaryPsychRate, formatCurrency(baseRate)],
          ...(isNewClient ? [[t.summaryAssessment, formatCurrency(assessmentFee)] as [string, string]] : []),
          [t.summaryTotal, formatCurrency(totalRate)],
        ]
      : []

  const isFriendSource = data.marketingSource === 'Rekomendasi Teman / Keluarga'

  return (
    <>
      <StepHeader eyebrow={t.almostDone} title={t.reviewTitle} lead={t.reviewLead} />
      <StepBody>
        <div className="border border-[#e1dbd0] rounded-[15px] overflow-hidden bg-white">
          {rows.map(([label, val]) => (
            <div
              key={label}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-3.5 py-3 border-b border-[#eee9e0] last:border-b-0 text-[13px]"
            >
              <b className="text-[#6f7884] font-bold">{label}</b>
              <span className="text-[#1c2b51] font-semibold">{val}</span>
            </div>
          ))}
        </div>

        {priceRows.length > 0 && (
          <div className="mt-4 border border-[#e1dbd0] rounded-[15px] overflow-hidden bg-white">
            <div className="px-3.5 py-2.5 bg-[#f8f5ee] border-b border-[#eee9e0]">
              <span className="text-[12px] uppercase tracking-[.08em] font-extrabold text-[#1c2b51]">
                {t.paymentBreakdownTitle}
              </span>
            </div>
            {priceRows.map(([label, val], i) => (
              <div
                key={label}
                className={`grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-3.5 py-3 border-b border-[#eee9e0] last:border-b-0 text-[13px] ${
                  i === priceRows.length - 1 ? 'bg-[#fdf8ed]' : ''
                }`}
              >
                <b className="text-[#6f7884] font-bold">{label}</b>
                <span
                  className={`font-semibold tabular-nums ${
                    i === priceRows.length - 1 ? 'text-[#b47f1f] font-extrabold' : 'text-[#1c2b51]'
                  }`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <span className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
            {t.marketingSourceLabel} <span className="text-[#d8a74d] font-black">*</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BOOKING_MARKETING_SOURCES.map((source) => {
              const active = data.marketingSource === source
              return (
                <motion.button
                  key={source}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={INTERACTIVE_SPRING}
                  onClick={() => {
                    set('marketingSource', source)
                    if (source !== 'Rekomendasi Teman / Keluarga') set('referrer', '')
                  }}
                  className={`px-3 py-2 rounded-xl text-[12.5px] font-bold border transition-colors cursor-pointer ${
                    active
                      ? 'border-[#d8a74d] bg-[#fffcf4] text-[#1c2b51] shadow-xs'
                      : 'border-[#e1dbd0] bg-white text-[#6f7884] hover:border-[#c5bfb3]'
                  }`}
                >
                  {source}
                </motion.button>
              )
            })}
          </div>
        </div>

        {isFriendSource && (
          <FormField id="booking-referrer" label={t.referrerNameLabel}>
            <TextInput
              id="booking-referrer"
              value={data.referrer}
              onChange={(v) => set('referrer', v)}
              placeholder={t.referrerNamePh}
            />
          </FormField>
        )}

        <Note>{t.afterSubmitNote}</Note>
        <Actions>
          <SecondaryBtn onClick={prev}>{t.back}</SecondaryBtn>
          <PrimaryBtn onClick={submit} disabled={submitting}>
            {submitting ? t.submitting : t.submitBooking}
          </PrimaryBtn>
        </Actions>
      </StepBody>
    </>
  )
}

function Step7({
  t,
  bookingCode,
  waUrl,
  onReset,
}: {
  t: TFn
  bookingCode: string
  waUrl: string
  onReset: () => void
}) {
  return (
    <>
      <div className="border-t-[5px] border-[#d8a74d] px-5 sm:px-8 pt-4" />
      <StepBody>
        <div className="text-center py-6 px-2">
          <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full grid place-items-center bg-[#f6edda] text-[#d8a74d] border border-[#e6d1a2]">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>
          <div className="text-[#d8a74d] text-[11px] uppercase tracking-[.15em] font-extrabold mb-2">
            {t.bookingReceived}
          </div>
          <h2 className="text-[#1c2b51] text-2xl sm:text-[28px] font-bold tracking-[-0.7px]">{t.thankYou}</h2>

          {bookingCode && (
            <div className="mt-4 inline-flex flex-col items-center rounded-xl bg-[#f8f5ee] border border-[#e1dbd0] px-5 py-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#6f7884]">
                {t.bookingCodeLabel}
              </span>
              <span className="text-[18px] font-extrabold tracking-wide text-[#1c2b51] font-mono">
                {bookingCode}
              </span>
            </div>
          )}

          <p className="mt-4 max-w-[530px] mx-auto text-[#6f7884] text-[14.5px] leading-[1.7]">{t.successLead}</p>
          <div className="max-w-[520px] mx-auto mt-5 rounded-[13px] p-3.5 bg-[#eef4f1] text-[#51665d] text-[13px] leading-relaxed">
            {t.successNote}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={INTERACTIVE_SPRING}
              className="inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-extrabold text-[13.5px] bg-[#1c2b51] text-white shadow-sm"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>{t.openWhatsAppCta}</span>
            </motion.a>
            <SecondaryBtn onClick={onReset}>{t.bookAnotherCta}</SecondaryBtn>
          </div>
        </div>
      </StepBody>
    </>
  )
}
