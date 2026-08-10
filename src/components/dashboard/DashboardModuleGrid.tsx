import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { dashboardApi } from '../../api';
import { useAuth } from '../../lib/auth';
import type { DashboardStats } from '../../types';
import { DASHBOARD_MODULE_CONFIG } from './dashboardConfig';
import { Card } from '../ui/Card';

interface Props {
  stats: DashboardStats;
}

interface ApiDashboardModule {
  moduleKey: string;
  labelEn: string;
  labelAr: string;
  adminRoute: string;
  permission: string;
  statsKey: string;
}

type GridModule = {
  moduleKey: string;
  adminRoute: string;
  permission: string;
  icon: typeof LayoutDashboard;
  getPrimaryValue: (stats: Record<string, unknown>) => number | string;
  labelKey?: string;
  labelEn?: string;
  labelAr?: string;
};

export function DashboardModuleGrid({ stats }: Props) {
  const { t, i18n } = useTranslation();
  const { hasPermission, role } = useAuth();

  const { data: apiModules, isError } = useQuery({
    queryKey: ['dashboard-modules'],
    queryFn: () => dashboardApi.modules().then((r) => r.data as ApiDashboardModule[]),
    staleTime: 60_000,
  });

  const configByKey = useMemo(
    () => Object.fromEntries(DASHBOARD_MODULE_CONFIG.map((mod) => [mod.moduleKey, mod])),
    [],
  );

  const modules = useMemo(() => {
    const source: GridModule[] =
      !isError && apiModules?.length
        ? apiModules.map((apiMod) => {
            const local = configByKey[apiMod.moduleKey];
            return {
              moduleKey: apiMod.moduleKey,
              labelKey: local?.labelKey,
              labelEn: apiMod.labelEn,
              labelAr: apiMod.labelAr,
              adminRoute: apiMod.adminRoute,
              permission: apiMod.permission,
              icon: local?.icon ?? LayoutDashboard,
              getPrimaryValue: local?.getPrimaryValue ?? (() => '—'),
            };
          })
        : DASHBOARD_MODULE_CONFIG.map((mod) => ({
            moduleKey: mod.moduleKey,
            labelKey: mod.labelKey,
            adminRoute: mod.adminRoute,
            permission: mod.permission,
            icon: mod.icon,
            getPrimaryValue: mod.getPrimaryValue,
          }));

    return source.filter((mod) => {
      if (role === 'ADMIN') return true;
      return hasPermission(mod.permission);
    });
  }, [apiModules, configByKey, hasPermission, isError, role]);

  if (modules.length === 0) return null;

  const statsRecord = stats as unknown as Record<string, unknown>;
  const isAr = i18n.language === 'ar';

  const getLabel = (mod: GridModule) => {
    if (mod.labelKey) return t(mod.labelKey);
    if (isAr && mod.labelAr) return mod.labelAr;
    return mod.labelEn ?? mod.moduleKey;
  };

  return (
    <div>
      <h2 className="font-semibold mb-4 text-neutral-dark dark:text-slate-200">
        {t('admin.ops.quickNav', 'Quick navigation')}
      </h2>
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
                  <div className="font-semibold text-neutral-dark">{getLabel(mod)}</div>
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
