import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Plus, FileText, CheckCircle2, Clock, Phone, MessageSquare } from 'lucide-react';
import { admissionsApi, requirementsApi } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { StatusBadge, LoadingSpinner } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate } from '../../../lib/utils';
import { useAppLanguage } from '../../../i18n';
import { useAuth } from '../../../lib/auth';
import type { Admission } from '../../../types';

function getRequiredDocCount(admission: Admission, requirements: Array<{ gradeLevel: string; requiredDocumentTypes?: string[] }>) {
  const gradeReq = requirements.find((r) => r.gradeLevel === admission.gradeLevel);
  return gradeReq?.requiredDocumentTypes?.length ?? 0;
}

function getMissingDocCount(
  admission: Admission,
  requirements: Array<{ gradeLevel: string; requiredDocumentTypes?: string[] }>,
) {
  const gradeReq = requirements.find((r) => r.gradeLevel === admission.gradeLevel);
  const requiredDocs = gradeReq?.requiredDocumentTypes ?? [];
  const uploaded = new Set((admission.documents ?? []).map((d) => d.documentType));
  return requiredDocs.filter((type) => !uploaded.has(type)).length;
}

function isIncompleteAdmission(
  admission: Admission,
  requirements: Array<{ gradeLevel: string; requiredDocumentTypes?: string[] }>,
) {
  if (admission.status === 'DRAFT') return true;
  if (['SUBMITTED', 'UNDER_REVIEW'].includes(admission.status) && !admission.documentsCompletedAt) {
    return getMissingDocCount(admission, requirements) > 0;
  }
  return false;
}

function docProgress(admission: Admission, requiredCount: number) {
  const uploaded = admission.documents?.length ?? 0;
  if (requiredCount <= 0) return Math.min(100, uploaded * 20);
  return Math.min(100, Math.round((uploaded / requiredCount) * 100));
}

