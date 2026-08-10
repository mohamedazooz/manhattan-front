import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { pagesApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { getBilingualText } from '../../lib/utils';

const slugMap: Record<string, string> = {
  policies: 'school-policies',
  forms: 'forms-documents',
};

export function StaticParentPage() {
  const { t } = useTranslation();
  const params = useParams<{ slug?: string }>();
  const location = useLocation();
  const lang = useAppLanguage();

  const pathLast = location.pathname.split('/').filter(Boolean).pop() || '';
  const rawSlug = params.slug || pathLast;
  const slug = slugMap[rawSlug] || rawSlug;

  const { data, isLoading } = useQuery({
    queryKey: ['page', slug, lang],
    queryFn: () => pagesApi.get(slug, lang).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="p-12 text-center text-slate-500 dark:text-slate-400">{t('staticPage.notFound', 'الصفحة غير موجودة')}</p>;

  const title = getBilingualText(data, 'title', lang);
  const content = getBilingualText(data, 'content', lang);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title={title} />
      <div className="prose-content text-neutral-medium dark:text-slate-300 leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
