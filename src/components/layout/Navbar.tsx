import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../../lib/auth';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/academics', label: t('nav.academics') },
    { to: '/admissions', label: t('nav.admissions') },
    { to: '/student-life', label: t('nav.studentLife') },
    { to: '/news', label: t('nav.news') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
            MS
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-primary-dark leading-tight">
              MANHATTAN
            </div>
            <div className="text-xs text-neutral-medium">LANGUAGE SCHOOL</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive ? 'text-primary' : 'text-neutral-dark',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/search')}
            className="p-2 text-neutral-medium hover:text-primary"
            aria-label={t('nav.search')}
          >
            <Search className="h-5 w-5" />
          </button>
          {user ? (
            <>
              <Button variant="outline" to="/portal" className="hidden sm:inline-flex py-2 px-4 text-xs">
                {t('nav.portal')}
              </Button>
              {isAdmin && (
                <Button variant="secondary" to="/admin" className="hidden sm:inline-flex py-2 px-4 text-xs">
                  {t('nav.admin')}
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" to="/login" className="hidden sm:inline-flex py-2 px-4 text-xs">
              {t('nav.login')}
            </Button>
          )}
          <Button to="/admissions" showArrow className="py-2 px-4 text-xs">
            {t('nav.enroll')}
          </Button>
        </div>
      </div>
    </header>
  );
}
