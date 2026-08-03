import { useTranslation } from 'react-i18next';
import { FileText, Upload } from 'lucide-react';
import { HIRING_DOCUMENTS } from '../../constants/hiringDocuments';
import { useAppLanguage } from '../../i18n';

const EXTRA_DOC_LABELS: Record<string, { ar: string; en: string }> = {
  CV_RESUME: { ar: 'السيرة الذاتية (CV)', en: 'CV / Resume' },
  TEACHING_LICENSE: { ar: 'رخصة التدريس', en: 'Teaching License' },
  DEGREE_CERTIFICATE: { ar: 'شهادة المؤهل', en: 'Degree Certificate' },
  OTHER: { ar: 'مستند آخر', en: 'Other document' },
};

function getDocLabel(code: string, isAr: boolean) {
  const fromHiring = HIRING_DOCUMENTS.find((d) => d.code === code);
  if (fromHiring) return isAr ? fromHiring.titleAr : fromHiring.titleEn;
  const extra = EXTRA_DOC_LABELS[code];
  if (extra) return isAr ? extra.ar : extra.en;
  return code.replace(/_/g, ' ');
}

interface Props {
  employmentType: string;
  requiredDocumentTypes: string[];
}

export function JobRequirementsLivePreview({ employmentType, requiredDocumentTypes }: Props) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const employmentLabel =
    employmentType === 'FULL_TIME'
      ? t('admin.employmentTypeFullTime')
      : employmentType === 'PART_TIME'
        ? t('admin.employmentTypePartTime')
        : employmentType === 'CONTRACT'
          ? t('admin.employmentTypeContract')
          : employmentType;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('admin.pageGuide.livePreview')}
        </h3>
      </div>
      <p className="text-xs text-slate-500">
        {t('admin.jobReqPreviewHint')}{' '}
        <span className="font-bold text-primary">{employmentLabel}</span>
      </p>
      {requiredDocumentTypes.length === 0 ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 italic">
          {isAr ? 'اختر مستنداً واحداً على الأقل' : 'Select at least one document'}
        </p>
      ) : (
        <ul className="space-y-2">
          {requiredDocumentTypes.map((code) => (
            <li
              key={code}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-xs"
            >
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                {getDocLabel(code, isAr)}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded">
                {t('admin.requiredField')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
