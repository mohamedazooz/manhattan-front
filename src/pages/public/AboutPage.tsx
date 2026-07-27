import { useQuery } from '@tanstack/react-query';
import { aboutApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function AboutPage() {
  const lang = useAppLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['about', lang],
    queryFn: () => aboutApi.get(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const sections = data?.sections || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title="About Us"
        description="Learn about Manhattan Language School's story, mission, educational excellence, and core values."
      />
      <PageHeader title="About Us" subtitle="Our story, mission, and values" />
      {sections.length === 0 && data?.legacyHistory && (
        <p className="text-neutral-medium leading-relaxed">{data.legacyHistory}</p>
      )}
      <div className="space-y-12">
        {sections.map((section: { id: string; title: string; content: string; imageUrl?: string }) => (
          <div key={section.id} className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary-dark mb-3">{section.title}</h2>
              <div className="prose-content text-neutral-medium" dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
            {section.imageUrl && (
              <img src={mediaUrl(section.imageUrl)} alt={section.title} className="rounded-lg shadow-md w-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
