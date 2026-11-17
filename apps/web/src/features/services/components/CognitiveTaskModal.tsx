import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Play, RotateCcw, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classifyCognitiveTrial,
  COGNITIVE_TASK_DEFINITIONS,
  DEMO_FEEDBACK_MS,
  DEMO_GAP_MS,
  generateCognitiveTrials,
  getCognitiveReportImageUrl,
  nextSstStopSignalDelay,
  summarizeCognitiveTrials,
  type CognitiveTaskKey,
  type CognitiveTaskSummary,
  type CognitiveTrial,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'

const TASK_SEQUENCE: readonly CognitiveTaskKey[] = ['cpt', 'sst', 'nb', 'gng']

export interface CognitiveTaskModalProps {
  taskKey: CognitiveTaskKey | null
  locale: 'id' | 'en'
  onClose: () => void
  onSelectTask: (nextKey: CognitiveTaskKey) => void
  onComplete: (taskKey: CognitiveTaskKey, summary: CognitiveTaskSummary) => void
  onOpenReportZoom?: (url: string, caption: string) => void
}

type StagePhase = 'intro' | 'fixation' | 'stimulus' | 'mask' | 'feedback' | 'done'

export function CognitiveTaskModal(props: CognitiveTaskModalProps) {
  if (!props.taskKey) return null
  return <CognitiveTaskStage key={props.taskKey} {...props} taskKey={props.taskKey} />
}

interface CognitiveTaskStageProps extends CognitiveTaskModalProps {
  taskKey: CognitiveTaskKey
}

