import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { educationApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { getBilingualText, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data: program, isLoading } = useQuery({
    queryKey: ['education', slug, lang],
    queryFn: () => educationApi.get(slug!, lang).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!program) return <p className="p-12 text-center text-slate-500">{t('academics.programNotFound', 'Education program not found.')}</p>;

  const title = getBilingualText(program, 'title', lang);
  const summary = getBilingualText(program, 'summary', lang);
  const content = getBilingualText(program, 'content', lang);

  const progImage = program.coverImageUrl ? mediaUrl(program.coverImageUrl) : undefined;
  const snippet = summary || content.replace(/<[^>]*>?/gm, '').slice(0, 160);

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description: snippet,
    provider: {
      '@type': 'School',
      name: 'Manhattan Language School',
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={program.metaTitle || title}
        description={program.metaDescription || snippet}
        keywords={program.metaKeywords}
        ogImage={program.ogImage || progImage}
        jsonLd={courseJsonLd}
      />
      <div className="mb-6">
        <Link
          to="/academics"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t('common.backToAcademics', lang === 'ar' ? 'الرجوع للأكاديميات' : 'Back to Academics')}</span>
        </Link>
      </div>

      {program.coverImageUrl && (
        <img src={mediaUrl(program.coverImageUrl)} alt={title} className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8 border border-slate-200 dark:border-slate-800 shadow-xs" />
      )}
      <PageHeader title={title} subtitle={summary} />
      <div className="prose-content text-neutral-medium dark:text-slate-300 leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
