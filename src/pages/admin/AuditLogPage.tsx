import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { dashboardApi } from '../../api';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import type { AuditCategory, AuditLogEntry } from '../../types';
import {
  AuditLogItemCard,
  AUDIT_CATEGORIES,
} from '../../components/admin/AuditLogItemCard';

export function AuditLogPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-audit', page, actionFilter, categoryFilter, lang],
    queryFn: () =>
      dashboardApi
        .audit({
          page,
          limit: 50,
          action: actionFilter || undefined,
          category: categoryFilter || undefined,
          lang,
        })
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
            {t('admin.audit.filterCategory', 'Filter by category')}
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as AuditCategory | '');
              setPage(1);
            }}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
          >
            <option value="">{t('admin.audit.allCategories', 'All categories')}</option>
            {AUDIT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`admin.audit.category.${cat}`, cat)}
              </option>
            ))}
          </select>
        </div>

        <Input
          label={t('admin.audit.searchAction', 'Search')}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          placeholder={t('admin.audit.searchPlaceholder', 'ابحث في الإجراءات...')}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t('admin.audit.noResults', 'لا توجد سجلات مطابقة للبحث.')}</p>
        </div>
      ) : (
        <div className="relative space-y-3">
          <div className="absolute top-0 bottom-0 start-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" aria-hidden />
          {items.map((log) => (
            <div key={log.id} className="relative sm:ps-2">
              <AuditLogItemCard log={log} />
            </div>
          ))}
        </div>
      )}

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
