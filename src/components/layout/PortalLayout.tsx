import { Link, Outlet, useNavigate } from 'react-router-dom';
import { mediaUrl, DEFAULT_GCS_LOGO } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { isStaffRole } from '../auth/RoleRoute';
import { Button } from '../ui/Button';

interface PortalLayoutProps {
  portalType: 'parent' | 'applicant';
}

export function PortalLayout({ portalType }: PortalLayoutProps) {
  const { t } = useTranslation();
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const title =
    portalType === 'parent' ? t('portal.parent.title') : t('portal.applicant.title');

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-ivory dark:bg-neutral-light flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-[var(--color-border-subtle)] sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" title={t('admin.site', 'العودة للموقع')}>
              <img src={mediaUrl(DEFAULT_GCS_LOGO)} alt="MLS" className="h-10 w-auto hover:opacity-90 transition-opacity" />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-widest text-sage font-medium">
                {portalType === 'parent' ? t('portal.parent.badge') : t('portal.applicant.badge')}
              </p>
              <h1 className="text-lg font-semibold text-primary-dark dark:text-white">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 transition-all shadow-2xs"
              title={t('admin.site', 'العودة للموقع الرئيسي')}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('nav.home', 'الرئيسية')}</span>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 shadow-2xs"
              title={t('common.back', 'رجوع للصفحة السابقة')}
            >
              <span className="rtl:rotate-0">←</span>
              <span>{t('common.back', 'رجوع')}</span>
            </button>
            <Link
              to={isStaffRole(role) ? '/admin' : portalType === 'parent' ? '/portal/parent' : '/portal/applicant'}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-light dark:bg-slate-800 text-primary dark:text-blue-400 hover:bg-primary/10 transition-colors"
            >
              <span>{t('nav.portalHome', 'لوحة التحكم')}</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-sm text-neutral-medium ms-1">
              <User className="w-4 h-4" />
              <span>{user?.fullName}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="!py-1.5 !px-3 text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('auth.logout', 'تسجيل الخروج')}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-border-subtle)] bg-white dark:bg-slate-900 py-6">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap gap-4 justify-between text-sm text-neutral-medium">
          <Link to="/contact" className="hover:text-primary">{t('nav.contact')}</Link>
          {portalType === 'parent' ? (
            <>
              <Link to="/parents/forms" className="hover:text-primary">{t('footer.forms')}</Link>
              <Link to="/parents/policies" className="hover:text-primary">{t('portal.parent.policies')}</Link>
            </>
          ) : (
            <Link to="/careers" className="hover:text-primary">{t('portal.applicant.browseJobs')}</Link>
          )}
        </div>
      </footer>
    </div>
  );
}
