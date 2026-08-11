import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import { PermissionGuard } from '../auth/ProtectedRoute';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AdminNotificationBell } from './AdminNotificationBell';
import { AdminApiStatusBanner } from '../admin/AdminApiStatusBanner';
import { cn, mediaUrl, DEFAULT_GCS_LOGO } from '../../lib/utils';
import {
  LayoutDashboard,
  Image,
  FileText,
  GraduationCap,
  Camera,
  Newspaper,
  ClipboardList,
  Briefcase,
  Mail,
  Users,
  Shield,
  Settings,
  LogOut,
  Home,
  ArrowLeft,
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Compass,
  FolderOpen,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  perm: string;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    titleKey: 'admin.navOverview',
    items: [
      { to: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
      { to: '/admin/notifications', labelKey: 'admin.notifications', icon: Bell, perm: 'VIEW_DASHBOARD' },
      { to: '/admin/inquiries', labelKey: 'admin.inquiries', icon: Mail, perm: 'VIEW_DASHBOARD' },
    ],
  },
  {
    titleKey: 'admin.navAdmissions',
    items: [
      { to: '/admin/admissions', labelKey: 'admin.admissions', icon: ClipboardList, perm: 'VIEW_ALL_ADMISSIONS' },
      { to: '/admin/admission-requirements', labelKey: 'admin.navRequirements', icon: ClipboardList, perm: 'MANAGE_ADMISSION_REQUIREMENTS' },
    ],
  },
  {
    titleKey: 'admin.navCareers',
    items: [
      { to: '/admin/careers', labelKey: 'admin.careers', icon: Briefcase, perm: 'MANAGE_JOBS' },
      { to: '/admin/job-requirements', labelKey: 'admin.jobRequirements', icon: ClipboardList, perm: 'MANAGE_JOBS' },
    ],
  },
  {
    titleKey: 'admin.navContent',
    items: [
      { to: '/admin/landing/hero', labelKey: 'admin.hero', icon: Image, perm: 'MANAGE_LANDING' },
      { to: '/admin/landing/sections', labelKey: 'admin.sections', icon: FileText, perm: 'MANAGE_LANDING' },
      { to: '/admin/student-life', labelKey: 'admin.navStudentLife', icon: Compass, perm: 'MANAGE_LANDING' },
      { to: '/admin/about', labelKey: 'admin.about', icon: FileText, perm: 'MANAGE_ABOUT_US' },
      { to: '/admin/pages', labelKey: 'admin.pages', icon: FileText, perm: 'MANAGE_ABOUT_US' },
      { to: '/admin/form-documents', labelKey: 'admin.formDocuments', icon: FileText, perm: 'MANAGE_ABOUT_US' },
      { to: '/admin/education', labelKey: 'admin.navEducation', icon: GraduationCap, perm: 'MANAGE_EDUCATION' },
      { to: '/admin/gallery', labelKey: 'admin.navGallery', icon: Camera, perm: 'MANAGE_GALLERY' },
      { to: '/admin/media', labelKey: 'admin.mediaLibrary', icon: FolderOpen, perm: 'VIEW_DASHBOARD' },
      { to: '/admin/blog', labelKey: 'admin.blog', icon: Newspaper, perm: 'UPDATE_BLOG' },
    ],
  },
  {
    titleKey: 'admin.navSystem',
    items: [
      { to: '/admin/users', labelKey: 'admin.navUsers', icon: Users, perm: 'MANAGE_USERS' },
      { to: '/admin/roles', labelKey: 'admin.navRoles', icon: Shield, perm: 'MANAGE_ROLES' },
      { to: '/admin/audit', labelKey: 'admin.audit', icon: Shield, perm: 'MANAGE_ROLES' },
      { to: '/admin/email', labelKey: 'admin.navEmail', icon: Mail, perm: 'MANAGE_EMAIL_TEMPLATES' },
      { to: '/admin/settings', labelKey: 'admin.settings', icon: Settings, perm: 'UPDATE_SYSTEM_CONFIG' },
      { to: '/admin/seo', labelKey: 'admin.seo', icon: Search, perm: 'UPDATE_SYSTEM_CONFIG' },
    ],
  },
];

const allNavItems = navSections.flatMap((section) => section.items);

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => hasPermission(item.perm)),
        }))
        .filter((section) => section.items.length > 0),
    [hasPermission],
  );

  const activeNav = allNavItems.find((item) => item.to === location.pathname);

  return (
    <div className="admin-shell flex min-h-screen bg-slate-50 dark:bg-slate-950 text-neutral-dark dark:text-slate-100 transition-colors">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-64 bg-primary-dark text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 shadow-lg',
          mobileOpen
            ? 'translate-x-0'
            : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full',
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mediaUrl(DEFAULT_GCS_LOGO)} alt="MLS Logo" className="h-9 w-auto object-contain bg-white/10 rounded p-1" />
            <div>
              <div className="font-bold text-lg leading-snug tracking-tight">MLS Admin</div>
              <div className="text-sm text-white/70 truncate max-w-[130px]">
                {user?.fullName || 'Administrator'}
              </div>
            </div>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {visibleSections.map((section) => (
            <div key={section.titleKey}>
              <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
                {t(section.titleKey)}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all',
                        isActive
                          ? 'bg-white/20 text-white shadow-xs font-semibold'
                          : 'text-white/75 hover:bg-white/10 hover:text-white',
                      )
                    }
                  >
                    <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1 bg-black/10">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home className="h-[1.125rem] w-[1.125rem] shrink-0" />
            <span>{t('admin.site', 'View Site')}</span>
          </button>
          <button
            onClick={() => logout().then(() => navigate('/admin/login'))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-colors"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" />
            <span>{t('admin.logout', 'Logout')}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
              {activeNav ? t(activeNav.labelKey) : t('admin.dashboard')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 shadow-2xs"
              title={t('common.back', 'Back')}
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('common.back', 'Back')}</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 transition-all shadow-2xs"
              title={t('admin.site', 'View Site')}
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('admin.site', 'View Site')}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <PermissionGuard permission="VIEW_DASHBOARD">
              <AdminNotificationBell />
            </PermissionGuard>

            <div className="text-sm text-slate-500 dark:text-slate-400 hidden md:block border-s border-slate-200 dark:border-slate-700 ps-3">
              {t('admin.welcomeUser', 'Welcome')},{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.fullName}</span>
            </div>
            <LanguageSwitcher />
            <button
              onClick={() => logout().then(() => navigate('/admin/login'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/50 transition-all shadow-2xs ms-1"
              title={t('admin.logout', 'Logout')}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('admin.logout', 'Logout')}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-none overflow-x-hidden">
          <AdminApiStatusBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
