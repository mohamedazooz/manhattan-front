import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/DataTable';
import { StatusBadge, PageHeader } from '../../../components/ui/Badge';
import { AdminDataTable } from '../../../components/admin/AdminDataTable';
import { AdminListToolbar, AdminStatusChip } from '../../../components/admin/AdminListToolbar';
import { AdminOpsCounters } from '../../../components/admin/AdminOpsCounters';
import { formatDate } from '../../../lib/utils';
import { getApiErrorMessage } from '../../../lib/formData';
import { useAppLanguage } from '../../../i18n';
import { Eye, Mail, Send, Phone, User, Clock, MessageSquare, ExternalLink, CheckCircle } from 'lucide-react';

interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
}

export function AdminInquiriesPage() {
  const lang = useAppLanguage();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyInquiry, setReplyInquiry] = useState<ContactInquiry | null>(null);
  const deepLinkInquiryId = searchParams.get('inquiryId');
  const handledInquiryDeepLink = useRef<string | null>(null);

  const [replyForm, setReplyForm] = useState({ subject: '', message: '' });
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery<ContactInquiry[]>({
    queryKey: ['inquiries', statusFilter],
    queryFn: () =>
      contactApi
        .admin(statusFilter === 'ALL' ? undefined : statusFilter)
        .then((r) => r.data),
  });

  useEffect(() => {
    if (!deepLinkInquiryId) {
      handledInquiryDeepLink.current = null;
      return;
    }
    if (handledInquiryDeepLink.current === deepLinkInquiryId) return;

    const inquiry = inquiries.find((item) => item.id === deepLinkInquiryId);
    if (!inquiry) return;

    handledInquiryDeepLink.current = deepLinkInquiryId;
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'NEW') {
      contactApi.updateStatus(inquiry.id, 'READ').then(() => {
        qc.invalidateQueries({ queryKey: ['inquiries'] });
      });
    }
  }, [deepLinkInquiryId, inquiries, qc]);

  const clearInquiryDeepLink = () => {
    if (!searchParams.get('inquiryId')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('inquiryId');
    setSearchParams(next, { replace: true });
    handledInquiryDeepLink.current = null;
  };

  const handleOpenView = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'NEW') {
      contactApi.updateStatus(inquiry.id, 'READ').then(() => {
        qc.invalidateQueries({ queryKey: ['inquiries'] });
      });
    }
  };

  const handleOpenReply = (inquiry: ContactInquiry) => {
    setReplyInquiry(inquiry);
    setReplyForm({
      subject: inquiry.subject.startsWith('Re:')
        ? inquiry.subject
        : `Re: ${inquiry.subject}`,
      message: '',
    });
    setReplyError(null);
    setReplySuccess(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInquiry || !replyForm.message.trim()) return;

    setReplyLoading(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      await contactApi.reply(replyInquiry.id, {
        subject: replyForm.subject,
        message: replyForm.message,
      });
      setReplySuccess(t('admin.replySuccess') || 'Reply sent successfully!');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      if (selectedInquiry?.id === replyInquiry.id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status: 'REPLIED' } : null,
        );
      }
      setTimeout(() => {
        setReplyInquiry(null);
        setReplySuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setReplyError(getApiErrorMessage(err, 'Failed to send reply email'));
    } finally {
      setReplyLoading(false);
    }
  };

  const inquiryCounts = useMemo(() => {
    const tally = { total: inquiries.length, new: 0, read: 0, replied: 0, archived: 0 };
    for (const item of inquiries) {
      if (item.status === 'NEW') tally.new += 1;
      else if (item.status === 'READ') tally.read += 1;
      else if (item.status === 'REPLIED') tally.replied += 1;
      else if (item.status === 'ARCHIVED') tally.archived += 1;
    }
    return tally;
  }, [inquiries]);

  const filteredInquiries = inquiries.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.fullName.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.subject.toLowerCase().includes(term) ||
      (item.phone && item.phone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.inquiries') || 'Contact Inquiries'}
        subtitle={t('admin.inquiriesSubtitle', 'Review visitor messages and reply from the admin panel.')}
      />

      <AdminOpsCounters
        items={[
          {
            id: 'new',
            label: t('admin.ops.needsResponse', 'Needs response'),
            value: inquiryCounts.new,
            highlight: inquiryCounts.new > 0,
            onClick: () => setStatusFilter('NEW'),
          },
          {
            id: 'read',
            label: t('status.READ'),
            value: inquiryCounts.read,
            onClick: () => setStatusFilter('READ'),
          },
          {
            id: 'replied',
            label: t('status.REPLIED'),
            value: inquiryCounts.replied,
            onClick: () => setStatusFilter('REPLIED'),
          },
          {
            id: 'total',
            label: t('admin.inquiries') || 'Inquiries',
            value: inquiryCounts.total,
            onClick: () => setStatusFilter('ALL'),
          },
        ]}
      />

      <AdminListToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('admin.searchInquiries') || 'Search inquiries…'}
        resultCount={filteredInquiries.length}
        totalCount={inquiries.length}
        filters={
          <>
            {(['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const).map((st) => (
              <AdminStatusChip
                key={st}
                label={
                  st === 'ALL'
                    ? t('admin.allStatuses') || 'All'
                    : t(`status.${st}`) || st
                }
                active={statusFilter === st}
                onClick={() => setStatusFilter(st)}
                count={
                  st === 'ALL'
                    ? inquiryCounts.total
                    : st === 'NEW'
                      ? inquiryCounts.new
                      : st === 'READ'
                        ? inquiryCounts.read
                        : st === 'REPLIED'
                          ? inquiryCounts.replied
                          : inquiryCounts.archived
                }
                variant={st === 'NEW' ? 'warning' : 'default'}
              />
            ))}
          </>
        }
      />

      <AdminDataTable
        isLoading={inquiriesLoading}
        data={filteredInquiries}
        emptyTitle={t('admin.ops.noInquiries', 'No contact inquiries')}
        emptyDescription={
          inquiries.length === 0
            ? t('admin.ops.noInquiriesHint', 'When visitors submit the contact form, inquiries will appear here.')
            : t('admin.ops.noFilterResults', 'No items match your search or filter.')
        }
        emptyActionLabel={
          inquiries.length > 0 ? t('admin.ops.clearFilters', 'Clear filters') : undefined
        }
        onEmptyAction={
          inquiries.length > 0
            ? () => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }
            : undefined
        }
        columns={[
          {
            key: 'name',
            header: t('common.name') || 'Name',
            render: (r: ContactInquiry) => (
              <div>
                <div className="font-semibold text-slate-800">{r.fullName}</div>
                <div className="text-xs text-slate-400">{r.email}</div>
              </div>
            ),
          },
          {
            key: 'subject',
            header: t('common.subject') || 'Subject',
            render: (r: ContactInquiry) => (
              <div className="max-w-xs truncate font-medium text-slate-700">
                {r.subject}
              </div>
            ),
          },
          {
            key: 'date',
            header: t('common.date') || 'Date',
            render: (r: ContactInquiry) => (
              <span className="text-xs text-slate-500">{formatDate(r.createdAt, lang)}</span>
            ),
          },
          {
            key: 'status',
            header: t('common.status') || 'Status',
            render: (r: ContactInquiry) => <StatusBadge status={r.status} />,
          },
          {
            key: 'actions',
            header: t('common.actions') || 'Actions',
            render: (r: ContactInquiry) => (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  className="py-1 px-2.5 text-xs flex items-center gap-1"
                  onClick={() => handleOpenView(r)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('common.view') || 'View'}</span>
                </Button>

                <Button
                  variant="secondary"
                  className="py-1 px-2.5 text-xs flex items-center gap-1 bg-navy-50 text-navy-800 hover:bg-navy-100 border border-navy-200"
                  onClick={() => handleOpenReply(r)}
                >
                  <Mail className="w-3.5 h-3.5 text-navy-600" />
                  <span>{t('admin.replyToInquiry') || 'Reply'}</span>
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* View Inquiry Modal */}
      {selectedInquiry && (
        <Modal
          open={!!selectedInquiry}
          onClose={() => {
            setSelectedInquiry(null);
            clearInquiryDeepLink();
          }}
          title={t('admin.inquiryDetails') || 'Inquiry Details'}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInquiry.status} />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(selectedInquiry.createdAt, lang)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-xs bg-white font-medium text-slate-700"
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    contactApi.updateStatus(selectedInquiry.id, newStatus).then(() => {
                      qc.invalidateQueries({ queryKey: ['inquiries'] });
                      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
                    });
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="READ">READ</option>
                  <option value="REPLIED">REPLIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('common.name') || 'Name'}</span>
                </div>
                <div className="font-semibold text-slate-800 text-sm">
                  {selectedInquiry.fullName}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('common.email') || 'Email'}</span>
                </div>
                <div className="font-medium text-slate-800 text-sm break-all">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-navy-600 hover:underline flex items-center gap-1"
                  >
                    {selectedInquiry.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-1 sm:col-span-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('common.phone') || 'Phone'}</span>
                  </div>
                  <div className="font-medium text-slate-800 text-sm">
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="text-slate-700 hover:text-navy-600 dir-ltr inline-block"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500">
                {t('common.subject') || 'Subject'}
              </div>
              <div className="p-2.5 bg-slate-100 rounded-md font-semibold text-slate-800 text-sm">
                {selectedInquiry.subject}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('admin.inquiryMessage') || 'Inquiry Message'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5"
                  onClick={() => {
                    const inquiryToReply = selectedInquiry;
                    setSelectedInquiry(null);
                    handleOpenReply(inquiryToReply);
                  }}
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('admin.replyToInquiry') || 'Reply via Email'}</span>
                </Button>

                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    `Re: ${selectedInquiry.subject}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('admin.openMailClient') || 'Open Mail App'}</span>
                </a>
              </div>

              <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                {t('common.close') || 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {replyInquiry && (
        <Modal
          open={!!replyInquiry}
          onClose={() => setReplyInquiry(null)}
          title={`${t('admin.replyToInquiry') || 'Reply to'}: ${replyInquiry.fullName}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            {replySuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{replySuccess}</span>
              </div>
            )}

            {replyError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">
                {replyError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('common.to') || 'To'}
              </label>
              <Input value={`${replyInquiry.fullName} <${replyInquiry.email}>`} disabled />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('admin.replySubject') || 'Email Subject'}
              </label>
              <Input
                value={replyForm.subject}
                onChange={(e) =>
                  setReplyForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {t('admin.replyMessage') || 'Message'}
              </label>
              <Textarea
                value={replyForm.message}
                onChange={(e) =>
                  setReplyForm((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={6}
                placeholder={
                  t('admin.replyPlaceholder') ||
                  'Write your response to the inquiry here...'
                }
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs text-slate-500">
              <div className="font-semibold text-slate-600">
                {t('admin.originalInquiry') || 'Original Inquiry'}:
              </div>
              <div className="line-clamp-2 italic">{replyInquiry.message}</div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReplyInquiry(null)}
                disabled={replyLoading}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={replyLoading || !replyForm.message.trim()}
                className="flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>
                  {replyLoading
                    ? t('common.sending') || 'Sending...'
                    : t('admin.sendReply') || 'Send Reply'}
                </span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
