import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Download, ExternalLink, FileText } from 'lucide-react';
import type { JobApplication } from '../../types';
import { HIRING_DOCUMENTS } from '../../constants/hiringDocuments';
import { mediaUrl } from '../../lib/utils';

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isAr,
}: {
  label: string;
  value?: string | number | boolean | null;
  isAr: boolean;
}) {
  if (value === undefined || value === null || value === '') return null;
  const display =
    typeof value === 'boolean'
      ? value
        ? isAr
          ? 'نعم'
          : 'Yes'
        : isAr
          ? 'لا'
          : 'No'
      : String(value);
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-end break-words">{display}</span>
    </div>
  );
}

function formatGender(value: string, isAr: boolean) {
  if (value === 'male') return isAr ? 'ذكر' : 'Male';
  if (value === 'female') return isAr ? 'أنثى' : 'Female';
  return value;
}

function formatCurriculum(value: string, isAr: boolean) {
  const options: Record<string, { ar: string; en: string }> = {
    IB: { ar: 'البكالوريا الدولية (IB)', en: 'IB' },
    British: { ar: 'المنهج البريطاني', en: 'British' },
    American: { ar: 'المنهج الأمريكي', en: 'American' },
    'Egyptian National': { ar: 'المنهج القومي المصري', en: 'Egyptian National' },
  };
  const opt = options[value];
  if (opt) return isAr ? opt.ar : opt.en;
  return value;
}

function formatDateValue(value?: string | Date | null, isAr?: boolean) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
}

function getDocumentLabel(code: string, isAr: boolean) {
  if (code === 'CV_RESUME') return isAr ? 'السيرة الذاتية (CV)' : 'CV / Resume';
  const doc = HIRING_DOCUMENTS.find((d) => d.code === code);
  if (doc) return isAr ? doc.titleAr : doc.titleEn;
  return code.replace(/_/g, ' ');
}