function CognitiveTaskStage({
  taskKey,
  locale,
  onClose,
  onSelectTask,
  onComplete,
  onOpenReportZoom,
}: CognitiveTaskStageProps) {
  const isEn = locale === 'en'
  const reduceMotion = useReducedMotion()

  const [phase, setPhase] = useState<StagePhase>('intro')
  const [trials, setTrials] = useState<CognitiveTrial[]>([])
  const [trialIndex, setTrialIndex] = useState(0)
  const [stopSignalVisible, setStopSignalVisible] = useState(false)
  const [stimulusHidden, setStimulusHidden] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<CognitiveTrial | null>(null)
  const [summary, setSummary] = useState<CognitiveTaskSummary | null>(null)

  const aliveRef = useRef(false)
  const responseOpenRef = useRef(false)
  const onsetRef = useRef<number>(0)
  const ssdRef = useRef<number>(200)
  const currentRespRef = useRef<{ resp: 'Space' | 'KeyF' | 'KeyJ'; rt: number } | null>(null)
  const resolveTrialRef = useRef<(() => void) | null>(null)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id)
    }
    timersRef.current = []
    if (resolveTrialRef.current) {
      const done = resolveTrialRef.current
      resolveTrialRef.current = null
      done()
    }
  }, [])

  const sleep = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      const id = window.setTimeout(resolve, ms)
      timersRef.current.push(id)
    })
  }, [])

  useEffect(() => {
    return () => {
      aliveRef.current = false
      clearTimers()
    }
  }, [clearTimers])

  const taskDef = COGNITIVE_TASK_DEFINITIONS[taskKey]

  const startPracticeRun = useCallback(async () => {
    if (!taskKey) return
    clearTimers()
    const generated = generateCognitiveTrials(taskKey)
    setTrials(generated)
    setTrialIndex(0)
    setSummary(null)
    setLastOutcome(null)
    ssdRef.current = 200
    aliveRef.current = true

    setPhase('fixation')
    await sleep(800)
    if (!aliveRef.current) return

    const completedTrials: CognitiveTrial[] = []

    for (let i = 0; i < generated.length; i++) {
      if (!aliveRef.current) return
      const current = generated[i]!
      setTrialIndex(i)
      setStopSignalVisible(false)
      setStimulusHidden(false)
      currentRespRef.current = null
      responseOpenRef.current = true
      setPhase('stimulus')
      onsetRef.current = performance.now()

      if (taskKey === 'sst') {
        let stopTimer: number | null = null
        if (current.stop) {
          const stopDelay = ssdRef.current
          stopTimer = window.setTimeout(() => {
            if (aliveRef.current && !currentRespRef.current) {
              setStopSignalVisible(true)
            }
          }, stopDelay)
          timersRef.current.push(stopTimer)
        }
        await new Promise<void>((resolve) => {
          resolveTrialRef.current = resolve
          const winTimer = window.setTimeout(() => {
            resolveTrialRef.current = null
            resolve()
          }, current.win)
          timersRef.current.push(winTimer)
        })
        if (stopTimer !== null) window.clearTimeout(stopTimer)
        if (current.stop) {
          ssdRef.current = nextSstStopSignalDelay(ssdRef.current, Boolean(currentRespRef.current))
        }
      } else {
        const hideTimer = window.setTimeout(() => {
          if (aliveRef.current) setStimulusHidden(true)
        }, current.dur)
        timersRef.current.push(hideTimer)
        await sleep(current.win)
        window.clearTimeout(hideTimer)
      }

      if (!aliveRef.current) return
      responseOpenRef.current = false

      const captured = currentRespRef.current as { resp: 'Space' | 'KeyF' | 'KeyJ'; rt: number } | null
      const classified = classifyCognitiveTrial(taskKey, {
        ...current,
        resp: captured?.resp ?? null,
        rt: captured?.rt ?? null,
      })
      completedTrials.push(classified)
      setLastOutcome(classified)
      setPhase('feedback')
      await sleep(classified.outcome === 'init' ? 250 : DEMO_FEEDBACK_MS)
      if (!aliveRef.current) return

      setPhase('fixation')
      await sleep(taskKey === 'sst' ? (current.iti ?? 450) : DEMO_GAP_MS)
    }

    if (!aliveRef.current) return
    const resultSummary = summarizeCognitiveTrials(completedTrials)
    setTrials(completedTrials)
    setSummary(resultSummary)
    setPhase('done')
    onComplete(taskKey, resultSummary)
  }, [taskKey, clearTimers, sleep, onComplete])

  const recordResponse = useCallback(
    (code: 'Space' | 'KeyF' | 'KeyJ') => {
      if (!taskKey || !responseOpenRef.current || currentRespRef.current !== null) return
      const isSst = taskKey === 'sst'
      if (isSst && code === 'Space') return
      if (!isSst && code !== 'Space') return

      const rt = Math.max(0, Math.round(performance.now() - onsetRef.current))
      currentRespRef.current = { resp: code, rt }
      responseOpenRef.current = false

      if (isSst && resolveTrialRef.current) {
        const finishEarly = resolveTrialRef.current
        resolveTrialRef.current = null
        finishEarly()
      }
    },
    [taskKey],
  )

  useEffect(() => {
    if (!taskKey) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (phase !== 'stimulus') return
      if (event.repeat) return
      const mapped =
        event.code === 'Space' || event.key === ' '
          ? 'Space'
          : event.code === 'KeyF' || event.key.toLowerCase() === 'f'
            ? 'KeyF'
            : event.code === 'KeyJ' || event.key.toLowerCase() === 'j'
              ? 'KeyJ'
              : null
      if (!mapped) return
      if ((taskKey === 'sst') !== (mapped !== 'Space')) return
      event.preventDefault()
      recordResponse(mapped)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [taskKey, phase, onClose, recordResponse])

  const feedbackMeta = useMemo(() => {
    if (!lastOutcome || lastOutcome.outcome === 'init') return null
    const labels: Record<string, { tone: 'ok' | 'no' | 'neutral'; id: string; en: string }> = {
      hit: { tone: 'ok', id: 'Tepat', en: 'Correct' },
      correct_rejection: { tone: 'ok', id: 'Benar, tidak ditekan', en: 'Right, no press' },
      miss: { tone: 'no', id: 'Terlewat, seharusnya ditekan', en: 'Missed, you should have pressed' },
      false_alarm: { tone: 'no', id: 'Seharusnya tidak ditekan', en: 'You should not have pressed' },
      anticipatory: { tone: 'neutral', id: 'Terlalu cepat, tunggu sampai muncul', en: 'Too early, wait until it appears' },
      go_correct: { tone: 'ok', id: 'Tepat', en: 'Correct' },
      go_wrong_key: { tone: 'no', id: 'Arah tombolnya salah', en: 'Wrong direction key' },
      go_omission: { tone: 'neutral', id: 'Terlalu lambat, coba lebih cepat', en: 'Too slow, try to be quicker' },
      stop_success: { tone: 'ok', id: 'Berhasil ditahan', en: 'Stopped in time' },
      stop_fail: {
        tone: 'neutral',
        id: 'Tidak sempat ditahan. Wajar, tetap cepat ya',
        en: "Didn't stop in time. That's normal, keep going fast",
      },
    }
    return labels[lastOutcome.outcome ?? ''] ?? null
  }, [lastOutcome])

  if (!taskKey || !taskDef) return null

  const activeTrial = trials[trialIndex]
  const nextTaskKey = TASK_SEQUENCE[TASK_SEQUENCE.indexOf(taskKey) + 1] ?? null
  const nextTaskDef = nextTaskKey ? COGNITIVE_TASK_DEFINITIONS[nextTaskKey] : null
  const progressPct = phase === 'done' ? 100 : trials.length > 0 ? Math.round((trialIndex / trials.length) * 100) : 0
  const sampleReportUrl = getCognitiveReportImageUrl(taskDef.reportKey, locale)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? taskDef.name[1] : taskDef.name[0]}
      className="fixed inset-0 z-50 flex flex-col bg-[#0d1f3d] text-[#f5edd4]"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#f5edd4]/15 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#d6a74d]/20 px-3 py-1 text-xs font-extrabold text-[#d6a74d]">
            {isEn ? taskDef.name[1] : taskDef.name[0]}
          </span>
          {(phase === 'fixation' || phase === 'stimulus' || phase === 'feedback') && trials.length > 0 && (
            <span className="text-xs font-bold tabular-nums text-[#f5edd4]/80">
              {trialIndex + 1}/{trials.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#f5edd4]/20 px-3 py-1.5 text-xs font-bold text-[#f5edd4] hover:bg-[#f5edd4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isEn ? 'Exit' : 'Keluar'}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-[#142b51]">
        <div
          className="h-full bg-[#d6a74d] transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Interactive Stage Body */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        {phase === 'intro' && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={INTERACTIVE_SPRING}
            className="w-full max-w-lg rounded-2xl border border-[#f5edd4]/15 bg-[#142b51] p-6 shadow-2xl"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#d6a74d]">
              {isEn ? taskDef.domain[1] : taskDef.domain[0]}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#f5edd4]">
              {isEn ? taskDef.name[1] : taskDef.name[0]}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#f5edd4]/90">
              {taskDef.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d6a74d]/20 text-[11px] font-bold text-[#d6a74d]">
                    {idx + 1}
                  </span>
                  <span>{isEn ? rule[1] : rule[0]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl border border-[#f5edd4]/15 bg-[#0d1f3d] px-3.5 py-2.5 text-xs text-[#f5edd4]/80">
              {isEn
                ? '30-second practice only. Nothing is saved or transmitted to our servers.'
                : 'Latihan singkat ~30 detik. Tidak ada data yang disimpan atau dikirim ke server.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void startPracticeRun()}
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d6a74d] px-5 py-2.5 text-sm font-extrabold text-[#142b51] hover:bg-[#e2b65d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5edd4]"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{isEn ? 'Start Practice' : 'Mulai Latihan'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-[#f5edd4]/25 px-4 py-2.5 text-sm font-bold text-[#f5edd4] hover:bg-[#f5edd4]/10"
              >
                {isEn ? 'Back' : 'Kembali'}
              </button>
            </div>
          </motion.div>
        )}

        {(phase === 'fixation' || phase === 'stimulus' || phase === 'feedback') && (
          <div className="flex w-full max-w-xl flex-col items-center gap-6">
            {/* Stimulus Canvas */}
            <div
              onPointerDown={(e) => {
                if (phase !== 'stimulus') return
                e.preventDefault()
                if (taskKey === 'sst') {
                  recordResponse(e.clientX < window.innerWidth / 2 ? 'KeyF' : 'KeyJ')
                } else {
                  recordResponse('Space')
                }
              }}
              className="flex h-64 w-full max-w-md select-none items-center justify-center rounded-3xl border border-[#f5edd4]/15 bg-[#142b51] shadow-2xl"
            >
              {phase === 'fixation' && (
                <span className="text-4xl font-light text-[#f5edd4]/40" aria-hidden="true">
                  +
                </span>
              )}

              {phase === 'stimulus' && (
                <>
                  {(taskKey === 'cpt' || taskKey === 'nb') && !stimulusHidden && activeTrial?.stim && (
                    <span className="text-7xl font-black tracking-tight text-[#f5edd4]">
                      {activeTrial.stim}
                    </span>
                  )}

                  {taskKey === 'gng' && !stimulusHidden && (
                    activeTrial?.target ? (
                      <div className="h-24 w-24 rounded-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]" />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.4)]" />
                    )
                  )}

                  {taskKey === 'sst' && activeTrial?.dir && (
                    <div
                      className={`flex h-28 w-28 items-center justify-center rounded-full border-8 transition-colors ${
                        stopSignalVisible
                          ? 'border-red-500 bg-red-500/15'
                          : 'border-[#f5edd4]/30 bg-transparent'
                      }`}
                    >
                      {activeTrial.dir === 'L' ? (
                        <ArrowLeft className="h-12 w-12 text-[#f5edd4]" strokeWidth={3} />
                      ) : (
                        <ArrowRight className="h-12 w-12 text-[#f5edd4]" strokeWidth={3} />
                      )}
                    </div>
                  )}

                  {stimulusHidden && (
                    <span className="text-4xl font-light text-[#f5edd4]/25" aria-hidden="true">
                      +
                    </span>
                  )}
                </>
              )}

              {phase === 'feedback' && feedbackMeta && (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold ${
                    feedbackMeta.tone === 'ok'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : feedbackMeta.tone === 'no'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-400/20 text-amber-200'
                  }`}
                >
                  {feedbackMeta.tone === 'ok' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {feedbackMeta.tone === 'no' && <XCircle className="h-4 w-4 shrink-0" />}
                  <span>{isEn ? feedbackMeta.en : feedbackMeta.id}</span>
                </div>
              )}
            </div>

            {/* Interactive Touch / Key Controls */}
            {taskKey === 'sst' ? (
              <div className="grid w-full max-w-md grid-cols-2 gap-3">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    recordResponse('KeyF')
                  }}
                  className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#f5edd4]/25 bg-[#142b51] text-sm font-extrabold text-[#f5edd4] active:bg-[#d6a74d] active:text-[#142b51]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{isEn ? 'Left (F)' : 'Kiri (F)'}</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    recordResponse('KeyJ')
                  }}
                  className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#f5edd4]/25 bg-[#142b51] text-sm font-extrabold text-[#f5edd4] active:bg-[#d6a74d] active:text-[#142b51]"
                >
                  <span>{isEn ? 'Right (J)' : 'Kanan (J)'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  recordResponse('Space')
                }}
                className="flex min-h-14 w-full max-w-md cursor-pointer items-center justify-center rounded-2xl border border-[#f5edd4]/25 bg-[#142b51] text-sm font-extrabold text-[#f5edd4] active:bg-[#d6a74d] active:text-[#142b51]"
              >
                {isEn ? 'Press SPACE or Tap Here' : 'Tekan SPACE atau Ketuk di Sini'}
              </button>
            )}
          </div>
        )}

        {phase === 'done' && summary && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={INTERACTIVE_SPRING}
            className="w-full max-w-xl rounded-2xl border border-[#f5edd4]/15 bg-[#142b51] p-6 shadow-2xl"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#d6a74d]">
              {isEn ? 'Quick try finished' : 'Coba singkat selesai'}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#f5edd4]">
              {isEn ? taskDef.name[1] : taskDef.name[0]}
            </h2>

            <div className="mt-4 flex flex-wrap items-baseline gap-4 rounded-xl bg-[#0d1f3d] p-4">
              <span className="text-3xl font-black tabular-nums text-[#d6a74d]">
                {summary.ok}/{summary.tot}
              </span>
              <span className="text-sm text-[#f5edd4]/85">
                {isEn ? 'correct responses' : 'respons tepat'}
                {summary.rt !== null && (
                  <>
                    {' · '}
                    <span className="font-bold tabular-nums">
                      {summary.rt} ms
                    </span>{' '}
                    {isEn ? 'mean RT' : 'rata-rata waktu reaksi'}
                  </>
                )}
              </span>
            </div>

            <p className="mt-3 text-xs text-[#f5edd4]/70">
              {isEn
                ? 'A short practice only, not a clinical assessment result. Nothing is stored on our server.'
                : 'Latihan singkat, bukan hasil asesmen klinis. Tidak ada data yang disimpan di server.'}
            </p>

            {/* Sample report thumbnail */}
            <div className="mt-5 rounded-xl border border-[#f5edd4]/15 bg-[#0d1f3d] p-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#d6a74d]">
                {isEn ? 'Sample report for this task' : 'Contoh laporan untuk tugas ini'}
              </p>
              <button
                type="button"
                onClick={() => {
                  const cap = isEn ? `${taskDef.name[1]} sample report` : `Contoh laporan ${taskDef.name[0]}`
                  if (onOpenReportZoom) {
                    onClose()
                    onOpenReportZoom(sampleReportUrl, cap)
                  }
                }}
                className="mt-2 block w-full cursor-pointer overflow-hidden rounded-lg border border-[#f5edd4]/15 text-left"
              >
                <img
                  src={sampleReportUrl}
                  alt={isEn ? taskDef.name[1] : taskDef.name[0]}
                  width={1200}
                  height={850}
                  className="max-h-44 w-full object-cover object-top"
                />
              </button>
              <p className="mt-2 text-[11px] text-[#f5edd4]/70">
                {isEn
                  ? 'Simulated participant data, computed identically to the full clinical assessment.'
                  : 'Data simulasi, dihitung dengan cara yang sama seperti asesmen penuh.'}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {nextTaskDef && nextTaskKey && (
                <button
                  type="button"
                  onClick={() => onSelectTask(nextTaskKey)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-[#d6a74d] px-4 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                >
                  <span>
                    {isEn ? 'Next' : 'Tugas berikutnya'}:{' '}
                    {isEn ? nextTaskDef.name[1] : nextTaskDef.name[0]}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => void startPracticeRun()}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#f5edd4]/25 px-4 py-2 text-xs font-bold text-[#f5edd4] hover:bg-[#f5edd4]/10"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? 'Try again' : 'Coba lagi'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-[#f5edd4]/20 px-4 py-2 text-xs font-bold text-[#f5edd4]/85 hover:bg-[#f5edd4]/10"
              >
                {isEn ? 'Back to task list' : 'Kembali ke daftar tugas'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
