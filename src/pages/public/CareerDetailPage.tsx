import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { useAuth } from '../../lib/auth';
import { getPortalHomeForRole } from '../../components/auth/RoleRoute';

import { getBilingualText } from '../../lib/utils';

export function CareerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id, lang],
    queryFn: () => careersApi.get(id!, lang).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p className="p-12 text-center text-neutral-medium">{t('careers.noPositions')}</p>;

  const title = getBilingualText(job, 'title', lang);
  const location = getBilingualText(job, 'location', lang);
  const description = getBilingualText(job, 'description', lang);
  const requirements = getBilingualText(job, 'requirements', lang);

  function handleApply() {
    if (!user) {
      navigate(`/login?redirect=/portal/applicant/apply/${id}`);
      return;
    }
    if (role === 'PARENT') {
      navigate('/register/applicant');
      return;
    }
    if (role === 'APPLICANT') {
      navigate(`/portal/applicant/apply/${id}`);
      return;
    }
    navigate(getPortalHomeForRole(role));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title={title} subtitle={`${location} · ${job.employmentType.replace('_', ' ')}`} />
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-primary-dark dark:text-gold">{t('careers.positionDescription', 'الوصف الوظيفي')}</h3>
            <div className="prose-content text-sm text-neutral-medium dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-primary-dark dark:text-gold">{t('careers.requirementsQualifications', 'المتطلبات والمؤهلات')}</h3>
            <div className="prose-content text-sm text-neutral-medium dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: requirements }} />
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-4">
            <h3 className="font-semibold text-xl text-primary-dark">{t('application.applyTitle')}</h3>

            {!user ? (
              <div className="text-center py-6 px-4 bg-gold-light rounded-xl border border-gold/20 space-y-4">
                <p className="text-sm font-medium text-primary-dark">
                  {t('auth.registerApplicantDesc')}
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="gold" onClick={() => navigate(`/login?redirect=/portal/applicant/apply/${id}`)}>
                    {t('auth.loginBtn')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/register/applicant?redirect=/portal/applicant/apply/${id}`)}>
                    {t('auth.registerBtn')}
                  </Button>
                </div>
              </div>
            ) : role === 'PARENT' ? (
              <div className="text-center py-6 px-4 bg-ivory rounded-xl border space-y-3">
                <p className="text-sm text-neutral-medium">{t('auth.switchToApplicant')}</p>
                <Button variant="gold" to="/register/applicant">{t('auth.registerApplicant')}</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-neutral-medium">{t('application.documentsHint')}</p>
                <Button variant="gold" className="w-full" onClick={handleApply}>
                  {t('application.applyTitle')}
                </Button>
                {role === 'APPLICANT' && (
                  <Link to="/portal/applicant" className="block text-center text-sm text-primary font-medium">
                    {t('portal.applicant.myApplications')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
