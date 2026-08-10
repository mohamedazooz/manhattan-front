import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { admissionsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/Badge';
import { AdmissionStatusSelect } from '../../components/admin/AdmissionStatusSelect';
import { AdminListToolbar, AdminStatusChip } from '../../components/admin/AdminListToolbar';
import { AdminDataTable } from '../../components/admin/AdminDataTable';
import { AdminOpsCounters } from '../../components/admin/AdminOpsCounters';

type StatusFilter = '' | 'NEEDS_REVIEW' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export function AdminAdmissionsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['admissions-admin'],
    queryFn: () => admissionsApi.list().then((r) => r.data),
  });

  const counts = useMemo(() => {
    const tally = {
      total: admissions.length,
      draft: 0,
      submitted: 0,
      underReview: 0,
      accepted: 0,
      rejected: 0,
      needsReview: 0,
    };

    for (const row of admissions) {
      switch (row.status) {
        case 'DRAFT':
          tally.draft += 1;
          break;
        case 'SUBMITTED':
          tally.submitted += 1;
          tally.needsReview += 1;
          break;
        case 'UNDER_REVIEW':
          tally.underReview += 1;
          tally.needsReview += 1;
          break;
        case 'ACCEPTED':
          tally.accepted += 1;
          break;
        case 'REJECTED':
          tally.rejected += 1;
          break;
        default:
          break;
      }
    }

    return tally;
  }, [admissions]);

  const filteredAdmissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return admissions.filter((a) => {
      if (statusFilter === 'NEEDS_REVIEW') {
        if (a.status !== 'SUBMITTED' && a.status !== 'UNDER_REVIEW') return false;
      } else if (statusFilter && a.status !== statusFilter) {
        return false;
      }

      if (!search) return true;

      const fullName = `${a.studentFirstName} ${a.studentLastName}`.toLowerCase();
      const parent = (a.parentName || a.parentEmail || '').toLowerCase();
      const grade = (a.gradeLevel || '').toLowerCase();
      const ref = (a.referenceNumber || '').toLowerCase();

      return (
        fullName.includes(search) ||
        parent.includes(search) ||
        grade.includes(search) ||
        ref.includes(search)
      );
    });
  }, [admissions, statusFilter, searchTerm]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admissions-admin'] });
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    qc.invalidateQueries({ queryKey: ['my-admissions'] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.admissionsTitle', 'Admissions & enrollment')}
        subtitle={t(
          'admin.admissionsSubtitle',
          'Review student applications, parent contact data, documents, and admission decisions.',
        )}
      />

      <AdminOpsCounters
        items={[
          {
            id: 'needs-review',
            label: t('admin.ops.needsReview', 'Needs review'),
            value: counts.needsReview,
            highlight: counts.needsReview > 0,
            onClick: () => setStatusFilter('NEEDS_REVIEW'),
          },
          {
            id: 'submitted',
            label: t('status.SUBMITTED'),
            value: counts.submitted,
            onClick: () => setStatusFilter('SUBMITTED'),
          },
          {
            id: 'under-review',
            label: t('status.UNDER_REVIEW'),
            value: counts.underReview,
            onClick: () => setStatusFilter('UNDER_REVIEW'),
          },
          {
            id: 'accepted',
            label: t('status.ACCEPTED'),
            value: counts.accepted,
            onClick: () => setStatusFilter('ACCEPTED'),
          },
          {
            id: 'total',
            label: t('admin.totalAdmissions'),
            value: counts.total,
            onClick: () => setStatusFilter(''),
          },
        ]}
      />

      <AdminListToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('admin.searchStudentPlaceholder', 'Search student, parent, grade, or reference…')}
        resultCount={filteredAdmissions.length}
        totalCount={admissions.length}
        filters={
          <>
            <AdminStatusChip
              label={t('admin.allStatuses', 'All statuses')}
              active={statusFilter === ''}
              onClick={() => setStatusFilter('')}
              count={counts.total}
            />
            <AdminStatusChip
              label={t('admin.ops.needsReview', 'Needs review')}
              active={statusFilter === 'NEEDS_REVIEW'}
              onClick={() => setStatusFilter('NEEDS_REVIEW')}
              count={counts.needsReview}
              variant="warning"
            />
            {(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'DRAFT'] as const).map((status) => (
              <AdminStatusChip
                key={status}
                label={t(`status.${status}`, status)}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                count={
                  status === 'SUBMITTED'
                    ? counts.submitted
                    : status === 'UNDER_REVIEW'
                      ? counts.underReview
                      : status === 'ACCEPTED'
                        ? counts.accepted
                        : status === 'REJECTED'
                          ? counts.rejected
                          : counts.draft
                }
              />
            ))}
          </>
        }
      />

      <AdminDataTable
        isLoading={isLoading}
        data={filteredAdmissions}
        emptyTitle={t('admin.ops.noAdmissions', 'No admission applications')}
        emptyDescription={
          admissions.length === 0
            ? t('admin.ops.noAdmissionsHint', 'When parents submit applications they will appear here for review.')
            : t('admin.ops.noFilterResults', 'No applications match your search or filter. Try clearing filters.')
        }
        emptyActionLabel={
          admissions.length > 0 ? t('admin.ops.clearFilters', 'Clear filters') : undefined
        }
        onEmptyAction={
          admissions.length > 0
            ? () => {
                setSearchTerm('');
                setStatusFilter('');
              }
            : undefined
        }
        columns={[
          {
            key: 'student',
            header: t('admin.studentName', 'Student'),
            render: (r) => (
              <div>
                <Link
                  to={`/admin/admissions/${r.id}`}
                  className="font-bold text-primary dark:text-blue-400 hover:underline"
                >
                  {r.studentFirstName} {r.studentLastName}
                </Link>
                <div className="text-xs text-neutral-medium dark:text-slate-400">
                  {r.referenceNumber
                    ? `${t('admin.ref', 'Ref')}: ${r.referenceNumber}`
                    : `${t('admin.appId', 'ID')}: #${r.id.slice(0, 8)}`}
                </div>
              </div>
            ),
          },
          {
            key: 'grade',
            header: t('admin.gradeLevel', 'Grade'),
            render: (r) => (
              <span className="font-semibold text-xs px-2.5 py-1 bg-primary-light text-primary rounded-lg border border-primary/20">
                {String(t(`grades.${r.gradeLevel}`, r.gradeLevel))}
              </span>
            ),
          },
          {
            key: 'parent',
            header: t('admin.parentContact', 'Parent contact'),
            render: (r) => (
              <div className="text-xs">
                <div className="font-medium text-neutral-dark dark:text-slate-200">
                  {r.parentName || r.parentEmail || t('admin.na', 'N/A')}
                </div>
                <div className="text-neutral-medium dark:text-slate-400">
                  {r.parentPhone || r.parentEmail || ''}
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: t('admin.statusLabel', 'Status'),
            render: (r) => (
              <AdmissionStatusSelect
                className="border rounded-lg p-1.5 text-xs bg-white dark:bg-slate-800 text-neutral-dark dark:text-slate-100 font-semibold min-w-[9rem]"
                value={r.status}
                onChange={(nextStatus) =>
                  admissionsApi.updateStatus(r.id, nextStatus).then(invalidate)
                }
              />
            ),
          },
          {
            key: 'actions',
            header: t('admin.actions', 'Actions'),
            render: (r) => (
              <Link to={`/admin/admissions/${r.id}`}>
                <Button variant="gold" className="py-1 px-3 text-xs font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t('admin.viewFullDetails', 'View details')}</span>
                </Button>
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
