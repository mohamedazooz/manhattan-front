import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { PermissionGuard } from '../auth/ProtectedRoute';
import { AuditLogItemCard, type AuditLogDisplayItem } from '../admin/AuditLogItemCard';

interface Props {
  activity: AuditLogDisplayItem[];
}

export function DashboardActivityFeed({ activity }: Props) {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-dark dark:text-slate-100">
          {t('admin.recentActivity', 'Recent activity')}
        </h2>
        <PermissionGuard permission="MANAGE_ROLES">
          <Link to="/admin/audit" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('admin.viewFullAudit', 'View full audit log')} <ArrowRight className="h-4 w-4" />
          </Link>
        </PermissionGuard>
      </div>
      <div className="space-y-2">
        {activity.length === 0 ? (
          <p className="text-sm text-neutral-medium">{t('admin.noActivity', 'No recent activity recorded.')}</p>
        ) : (
          activity.slice(0, 10).map((log) => (
            <AuditLogItemCard key={log.id} log={log} compact showIp={false} />
          ))
        )}
      </div>
    </section>
  );
}
