import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { requirementsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { useAuth } from '../../lib/auth';
import { SeoHead } from '../../components/common/SeoHead';
import { CheckCircle2, Award } from 'lucide-react';

const DOC_LABELS: Record<string, { en: string; ar: string }> = {
  BIRTH_CERTIFICATE: { en: 'Birth Certificate', ar: 'شهادة الميلاد' },
  PREVIOUS_REPORT: { en: 'Previous School Report', ar: 'التقرير الدراسي السابق' },
  HEALTH_RECORD: { en: 'Health Record', ar: 'السجل الطبي والصحي' },
  IMMUNIZATION_RECORD: { en: 'Immunization Record', ar: 'سجل التطعيمات' },
  STUDENT_PHOTO: { en: 'Student Photo', ar: 'صورة شخصية للطالب' },
  PARENT_PASSPORT: { en: 'Parent Passport / ID', ar: 'بطاقة/جواز ولي الأمر' },
  SCHOOL_REFERENCE: { en: 'School Reference', ar: 'خطاب تزكية مدرسة' },
  TRANSCRIPT: { en: 'Academic Transcript', ar: 'كشف الدرجات الأكاديمي' },
  PASSPORT: { en: 'Student Passport', ar: 'جواز سفر الطالب' },
};

import { getBilingualText } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export function AdmissionsPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { user } = useAuth();

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements', lang],
    queryFn: () => requirementsApi.list(false, lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title={t('admissionsPage.pageTitle')}
        description={t('admissionsPage.seoDesc')}
      />
      <PageHeader title={t('admissionsPage.pageTitle')} subtitle={t('admissionsPage.pageSubtitle')} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {requirements.map(
          (req: any, idx: number) => {
            const cardTitle = getBilingualText(req, 'title', lang);
            const cardDesc = getBilingualText(req, 'description', lang);

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full space-y-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-primary dark:text-blue-400 bg-primary-light dark:bg-slate-800 px-3 py-1 rounded-md">
                        {String(t(`grades.${req.gradeLevel}`, req.gradeLevel))}
                      </span>
                      <h3 className="font-bold text-xl text-primary-dark dark:text-slate-100 mt-2">
                        {cardTitle}
                      </h3>
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-500 rounded-lg">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>

                  {cardDesc && (
                    <p className="text-sm text-neutral-medium dark:text-slate-300 leading-relaxed">
                      {cardDesc}
                    </p>
                  )}

                  {(req.minAge || req.maxAge) && (
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-dark dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>
                        {t('admissionsPage.ageEligibility')}{' '}
                        <strong>
                          {req.minAge ?? '?'} – {req.maxAge ?? '?'} {t('admissionsPage.years')}
                        </strong>
                      </span>
                    </div>
                  )}

                  {req.requiredDocumentTypes && req.requiredDocumentTypes.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-neutral-dark dark:text-slate-200 mb-1.5">
                        {t('admissionsPage.requiredDocs')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {req.requiredDocumentTypes.map((doc: string) => {
                          const labelObj = DOC_LABELS[doc];
                          const docLabel = labelObj
                            ? lang === 'ar'
                              ? labelObj.ar
                              : labelObj.en
                            : doc.replace(/_/g, ' ');

                          return (
                            <span
                              key={doc}
                              className="text-[11px] bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-neutral-dark dark:text-slate-300 px-2.5 py-1 rounded shadow-2xs font-semibold"
                            >
                              📄 {docLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          }
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center bg-gradient-to-r from-primary-dark via-slate-900 to-primary text-white rounded-2xl p-10 shadow-xl space-y-4"
      >
        <h3 className="text-2xl sm:text-3xl font-extrabold">{t('admissionsPage.readyTitle')}</h3>
        <p className="text-slate-200 text-base max-w-xl mx-auto">
          {t('admissionsPage.readySubtitle')}
        </p>
        <div className="pt-2">
          <Button
            to={user ? '/portal/parent/admissions/new' : '/register/parent'}
            showArrow
            variant="gold"
            className="py-3 px-8 text-base shadow-lg"
          >
            {user ? t('portal.parent.newApplication') : t('auth.registerParent')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
