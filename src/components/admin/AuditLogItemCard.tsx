import {
  FileText,
  Briefcase,
  GraduationCap,
  Users,
  Mail,
  Settings,
  Shield,
  Circle,
  LogIn,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatRelativeTime } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export type AuditCategory =
  | 'auth'
  | 'admissions'
  | 'jobs'
  | 'content'
  | 'users'
  | 'system'
  | 'inquiries'
  | 'other';

export type AuditSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AuditLogDisplayItem {
  id: string;
  action: string;
  actionLabel?: string;
  actionLabelEn?: string;
  details?: string | null;
  detailsLabel?: string | null;
  detailsLabelEn?: string | null;
  category?: AuditCategory | string;
  moduleLabel?: string;
  moduleLabelEn?: string;
  severity?: AuditSeverity | string;
  ipAddress?: string | null;
  createdAt: string;
  user?: { fullName: string; email?: string } | null;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  auth: LogIn,
  admissions: GraduationCap,
  jobs: Briefcase,
  content: FileText,
  users: Users,
  inquiries: Mail,
  system: Settings,
  other: Circle,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  auth: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  admissions: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  jobs: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  content: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  users: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  inquiries: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  system: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface AuditLogItemCardProps {
  log: AuditLogDisplayItem;
  compact?: boolean;
  showIp?: boolean;
}

export function AuditLogItemCard({ log, compact = false, showIp = true }: AuditLogItemCardProps) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const category = (log.category ?? 'other') as string;
  const severity = (log.severity ?? 'info') as string;
  const Icon = CATEGORY_ICONS[category] ?? Shield;

  const title =
    (isAr ? log.actionLabel : log.actionLabelEn) ??
    log.actionLabel ??
    log.actionLabelEn ??
    log.action;

  const details =
    (isAr ? log.detailsLabel : log.detailsLabelEn) ??
    log.detailsLabel ??
    log.detailsLabelEn ??
    null;

  const moduleName =
    (isAr ? log.moduleLabel : log.moduleLabelEn) ??
    log.moduleLabel ??
    t(`admin.audit.category.${category}`, category);

  return (
    <div
      className={cn(
        'relative flex gap-3 rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-shadow hover:shadow-md',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div
        className={cn(
          'shrink-0 flex items-center justify-center rounded-xl border w-10 h-10',
          SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn('font-bold text-slate-900 dark:text-white', compact ? 'text-sm' : 'text-base')}>
                {title}
              </h3>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  CATEGORY_BADGE_STYLES[category] ?? CATEGORY_BADGE_STYLES.other,
                )}
              >
                {moduleName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {log.user?.fullName ?? t('admin.system', 'System')}
              </span>
              {' · '}
              <span title={formatDate(log.createdAt, lang)}>
                {formatRelativeTime(log.createdAt, lang)}
              </span>
            </p>
          </div>
        </div>

        {details && (
          <p className={cn('text-slate-600 dark:text-slate-300 leading-relaxed', compact ? 'text-xs' : 'text-sm')}>
            {details}
          </p>
        )}

        {showIp && log.ipAddress && (
          <p className="text-[10px] text-slate-400 hidden sm:block">
            IP: {log.ipAddress === '::1' || log.ipAddress === '127.0.0.1' ? t('admin.audit.localhost', 'Local') : log.ipAddress}
          </p>
        )}
      </div>
    </div>
  );
}

export const AUDIT_CATEGORIES: AuditCategory[] = [
  'auth',
  'admissions',
  'jobs',
  'content',
  'users',
  'inquiries',
  'system',
  'other',
];
