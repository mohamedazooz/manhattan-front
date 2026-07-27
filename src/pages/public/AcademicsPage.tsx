import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { educationApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function AcademicsPage() {
  const lang = useAppLanguage();
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['education', lang],
    queryFn: () => educationApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title="Academics & Education Programs"
        description="Discover Manhattan Language School's comprehensive academic programs, curriculum, and educational standards."
      />
      <PageHeader title="Academics" subtitle="Our academic programs and curriculum" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((p) => (
          <Link key={p.id} to={`/academics/${p.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {p.coverImageUrl && (
                <img src={mediaUrl(p.coverImageUrl)} alt={p.title} className="w-full h-40 object-cover rounded mb-4" />
              )}
              <span className="text-xs text-primary font-medium">{p.level}</span>
              <h3 className="text-lg font-semibold mt-1 mb-2">{p.title}</h3>
              <p className="text-sm text-neutral-medium">{p.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
      {!programs.length && <p className="text-neutral-medium">No programs published yet.</p>}
    </div>
  );
}
