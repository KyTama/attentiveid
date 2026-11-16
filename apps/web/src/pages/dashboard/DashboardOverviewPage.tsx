import { useEffect, useState } from 'react'
import { useTx } from '@/features/i18n/use-tx'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  LayoutTemplate,
  FileText,
  ShieldCheck,
  UserCheck,
  MessageSquareQuote,
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
  const { tx } = useTx()
  const { user, accessToken } = useAuth()
  const { t } = useTranslation()

  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

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
        className="bg-gradient-to-r from-[#142c52] via-[#1a3865] to-navy-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-gold-100 border border-white/10">
              {isAdmin ? t('dashboard.adminRole', 'Administrator Portal') : t('dashboard.psychologistRole', 'Psychologist Portal')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcomeMessage', 'Selamat Datang')}, {user?.name}!
            </h1>
            <p className="text-gold-100/90 text-sm mt-1">
              {user?.email} • {tx('Akses level', 'Access level')}: <span className="font-semibold uppercase">{user?.role}</span>
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="self-start sm:self-auto px-4 py-2 bg-white text-navy-950 hover:bg-gold-50 font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <span>{t('dashboard.viewPublicWebsite', 'Lihat Website Publik')}</span>
            <span>→</span>
          </Link>
        </div>
      </motion.div>

      {/* Live Operational Metrics KPI Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
          {tx('Ringkasan Operasional Sistem', 'System operations summary')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Psychologists */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{tx('Direktori Psikolog', 'Psychologist directory')}</span>
              <div className="size-9 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center">
                <Users className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.psychologists.active || 0} ${tx('Aktif', 'Active')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {tx(`Dari total ${stats?.psychologists.total || 0} profil (${stats?.psychologists.featured || 0} tampil di Hero)`, `Of ${stats?.psychologists.total || 0} profiles in total (${stats?.psychologists.featured || 0} shown in the Hero)`)}
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
              <div className="size-9 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center">
                <LayoutTemplate className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : stats?.landing.hasDraftChanges ? tx('Draft Baru', 'New draft') : 'Live / Synced'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.landing.hasDraftChanges
                ? tx('Ada perubahan draft yang belum di-publish', 'There are draft changes that are not published yet')
                : tx('9 section bilingual aktif', '9 bilingual sections active')}
            </p>
          </motion.div>

          {/* Card 3: Articles */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{tx('Artikel Edukasi', 'Education articles')}</span>
              <div className="size-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.articles.published || 0} ${tx('Terbit', 'Published')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {stats?.articles.draft || 0} draft • {stats?.articles.archived || 0} {tx('arsip', 'archived')}
            </p>
          </motion.div>

          {/* Card 4: Staff Accounts */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{tx('Staff & Kredensial', 'Staff & credentials')}</span>
              <div className="size-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
                <ShieldCheck className="size-4.5 stroke-[1.75]" aria-hidden="true" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {isLoading ? '...' : `${stats?.staff.total || 0} ${tx('Akun', 'Accounts')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              {stats?.staff.admins || 0} Admin • {stats?.staff.psychologists || 0} {tx('Psikolog', 'Psychologists')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Role-Specific Portal Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
          {tx('Modul Kerja Portal', 'Portal work modules')}
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
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UserCheck className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                  {tx('Profil Mandiri Saya', 'My own profile')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tx('Kelola bio bilingual, tarif konsultasi, STR/SIP, dan link booking jadwal Anda.', 'Manage your bilingual bio, consultation fees, STR/SIP and booking schedule link.')}
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
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <LayoutTemplate className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                  Landing Content CMS
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tx('Edit headline, deskripsi bilingual 9 section, urutan repeater, dan preview draft.', 'Edit headlines, bilingual descriptions for 9 sections, repeater order and draft preview.')}
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
                to="/dashboard/testimonials"
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquareQuote className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {tx('Manajemen Testimoni', 'Testimonial management')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tx('Kelola ulasan klien, rating bintang, dan publikasikan ke auto-moving carousel homepage.', 'Manage client reviews and star ratings, and publish them to the homepage carousel.')}
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
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                  {tx('Direktori Psikolog', 'Psychologist directory')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tx('Kelola master profil psikolog, spesialisasi, status aktif, foto profil, dan tarif.', 'Manage psychologist profiles, specialisations, active status, photos and fees.')}
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
              className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
            >
              <div className="size-10 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="size-5 stroke-[1.75]" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                {tx('Manajemen Artikel', 'Article management')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {tx('Tulis artikel baru, ajukan review, dan kelola alur publikasi edukasi kesehatan mental.', 'Write new articles, submit for review and manage the mental-health education publishing flow.')}
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
                className="block h-full p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-700/60 transition-all group"
              >
                <div className="size-10 rounded-xl bg-gold-50 text-navy-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-5 stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-navy-700 transition-colors">
                  {tx('Manajemen Staff & User', 'Staff & user management')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tx('Kelola akun administrator dan psikolog, reset password, dan pantau aktivitas staff.', 'Manage administrator and psychologist accounts, reset passwords and monitor staff activity.')}
                </p>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
