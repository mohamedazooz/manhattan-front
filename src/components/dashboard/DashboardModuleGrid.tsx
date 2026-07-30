import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import type { DashboardStats } from '../../types';
import { DASHBOARD_MODULE_CONFIG } from './dashboardConfig';
import { Card } from '../ui/Card';

interface Props {
  stats: DashboardStats;
}

export function DashboardModuleGrid({ stats }: Props) {
  const { t } = useTranslation();
  const { hasPermission, role } = useAuth();

  const modules = DASHBOARD_MODULE_CONFIG.filter((mod) => {
    if (role === 'ADMIN') return true;
    return hasPermission(mod.permission);
  });

  if (modules.length === 0) return null;

  const statsRecord = stats as unknown as Record<string, unknown>;

  return (
    <div>
      <h2 className="font-semibold mb-4 text-neutral-dark">{t('admin.moduleGrid', 'All Modules')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const value = mod.getPrimaryValue(statsRecord);

          return (
            <Card key={mod.moduleKey} className="flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-dark">{t(mod.labelKey)}</div>
                  <div className="text-2xl font-bold text-primary mt-1">{value}</div>
                </div>
              </div>
              <Link
                to={mod.adminRoute}
                className="mt-4 text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                {t('admin.manageModule', 'Manage')} <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
