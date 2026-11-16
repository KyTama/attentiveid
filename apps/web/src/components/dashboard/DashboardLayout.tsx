import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LayoutTemplate,
  Users,
  UserCheck,
  FileText,
  BookOpenText,
  ShieldCheck,
  MessageSquareQuote,
  ClipboardList,
  FlaskConical,
  TextCursorInput,
  Network,
  CalendarDays,
  Star,
  Share2,
  BarChart3,
  QrCode,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { canAccessExperimental } from '../../features/experimental/access'
import { NAV_KEYWORDS, type NavSearchItem } from '../../features/dashboard/nav-search'
import { NavSearch } from './NavSearch'

type NavLeaf = { to: string; label: string; icon: ReactNode; end?: boolean; show: boolean }
type NavGroup = { id: string; label: string; icon: ReactNode; show: boolean; children: NavEntry[] }
type NavEntry = NavLeaf | NavGroup

const isGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const showExperimental = isAdmin && canAccessExperimental(user?.email)

  const navEntries: NavEntry[] = [
    {
      to: '/dashboard',
      end: true,
      label: t('dashboard.navOverview', 'Overview'),
      icon: <LayoutDashboard className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
    },
    {
      id: 'content',
      label: t('dashboard.groupContent', 'Konten Website'),
      icon: <LayoutTemplate className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
      children: [
        {
          to: '/dashboard/landing',
          label: t('dashboard.navLanding', 'Landing Content'),
          icon: <LayoutTemplate className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
        {
          to: '/dashboard/testimonials',
          label: t('dashboard.navTestimonials', 'Testimoni Klien'),
          icon: <MessageSquareQuote className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
        {
          to: '/dashboard/featured-products',
          label: t('dashboard.navFeaturedProducts', 'Produk Featured'),
          icon: <Star className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
        {
          to: '/dashboard/share-previews',
          label: t('dashboard.navSharePreviews', 'Thumbnail Link'),
          icon: <Share2 className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
        {
          to: '/dashboard/site-settings',
          label: t('dashboard.navSiteSettings', 'Pengaturan Situs'),
          icon: <SlidersHorizontal className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
      ],
    },
    {
      id: 'team',
      label: t('dashboard.groupTeam', 'Tim & Psikolog'),
      icon: <Users className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
      children: [
        {
          to: '/dashboard/psychologists',
          label: t('dashboard.navPsychologists', 'Psychologists'),
          icon: <Users className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
        {
          to: '/dashboard/profile',
          label: t('dashboard.navProfile', 'Profil Saya'),
          icon: <UserCheck className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
      ],
    },
    {
      id: 'research',
      label: t('dashboard.groupResearch', 'Riset & Publikasi'),
      icon: <BookOpenText className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
      children: [
        {
          to: '/dashboard/articles',
          label: t('dashboard.navArticles', 'Articles Management'),
          icon: <FileText className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
        {
          to: '/dashboard/sci-brief',
          label: t('dashboard.navSciBrief', 'Sci-Brief'),
          icon: <BookOpenText className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
      ],
    },
    {
      id: 'operations',
      label: t('dashboard.groupOperations', 'Operasional'),
      icon: <CalendarDays className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
      children: [
        {
          to: '/dashboard/bookings',
          label: t('dashboard.navBookings', 'Reservasi & Booking'),
          icon: <CalendarDays className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
      ],
    },
    {
      id: 'tools',
      label: t('dashboard.groupTools', 'Alat Bantu'),
      icon: <QrCode className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: true,
      children: [
        {
          to: '/dashboard/qr-generator',
          label: t('dashboard.navQrGenerator', 'QR Generator'),
          icon: <QrCode className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
      ],
    },
    {
      id: 'settings',
      label: t('dashboard.groupSettings', 'Pengaturan'),
      icon: <ShieldCheck className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: isAdmin,
      children: [
        {
          to: '/dashboard/users',
          label: t('dashboard.navUsers', 'Manajemen Staff'),
          icon: <ShieldCheck className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: isAdmin,
        },
      ],
    },
    {
      id: 'experimental',
      label: t('dashboard.navExperimental', 'Experimental'),
      icon: <FlaskConical className="size-5 shrink-0 stroke-[1.75]" aria-hidden="true" />,
      show: showExperimental,
      children: [
        {
          to: '/dashboard/experimental/forms',
          label: t('dashboard.navForms', 'Forms'),
          icon: <TextCursorInput className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
        {
          to: '/dashboard/experimental/traffic',
          label: t('dashboard.navTraffic', 'Traffic Monitor'),
          icon: <BarChart3 className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
        {
          to: '/dashboard/experimental/system-map',
          label: t('dashboard.navSystemMap', 'System Map'),
          icon: <Network className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
        },
        {
          id: 'events',
          label: t('dashboard.navEvents', 'Events'),
          icon: <CalendarDays className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
          show: true,
          children: [
            {
              to: '/dashboard/free-session',
              label: t('dashboard.navFreeSession', 'Sesi Gratis'),
              icon: <ClipboardList className="size-4 shrink-0 stroke-[1.75]" aria-hidden="true" />,
              show: true,
            },
          ],
        },
      ],
    },
  ].filter((entry) => entry.show)

  const linkClass = (isActive: boolean, nested: boolean) =>
    `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${nested ? 'px-3 py-2' : 'px-3 py-2.5'} ${
      isActive
        ? 'bg-gold-50 text-navy-800 font-semibold shadow-xs'
        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
    }`

  const hasActiveDescendant = (group: NavGroup): boolean =>
    group.children.some((child) =>
      isGroup(child) ? hasActiveDescendant(child) : location.pathname.startsWith(child.to),
    )

  const renderEntry = (entry: NavEntry, depth: number, onNavigate?: () => void): ReactNode => {
    const nested = depth > 0

    if (!isGroup(entry)) {
      return (
        <NavLink
          key={entry.to}
          to={entry.to}
          end={entry.end}
          onClick={onNavigate}
          className={({ isActive }) => linkClass(isActive, nested)}
        >
          {entry.icon}
          <span>{entry.label}</span>
        </NavLink>
      )
    }

    const children = entry.children.filter((child) => child.show)
    const hasActiveChild = hasActiveDescendant(entry)
    const isOpen = expandedGroups[entry.id] ?? hasActiveChild
    const panelId = `nav-group-${entry.id}`

    return (
      <div key={entry.id}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setExpandedGroups((current) => ({ ...current, [entry.id]: !isOpen }))}
          className={`w-full ${linkClass(false, nested)} ${hasActiveChild && !isOpen ? 'text-navy-800' : ''}`}
        >
          {entry.icon}
          <span className="flex-1 text-left">{entry.label}</span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {isOpen ? (
          <div id={panelId} className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-2">
            {children.map((child) => renderEntry(child, depth + 1, onNavigate))}
          </div>
        ) : null}
      </div>
    )
  }

  // Every visible menu page, with the group(s) it sits under, for the search box.
  const flattenNav = (entries: NavEntry[], trail: string[] = []): NavSearchItem[] =>
    entries
      .filter((entry) => entry.show)
      .flatMap((entry) =>
        isGroup(entry)
          ? flattenNav(entry.children, [...trail, entry.label])
          : [{ to: entry.to, label: entry.label, trail, keywords: NAV_KEYWORDS[entry.to] ?? '' }],
      )
  const searchItems = flattenNav(navEntries)

  const renderNav = (onNavigate?: () => void) => navEntries.map((entry) => renderEntry(entry, 0, onNavigate))

  const handleLogout = async () => {
    await logout()
    navigate('/portal-gate')
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex accent-navy-700">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex flex-col gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-gold-500" aria-label="Attentive.id Internal Portal">
            <img alt="Attentive.id" className="h-auto w-36" height="144" src="/images/figma/attentive-logo.webp" width="528" />
            <span className="text-[10px] font-semibold text-navy-700/70 uppercase tracking-wider">Internal Portal</span>
          </Link>
        </div>

        <div className="border-b border-slate-200/80 p-3">
          <NavSearch enableShortcut items={searchItems} onSelect={(to) => navigate(to)} />
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {renderNav()}
        </nav>

        <div className="p-3 border-t border-slate-200/80">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-navy-700 hover:bg-gold-50/50 rounded-lg transition-colors"
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
              <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-gold-50 text-navy-800 border border-gold-200/60 capitalize">
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
                  <span className="flex flex-col gap-1">
                    <img alt="Attentive.id" className="h-auto w-32" height="144" src="/images/figma/attentive-logo.webp" width="528" />
                    <span className="text-[10px] font-semibold text-navy-700/70 uppercase tracking-wider">Internal Portal</span>
                  </span>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Close menu"
                  >
                    <X className="size-5 stroke-[1.75]" aria-hidden="true" />
                  </button>
                </div>

                <div className="mb-3">
                  <NavSearch
                    items={searchItems}
                    onSelect={(to) => {
                      setIsMobileOpen(false)
                      navigate(to)
                    }}
                  />
                </div>

                <nav className="space-y-1">
                  {renderNav(() => setIsMobileOpen(false))}
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
