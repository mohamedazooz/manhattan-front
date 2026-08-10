import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { healthApi } from '../../api';
import { API_URL } from '../../lib/utils';

export function AdminApiStatusBanner() {
  const { t } = useTranslation();

  const { isError, isLoading } = useQuery({
    queryKey: ['api-health'],
    queryFn: () => healthApi.ping().then((r) => r.data),
    retry: 1,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (isLoading || !isError) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">
            {t('admin.ops.apiOfflineTitle', 'Cannot reach the API server')}
          </p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            {t(
              'admin.ops.apiOfflineHint',
              'Check that the NestJS backend is running and VITE_API_URL points to it.',
            )}{' '}
            <code className="text-xs bg-amber-100/80 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">{API_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
