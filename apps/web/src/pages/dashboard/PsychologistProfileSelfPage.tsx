import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

const springConfig = { type: 'spring', stiffness: 400, damping: 30 } as const

interface PsychologistSelfData {
  id: string
  slug: string
  name: string
  nickname: string
  status: string
  featured: boolean
  credential: string
  experienceYears: number
  licenseNumber: string
  bookingUrl: string
  premiumBookingUrl: string | null
  biography: {
    id: string
    en: string
  }
  specializations: { id: string; labelId: string; labelEn: string; order: number }[]
}

export function PsychologistProfileSelfPage() {
  const { accessToken, user } = useAuth()

  const [data, setData] = useState<PsychologistSelfData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [bioTab, setBioTab] = useState<'id' | 'en'>('id')

  // Form State
  const [credential, setCredential] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [premiumBookingUrl, setPremiumBookingUrl] = useState('')
  const [bioId, setBioId] = useState('')
  const [bioEn, setBioEn] = useState('')

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setNotFoundMessage(null)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/psychologist/my-profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const json = await res.json()

      if (res.status === 404) {
        setNotFoundMessage(json.message || 'Akun Anda belum terhubung dengan profil psikolog.')
        return
      }

      if (json.status === 'success' && json.data) {
        const d: PsychologistSelfData = json.data
        setData(d)
        setCredential(d.credential || '')
        setExperienceYears(d.experienceYears || 0)
        setLicenseNumber(d.licenseNumber || '')
        setBookingUrl(d.bookingUrl || '')
        setPremiumBookingUrl(d.premiumBookingUrl || '')
        setBioId(d.biography?.id || '')
        setBioEn(d.biography?.en || '')
      }
    } catch {
      setNotFoundMessage('Gagal memuat profil psikolog. Silakan coba beberapa saat lagi.')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFeedback(null)

    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/psychologist/my-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          credential,
          experienceYears: Number(experienceYears),
          licenseNumber,
          bookingUrl,
          premiumBookingUrl: premiumBookingUrl || undefined,
          biography: {
            id: bioId,
            en: bioEn,
          },
        }),
      })

      const json = await res.json()
      if (res.ok && json.status === 'success') {
        setFeedback({
          type: 'success',
          message: json.message || 'Profil berhasil disimpan dan diperbarui!',
        })
        // Update local state snapshot
        if (data) {
          setData({
            ...data,
            credential,
            experienceYears: Number(experienceYears),
            licenseNumber,
            bookingUrl,
            premiumBookingUrl: premiumBookingUrl || null,
            biography: {
              id: bioId,
              en: bioEn,
            },
          })
        }
      } else {
        setFeedback({
          type: 'error',
          message: json.message || 'Gagal menyimpan profil.',
        })
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan saat menyimpan.'
      setFeedback({
        type: 'error',
        message: errMsg,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data profil psikolog...</span>
        </div>
      </div>
    )
  }

  if (notFoundMessage) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Profil Psikolog Belum Terhubung
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              {notFoundMessage}
            </p>
          </div>
          {user?.role === 'admin' ? (
            <div className="pt-2 flex flex-wrap gap-3 justify-center">
              <Link
                to="/dashboard/users"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Atur Relasi di Manajemen Staff
              </Link>
              <Link
                to="/dashboard/psychologists"
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Kelola Direktori Master
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Hubungi administrator tim untuk menghubungkan akun login Anda dengan data psikolog di sistem.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
              {data.status.toUpperCase()}
            </span>
            {data.featured && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800">
                Hero Featured
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {data.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Panggilan: <strong className="text-slate-700">{data.nickname}</strong> • Slug:{' '}
            <code className="text-teal-600">/{data.slug}</code>
          </p>
        </div>

        <Link
          to={`/psychologists/${data.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <span>Lihat Halaman Publik</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={springConfig}
            className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:no-underline ml-4"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editable Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Kredensial & Praktik
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gelar / Kredensial Profesi *
                </label>
                <input
                  type="text"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="e.g. M.Psi., Psikolog Klinis"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pengalaman Praktik (Tahun) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Registrasi / Izin Praktik (STR / SIP PKP) *
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="e.g. 1234567890-SIP-PKP"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Nomor resmi untuk menjamin kepatuhan regulasi HIMPSI & Kemenkes.
              </span>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tautan Jadwal & Reservasi Konsultasi
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Booking Reguler *
                </label>
                <input
                  type="url"
                  required
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Booking VIP / Premium (Opsional)
                </label>
                <input
                  type="url"
                  value={premiumBookingUrl}
                  onChange={(e) => setPremiumBookingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Bilingual Biography */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Biografi & Pendekatan Konseling
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setBioTab('id')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      bioTab === 'id'
                        ? 'bg-white text-teal-700 shadow-xs font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setBioTab('en')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      bioTab === 'en'
                        ? 'bg-white text-teal-700 shadow-xs font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {bioTab === 'id' ? (
                <div>
                  <textarea
                    rows={5}
                    value={bioId}
                    onChange={(e) => setBioId(e.target.value)}
                    placeholder="Tuliskan latar belakang pendidikan, spesialisasi kasus, dan pendekatan konseling Anda dalam Bahasa Indonesia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-y"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Ditampilkan kepada pengguna saat memilih Bahasa Indonesia.
                  </span>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={5}
                    value={bioEn}
                    onChange={(e) => setBioEn(e.target.value)}
                    placeholder="Write your educational background, specialization, and therapy approach in English..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-y"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Displayed to users when English locale is selected.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Profil</span>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Live Public Profile Card Preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Live Preview Kartu Publik
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-bold text-lg flex items-center justify-center shrink-0 border border-teal-200">
                {data.nickname.slice(0, 2).toUpperCase() || 'PS'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 truncate text-sm">
                  {data.name}
                </h3>
                <p className="text-xs text-teal-700 font-medium">
                  {credential || 'Gelar / Kredensial'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  SIP: {licenseNumber || 'Belum diisi'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <svg className="w-4 h-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{experienceYears} Tahun Pengalaman Praktik</span>
            </div>

            {/* Specializations Tags Preview */}
            {data.specializations && data.specializations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Spesialisasi Klinis
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.specializations.map((spec) => (
                    <span
                      key={spec.id}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]"
                    >
                      {spec.labelId || spec.labelEn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio snippet preview */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Pratinjau Bio ({bioTab === 'id' ? 'ID' : 'EN'})
              </span>
              <p className="text-xs text-slate-600 line-clamp-3 italic leading-relaxed">
                {(bioTab === 'id' ? bioId : bioEn) || 'Belum ada deskripsi biografi yang ditulis.'}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={bookingUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-2 px-3 text-center text-xs font-semibold rounded-xl block transition-colors ${
                  bookingUrl
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Jadwalkan Sesi Konsultasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
