import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { blogApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate, getBilingualText, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';

export function NewsPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data: posts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['posts', lang],
    queryFn: () => blogApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title={t('newsPage.pageTitle')}
        description={t('newsPage.seoDesc')}
      />
      <PageHeader title={t('newsPage.pageTitle')} subtitle={t('newsPage.pageSubtitle')} />

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isError && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any, idx: number) => {
          const title = getBilingualText(post, 'title', lang);
          const contentSnippet = getBilingualText(post, 'content', lang).replace(/<[^>]+>/g, '').slice(0, 120);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link to={`/news/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    {post.coverImageUrl && (
                      <div className="overflow-hidden rounded-lg mb-4 h-48">
                        <img
                          src={mediaUrl(post.coverImageUrl)}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/photos/photo1.jpeg';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-neutral-medium dark:text-slate-400 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                      <span>{formatDate(post.createdAt, lang)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-dark dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-neutral-medium dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {contentSnippet}...
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-primary dark:text-blue-400">
                    <span>{t('newsPage.readArticle')}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
        </div>
      )}

      {!isError && !posts.length && (
        <EmptyState
          icon={<Newspaper className="h-12 w-12" />}
          title={t('newsPage.noPosts')}
        />
      )}
    </div>
  );
}
