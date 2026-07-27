import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { SeoHead } from '../../components/common/SeoHead';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const lang = useAppLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug, lang],
    queryFn: () => blogApi.get(slug!, lang).then((r) => r.data),
    enabled: !!slug,
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!post?.id || !commentText.trim()) return;
      return blogApi.createComment(post.id, commentText);
    },
    onSuccess: () => {
      setCommentText('');
      setCommentSuccess(true);
      qc.invalidateQueries({ queryKey: ['post', slug, lang] });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <p className="p-12 text-center text-neutral-medium">Article not found</p>;

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

  const approvedComments = (post.comments || []).filter(
    (c: { status: string }) => c.status === 'APPROVED' || c.status === 'APPROVED'
  );

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
        <img src={mediaUrl(post.coverImageUrl)} alt={post.title} className="w-full h-80 object-cover rounded-xl shadow-md mb-8" />
      )}
      <PageHeader title={post.title} subtitle={`${post.category?.name || 'News'} · ${formatDate(post.createdAt, lang)}`} />
      
      <div className="prose-content text-neutral-dark text-base leading-relaxed mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Comments Section */}
      <section className="border-t border-neutral-200 pt-8 mt-12">
        <h3 className="font-bold text-xl mb-6 text-neutral-dark flex items-center gap-2">
          💬 Comments ({approvedComments.length})
        </h3>

        {/* Comment List */}
        <div className="space-y-4 mb-8">
          {approvedComments.map((c: { id: string; content: string; createdAt: string; author?: { fullName: string } }) => (
            <div key={c.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-neutral-dark">{c.author?.fullName || 'Anonymous'}</span>
                <span className="text-xs text-neutral-medium">{formatDate(c.createdAt, lang)}</span>
              </div>
              <p className="text-sm text-neutral-dark">{c.content}</p>
            </div>
          ))}
          {approvedComments.length === 0 && (
            <p className="text-sm text-neutral-medium italic">No comments yet. Be the first to join the discussion!</p>
          )}
        </div>

        {/* Comment Form */}
        {!user ? (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900 flex justify-between items-center">
            <span>Please login to post a comment on this article.</span>
            <Link to="/login">
              <Button variant="secondary" className="text-xs">Log In</Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commentMutation.mutate();
            }}
            className="space-y-3 max-w-xl bg-white p-5 rounded-xl border border-neutral-200 shadow-sm"
          >
            <h4 className="font-semibold text-sm text-neutral-dark">Leave a Comment</h4>
            {commentSuccess && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                Comment submitted! It will appear after admin review.
              </p>
            )}
            <Textarea
              label="Your Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              required
            />
            <Button type="submit" className="text-xs" disabled={commentMutation.isPending}>
              {commentMutation.isPending ? 'Submitting...' : 'Post Comment'}
            </Button>
          </form>
        )}
      </section>
    </article>
  );
}

