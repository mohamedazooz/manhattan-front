import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const page = location.pathname.split('/').pop() || '';
  const lang = useAppLanguage();
  const slug = slugMap[page] || page;

  const { data, isLoading } = useQuery({
    queryKey: ['page', slug, lang],
    queryFn: () => pagesApi.get(slug, lang).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="p-12 text-center">{t('staticPage.notFound')}</p>;

  const title = getBilingualText(data, 'title', lang);
  const content = getBilingualText(data, 'content', lang);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title={title} />
      <div className="prose-content text-neutral-medium dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
