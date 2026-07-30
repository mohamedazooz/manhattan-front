import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppLanguage } from '../../i18n';
import { cn } from '../../lib/utils';

const colors: Record<string, string> = {
  PUBLISHED: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  DRAFT: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  OPEN: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  CLOSED: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  SUBMITTED: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300',
  UNDER_REVIEW: 'bg-yellow-100 dark:bg-amber-950/80 text-yellow-800 dark:text-amber-300',
  ACCEPTED: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  REJECTED: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300',
  NEW: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300',
  READ: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  REPLIED: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  ARCHIVED: 'bg-gray-100 dark:bg-slate-500 text-gray-500 dark:text-slate-400',
  PENDING: 'bg-yellow-100 dark:bg-amber-950/80 text-yellow-800 dark:text-amber-300',
  APPROVED: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  SPAM: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300',
  ACTIVE: 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300',
  SUSPENDED: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[status] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
      )}
    >
      {t(`status.${status}`, status ? status.replace(/_/g, ' ') : '')}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function PageHeader({ title, subtitle, showBack = true }: { title: string; subtitle?: string; showBack?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';
  const canGoBack = showBack && location.pathname !== '/';

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark dark:text-slate-100 font-[family-name:var(--font-heading)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-medium dark:text-slate-400">{subtitle}</p>}
      </div>
      {canGoBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all shrink-0 active:scale-95"
          title={isAr ? 'رجوع للصفحة السابقة' : 'Go back'}
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{isAr ? 'رجوع' : 'Back'}</span>
        </button>
      )}
    </div>
  );
}
