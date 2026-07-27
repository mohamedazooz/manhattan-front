import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export function AdminDashboardPage() {
  const lang = useAppLanguage();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  });
  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.activity().then((r) => r.data),
  });

  if (statsLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of school operations" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><div className="text-2xl font-bold text-primary">{stats?.admissions?.total ?? 0}</div><div className="text-sm text-neutral-medium">Total Admissions</div></Card>
        <Card><div className="text-2xl font-bold text-accent">{stats?.admissions?.submitted ?? 0}</div><div className="text-sm text-neutral-medium">Submitted</div></Card>
        <Card><div className="text-2xl font-bold text-primary">{stats?.blog?.published ?? 0}</div><div className="text-sm text-neutral-medium">Published Posts</div></Card>
        <Card><div className="text-2xl font-bold text-gold">{stats?.jobs?.open ?? 0}</div><div className="text-sm text-neutral-medium">Open Jobs</div></Card>
      </div>
      <h2 className="font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {activity.map((log: { id: string; action: string; details?: string; createdAt: string; user?: { fullName: string } }) => (
          <div key={log.id} className="rounded border bg-white p-3 text-sm">
            <div className="font-medium">{log.action}</div>
            <div className="text-neutral-medium">{log.user?.fullName} · {formatDate(log.createdAt, lang)}</div>
            {log.details && <div className="text-xs mt-1">{log.details}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
