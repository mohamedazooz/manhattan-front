import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { DashboardOverviewCards } from '../../components/dashboard/DashboardOverviewCards';
import { DashboardActionQueue } from '../../components/dashboard/DashboardActionQueue';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { DashboardActivityFeed } from '../../components/dashboard/DashboardActivityFeed';
import { DashboardModuleGrid } from '../../components/dashboard/DashboardModuleGrid';
import { useAuth } from '../../lib/auth';
import { useAppLanguage } from '../../i18n';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard-activity', lang],
    queryFn: () => dashboardApi.activity({ limit: 10, lang }).then((r) => r.data),
  });

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('admin.dashboard', 'Dashboard')}
        subtitle={t('admin.dashboardWelcome', { name: user?.fullName ?? 'Admin' })}
      />

      {stats && <DashboardCharts stats={stats} />}

      {stats && <DashboardOverviewCards stats={stats} />}

      {stats && <DashboardModuleGrid stats={stats} />}

      {stats && <DashboardActionQueue stats={stats} />}

      <DashboardActivityFeed activity={activity} />
    </div>
  );
}
