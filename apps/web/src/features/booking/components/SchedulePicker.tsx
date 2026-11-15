import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import {
  DEFAULT_SCHEDULE,
  getDayTimeRanges,
  hasScheduleData,
  isDayAppointment,
  isDayOff,
  type TimeRange,
  type WeekSchedule,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]
const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export interface BrandDatePickerProps {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  lang?: 'id' | 'en'
  minDate?: string
  schedule?: WeekSchedule
}

export function BrandDatePicker({
  id,
  value,
  onChange,
  placeholder,
  lang = 'id',
  minDate,
  schedule,
}: BrandDatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const anchorDate = value ? new Date(`${value}T00:00:00`) : minDate ? new Date(`${minDate}T00:00:00`) : new Date()
  const [monthNav, setMonthNav] = useState<{ valueKey: string; year: number; month: number } | null>(null)
  const viewYear = monthNav && monthNav.valueKey === (value ?? '') ? monthNav.year : anchorDate.getFullYear()
  const viewMonth = monthNav && monthNav.valueKey === (value ?? '') ? monthNav.month : anchorDate.getMonth()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const months = lang === 'en' ? MONTHS_EN : MONTHS_ID
  const dayLabels = lang === 'en' ? DAYS_EN : DAYS_ID
  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())
  const hasData = schedule ? hasScheduleData(schedule) : false

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

    const grid: {
      day: number
      iso: string
      current: boolean
      disabled: boolean
      isAppointment: boolean
    }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i
      const m = viewMonth - 1
      const y = m < 0 ? viewYear - 1 : viewYear
      const mo = m < 0 ? 11 : m
      grid.push({ day: d, iso: toISO(y, mo, d), current: false, disabled: true, isAppointment: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISO(viewYear, viewMonth, d)
      const pastMin = minDate ? iso < minDate : false
      const dow = new Date(viewYear, viewMonth, d).getDay()
      const off = hasData && schedule ? isDayOff(schedule, dow) : false
      const appointment = hasData && schedule ? isDayAppointment(schedule, dow) : false
      grid.push({
        day: d,
        iso,
        current: true,
        disabled: pastMin || off,
        isAppointment: appointment && !pastMin,
      })
    }

    const remaining = 7 - (grid.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const m = viewMonth + 1
        const y = m > 11 ? viewYear + 1 : viewYear
        const mo = m > 11 ? 0 : m
        grid.push({ day: d, iso: toISO(y, mo, d), current: false, disabled: true, isAppointment: false })
      }
    }

    return grid
  }, [viewYear, viewMonth, minDate, schedule, hasData])

  const prevMonth = () => {
    const nextY = viewMonth === 0 ? viewYear - 1 : viewYear
    const nextM = viewMonth === 0 ? 11 : viewMonth - 1
    setMonthNav({ valueKey: value ?? '', year: nextY, month: nextM })
  }

  const nextMonth = () => {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    setMonthNav({ valueKey: value ?? '', year: nextY, month: nextM })
  }

  const displayValue = value
    ? (() => {
        const [y, m, d] = value.split('-')
        return `${d}/${m}/${y}`
      })()
    : ''

  const isByAppointment =
    value && hasData && schedule ? isDayAppointment(schedule, new Date(`${value}T00:00:00`).getDay()) : false

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-[13px] bg-white text-sm py-3 px-3.5 outline-none transition-colors cursor-pointer ${
          open
            ? 'border-[#d8a74d] shadow-[0_0_0_3px_rgba(216,167,77,.13)]'
            : 'border-[#ddd6ca] hover:border-[#c9c1b3]'
        }`}
      >
        <span className={displayValue ? 'text-[#1c2b51] font-semibold' : 'text-[#8e877a]'}>
          {displayValue || placeholder || 'DD/MM/YYYY'}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#8e877a]" aria-hidden="true" />
      </button>

      {isByAppointment && (
        <p className="mt-1.5 text-[11px] text-[#b47f1f] font-semibold leading-snug px-1">
          {lang === 'en' ? 'Schedule will be reconfirmed by admin.' : 'Jadwal akan dikonfirmasi ulang oleh admin.'}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={INTERACTIVE_SPRING}
            className="absolute z-50 top-full mt-1.5 left-0 w-[290px] bg-white border border-[#ddd6ca] rounded-[14px] shadow-[0_12px_32px_rgba(28,43,81,.14)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#eee9e0]">
              <button
                type="button"
                aria-label={lang === 'en' ? 'Previous month' : 'Bulan sebelumnya'}
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f3ede4] text-[#1c2b51] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[13px] font-bold text-[#1c2b51]">
                {months[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                aria-label={lang === 'en' ? 'Next month' : 'Bulan berikutnya'}
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f3ede4] text-[#1c2b51] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 px-2 pt-2">
              {dayLabels.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10.5px] font-bold text-[#8e877a] uppercase tracking-wide py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 px-2 pb-2.5 gap-y-0.5">
              {cells.map((cell) => {
                const isSelected = cell.iso === value
                const isToday = cell.iso === todayISO && cell.current

                let cls: string
                if (isSelected) {
                  cls = 'bg-[#1c2b51] text-white shadow-sm'
                } else if (cell.disabled || !cell.current) {
                  cls = 'text-[#ccc5ba] cursor-default'
                } else if (isToday) {
                  cls = 'ring-2 ring-[#1c2b51] text-[#1c2b51] font-bold hover:bg-[#e8e3da]'
                } else if (cell.isAppointment) {
                  cls = 'bg-[#fef3c7] text-[#92710a] font-bold hover:bg-[#fde68a]'
                } else {
                  cls = 'text-[#1c2b51] hover:bg-[#f3ede4]'
                }

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={cell.disabled}
                    onClick={() => {
                      if (!cell.disabled && cell.current) {
                        onChange(cell.iso)
                        setOpen(false)
                      }
                    }}
                    className={`w-full aspect-square flex items-center justify-center text-[13px] font-semibold rounded-lg transition-colors ${cls}`}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function buildLocalSlots(ranges: TimeRange[], gmtDiffHours: number): { hour: number; minute: number }[] {
  const slots: { hour: number; minute: number }[] = []
  for (const r of ranges) {
    let t = r.start
    while (t < r.end) {
      const totalLocalMinutes = Math.round((t + gmtDiffHours) * 60)
      const localH = Math.floor(totalLocalMinutes / 60)
      const localM = ((totalLocalMinutes % 60) + 60) % 60
      if (localH >= 0 && localH <= 23) {
        slots.push({ hour: localH, minute: localM })
      }
      t += 0.5
    }
  }
  const unique = new Map<string, { hour: number; minute: number }>()
  for (const s of slots) {
    unique.set(`${s.hour}:${s.minute}`, s)
  }
  return Array.from(unique.values()).sort((a, b) => a.hour - b.hour || a.minute - b.minute)
}

export interface TimePickerProps {
  id?: string
  date: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  lang?: 'id' | 'en'
  schedule?: WeekSchedule
  gmtOffset?: number
}

export function TimePicker({
  id,
  date,
  value,
  onChange,
  placeholder,
  lang = 'id',
  schedule,
  gmtOffset = 7,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [pendingH, setPendingH] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const gmtDiff = gmtOffset - 7
  const hasData = schedule ? hasScheduleData(schedule) : false

  const dayRanges = useMemo(() => {
    if (!date) return null
    const dow = new Date(`${date}T00:00:00`).getDay()
    if (hasData && schedule) {
      return getDayTimeRanges(schedule, dow)
    }
    const def = DEFAULT_SCHEDULE[dow]
    if (!def || def.type === 'off') return null
    if (def.type === 'appointment') return [{ start: 8, end: 20 }]
    return def.ranges
  }, [schedule, date, hasData])

  const isAppointment = useMemo(() => {
    if (!date || !hasData || !schedule) return false
    return isDayAppointment(schedule, new Date(`${date}T00:00:00`).getDay())
  }, [schedule, date, hasData])

  const slots = useMemo(() => {
    if (!dayRanges) return []
    return buildLocalSlots(dayRanges, gmtDiff)
  }, [dayRanges, gmtDiff])

  const hours = useMemo(() => {
    const h = new Set(slots.map((s) => s.hour))
    return Array.from(h).sort((a, b) => a - b)
  }, [slots])

  const selectedH = value ? Number.parseInt(value.split(':')[0] ?? '-1', 10) : -1
  const selectedM = value ? Number.parseInt(value.split(':')[1] ?? '-1', 10) : -1
  const activeH = pendingH ?? selectedH

  const minutes = useMemo(() => {
    if (activeH < 0) return [0, 30]
    return slots
      .filter((s) => s.hour === activeH)
      .map((s) => s.minute)
      .sort((a, b) => a - b)
  }, [activeH, slots])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setPendingH(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const commit = (h: number, m: number) => {
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    setPendingH(null)
    setOpen(false)
  }

  const pickHour = (h: number) => {
    if (selectedM >= 0) {
      const validMins = slots.filter((s) => s.hour === h).map((s) => s.minute)
      if (validMins.includes(selectedM)) {
        commit(h, selectedM)
        return
      }
      if (validMins.length === 1) {
        commit(h, validMins[0]!)
        return
      }
    }
    setPendingH(h)
  }

  const pickMinute = (m: number) => {
    const h = activeH >= 0 ? activeH : (hours[0] ?? 9)
    commit(h, m)
  }

  const disabled = !date || !dayRanges

  const opLabel = useMemo(() => {
    if (!dayRanges || dayRanges.length === 0) return ''
    return dayRanges
      .map((r) => {
        const sH = Math.floor(r.start + gmtDiff)
        const eH = Math.floor(r.end + gmtDiff)
        return `${String(sH).padStart(2, '0')}–${String(eH).padStart(2, '0')}`
      })
      .join(', ')
  }, [dayRanges, gmtDiff])

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false)
            setPendingH(null)
          } else {
            setPendingH(null)
            setOpen(true)
          }
        }}
        className={`w-full flex items-center justify-between border rounded-[13px] bg-white text-sm py-3 px-3.5 outline-none transition-colors ${
          disabled
            ? 'border-[#e6e1d8] text-[#b8b0a3] cursor-not-allowed'
            : open
              ? 'border-[#d8a74d] shadow-[0_0_0_3px_rgba(216,167,77,.13)] cursor-pointer'
              : 'border-[#ddd6ca] hover:border-[#c9c1b3] cursor-pointer'
        }`}
      >
        <span className={value ? 'text-[#1c2b51] font-semibold' : 'text-[#8e877a]'}>
          {value
            || (disabled
              ? lang === 'en'
                ? 'Pick date first'
                : 'Pilih tanggal dulu'
              : placeholder || (lang === 'en' ? 'Select time' : 'Pilih waktu'))}
        </span>
        <div className="flex items-center gap-1.5">
          {opLabel && (
            <span className="text-[10px] font-bold text-[#b47f1f] bg-[#fdf8ed] px-1.5 py-0.5 rounded-md tabular-nums">
              {opLabel}
            </span>
          )}
          <Clock className="w-4 h-4 text-[#8e877a]" aria-hidden="true" />
        </div>
      </button>

      {isAppointment && date && (
        <p className="mt-1.5 text-[11px] text-[#b47f1f] font-semibold leading-snug px-1">
          {lang === 'en' ? 'Schedule will be reconfirmed by admin.' : 'Jadwal akan dikonfirmasi ulang oleh admin.'}
        </p>
      )}

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={INTERACTIVE_SPRING}
            className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white border border-[#ddd6ca] rounded-[14px] shadow-[0_12px_32px_rgba(28,43,81,.14)] overflow-hidden"
          >
            {gmtOffset !== 7 && (
              <div className="px-2 py-1.5 text-center text-[10px] font-bold text-[#51665d] bg-[#eef4f1] border-b border-[#eee9e0]">
                {lang === 'en'
                  ? `Your timezone (GMT${gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset})`
                  : `Zona waktu kamu (GMT${gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset})`}
              </div>
            )}
            <div className="grid grid-cols-2 divide-x divide-[#eee9e0]">
              <div>
                <div className="px-1 py-1.5 text-center text-[10px] font-bold text-[#8e877a] uppercase tracking-wider border-b border-[#eee9e0]">
                  {lang === 'en' ? 'Hours' : 'Jam'}
                </div>
                <div className="max-h-[180px] overflow-y-auto py-0.5">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => pickHour(h)}
                      className={`w-full text-center py-1.5 text-[13px] font-semibold transition-colors tabular-nums cursor-pointer ${
                        activeH === h ? 'bg-[#1c2b51] text-white' : 'text-[#1c2b51] hover:bg-[#f3ede4]'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="px-1 py-1.5 text-center text-[10px] font-bold text-[#8e877a] uppercase tracking-wider border-b border-[#eee9e0]">
                  {lang === 'en' ? 'Minutes' : 'Menit'}
                </div>
                <div className="max-h-[180px] overflow-y-auto py-0.5">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => pickMinute(m)}
                      className={`w-full text-center py-1.5 text-[13px] font-semibold transition-colors tabular-nums cursor-pointer ${
                        selectedM === m && activeH >= 0
                          ? 'bg-[#1c2b51] text-white'
                          : 'text-[#1c2b51] hover:bg-[#f3ede4]'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
