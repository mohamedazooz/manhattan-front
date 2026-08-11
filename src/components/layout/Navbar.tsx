import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Sun, Moon, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { cmsApi } from '../../api';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../../lib/auth';
import { getPortalHomeForRole } from '../../components/auth/RoleRoute';
import { useTheme } from '../../lib/theme';
import { cn, mediaUrl, DEFAULT_GCS_LOGO } from '../../lib/utils';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isRtl = i18n.language === 'ar';

  const { data: config = {} } = useQuery({
    queryKey: ['cms-config'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
  });

  // Track scroll position to enhance background dynamics
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/academics', label: t('nav.academics') },
    { to: '/admissions', label: t('nav.admissions') },
    { to: '/student-life', label: t('nav.studentLife') },
    { to: '/gallery', label: t('nav.gallery', isRtl ? 'معرض' : 'Gallery') },
    { to: '/careers', label: t('nav.careers', isRtl ? 'وظائف' : 'Careers') },
    { to: '/news', label: t('nav.news') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b w-full overflow-x-hidden',
        scrolled
          ? 'bg-white/95 dark:bg-slate-950/95 border-slate-200/90 dark:border-slate-800/90 shadow-md shadow-slate-950/5 py-2'
          : 'bg-white/90 dark:bg-slate-950/90 border-slate-200/60 dark:border-slate-800/60 shadow-xs py-2.5'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 lg:gap-2.5 px-3 lg:px-4 xl:px-6 w-full">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group py-0.5">
          <img
            src={mediaUrl(config.school_logo_url || DEFAULT_GCS_LOGO)}
            alt="Manhattan Language School"
            className="h-10 lg:h-11 xl:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling;
              if (sibling) sibling.classList.remove('hidden');
            }}
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-primary font-black tracking-wider text-xs lg:text-sm xl:text-base dark:text-white leading-tight">
              {isRtl ? 'مدرسة مانهاتن للغات' : 'MLS MANHATTAN'}
            </span>
            <span className="text-[9px] lg:text-[10px] font-semibold text-gold tracking-widest uppercase">
              {isRtl ? 'التعليم ثنائي اللغة' : 'Language School'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shrink-0 overflow-hidden mx-3 xl:mx-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative px-2 xl:px-2.5 2xl:px-3 py-1 rounded-full text-xs xl:text-[13px] 2xl:text-sm font-bold transition-all duration-200 whitespace-nowrap select-none shrink-0',
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-amber-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60 font-extrabold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-1">
                  {link.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Hub & Utilities */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ms-auto ps-2">
          <div className="hidden sm:block me-1">
            <LanguageSwitcher />
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label={t('theme.toggle')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform hover:rotate-45 duration-300" />
            ) : (
              <Moon className="h-4.5 w-4.5 transition-transform hover:-rotate-12 duration-300" />
            )}
          </button>

          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
              title={t('common.back', 'رجوع للصفحة السابقة')}
            >
              <span className="rtl:rotate-0">←</span>
              <span className="hidden sm:inline">{t('common.back', 'رجوع')}</span>
            </button>
          )}

          <button
            onClick={() => navigate('/search')}
            className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            aria-label={t('nav.search')}
            title={t('nav.search')}
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {user ? (
            <Link
              to={getPortalHomeForRole(role)}
              className="p-2 lg:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:text-primary dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs flex items-center justify-center shrink-0"
              title={isRtl ? 'لوحة التحكم' : 'Dashboard'}
              aria-label={isRtl ? 'لوحة التحكم' : 'Dashboard'}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
            </Link>
          ) : (
            <Button
              to="/login"
              className="py-1.5 px-3 lg:px-3.5 text-xs font-bold shadow-xs bg-gradient-to-r from-primary to-blue-900 hover:from-primary-dark hover:to-blue-950 text-white rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0"
            >
              <User className="h-3.5 w-3.5 me-1.5" />
              {t('nav.login')}
            </Button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Dynamic Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden animate-fade-in border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl px-4 py-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="outline" to={getPortalHomeForRole(role)} className="py-1.5 px-3 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
                </Button>
              ) : (
                <Button variant="outline" to="/login" className="py-1.5 px-3 text-xs font-bold rounded-lg flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{t('nav.login')}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between',
                    isActive
                      ? 'bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-amber-400 font-extrabold border border-primary/20 dark:border-amber-400/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
