import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Newspaper, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { blogApi } from '../../api';
import { StatusBadge } from '../ui/Badge';
import { formatDate, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { PermissionGuard } from '../auth/ProtectedRoute';

export function DashboardBlogSection() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['dashboard-blog-posts'],
    queryFn: () =>
      blogApi.admin().then((r) => {
        const body = r.data;
        return Array.isArray(body) ? body : body.data ?? [];
      }),
  });

  return (
    <PermissionGuard permission="UPDATE_BLOG">
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-neutral-dark">{t('admin.blogTitle', 'Blog & Academy News')}</h2>
          </div>
          <Link
            to="/admin/blog"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {t('admin.manageAll', 'Manage All Posts')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center py-8 text-neutral-medium">{t('admin.noPosts', 'No blog posts found.')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogPosts.slice(0, 6).map((post: {
              id: string;
              title: string;
              coverImageUrl?: string;
              status: string;
              createdAt: string;
              category?: { name: string };
              author?: { fullName: string };
            }) => (
              <div key={post.id} className="rounded-lg border overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <div className="h-36 bg-neutral-100 relative overflow-hidden">
                  {post.coverImageUrl ? (
                    <img
                      src={mediaUrl(post.coverImageUrl)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/photos/photo1.jpeg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={post.status} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {post.category && (
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-neutral-dark line-clamp-2 mt-1">
                      {post.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-2 border-t text-xs text-neutral-medium flex items-center justify-between">
                    <span>{post.author?.fullName || 'Admin'}</span>
                    <span>{formatDate(post.createdAt, lang)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
