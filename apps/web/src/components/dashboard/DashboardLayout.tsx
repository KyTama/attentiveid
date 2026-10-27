import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LayoutTemplate,
  Users,
  UserCheck,
  FileText,
  ShieldCheck,
  ClipboardList,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const navItems = [
    {
      to: '/dashboard',
      end: true,
      label: t('dashboard.navOverview', 'Overview'),
      icon: <LayoutDashboard className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
    },
    {
      to: '/dashboard/landing',
      label: t('dashboard.navLanding', 'Landing Content'),
      icon: <LayoutTemplate className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
    },
    {
      to: '/dashboard/psychologists',
      label: t('dashboard.navPsychologists', 'Psychologists'),
      icon: <Users className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
    },
    {
      to: '/dashboard/profile',
      label: t('dashboard.navProfile', 'Profil Saya'),
      icon: <UserCheck className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
    },
    {
      to: '/dashboard/articles',
      label: t('dashboard.navArticles', 'Articles Management'),
      icon: <FileText className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
    },
    {
      to: '/dashboard/users',
      label: t('dashboard.navUsers', 'Manajemen Staff'),
      icon: <ShieldCheck className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
    },
    {
      to: '/dashboard/free-session',
      label: t('dashboard.navFreeSession', 'Sesi Gratis'),
      icon: <ClipboardList className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
    },
  ].filter((item) => item.show)

  const handleLogout = async () => {
    await logout()
    navigate('/portal-gate')
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-teal-800 transition-colors">
              A
            </span>
            <div className="flex flex-col">
              <span className="leading-tight font-bold text-slate-900 tracking-tight">Attentive</span>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Internal Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200/80">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50/50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{t('dashboard.viewPublicSite', 'View Public Website')}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu className="size-5 stroke-[1.75]" aria-hidden="true" />
            </button>
            <h2 className="text-base font-semibold text-slate-900 truncate">
              {user?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200/60 capitalize">
                {user?.role}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-300 transition-colors"
              >
                <LogOut className="size-3.5 stroke-[1.75]" aria-hidden="true" />
                <span>{t('auth.logout', 'Sign Out')}</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-64 max-w-full h-full bg-white p-4 space-y-4 shadow-xl border-r border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Attentive Portal</span>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Close menu"
                  >
                    <X className="size-5 stroke-[1.75]" aria-hidden="true" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-teal-50 text-teal-800 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
