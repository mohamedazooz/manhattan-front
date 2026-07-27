import { useQuery } from '@tanstack/react-query';
import { galleryApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export function StudentLifePage() {
  const lang = useAppLanguage();
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery', lang],
    queryFn: () => galleryApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageHeader title="Student Life" subtitle="Campus activities, events, and gallery" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img: { id: string; title: string; caption?: string; imageUrl: string; category: string }) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg shadow">
            <img src={mediaUrl(img.imageUrl)} alt={img.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <div className="text-white text-sm">
                <div className="font-medium">{img.title}</div>
                <div className="text-xs opacity-80">{img.category}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!images.length && <p className="text-neutral-medium">No gallery images yet.</p>}
    </div>
  );
}
