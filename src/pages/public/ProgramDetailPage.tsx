import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { educationApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lang = useAppLanguage();
  const { data: program, isLoading } = useQuery({
    queryKey: ['education', slug, lang],
    queryFn: () => educationApi.get(slug!, lang).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!program) return <p className="p-12 text-center">Program not found</p>;

  const progImage = program.coverImageUrl ? mediaUrl(program.coverImageUrl) : undefined;
  const snippet = program.summary || program.content.replace(/<[^>]*>?/gm, '').slice(0, 160);

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    description: snippet,
    provider: {
      '@type': 'School',
      name: 'Manhattan Language School',
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={program.metaTitle || program.title}
        description={program.metaDescription || snippet}
        keywords={program.metaKeywords}
        ogImage={program.ogImage || progImage}
        jsonLd={courseJsonLd}
      />
      {program.coverImageUrl && (
        <img src={mediaUrl(program.coverImageUrl)} alt={program.title} className="w-full h-64 object-cover rounded-lg mb-8" />
      )}
      <PageHeader title={program.title} subtitle={program.summary} />
      <div className="prose-content text-neutral-medium" dangerouslySetInnerHTML={{ __html: program.content }} />
    </div>
  );
}
