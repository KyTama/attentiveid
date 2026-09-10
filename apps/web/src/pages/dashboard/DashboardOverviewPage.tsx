import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { useTranslation } from 'react-i18next'

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              {user?.role === 'admin' ? t('dashboard.adminRole', 'Administrator Portal') : t('dashboard.psychologistRole', 'Psychologist Portal')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashboard.welcomeMessage', 'Selamat Datang')}, {user?.name}!
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              {user?.email}
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="self-start sm:self-auto px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 font-medium text-sm rounded-xl transition-colors shrink-0 shadow-sm"
          >
            {t('dashboard.viewPublicWebsite', 'Lihat Website Publik')} →
          </Link>
        </div>
      </motion.div>

      {/* Quick Action Modules Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('dashboard.quickModulesTitle', 'Quick Management Modules')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin && (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Link
                to="/dashboard/landing"
                className="block h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('dashboard.landingCmsTitle', 'Landing Content CMS')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {t('dashboard.landingCmsDesc', 'Kelola teks landing page bilingual, urutan repeater, dan preview draft.')}
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
                className="block h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {t('dashboard.psychologistsCmsTitle', 'Direktori Psikolog')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {t('dashboard.psychologistsCmsDesc', 'Kelola profil psikolog, spesialisasi, status aktif, dan foto media.')}
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
              className="block h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {t('dashboard.articlesCmsTitle', 'Manajemen Artikel')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t('dashboard.articlesCmsDesc', 'Tulis artikel baru, ajukan review draft, dan publikasikan artikel psikologi.')}
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
