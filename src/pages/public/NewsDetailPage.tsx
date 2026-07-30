import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { blogApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const lang = useAppLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug, lang],
    queryFn: () => blogApi.get(slug!, lang).then((r) => r.data),
    enabled: !!slug,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <p className="p-12 text-center text-neutral-medium">{t('newsPage.articleNotFound')}</p>;

  const articleImage = post.coverImageUrl ? mediaUrl(post.coverImageUrl) : undefined;
  const snippet = post.content.replace(/<[^>]*>?/gm, '').slice(0, 160);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: articleImage ? [articleImage] : undefined,
    datePublished: post.createdAt,
    author: post.author?.fullName ? { '@type': 'Person', name: post.author.fullName } : undefined,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <SeoHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || snippet}
        keywords={post.metaKeywords}
        ogImage={post.ogImage || articleImage}
        article={true}
        publishedTime={post.createdAt}
        authorName={post.author?.fullName}
        jsonLd={articleJsonLd}
      />
      {post.coverImageUrl && (
        <img
          src={mediaUrl(post.coverImageUrl)}
          alt={post.title}
          className="w-full h-80 object-cover rounded-xl shadow-md mb-8"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/photos/photo1.jpeg';
          }}
        />
      )}
      <PageHeader title={post.title} subtitle={`${post.category?.name || 'News'} · ${formatDate(post.createdAt, lang)}`} />
      
      <div className="prose-content text-neutral-dark text-base leading-relaxed mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

