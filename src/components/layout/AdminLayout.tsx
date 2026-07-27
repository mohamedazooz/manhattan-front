import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { PermissionGuard } from '../auth/ProtectedRoute';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Image,
  FileText,
  GraduationCap,
  Camera,
  Newspaper,
  MessageSquare,
  ClipboardList,
  Briefcase,
  Mail,
  Users,
  Shield,
  Settings,
  LogOut,
  Home,
  Search,
} from 'lucide-react';

const navItems = [
  { to: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard, perm: 'VIEW_DASHBOARD' },
  { to: '/admin/landing/hero', labelKey: 'admin.hero', icon: Image, perm: 'MANAGE_LANDING' },
  { to: '/admin/landing/sections', labelKey: 'admin.sections', icon: FileText, perm: 'MANAGE_LANDING' },
  { to: '/admin/about', labelKey: 'admin.about', icon: FileText, perm: 'MANAGE_ABOUT_US' },
  { to: '/admin/pages', labelKey: 'admin.pages', icon: FileText, perm: 'MANAGE_ABOUT_US' },
  { to: '/admin/settings', labelKey: 'admin.settings', icon: Settings, perm: 'UPDATE_SYSTEM_CONFIG' },
  { to: '/admin/seo', labelKey: 'SEO Settings', icon: Search, perm: 'UPDATE_SYSTEM_CONFIG' },
  { to: '/admin/education', labelKey: 'admin.education', icon: GraduationCap, perm: 'MANAGE_EDUCATION' },
  { to: '/admin/gallery', labelKey: 'admin.gallery', icon: Camera, perm: 'MANAGE_GALLERY' },
  { to: '/admin/blog', labelKey: 'admin.blog', icon: Newspaper, perm: 'UPDATE_BLOG' },
  { to: '/admin/comments', labelKey: 'admin.comments', icon: MessageSquare, perm: 'APPROVE_COMMENTS' },
  { to: '/admin/admissions', labelKey: 'admin.admissions', icon: ClipboardList, perm: 'VIEW_ALL_ADMISSIONS' },
  { to: '/admin/admission-requirements', labelKey: 'admin.requirements', icon: ClipboardList, perm: 'MANAGE_ADMISSION_REQUIREMENTS' },
  { to: '/admin/careers', labelKey: 'admin.careers', icon: Briefcase, perm: 'MANAGE_JOBS' },
  { to: '/admin/inquiries', labelKey: 'admin.inquiries', icon: Mail, perm: 'VIEW_DASHBOARD' },
  { to: '/admin/users', labelKey: 'admin.users', icon: Users, perm: 'MANAGE_USERS' },
  { to: '/admin/roles', labelKey: 'admin.roles', icon: Shield, perm: 'MANAGE_ROLES' },
  { to: '/admin/email', labelKey: 'admin.email', icon: Mail, perm: 'MANAGE_EMAIL_TEMPLATES' },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-neutral-light">
      <aside className="w-64 shrink-0 bg-primary-dark text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="font-bold text-lg">MLS Admin</div>
          <div className="text-xs text-white/60 mt-1">{user?.fullName}</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <PermissionGuard key={item.to} permission={item.perm}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </NavLink>
            </PermissionGuard>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <Home className="h-4 w-4" /> Site
          </button>
          <button
            onClick={() => logout().then(() => navigate('/admin/login'))}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> {t('admin.logout')}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3 flex justify-end">
          <LanguageSwitcher />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