export function ParentPortalDashboard() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const submissionState = location.state as {
    submitted?: boolean;
    referenceNumber?: string;
    studentName?: string;
  } | null;

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['my-admissions'],
    queryFn: () => admissionsApi.myAdmissions().then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['admission-requirements', lang],
    queryFn: () => requirementsApi.list(false, lang).then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  if (isLoading) return <LoadingSpinner />;

  const active = admissions.filter((a) => ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(a.status));
  const incompleteAdmissions = admissions.filter((a) => isIncompleteAdmission(a, requirements));
  const acceptedAdmissions = admissions.filter((a) => a.status === 'ACCEPTED');
  const accepted = acceptedAdmissions.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sage text-sm font-medium uppercase tracking-wide">{t('portal.parent.welcome')}</p>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-white">
            {t('portal.parent.greeting', { name: user?.fullName })}
          </h2>
        </div>
        <Button to="/portal/parent/admissions/new" variant="gold">
          <Plus className="w-4 h-4" />
          {lang === 'ar' ? 'تقديم طلب قبول جديد (طالب آخر)' : t('portal.parent.newApplication')}
        </Button>
      </div>

      {/* Newly Submitted Application Banner */}
      {submissionState?.submitted && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>تم إرسال واستلام طلب القبول بنجاح، وجاري مراجعته بواسطة إدارة المدرسية</span>
            </div>
            {submissionState.studentName && (
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                اسم الطالب: {submissionState.studentName}
              </h4>
            )}
            {submissionState.referenceNumber && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                الرقم المرجعي للطلب: <strong className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 font-mono text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-500/30">{submissionState.referenceNumber}</strong>
              </p>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            يمكنك متابعة وتتبع حالة هذا الطلب ومراحل المراجعة أدناه
          </span>
        </div>
      )}

      {/* Notice for Parent with NO applications yet */}
      {admissions.length === 0 && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300">
              {t('portal.parent.noApplicationNoticeTitle')}
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              {t('portal.parent.noApplicationNoticeDesc')}
            </p>
          </div>
          <Button to="/portal/parent/admissions/new" variant="gold" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {t('portal.parent.startNow')}
          </Button>
        </div>
      )}

      {/* Notice for Incomplete Applications */}
      {incompleteAdmissions.map((incomplete) => (
        <div
          key={`incomplete-alert-${incomplete.id}`}
          className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>{t('portal.parent.incompleteNoticeTitle')}</span>
            </div>
            <h4 className="font-bold text-lg text-primary-dark dark:text-white">
              {incomplete.studentFirstName} {incomplete.studentLastName} ({incomplete.gradeLevel})
            </h4>
            <p className="text-sm text-neutral-medium">
              {incomplete.status === 'DRAFT'
                ? t('portal.parent.incompleteNoticeDesc')
                : `يتبقى رفع ${getMissingDocCount(incomplete, requirements)} مستند مطلوب لاستكمال الطلب المُرسَل.`}
            </p>
          </div>
          <Button to={`/portal/parent/admissions/${incomplete.id}`} variant="gold" className="shrink-0">
            {incomplete.status === 'DRAFT'
              ? t('portal.parent.resumeApplication')
              : 'استكمال المستندات'}
          </Button>
        </div>
      ))}

      {acceptedAdmissions.map((acc: Admission) => (
        <div
          key={`accepted-alert-${acc.id}`}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-emerald-800 to-primary p-6 text-white shadow-xl border border-emerald-500/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm tracking-wide uppercase">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('portal.parent.acceptedNotice.title')}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {acc.studentFirstName} {acc.studentLastName} ({acc.gradeLevel})
              </h3>
              <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
                {t('portal.parent.acceptedNotice.description', {
                  studentName: `${acc.studentFirstName} ${acc.studentLastName}`,
                })}
              </p>
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/40">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{t('portal.parent.acceptedNotice.timeLimit')}</span>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
              <a
                href="tel:+201234567890"
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4" />
                {t('portal.parent.acceptedNotice.callSchool')}
              </a>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                {t('portal.parent.acceptedNotice.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      ))}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: t('portal.parent.stats.active'), value: active.length, color: 'text-primary' },
          { label: t('portal.parent.stats.total'), value: admissions.length, color: 'text-sage' },
          { label: t('portal.parent.stats.accepted'), value: accepted, color: 'text-gold' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <p className="text-sm text-neutral-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          {t('portal.parent.myApplications')}
        </h3>

        {admissions.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title={t('portal.parent.emptyTitle')}
            description={t('portal.parent.emptyDesc')}
            actionLabel={t('portal.parent.newApplication')}
            actionTo="/portal/parent/admissions/new"
          />
        ) : (
          <div className="space-y-4">
            {admissions.map((a: Admission) => (
              <div key={a.id} className="glass-card rounded-xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {a.studentFirstName} {a.studentLastName}
                      </h4>
                      {a.referenceNumber && (
                        <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold rounded-lg">
                          {a.referenceNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-medium dark:text-slate-400 flex items-center gap-2 flex-wrap">
                      <span><strong>المرحلة:</strong> {a.gradeLevel}</span>
                      {a.createdAt && <span>· <strong>تاريخ التقديم:</strong> {formatDate(a.createdAt, lang)}</span>}
                      {a.documents && a.documents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20">
                          📁 {a.documents.length} مستند مرفق
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={a.status} />
                    <Link to={`/portal/parent/admissions/${a.id}`}>
                      <Button variant={a.status === 'DRAFT' ? 'gold' : 'outline'} className="!py-2 !px-4 text-xs font-bold rounded-xl">
                        {a.status === 'DRAFT' ? t('portal.parent.resumeApplication') : t('portal.parent.viewDetails', 'عرض تفاصيل الطلب')}
                      </Button>
                    </Link>
                  </div>
                </div>
                {(a.status === 'DRAFT' || (['SUBMITTED', 'UNDER_REVIEW'].includes(a.status) && !a.documentsCompletedAt)) && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-neutral-medium mb-1">
                      <span>{t('portal.parent.progress')}</span>
                      <span>{docProgress(a, getRequiredDocCount(a, requirements))}%</span>
                    </div>
                    <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sage rounded-full transition-all"
                        style={{ width: `${docProgress(a, getRequiredDocCount(a, requirements))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
