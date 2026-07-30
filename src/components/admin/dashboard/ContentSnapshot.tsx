import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Image as ImageIcon } from 'lucide-react';
import { StatusBadge } from '../../ui/Badge';
import { formatDate, mediaUrl } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';

interface BlogPostPreview {
  id: string;
  title: string;
  coverImageUrl?: string;
  status: string;
  createdAt: string;
  category?: { name: string };
  author?: { fullName: string };
}

export function ContentSnapshot({
  posts,
  draftCount,
  pendingComments,
}: {
  posts: BlogPostPreview[];
  draftCount: number;
  pendingComments: number;
}) {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {t('admin.draftPosts', 'Draft posts')}: <strong>{draftCount}</strong>
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {t('admin.pendingComments', 'Pending comments')}: <strong>{pendingComments}</strong>
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">
          {t('admin.noPosts', 'No blog posts found.')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <div
              key={post.id}
              className="flex flex-col overflow-hidden rounded-lg border border-slate-200 transition-colors hover:border-primary/40 dark:border-slate-700"
            >
              <div className="relative h-28 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {post.coverImageUrl ? (
                  <img
                    src={mediaUrl(post.coverImageUrl)}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <StatusBadge status={post.status} />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-3">
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-primary">
                    <Newspaper className="h-3 w-3" />
                    {post.category?.name}
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {post.title}
                  </h3>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-slate-500">
                  <span>{post.author?.fullName || 'Admin'}</span>
                  <span>{formatDate(post.createdAt, lang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-right">
        <Link to="/admin/blog" className="text-sm font-medium text-primary hover:underline">
          {t('admin.manageAll', 'Manage All Posts')} →
        </Link>
      </div>
    </div>
  );
}
