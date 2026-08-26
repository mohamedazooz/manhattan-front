import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  FileText,
  GraduationCap,
  Award,
  CreditCard,
  Image as ImageIcon,
  FileCheck,
  FileBadge,
  Stethoscope,
  Briefcase,
  Printer,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckSquare,
  Square,
  Paperclip,
} from 'lucide-react';
import { HIRING_DOCUMENTS, type HiringDocumentDef } from '../../constants/hiringDocuments';

interface HiringDocumentsSectionProps {
  lang?: 'ar' | 'en';
  pledged: boolean;
  onPledgeChange: (pledged: boolean) => void;
  documentFiles: Record<string, File | null>;
  onFileChange: (docCode: string, file: File | null) => void;
  uploadedDocs?: Array<{ documentType: string; fileName: string; fileUrl: string }>;
  readOnly?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  FileText,
  GraduationCap,
  Award,
  CreditCard,
  Image: ImageIcon,
  FileCheck,
  FileBadge,
  Stethoscope,
  Briefcase,
  Printer,
};

export const HiringDocumentsSection: React.FC<HiringDocumentsSectionProps> = ({
  lang = 'ar',
  pledged,
  onPledgeChange,
  documentFiles,
  onFileChange,
  uploadedDocs = [],
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const isAr = lang === 'ar';

  const getUploadedForCode = (code: string) => {
    return uploadedDocs.find((d) => d.documentType === code);
  };

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-950/60 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900/90 p-5 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? 'مصوغات التعيين (المستندات المطلوبة للوظيفة)' : 'Employment Required Documents'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                MLS Official (11 مستند)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'يمكنك إرفاق المستندات المتاحة لديك الآن، أو التعهد بإحُضار كافة الأصول أثناء الإنترفيو.'
                : 'Upload available documents now, or pledge to bring original copies to the interview.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Pledge Card */}
      {!readOnly && (
        <div
          onClick={() => onPledgeChange(!pledged)}
          className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border-2 ${
            pledged
              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/20'
              : 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-400 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {pledged ? (
                <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Square className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm leading-snug">
                {isAr
                  ? 'أتعهد بإحضار أصول وصور كافة مسوغات التعيين المذكورة أعلاه في المقابلة الشخصية (الإنترفيو)'
                  : 'I pledge to bring all original required hiring documents during the in-person interview.'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'عند تحديد هذا الخيار، يمكنك تقديم الطلب الآن وإحضار الأصول الرسمية المستخرجة يوم المقابلة في مدرسة منهاتن للغات.'
                  : 'By checking this box, you may proceed with the application and present physical original documents at the MLS interview.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Read-Only Pledge Indicator */}
      {readOnly && pledged && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            {isAr
              ? 'تعهد المتقدم بإحضار أصول كافة مسوغات التعيين أثناء المقابلة الشخصية (الإنترفيو).'
              : 'Applicant pledged to present all original hiring documents during the interview.'}
          </span>
        </div>
      )}

      {/* Expanded Document Grid */}
      {isExpanded && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>
              {isAr ? 'قائمة تفاصيل مسوغات التعيين الـ 11:' : 'Detailed List of 11 Required Documents:'}
            </span>
            {pledged && !readOnly && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
                ✓ رفع الملفات اختياري حالياً بفضل التعهد
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HIRING_DOCUMENTS.map((doc: HiringDocumentDef) => {
              const IconComponent = ICON_MAP[doc.icon] || FileText;
              const title = isAr ? doc.titleAr : doc.titleEn;
              const desc = isAr ? doc.descriptionAr : doc.descriptionEn;
              const badge = isAr ? doc.badgeAr : doc.badgeEn;
              const currentFile = documentFiles[doc.code];
              const uploadedDoc = getUploadedForCode(doc.code);

              return (
                <div
                  key={doc.code}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex flex-col justify-between space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {doc.isMandatory ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                              {isAr ? '🔴 مطلوب إلزامي' : 'Mandatory'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {isAr ? '🔵 اختياري' : 'Optional'}
                            </span>
                          )}
                          {badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Upload or Status Row */}
                  {!readOnly ? (
                    <div className="pt-1">
                      {currentFile ? (
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate font-semibold">{currentFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onFileChange(doc.code, null)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold shrink-0 hover:underline"
                          >
                            حذف
                          </button>
                        </div>
                      ) : uploadedDoc ? (
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px]">
                          <span className="truncate font-semibold">✓ مرفوع سابقاً</span>
                          <a
                            href={uploadedDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary dark:text-gold hover:underline text-[10px] font-bold"
                          >
                            عرض
                          </a>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('careers.attachDocument', 'إرفاق المستند')}</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) onFileChange(doc.code, file);
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1">
                      {uploadedDoc ? (
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px]">
                          <span className="font-medium truncate">✓ {uploadedDoc.fileName}</span>
                          <a
                            href={uploadedDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary dark:text-gold font-bold hover:underline"
                          >
                            معاينة
                          </a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">
                          {pledged ? 'مشمول ضمن التعهد بالإنترفيو' : 'غير مرفوع'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
