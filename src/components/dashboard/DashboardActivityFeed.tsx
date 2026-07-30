import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { PermissionGuard } from '../auth/ProtectedRoute';

export interface ActivityLogItem {
  id: string;
  action: string;
  actionLabel?: string;
  details?: string | null;
  createdAt: string;
  user?: { fullName: string } | null;
}

interface Props {
  activity: ActivityLogItem[];
}

export function DashboardActivityFeed({ activity }: Props) {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-dark">{t('admin.recentActivity', 'Recent Activity')}</h2>
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
            <div key={log.id} className="rounded border bg-white p-3 text-sm">
              <div className="font-medium">{log.actionLabel ?? log.action}</div>
              <div className="text-neutral-medium">
                {log.user?.fullName ?? t('admin.system', 'System')} · {formatDate(log.createdAt, lang)}
              </div>
              {log.details && <div className="text-xs mt-1 text-neutral-medium">{log.details}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
