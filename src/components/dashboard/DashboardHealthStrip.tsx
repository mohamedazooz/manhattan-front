import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { useAuth } from '../../lib/auth';
import {
  buildDashboardActions,
  computeOpsHealth,
  countTotalActions,
  isDashboardEmpty,
} from '../../lib/dashboardOps';
import { cn } from '../../lib/utils';

interface Props {
  stats: DashboardStats;
}

const healthStyles = {
  healthy: {
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleKey: 'admin.ops.healthHealthy',
    titleDefault: 'Operations healthy',
  },
  attention: {
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40',
    icon: Activity,
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleKey: 'admin.ops.healthAttention',
    titleDefault: 'Items need attention',
  },
  critical: {
    border: 'border-rose-200 dark:border-rose-800',
    bg: 'bg-rose-50/80 dark:bg-rose-950/40',
    icon: AlertTriangle,
    iconColor: 'text-rose-600 dark:text-rose-400',
    titleKey: 'admin.ops.healthCritical',
    titleDefault: 'Critical issues detected',
  },
} as const;

export function DashboardHealthStrip({ stats }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  const actions = buildDashboardActions(stats, hasPermission, t);
  const health = computeOpsHealth(actions);
  const totalActions = countTotalActions(actions);
  const emptyData = isDashboardEmpty(stats);
  const style = healthStyles[health];
  const Icon = style.icon;

  return (
    <section
      className={cn(
        'rounded-2xl border p-5 shadow-xs',
        style.border,
        style.bg,
      )}
      aria-label={t('admin.ops.healthLabel', 'Operations health')}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-xl bg-white/70 dark:bg-slate-900/50 p-2.5', style.iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t(style.titleKey, style.titleDefault)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {emptyData
                ? t('admin.ops.emptyDataHint', 'No operational data yet. Publish content or wait for live submissions.')
                : health === 'healthy'
                  ? t('admin.ops.noPendingWork', 'No pending reviews or system alerts.')
                  : t('admin.ops.pendingCount', '{{count}} items across queues need action', { count: totalActions })}
            </p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.slice(0, 4).map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  action.severity === 'critical'
                    ? 'border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
                    : action.severity === 'warning'
                      ? 'border-amber-300 bg-white text-amber-800 hover:bg-amber-50'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                )}
              >
                <span>{action.title}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">
                  {action.count}
                </span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
