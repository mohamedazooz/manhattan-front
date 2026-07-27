import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { admissionsApi, careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { useAuth } from '../../lib/auth';
import type { Admission } from '../../types';

export function PortalDashboard() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState<'admissions' | 'jobs'>('admissions');

  const { data: admissions = [], isLoading: loadingAdmissions } = useQuery({
    queryKey: ['my-admissions'],
    queryFn: () => admissionsApi.myAdmissions().then((r) => r.data),
  });

  const { data: jobApps = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['my-job-applications'],
    queryFn: () => careersApi.myApplications().then((r) => r.data),
  });

  if (loadingAdmissions || loadingJobs) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <PageHeader title={t('portal.title')} subtitle={`Welcome back, ${user?.fullName || 'User'}`} />
        </div>
        <div className="flex gap-2">
          <Button to="/portal/admissions/new">{t('portal.newApplication')}</Button>
          <Button variant="secondary" to="/careers">Browse Open Jobs</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6">
        <button
          onClick={() => setTab('admissions')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            tab === 'admissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-medium hover:text-neutral-dark'
          }`}
        >
          Student Admissions ({admissions.length})
        </button>
        <button
          onClick={() => setTab('jobs')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            tab === 'jobs'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-medium hover:text-neutral-dark'
          }`}
        >
          Teacher Job Applications ({jobApps.length})
        </button>
      </div>

      {tab === 'admissions' && (
        <div className="space-y-4">
          {admissions.map((a: Admission) => (
            <div key={a.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-dark">
                    {a.studentFirstName} {a.studentLastName}
                  </h3>
                  <p className="text-sm text-neutral-medium">
                    Grade: <strong className="text-neutral-dark">{a.gradeLevel}</strong>{a.createdAt ? ` · Submitted: ${formatDate(a.createdAt, lang)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <Link to={`/portal/admissions/${a.id}`}>
                    <Button variant="secondary" className="text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>

              {a.documents && a.documents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
                  <span className="text-xs text-neutral-medium self-center">Uploaded Documents:</span>
                  {a.documents.map((doc) => (
                    <span key={doc.id} className="text-xs bg-neutral-100 text-neutral-dark px-2 py-1 rounded font-mono">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!admissions.length && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-medium mb-4">No student admission applications found.</p>
              <Button to="/portal/admissions/new">Submit Student Admission</Button>
            </div>
          )}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="space-y-4">
          {jobApps.map((ja: { id: string; job?: { title: string; location: string }; status: string; createdAt: string; documents: Array<{ id: string; fileName: string; documentType: string }> }) => (
            <div key={ja.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-dark">
                    {ja.job?.title || 'Teaching Position'}
                  </h3>
                  <p className="text-sm text-neutral-medium">
                    {ja.job?.location} · Applied: {formatDate(ja.createdAt, lang)}
                  </p>
                </div>
                <StatusBadge status={ja.status} />
              </div>

              {ja.documents && ja.documents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-2">
                  <span className="text-xs text-neutral-medium self-center">Attached Files & Certificates:</span>
                  {ja.documents.map((doc) => (
                    <span key={doc.id} className="text-xs bg-primary-light text-primary px-2 py-1 rounded font-mono">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!jobApps.length && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-medium mb-4">No teacher job applications submitted yet.</p>
              <Button to="/careers">Browse Teaching Positions</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

