import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function NewsPage() {
  const lang = useAppLanguage();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', lang],
    queryFn: () => blogApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title="News & Events"
        description="Stay updated with the latest news, announcements, and events from Manhattan Language School."
      />
      <PageHeader title="News & Events" subtitle="Latest updates from our school" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} to={`/news/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              {post.coverImageUrl && (
                <img src={mediaUrl(post.coverImageUrl)} alt={post.title} className="w-full h-40 object-cover rounded mb-4" />
              )}
              <span className="text-xs text-neutral-medium">{formatDate(post.createdAt, lang)}</span>
              <h3 className="text-lg font-semibold mt-1">{post.title}</h3>
              <p className="text-sm text-neutral-medium mt-2 line-clamp-3">{post.content.replace(/<[^>]+>/g, '').slice(0, 120)}...</p>
            </Card>
          </Link>
        ))}
      </div>
      {!posts.length && <p className="text-neutral-medium">No news published yet.</p>}
    </div>
  );
}
