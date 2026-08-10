import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, ChevronDown } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { DashboardCharts } from './DashboardCharts';
import { cn } from '../../lib/utils';

interface Props {
  stats: DashboardStats;
}

export function DashboardAnalyticsPanel({ stats }: Props) {
  const { t } = useTranslation();
  const hasData =
    (stats.admissions?.total ?? 0) > 0 ||
    (stats.jobs?.totalApplications ?? 0) > 0 ||
    (stats.content?.totalDrafts ?? 0) > 0;

  const [open, setOpen] = useState(hasData);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-500" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('admin.ops.analyticsTitle', 'Detailed analytics')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('admin.ops.analyticsSubtitle', 'Optional breakdown charts — expand when you need distribution detail.')}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
          <DashboardCharts stats={stats} />
        </div>
      )}
    </section>
  );
}
