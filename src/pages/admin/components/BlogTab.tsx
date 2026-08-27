import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi, storageApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { DataTable, Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { AdminPageGuide } from '../../../components/admin/AdminPageGuide';
import { AdminListToolbar, AdminStatusChip } from '../../../components/admin/AdminListToolbar';
import { AdminDataTable } from '../../../components/admin/AdminDataTable';
import { AdminOpsCounters } from '../../../components/admin/AdminOpsCounters';
import { mediaUrl } from '../../../lib/utils';
import { getApiErrorMessage } from '../../../lib/formData';
import { Upload } from 'lucide-react';

export function AdminBlogPage() {
  const { t } = useTranslation();
  const { id: routePostId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    content: '',
    contentAr: '',
    categoryId: '',
    coverImageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'categories'>('posts');
  const [categoryForm, setCategoryForm] = useState({ name: '', nameAr: '', slug: '' });
  const [commentStatusFilter, setCommentStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SPAM'>('ALL');
  const [commentSearch, setCommentSearch] = useState('');

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-admin'],
    queryFn: () => blogApi.admin().then((r) => r.data),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.categories('en').then((r) => r.data),
  });
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['blog-comments-admin'],
    queryFn: () => blogApi.comments().then((r) => r.data),
    enabled: activeTab === 'comments',
  });

  const commentCounts = useMemo(() => {
    const tally = { total: comments.length, pending: 0, approved: 0, spam: 0 };
    for (const c of comments) {
      if (c.status === 'PENDING') tally.pending += 1;
      else if (c.status === 'APPROVED') tally.approved += 1;
      else if (c.status === 'SPAM') tally.spam += 1;
    }
    return tally;
  }, [comments]);

  const filteredComments = useMemo(() => {
    const search = commentSearch.trim().toLowerCase();
    return comments.filter((c: { status: string; content?: string; author?: { fullName?: string } }) => {
      if (commentStatusFilter !== 'ALL' && c.status !== commentStatusFilter) return false;
      if (!search) return true;
      const content = (c.content || '').toLowerCase();
      const author = (c.author?.fullName || '').toLowerCase();
      return content.includes(search) || author.includes(search);
    });
  }, [comments, commentStatusFilter, commentSearch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      setSaveError(null);
      let finalCoverUrl = form.coverImageUrl;

      if (selectedFile) {
        const uploadRes = await storageApi.upload(selectedFile, 'posts');
        finalCoverUrl = uploadRes.data.fileUrl || uploadRes.data.url;
      }

      const payload = {
        title: form.title,
        titleAr: form.titleAr || undefined,
        content: form.content,
        contentAr: form.contentAr || undefined,
        categoryId: form.categoryId || undefined,
        coverImageUrl: finalCoverUrl,
      };

      return editId ? blogApi.update(editId, payload) : blogApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts-admin'] });
      setOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSaveError(null);
    },
    onError: (err: any) => {
      setSaveError(getApiErrorMessage(err, t('common.errorSave', 'Failed to save post')));
    },
  });

  const openNewModal = () => {
    setEditId(null);
    setForm({
      title: '',
      titleAr: '',
      content: '',
      contentAr: '',
      categoryId: categories[0]?.id || '',
      coverImageUrl: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const openEditModal = (r: any) => {
    setEditId(r.id);
    setForm({
      title: r.title || '',
      titleAr: r.titleAr || '',
      content: r.content || '',
      contentAr: r.contentAr || '',
      categoryId: r.category?.id || categories[0]?.id || '',
      coverImageUrl: r.coverImageUrl || '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSaveError(null);
    setOpen(true);
  };

  const currentCoverDisplay = previewUrl || (form.coverImageUrl ? mediaUrl(form.coverImageUrl) : null);

  const handledRoutePostId = useRef<string | null>(null);

  useEffect(() => {
    if (!routePostId) {
      handledRoutePostId.current = null;
      return;
    }
    if (handledRoutePostId.current === routePostId) return;

    const fromList = posts.find((p: { id: string }) => p.id === routePostId);
    if (fromList) {
      handledRoutePostId.current = routePostId;
      openEditModal(fromList);
      return;
    }

    blogApi
      .getById(routePostId)
      .then((res) => {
        handledRoutePostId.current = routePostId;
        openEditModal(res.data);
      })
      .catch(() => navigate('/admin/blog', { replace: true }));
  }, [routePostId, posts, navigate]);

  const closeBlogModal = () => {
    setOpen(false);
    if (routePostId) {
      handledRoutePostId.current = null;
      navigate('/admin/blog', { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageGuide guideKey="blog" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <PageHeader title={t('admin.blogCrud.title', 'Articles & News Management')} />
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.blogCrud.subtitle', 'Publish school announcements, news articles, and manage comments.')}
          </p>
        </div>
        {activeTab === 'posts' && (
          <Button onClick={openNewModal} className="shadow-sm">{t('admin.blogCrud.addNew', '+ Write New Article')}</Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(['posts', 'comments', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'posts'
              ? t('admin.blogPosts', 'Articles')
              : tab === 'comments'
                ? t('admin.blogComments', 'Comments')
                : t('admin.blogCategories', 'Categories')}
          </button>
        ))}
      </div>

      {activeTab === 'comments' && (
        <div className="space-y-6">
          <AdminOpsCounters
            items={[
              {
                id: 'pending',
                label: t('admin.ops.pendingReview', 'Pending review'),
                value: commentCounts.pending,
                highlight: commentCounts.pending > 0,
                onClick: () => setCommentStatusFilter('PENDING'),
              },
              {
                id: 'approved',
                label: t('status.APPROVED'),
                value: commentCounts.approved,
                onClick: () => setCommentStatusFilter('APPROVED'),
              },
              {
                id: 'spam',
                label: t('status.SPAM'),
                value: commentCounts.spam,
                onClick: () => setCommentStatusFilter('SPAM'),
              },
              {
                id: 'total',
                label: t('admin.blogComments', 'Comments'),
                value: commentCounts.total,
                onClick: () => setCommentStatusFilter('ALL'),
              },
            ]}
          />

          <AdminListToolbar
            searchValue={commentSearch}
            onSearchChange={setCommentSearch}
            searchPlaceholder={t('admin.ops.searchComments', 'Search comments or authors…')}
            resultCount={filteredComments.length}
            totalCount={comments.length}
            filters={
              <>
                <AdminStatusChip
                  label={t('admin.allStatuses', 'All')}
                  active={commentStatusFilter === 'ALL'}
                  onClick={() => setCommentStatusFilter('ALL')}
                  count={commentCounts.total}
                />
                <AdminStatusChip
                  label={t('admin.ops.pendingReview', 'Pending review')}
                  active={commentStatusFilter === 'PENDING'}
                  onClick={() => setCommentStatusFilter('PENDING')}
                  count={commentCounts.pending}
                  variant="warning"
                />
                <AdminStatusChip
                  label={t('status.APPROVED')}
                  active={commentStatusFilter === 'APPROVED'}
                  onClick={() => setCommentStatusFilter('APPROVED')}
                  count={commentCounts.approved}
                />
                <AdminStatusChip
                  label={t('status.SPAM')}
                  active={commentStatusFilter === 'SPAM'}
                  onClick={() => setCommentStatusFilter('SPAM')}
                  count={commentCounts.spam}
                  variant="critical"
                />
              </>
            }
          />

          <AdminDataTable
            isLoading={commentsLoading}
            data={filteredComments}
            emptyTitle={t('admin.ops.noComments', 'No blog comments')}
            emptyDescription={
              comments.length === 0
                ? t('admin.ops.noCommentsHint', 'Comments from readers will appear here for moderation.')
                : t('admin.ops.noFilterResults', 'No items match your search or filter.')
            }
            emptyActionLabel={
              comments.length > 0 ? t('admin.ops.clearFilters', 'Clear filters') : undefined
            }
            onEmptyAction={
              comments.length > 0
                ? () => {
                    setCommentSearch('');
                    setCommentStatusFilter('ALL');
                  }
                : undefined
            }
            columns={[
              {
                key: 'content',
                header: t('admin.comment', 'Comment'),
                render: (r: { content: string }) => (
                  <span className="line-clamp-2 text-sm text-slate-700">{r.content}</span>
                ),
              },
              {
                key: 'author',
                header: t('admin.author', 'Author'),
                render: (r: { author?: { fullName: string } }) => r.author?.fullName || '—',
              },
              {
                key: 'status',
                header: t('common.status', 'Status'),
                render: (r: { status: string }) => <StatusBadge status={r.status} />,
              },
              {
                key: 'actions',
                header: t('common.actions', 'Actions'),
                render: (r: { id: string; status: string }) => (
                  <div className="flex gap-2">
                    {r.status !== 'APPROVED' && (
                      <Button
                        variant="secondary"
                        className="py-1 px-2.5 text-xs"
                        onClick={() =>
                          blogApi.moderateComment(r.id, 'APPROVED').then(() => {
                            qc.invalidateQueries({ queryKey: ['blog-comments-admin'] });
                            qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
                          })
                        }
                      >
                        {t('admin.approve', 'Approve')}
                      </Button>
                    )}
                    {r.status !== 'SPAM' && (
                      <Button
                        variant="danger"
                        className="py-1 px-2.5 text-xs"
                        onClick={() =>
                          blogApi.moderateComment(r.id, 'SPAM').then(() => {
                            qc.invalidateQueries({ queryKey: ['blog-comments-admin'] });
                          })
                        }
                      >
                        {t('admin.spam', 'Spam')}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <form
            className="grid md:grid-cols-4 gap-3 bg-white p-5 rounded-xl border border-slate-200"
            onSubmit={(e) => {
              e.preventDefault();
              blogApi
                .createCategory({
                  name: categoryForm.name,
                  nameAr: categoryForm.nameAr || undefined,
                  slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
                })
                .then(() => {
                  setCategoryForm({ name: '', nameAr: '', slug: '' });
                  qc.invalidateQueries({ queryKey: ['categories'] });
                });
            }}
          >
            <Input label={t('admin.categoryName', 'Name')} value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
            <Input label={t('admin.categoryNameAr', 'Name (AR)')} value={categoryForm.nameAr} onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })} />
            <Input label={t('admin.slug', 'Slug')} value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
            <Button type="submit" className="self-end">{t('admin.addCategory', 'Add Category')}</Button>
          </form>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <DataTable data={categories} columns={[
              { key: 'name', header: t('admin.categoryName', 'Name'), render: (r: { name: string; nameAr?: string }) => r.nameAr ? `${r.name} / ${r.nameAr}` : r.name },
              { key: 'slug', header: t('admin.slug', 'Slug'), render: (r: { slug: string }) => r.slug },
              {
                key: 'actions',
                header: t('common.actions', 'Actions'),
                render: (r: { id: string }) => (
                  <Button
                    variant="danger"
                    className="py-1 px-2.5 text-xs"
                    onClick={() =>
                      blogApi.deleteCategory(r.id).then(() => qc.invalidateQueries({ queryKey: ['categories'] }))
                    }
                  >
                    {t('admin.delete', 'Delete')}
                  </Button>
                ),
              },
            ]} />
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
      <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <DataTable data={posts} columns={[
          {
            key: 'cover',
            header: t('admin.education.coverImage', 'Cover Image'),
            render: (r) => (
              <div className="w-16 h-10 rounded border overflow-hidden bg-slate-100 flex items-center justify-center">
                {r.coverImageUrl ? (
                  <img
                    src={mediaUrl(r.coverImageUrl)}
                    alt={r.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">—</span>
                )}
              </div>
            ),
          },
          {
            key: 'title',
            header: t('common.title', 'Title'),
            render: (r) => (
              <div>
                <div className="font-semibold text-slate-900">{r.title}</div>
                {r.titleAr && <div className="text-xs text-slate-500">{r.titleAr}</div>}
              </div>
            ),
          },
          { key: 'category', header: t('admin.gallery.category', 'Category'), render: (r) => r.category?.name || '—' },
          { key: 'status', header: t('common.status', 'Status'), render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            header: t('common.actions', 'Actions'),
            render: (r) => (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2.5 text-xs" onClick={() => openEditModal(r)}>
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs"
                  onClick={() =>
                    blogApi.updateStatus(r.id, r.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
                      .then(() => {
                        qc.invalidateQueries({ queryKey: ['posts-admin'] });
                        qc.invalidateQueries({ queryKey: ['posts'] });
                      })
                  }
                >
                  {r.status === 'PUBLISHED' ? t('common.draft', 'Draft') : t('common.published', 'Publish')}
                </Button>
              </div>
            ),
          },
        ]} />
      </div>

      <Modal open={open} onClose={closeBlogModal} title={editId ? t('common.edit', 'Edit') : t('admin.blogCrud.addNew', '+ Write New Article')} wide>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={t('admin.titleEn', 'Title (English)')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} />
            <Input label={t('admin.titleAr', 'Title (Arabic)')} value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
          </div>

          <Select label={t('admin.category', 'Category')} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">{t('admin.selectCategory', 'Select category…')}</option>
            {categories.map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div className="space-y-2 border p-4 rounded-xl bg-slate-50/50">
            <label className="block text-sm font-semibold text-slate-800">{t('admin.blogCrud.coverImage', 'Cover image')}</label>

            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 rounded-lg border overflow-hidden bg-slate-200 flex-shrink-0 shadow-2xs">
                {currentCoverDisplay ? (
                  <img
                    src={currentCoverDisplay}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                    {t('admin.blogCrud.noCover', 'No cover')}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{t('admin.blogCrud.coverHint', 'Upload an image from your computer')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs py-1 px-3 flex items-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t('admin.education.uploadFromPc', 'Upload from computer')}
                </Button>
              </div>
            </div>

            <Input
              label={t('admin.blogCrud.coverUrl', 'Cover image URL')}
              value={selectedFile ? selectedFile.name : form.coverImageUrl}
              disabled={!!selectedFile}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Textarea label={t('admin.contentEn', 'Content (English)')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} required />
          <Textarea label={t('admin.contentAr', 'Content (Arabic)')} value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={4} />

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={closeBlogModal}>{t('common.cancel', 'Cancel')}</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t('admin.blogCrud.saving', 'Saving…') : t('admin.blogCrud.savePost', 'Save article')}
            </Button>
          </div>
        </form>
      </Modal>
      </>
      )}
    </div>
  );
}