export function JobApplicationAdminDetails({ app, isAr }: { app: JobApplication; isAr: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {app.referenceNumber && (
        <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm font-mono font-bold text-primary">
          {isAr ? 'الرقم المرجعي:' : 'Reference:'} {app.referenceNumber}
        </div>
      )}

      <DetailSection title={isAr ? 'البيانات الشخصية والعنوان' : 'Personal Details & Address'}>
        <DetailRow isAr={isAr} label={t('application.fullName', 'Full Name')} value={app.fullName} />
        <DetailRow isAr={isAr} label={t('application.nationalId', 'National ID')} value={app.nationalId} />
        <DetailRow
          isAr={isAr}
          label={t('application.dateOfBirth', 'Date of Birth')}
          value={formatDateValue(app.dateOfBirth, isAr)}
        />
        <DetailRow
          isAr={isAr}
          label={t('application.gender', 'Gender')}
          value={app.gender ? formatGender(app.gender, isAr) : undefined}
        />
        <DetailRow isAr={isAr} label={isAr ? 'الجنسية' : 'Nationality'} value={app.nationality} />
        <DetailRow isAr={isAr} label={t('application.streetAddress', 'Street Address')} value={app.streetAddress} />
        <DetailRow isAr={isAr} label={t('application.city', 'City')} value={app.city} />
        <DetailRow isAr={isAr} label={isAr ? 'المحافظة' : 'Governorate'} value={app.governorate} />
      </DetailSection>

      <DetailSection title={isAr ? 'بيانات التواصل' : 'Contact Information'}>
        <DetailRow isAr={isAr} label={t('application.email', 'Email')} value={app.email} />
        <DetailRow isAr={isAr} label={t('application.phone', 'Phone')} value={app.phone} />
        <DetailRow
          isAr={isAr}
          label={t('application.emergencyContactName', 'Emergency Contact Name')}
          value={app.emergencyContactName}
        />
        <DetailRow
          isAr={isAr}
          label={t('application.emergencyContactPhone', 'Emergency Contact Phone')}
          value={app.emergencyContactPhone}
        />
        <DetailRow
          isAr={isAr}
          label={isAr ? 'تاريخ تقديم الطلب' : 'Submitted Date'}
          value={formatDateValue(app.createdAt, isAr)}
        />
        <DetailRow isAr={isAr} label={isAr ? 'الخطوة الحالية' : 'Current Step'} value={app.currentStep} />
      </DetailSection>

      <DetailSection title={isAr ? 'المؤهلات والخبرات التدريسية' : 'Qualifications & Teaching Experience'}>
        <DetailRow isAr={isAr} label={t('application.yearsExperience', 'Years of Experience')} value={app.yearsExperience} />
        <DetailRow
          isAr={isAr}
          label={t('application.curriculum', 'Curriculum Experience')}
          value={
            app.curriculumExperience
              ? formatCurriculum(app.curriculumExperience, isAr)
              : undefined
          }
        />
        <DetailRow isAr={isAr} label={t('application.subjects', 'Subjects Taught')} value={app.subjectsTaught} />
        <DetailRow
          isAr={isAr}
          label={t('application.qualification', 'Highest Qualification')}
          value={app.highestQualification}
        />
        <DetailRow isAr={isAr} label={t('application.university', 'University')} value={app.university} />
        <DetailRow isAr={isAr} label={t('application.graduationYear', 'Graduation Year')} value={app.graduationYear} />
        <DetailRow isAr={isAr} label={isAr ? 'التخصص' : 'Major'} value={app.major} />
        <DetailRow isAr={isAr} label={t('application.licenseNo', 'Teaching License No.')} value={app.teachingLicenseNo} />
        <DetailRow
          isAr={isAr}
          label={isAr ? 'تاريخ التفرغ للعمل' : 'Available Start Date'}
          value={formatDateValue(app.availableStartDate, isAr)}
        />
        <DetailRow isAr={isAr} label={t('application.noticePeriod', 'Notice Period')} value={app.noticePeriod} />
        <DetailRow isAr={isAr} label={t('application.expectedSalary', 'Expected Salary')} value={app.expectedSalary} />
      </DetailSection>

      <DetailSection title={isAr ? 'الإقرارات والتعهدات' : 'Declarations & Pledges'}>
        <DetailRow
          isAr={isAr}
          label={isAr ? 'إقرار حماية الطفل (Safeguarding)' : 'Safeguarding Declaration'}
          value={app.safeguardingAccepted}
        />
        <DetailRow
          isAr={isAr}
          label={isAr ? 'تعهد إحضار الأصول عند المقابلة' : 'Pledge to Bring Originals at Interview'}
          value={app.pledgeOriginalsAtInterview}
        />
      </DetailSection>

      {app.coverLetter && (
        <DetailSection title={isAr ? 'خطاب التقديم / الرسالة التعريفية' : 'Cover Letter'}>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            {app.coverLetter}
          </p>
        </DetailSection>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {isAr ? 'المستندات والمرفقات' : 'Documents & Attachments'}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            {app.documents?.length || 0} {isAr ? 'ملف' : 'files'}
          </span>
        </div>

        {app.documents && app.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {doc.fileName || getDocumentLabel(doc.documentType, isAr)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {getDocumentLabel(doc.documentType, isAr)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={mediaUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-primary shadow-xs border border-slate-200 dark:border-slate-700"
                    title={isAr ? 'فتح الملف' : 'Open file'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={mediaUrl(doc.fileUrl)}
                    download
                    className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark shadow-xs"
                    title={isAr ? 'تحميل' : 'Download'}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-400 text-xs">
            {isAr ? 'لم يتم رفع أي مستندات.' : 'No documents uploaded.'}
          </div>
        )}
      </div>

      {app.statusHistory && app.statusHistory.length > 0 && (
        <DetailSection title={isAr ? 'سجل تغييرات الحالة' : 'Status History'}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {app.statusHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-600 dark:text-slate-300">
                  <span>
                    {entry.fromStatus} → {entry.toStatus}
                  </span>
                  <span className="text-slate-400">
                    {new Date(entry.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
                {entry.changedBy?.fullName && (
                  <div className="text-[10px] text-slate-400 mt-1">{entry.changedBy.fullName}</div>
                )}
                {entry.note && <p className="text-slate-600 dark:text-slate-400 mt-1">{entry.note}</p>}
              </div>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}
