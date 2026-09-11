import { useState, useEffect, useId, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Check, AlertTriangle, Phone, ArrowLeft, Send } from 'lucide-react'
import {
  INTAKE_CONCERNS,
  type IntakeConcernId,
  type IntakeSessionFormat,
  type IntakeGenderPreference,
  type IntakeClientCategory,
  type IntakeSubmissionData,
  matchPsychologists,
  detectCrisisKeywords,
  EMERGENCY_CRISIS_HOTLINES,
  generateIntakeWhatsAppUrl,
} from '@attentiveid/shared'
import { psychologists } from '@/data/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export interface ConsultationIntakeModalProps {
  isOpen: boolean
  onClose: () => void
  initialConcernId?: IntakeConcernId
  initialPsychologistId?: string
}

export function ConsultationIntakeModal({
  isOpen,
  onClose,
  initialConcernId,
  initialPsychologistId,
}: ConsultationIntakeModalProps) {
  const { t, i18n } = useTranslation()
  const currentLang = (i18n.language?.startsWith('en') ? 'en' : 'id') as 'id' | 'en'
  const titleId = useId()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [concernId, setConcernId] = useState<IntakeConcernId>(initialConcernId || 'anxiety_mood')
  const [format, setFormat] = useState<IntakeSessionFormat>('online')
  const [genderPreference, setGenderPreference] = useState<IntakeGenderPreference>('any')
  const [clientCategory, setClientCategory] = useState<IntakeClientCategory>('individual')
  const [isCrisisManual, setIsCrisisManual] = useState(false)

  // Step 2 Form
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [problemDescription, setProblemDescription] = useState('')

  // Step 3 Matched Psychologist Selection
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(
    initialPsychologistId || null
  )
  const [consent, setConsent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Dynamic matched psychologists (Curated top 3)
  const matchedResults = useMemo(() => {
    return matchPsychologists(
      {
        concernId,
        genderPreference,
        clientCategory,
      },
      psychologists,
      { maxResults: 3 }
    )
  }, [concernId, genderPreference, clientCategory])

  // Effective selected psychologist
  const effectivePsychologistId = selectedPsychologistId || (matchedResults.length > 0 ? matchedResults[0].psychologist.id : null)

  // Effective crisis status
  const isCrisisDetected = useMemo(() => {
    return detectCrisisKeywords(problemDescription).isCrisisDetected
  }, [problemDescription])

  const effectiveIsCrisis = isCrisisManual || isCrisisDetected

  if (!isOpen) return null

  const handleStep1Next = () => {
    setErrorMsg(null)
    if (!concernId) {
      setErrorMsg(t('intakeDialog.errorConcern'))
      return
    }
    setStep(2)
  }

  const handleStep2Next = () => {
    setErrorMsg(null)
    if (!name.trim()) {
      setErrorMsg(t('intakeDialog.errorName'))
      return
    }
    const cleanDigits = whatsapp.replace(/\D/g, '')
    if (cleanDigits.length < 9) {
      setErrorMsg(t('intakeDialog.errorWa'))
      return
    }
    setStep(3)
  }

  const handleOpenWhatsApp = () => {
    setErrorMsg(null)
    if (!consent) {
      setErrorMsg(t('intakeDialog.errorConsent'))
      return
    }

    const selectedPsychologist = psychologists.find((p) => p.id === effectivePsychologistId)
    const psychologistName = selectedPsychologist
      ? `${selectedPsychologist.name}, ${selectedPsychologist.title}`
      : effectivePsychologistId === 'admin_choice'
        ? currentLang === 'id'
          ? 'Rekomendasi Terbaik Admin'
          : 'Best Admin Match'
        : undefined

    const submissionData: IntakeSubmissionData = {
      concernId,
      format,
      genderPreference,
      clientCategory,
      name,
      whatsapp,
      preferredDate,
      problemDescription,
      selectedPsychologistId: effectivePsychologistId,
      selectedPsychologistName: psychologistName,
      isCrisis: effectiveIsCrisis,
      consent,
    }

    const waUrl = generateIntakeWhatsAppUrl(submissionData, currentLang)
    window.open(waUrl, '_blank', 'noopener')
    onClose()
  }

  // Get tomorrow's date string for min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDateString = tomorrow.toISOString().split('T')[0]

  const activeConcern = INTAKE_CONCERNS.find((c) => c.id === concernId)
  const selectedPsychologist = psychologists.find((p) => p.id === effectivePsychologistId)

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden text-secondary"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={INTERACTIVE_SPRING}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/10 bg-surface">
            <div>
              <h2 id={titleId} className="text-xl font-bold tracking-tight text-secondary">
                {t('intakeDialog.title')}
              </h2>
              <p className="text-xs text-secondary/70">{t('intakeDialog.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Bilingual Switcher */}
              <div className="flex items-center rounded-full bg-secondary/5 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('id')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    currentLang === 'id' ? 'bg-primary text-secondary font-bold shadow-sm' : 'text-secondary/70 hover:text-secondary'
                  }`}
                  aria-pressed={currentLang === 'id'}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    currentLang === 'en' ? 'bg-primary text-secondary font-bold shadow-sm' : 'text-secondary/70 hover:text-secondary'
                  }`}
                  aria-pressed={currentLang === 'en'}
                >
                  EN
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label={t('intakeDialog.close')}
                className="p-1.5 rounded-full text-secondary/60 hover:text-secondary hover:bg-secondary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center border-b border-secondary/10 px-6 py-2.5 bg-[#fbf9f5] text-xs font-medium gap-2 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded ${
                step === 1 ? 'text-secondary font-bold' : step > 1 ? 'text-secondary/70 hover:text-secondary' : 'text-secondary/40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                  step === 1 ? 'bg-primary text-secondary' : step > 1 ? 'bg-secondary/10 text-secondary' : 'bg-secondary/5 text-secondary/40'
                }`}
              >
                {step > 1 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '1'}
              </span>
              <span>{t('intakeDialog.stepNeed')}</span>
            </button>
            <span className="text-secondary/20">/</span>
            <button
              type="button"
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded ${
                step === 2 ? 'text-secondary font-bold' : step > 2 ? 'text-secondary/70 hover:text-secondary' : 'text-secondary/40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                  step === 2 ? 'bg-primary text-secondary' : step > 2 ? 'bg-secondary/10 text-secondary' : 'bg-secondary/5 text-secondary/40'
                }`}
              >
                {step > 2 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '2'}
              </span>
              <span>{t('intakeDialog.stepDetails')}</span>
            </button>
            <span className="text-secondary/20">/</span>
            <span
              className={`flex items-center gap-1.5 whitespace-nowrap ${
                step === 3 ? 'text-secondary font-bold' : 'text-secondary/40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                  step === 3 ? 'bg-primary text-secondary' : 'bg-secondary/5 text-secondary/40'
                }`}
              >
                3
              </span>
              <span>{t('intakeDialog.stepReview')}</span>
            </span>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* STEP 1: Kebutuhan & Pilihan Sesi */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={INTERACTIVE_SPRING}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary">{t('intakeDialog.step1Title')}</h3>
                  <p className="text-sm text-secondary/70 mt-1">{t('intakeDialog.step1Lead')}</p>
                </div>

                {/* Concern Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {INTAKE_CONCERNS.map((item) => {
                    const isSelected = concernId === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConcernId(item.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                            : 'border-secondary/15 hover:border-secondary/30 bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm text-secondary">{item.title[currentLang]}</p>
                          <p className="text-xs text-secondary/70 mt-1 leading-relaxed">{item.description[currentLang]}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Session Format & Gender Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-2">{t('intakeDialog.formatLabel')}</label>
                    <div className="space-y-1.5">
                      {(['online', 'offline', 'flexible'] as const).map((fmt) => (
                        <label
                          key={fmt}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            format === fmt ? 'border-primary bg-primary/5 font-semibold text-secondary' : 'border-secondary/10 hover:bg-secondary/5 text-secondary/80'
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={fmt}
                            checked={format === fmt}
                            onChange={() => setFormat(fmt)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{t(`intakeDialog.format${fmt.charAt(0).toUpperCase() + fmt.slice(1)}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary mb-2">{t('intakeDialog.genderPrefLabel')}</label>
                    <div className="space-y-1.5">
                      {(['any', 'female', 'male'] as const).map((g) => (
                        <label
                          key={g}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            genderPreference === g ? 'border-primary bg-primary/5 font-semibold text-secondary' : 'border-secondary/10 hover:bg-secondary/5 text-secondary/80'
                          }`}
                        >
                          <input
                            type="radio"
                            name="genderPreference"
                            value={g}
                            checked={genderPreference === g}
                            onChange={() => setGenderPreference(g)}
                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{t(`intakeDialog.gender${g.charAt(0).toUpperCase() + g.slice(1)}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crisis Safeguard Checkbox & Modal */}
                <div className="pt-2 border-t border-secondary/10">
                  <label className="flex items-start gap-2.5 text-xs text-secondary/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCrisisManual}
                      onChange={(e) => setIsCrisisManual(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-secondary/20 text-red-600 focus:ring-red-500"
                    />
                    <span>{t('intakeDialog.crisisCheckbox')}</span>
                  </label>

                  {effectiveIsCrisis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2.5"
                    >
                      <div className="flex items-center gap-2 font-bold text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{t('intakeDialog.crisisAlertTitle')}</span>
                      </div>
                      <p className="text-red-800 leading-relaxed">{t('intakeDialog.crisisAlertLead')}</p>
                      <div className="space-y-1.5 pt-1">
                        {EMERGENCY_CRISIS_HOTLINES.map((hotline, idx) => (
                          <a
                            key={idx}
                            href={hotline.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-200 text-red-900 hover:bg-red-100 transition-colors font-medium"
                          >
                            <span>{hotline.name}</span>
                            <span className="flex items-center gap-1 font-bold text-red-700 underline">
                              <Phone className="w-3.5 h-3.5" />
                              {hotline.number}
                            </span>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Detail Diri & Konteks */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={INTERACTIVE_SPRING}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary">{t('intakeDialog.step2Title')}</h3>
                  <p className="text-sm text-secondary/70 mt-1">{t('intakeDialog.step2Lead')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      {t('intakeDialog.nameLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('intakeDialog.namePlaceholder')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      {t('intakeDialog.waLabel')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder={t('intakeDialog.waPlaceholder')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    {t('intakeDialog.categoryLabel')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['individual', 'couple', 'child_teen', 'family'] as const).map((cat) => {
                      const isCatSelected = clientCategory === cat
                      const labelKey = `category${cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setClientCategory(cat)}
                          className={`px-3 py-2 text-xs rounded-lg border font-medium text-center transition-colors ${
                            isCatSelected
                              ? 'border-primary bg-primary text-secondary font-bold shadow-sm'
                              : 'border-secondary/15 hover:bg-secondary/5 text-secondary/80 bg-white'
                          }`}
                        >
                          {t(`intakeDialog.${labelKey}`)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    {t('intakeDialog.dateLabel')}
                  </label>
                  <input
                    type="date"
                    min={minDateString}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    {t('intakeDialog.problemLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder={t('intakeDialog.problemPlaceholder')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Rekomendasi Psikolog & Konfirmasi */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={INTERACTIVE_SPRING}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-secondary">{t('intakeDialog.step3Title')}</h3>
                  <p className="text-sm text-secondary/70 mt-1">{t('intakeDialog.step3Lead')}</p>
                </div>

                {effectiveIsCrisis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('intakeDialog.crisisAlertTitle')}</span>
                    </div>
                    <p className="text-red-800 leading-relaxed">{t('intakeDialog.crisisAlertLead')}</p>
                    <div className="space-y-1.5 pt-1">
                      {EMERGENCY_CRISIS_HOTLINES.map((hotline, idx) => (
                        <a
                          key={idx}
                          href={hotline.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-200 text-red-900 hover:bg-red-100 transition-colors font-medium"
                        >
                          <span>{hotline.name}</span>
                          <span className="flex items-center gap-1 font-bold text-red-700 underline">
                            <Phone className="w-3.5 h-3.5" />
                            {hotline.number}
                          </span>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Curated >1 Matched Psychologist Options */}
                <div>
                  <p className="text-xs font-bold text-secondary mb-3 flex items-center gap-1.5">
                    <span>{t('intakeDialog.recommendationTitle')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-secondary font-bold">
                      {matchedResults.length} {t('intakeDialog.matchScoreBadge')}
                    </span>
                  </p>

                  <div className="space-y-2">
                    {matchedResults.map(({ psychologist, matchReasons }) => {
                      const isChosen = effectivePsychologistId === psychologist.id
                      return (
                        <button
                          type="button"
                          key={psychologist.id}
                          onClick={() => setSelectedPsychologistId(psychologist.id)}
                          className={`w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all text-left ${
                            isChosen
                              ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                              : 'border-secondary/15 hover:border-secondary/30 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={psychologist.image}
                              alt={psychologist.name}
                              className="w-12 h-12 rounded-full object-cover border border-secondary/15 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-secondary">{psychologist.name}</span>
                                <span className="text-xs text-secondary/60">{psychologist.title}</span>
                              </div>
                              <p className="text-[11px] text-secondary/70 mt-0.5">
                                SIPP: {psychologist.sipp} · {psychologist.experience}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {matchReasons.map((reason, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/10 text-secondary font-medium"
                                  >
                                    {reason[currentLang]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isChosen ? 'border-primary bg-primary text-secondary' : 'border-secondary/30 bg-white'
                              }`}
                            >
                              {isChosen && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </button>
                      )
                    })}

                    {/* Admin help fallback option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPsychologistId('admin_choice')}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all text-left ${
                        effectivePsychologistId === 'admin_choice'
                          ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/30'
                          : 'border-secondary/15 hover:border-secondary/30 bg-white'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs text-secondary">{t('intakeDialog.adminMatchOption')}</p>
                        <p className="text-[11px] text-secondary/60 mt-0.5">{t('intakeDialog.adminMatchDesc')}</p>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            effectivePsychologistId === 'admin_choice'
                              ? 'border-primary bg-primary text-secondary'
                              : 'border-secondary/30 bg-white'
                          }`}
                        >
                          {effectivePsychologistId === 'admin_choice' && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Review Summary Box with Inline Edit Links */}
                <div className="rounded-xl border border-secondary/15 bg-secondary/[0.02] p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-secondary/10">
                    <span className="font-bold text-secondary">{t('intakeDialog.reviewSummaryTitle')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondary/60">{t('intakeDialog.reviewNeed')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary">{activeConcern?.title[currentLang]}</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-secondary hover:text-primary underline font-medium text-[11px] transition-colors"
                      >
                        {t('intakeDialog.editLink')}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondary/60">{t('intakeDialog.reviewFormat')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary">
                        {t(`intakeDialog.format${format.charAt(0).toUpperCase() + format.slice(1)}`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-secondary hover:text-primary underline font-medium text-[11px] transition-colors"
                      >
                        {t('intakeDialog.editLink')}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-secondary/60">{t('intakeDialog.reviewContact')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary">{name} ({whatsapp})</span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-secondary hover:text-primary underline font-medium text-[11px] transition-colors"
                      >
                        {t('intakeDialog.editLink')}
                      </button>
                    </div>
                  </div>

                  {preferredDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary/60">{t('intakeDialog.reviewDate')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-secondary">{preferredDate}</span>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-secondary hover:text-primary underline font-medium text-[11px] transition-colors"
                        >
                          {t('intakeDialog.editLink')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-secondary/60">{t('intakeDialog.reviewPsychologist')}:</span>
                    <span className="font-bold text-secondary">
                      {selectedPsychologist
                        ? `${selectedPsychologist.name}, ${selectedPsychologist.title}`
                        : t('intakeDialog.adminMatchOption')}
                    </span>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-secondary/80 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-secondary/20 text-primary focus:ring-primary"
                    required
                  />
                  <span className="leading-relaxed">{t('intakeDialog.consentLabel')}</span>
                </label>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-secondary/10 bg-[#fbf9f5] flex items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary/70 hover:text-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('intakeDialog.btnBack')}</span>
                </button>
              ) : (
                <span className="text-[11px] text-secondary/60 hidden sm:inline">
                  {t('intakeDialog.bookingNote')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="px-5 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                >
                  {t('intakeDialog.btnContinue')}
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="px-5 py-2.5 rounded-xl bg-primary text-secondary font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                >
                  {t('intakeDialog.btnReview')}
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('intakeDialog.btnSubmit')}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
