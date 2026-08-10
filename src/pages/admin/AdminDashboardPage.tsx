import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { DashboardOverviewCards } from '../../components/dashboard/DashboardOverviewCards';
import { DashboardAnalyticsPanel } from '../../components/dashboard/DashboardAnalyticsPanel';
import { DashboardModuleGrid } from '../../components/dashboard/DashboardModuleGrid';
import { DashboardPipelineSection } from '../../components/dashboard/DashboardPipelineSection';
import { useAuth } from '../../lib/auth';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
    refetchInterval: 120_000,
  });

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.dashboard', 'Dashboard')}
        subtitle={t('admin.dashboardWelcome', { name: user?.fullName ?? 'Admin' })}
      />

      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {t('admin.ops.statsError', 'Could not load dashboard stats. Check API connection and refresh.')}
        </div>
      )}

      {stats && <DashboardOverviewCards stats={stats} />}

      {stats && <DashboardPipelineSection stats={stats} />}

      {stats && <DashboardAnalyticsPanel stats={stats} />}

      {stats && <DashboardModuleGrid stats={stats} />}
    </div>
  );
}
