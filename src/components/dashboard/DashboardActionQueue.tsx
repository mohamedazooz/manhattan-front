import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, AlertCircle, Inbox } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import type { DashboardStats } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { StatusBadge } from '../ui/Badge';
import { buildDashboardActions, isDashboardEmpty } from '../../lib/dashboardOps';

interface Props {
  stats: DashboardStats;
}

export function DashboardActionQueue({ stats }: Props) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { hasPermission } = useAuth();

  const actions = buildDashboardActions(stats, hasPermission, t);
  const emptyData = isDashboardEmpty(stats);

  const detailBlocks: Array<{
    key: string;
    title: string;
    link: string;
    visible: boolean;
    children?: ReactNode;
  }> = [];

  if (hasPermission('VIEW_ALL_ADMISSIONS') && stats.admissions?.recent?.length) {
    detailBlocks.push({
      key: 'admissions-detail',
      title: t('admin.admissionsOps'),
      link: '/admin/admissions',
      visible: true,
      children: (
        <ul className="space-y-2 mt-2">
          {stats.admissions.recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {a.studentFirstName} {a.studentLastName}
                  {a.referenceNumber && (
                    <span className="text-xs text-neutral-medium ms-2">({a.referenceNumber})</span>
                  )}
                </div>
                <div className="text-xs text-neutral-medium">{a.gradeLevel}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                <Link to={`/admin/admissions/${a.id}`} className="text-primary text-xs hover:underline">
                  {t('admin.review', 'Review')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (hasPermission('MANAGE_JOBS') && stats.jobs?.recentApplications?.length) {
    detailBlocks.push({
      key: 'jobs-detail',
      title: t('admin.careersOps'),
      link: '/admin/careers',
      visible: true,
      children: (
        <ul className="space-y-2 mt-2">
          {stats.jobs.recentApplications.map((app) => (
            <li key={app.id} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{app.fullName}</div>
                <div className="text-xs text-neutral-medium">{app.job?.title}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={app.status} />
                <span className="text-xs text-neutral-medium">{formatDate(app.createdAt, lang)}</span>
              </div>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-neutral-dark dark:text-slate-100">
          {t('admin.actionQueue', 'Action queue')}
        </h2>
      </div>

      {actions.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
          <Inbox className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('admin.ops.queueClear', 'Queue is clear')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {emptyData
                ? t('admin.ops.queueEmptyHint', 'No pending submissions currently in the queue.')
                : t('admin.ops.queueClearHint', 'No reviews, inquiries, or system alerts waiting on you.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {actions.map((action) => (
            <Link
              key={action.id}
              to={action.link}
              className={cn(
                'rounded-xl border p-4 transition-colors hover:shadow-sm',
                action.severity === 'critical'
                  ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30'
                  : action.severity === 'warning'
                    ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40',
              )}
            >
              <div className="text-2xl font-black tabular-nums text-slate-900 dark:text-slate-100">
                {action.count}
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {action.title}
              </div>
              <div className="text-[11px] text-primary mt-2 flex items-center gap-1">
                {t('admin.ops.takeAction', 'Take action')} <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {detailBlocks.length > 0 && (
        <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
          {detailBlocks.map((block) => (
            <div key={block.key}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-dark dark:text-slate-200">{block.title}</h3>
                <Link to={block.link} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {t('admin.manageAll')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {block.children}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
