import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Briefcase, Plus, CheckCircle2, Clock, Phone, MessageSquare } from 'lucide-react';
import { careersApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StatusBadge, LoadingSpinner } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';
import { useAuth } from '../../../lib/auth';

export function ApplicantPortalDashboard() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-job-applications'],
    queryFn: () => careersApi.myApplications().then((r) => r.data),
    refetchInterval: 10000,
  });

  if (isLoading) return <LoadingSpinner />;

  const pending = applications.filter((a: { status: string }) =>
    ['DRAFT', 'SUBMITTED', 'REVIEWING', 'SHORTLISTED'].includes(a.status),
  );
  const acceptedApps = applications.filter((a: { status: string }) => a.status === 'ACCEPTED');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sage text-sm font-medium uppercase tracking-wide">{t('portal.applicant.welcome')}</p>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
            {t('portal.applicant.greeting', { name: user?.fullName })}
          </h2>
        </div>
        <Button to="/careers" variant="gold">
          <Plus className="w-4 h-4" />
          {t('portal.applicant.browseJobs', 'تصفح الوظائف المتاحة')}
        </Button>
      </div>

      {acceptedApps.map((acc: { id: string; job?: { title: string } }) => (
        <div
          key={`accepted-job-alert-${acc.id}`}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-emerald-800 to-primary p-6 text-white shadow-xl border border-emerald-500/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm tracking-wide uppercase">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('portal.applicant.acceptedNotice.title')}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {acc.job?.title || 'Teaching Position'}
              </h3>
              <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
                {t('portal.applicant.acceptedNotice.description')}
              </p>
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/40">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{t('portal.applicant.acceptedNotice.timeLimit')}</span>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              <a
                href="tel:+201234567890"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4" />
                {t('portal.applicant.acceptedNotice.callSchool')}
              </a>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                {t('portal.applicant.acceptedNotice.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      ))}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-neutral-medium">{t('portal.applicant.stats.pending')}</p>
          <p className="text-3xl font-bold text-primary mt-1">{pending.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-neutral-medium">{t('portal.applicant.stats.total')}</p>
          <p className="text-3xl font-bold text-sage mt-1">{applications.length}</p>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          {t('portal.applicant.myApplications')}
        </h3>

        {applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-12 h-12" />}
            title={t('portal.applicant.emptyTitle')}
            description={t('portal.applicant.emptyDesc')}
            actionLabel={t('portal.applicant.browseJobs')}
            actionTo="/careers"
          />
        ) : (
          <div className="space-y-4">
            {applications.map((ja: {
              id: string;
              status: string;
              createdAt: string;
              job?: { title: string; location: string };
            }) => (
              <div key={ja.id} className="glass-card rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-lg">{ja.job?.title || 'Teaching Position'}</h4>
                    <p className="text-sm text-neutral-medium">
                      {ja.job?.location} · {formatDate(ja.createdAt, lang)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ja.status} />
                    <Link to={`/portal/applicant/applications/${ja.id}`}>
                      <Button variant="outline" className="!py-2 !px-4 text-xs">
                        {t('portal.applicant.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
