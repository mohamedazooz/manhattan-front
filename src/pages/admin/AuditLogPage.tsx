import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '../../api';
import { DataTable } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import type { AuditLogEntry } from '../../types';

export function AuditLogPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-audit', page, actionFilter],
    queryFn: () =>
      dashboardApi
        .audit({ page, limit: 50, action: actionFilter || undefined })
        .then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const items: AuditLogEntry[] = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.audit', 'Audit Log')}
        subtitle={t('admin.auditSubtitle', 'System-wide activity and status change history')}
      />

      <div className="max-w-md">
        <Input
          label={t('admin.filterAction', 'Filter by action')}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          placeholder="admissions, STATUS_CHANGE..."
        />
      </div>

      <DataTable
        data={items}
        columns={[
          {
            key: 'createdAt',
            header: t('admin.date', 'Date'),
            render: (r) => formatDate(r.createdAt, lang),
          },
          {
            key: 'user',
            header: t('admin.user', 'User'),
            render: (r) => r.user?.fullName ?? t('admin.system', 'System'),
          },
          {
            key: 'action',
            header: t('admin.action', 'Action'),
            render: (r) => r.actionLabel ?? r.action,
          },
          {
            key: 'details',
            header: t('admin.details', 'Details'),
            render: (r) => (
              <span className="text-xs text-neutral-medium line-clamp-2">{r.details ?? '—'}</span>
            ),
          },
          {
            key: 'ip',
            header: 'IP',
            render: (r) => r.ipAddress ?? '—',
          },
        ]}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('admin.prevPage', 'Previous')}
          </button>
          <span>
            {t('admin.pageOf', 'Page {{page}} of {{total}}', {
              page: data.page,
              total: data.totalPages,
            })}
          </span>
          <button
            type="button"
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('admin.nextPage', 'Next')}
          </button>
        </div>
      )}
    </div>
  );
}
