import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  LayoutTemplate,
  FileText,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { useTranslation } from 'react-i18next'

interface OverviewStats {
  psychologists: { total: number; active: number; featured: number }
  landing: { publishedSections: number; hasDraftChanges: boolean; lastPublishedAt: string | null }
  articles: { total: number; published: number; draft: number; archived?: number }
  staff: { total: number; admins: number; psychologists: number }
}

export function DashboardOverviewPage() {
  const { user, accessToken } = useAuth()
  const { t } = useTranslation()

  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/admin/overview/stats`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (res.ok) {
          const json = await res.json()
          if (json.status === 'success') {
            setStats(json.data)
          }
        }
      } catch (err) {
        console.error('Failed to load overview stats', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [accessToken])

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-gradient-to-r from-[#142c52] via-[#1a3865] to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-teal-100 border border-white/10">
              {isAdmin ? t('dashboard.adminRole', 'Administrator Portal') : t('dashboard.psychologistRole', 'Psychologist Portal')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcomeMessage', 'Selamat Datang')}, {user?.name}!
            </h1>
            <p className="text-teal-100/90 text-sm mt-1">
              {user?.email} • Akses level: <span className="font-semibold uppercase">{user?.role}</span>
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="self-start sm:self-auto px-4 py-2 bg-white text-teal-950 hover:bg-teal-50 font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <span>{t('dashboard.viewPublicWebsite', 'Lihat Website Publik')}</span>
            <span>→</span>
          </Link>
        </div>
      </motion.div>

      {/* Live Operational Metrics KPI Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
          Ringkasan Operasional Sistem
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Psychologists */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Direktori Psikolog</span>
              <div className="size-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.psychologists.active || 0} Aktif`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              Dari total {stats?.psychologists.total || 0} profil ({stats?.psychologists.featured || 0} tampil di Hero)
            </p>
          </motion.div>

          {/* Card 2: Landing Status */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Landing Page</span>
              <div className="size-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <LayoutTemplate className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : stats?.landing.hasDraftChanges ? 'Draft Baru' : 'Live / Synced'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.landing.hasDraftChanges
                ? 'Ada perubahan draft yang belum di-publish'
                : '9 section bilingual aktif'}
            </p>
          </motion.div>

          {/* Card 3: Articles */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Artikel Edukasi</span>
              <div className="size-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.articles.published || 0} Terbit`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {stats?.articles.draft || 0} draft • {stats?.articles.archived || 0} arsip
            </p>
          </motion.div>

          {/* Card 4: Staff Accounts */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Staff & Kredensial</span>
              <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.staff.total || 0} Akun`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {stats?.staff.admins || 0} Admin • {stats?.staff.psychologists || 0} Psikolog
            </p>
          </motion.div>
        </div>
      </div>

      {/* Role-Specific Portal Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
          Modul Kerja Portal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Psychologist Self-Service Profile Shortcut */}
          {!isAdmin && (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Link
                to="/dashboard/profile"
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-600/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UserCheck className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Profil Mandiri Saya
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kelola bio bilingual, tarif konsultasi, STR/SIP, dan link booking jadwal Anda.
                </p>
              </Link>
            </motion.div>
          )}

          {isAdmin && (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Link
                to="/dashboard/landing"
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-600/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <LayoutTemplate className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Landing Content CMS
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Edit headline, deskripsi bilingual 9 section, urutan repeater, dan preview draft.
                </p>
              </Link>
            </motion.div>
          )}

          {isAdmin && (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Link
                to="/dashboard/psychologists"
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-600/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Direktori Psikolog
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kelola master profil psikolog, spesialisasi, status aktif, foto profil, dan tarif.
                </p>
              </Link>
            </motion.div>
          )}

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Link
              to="/dashboard/articles"
              className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-600/60 transition-all group"
            >
              <div className="size-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="size-5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Manajemen Artikel
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tulis artikel baru, ajukan review, dan kelola alur publikasi edukasi kesehatan mental.
              </p>
            </Link>
          </motion.div>

          {isAdmin && (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Link
                to="/dashboard/users"
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-600/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Manajemen Staff & User
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kelola akun administrator dan psikolog, reset password, dan pantau aktivitas staff.
                </p>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
