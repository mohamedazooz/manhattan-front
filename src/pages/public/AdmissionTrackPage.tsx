import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { admissionsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { formatDate } from '../../lib/utils';

interface TrackResult {
  referenceNumber: string;
  studentName: string;
  gradeLevel: string;
  status: string;
  updatedAt: string;
}

export function AdmissionTrackPage() {
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const [refNumber, setRefNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await admissionsApi.track(refNumber.trim(), email.trim());
      setResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(
        msg ||
          (isAr
            ? 'لم يتم العثور على طلب بهذا الرقم المرجعي أو البريد الإلكتروني غير مطابق'
            : 'No application found with the provided reference number or email mismatch'),
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { labelAr: string; labelEn: string; color: string }> = {
      DRAFT: {
        labelAr: 'مسودة',
        labelEn: 'Draft',
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      },
      SUBMITTED: {
        labelAr: 'تم استلام الطلب',
        labelEn: 'Submitted',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      },
      UNDER_REVIEW: {
        labelAr: 'قيد المراجعة',
        labelEn: 'Under Review',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      },
      ACCEPTED: {
        labelAr: 'تم القبول',
        labelEn: 'Accepted',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      },
      REJECTED: {
        labelAr: 'غير مقبول',
        labelEn: 'Not Accepted',
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      },
    };

    const info = statusMap[status] || { labelAr: status, labelEn: status, color: 'bg-slate-100 text-slate-800' };
    return (
      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${info.color}`}>
        {isAr ? info.labelAr : info.labelEn}
      </span>
    );
  };

  const steps = [
    { key: 'SUBMITTED', titleAr: 'تم التقديم', titleEn: 'Submitted' },
    { key: 'UNDER_REVIEW', titleAr: 'قيد المراجعة', titleEn: 'Under Review' },
    { key: 'ACCEPTED', titleAr: 'القبول', titleEn: 'Accepted' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'ACCEPTED':
        return 2;
      case 'REJECTED':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            {isAr ? 'نظام تتبع طلبات القبول MLS' : 'MLS Admission Application Tracking'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white tracking-tight mb-3">
            {isAr ? 'تتبع حالة طلب القبول' : 'Track Your Admission Application'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            {isAr
              ? 'أدخل الرقم المرجعي وبريد ولي الأمر المسجل في الطلب لمعرفة حالة القبول.'
              : 'Enter your reference number and parent email used in the application to check admission status.'}
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 mb-8"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'الرقم المرجعي' : 'Reference Number'}
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder={isAr ? 'مثال: ADM-2026-0001' : 'e.g. ADM-2026-0001'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'بريد ولي الأمر' : 'Parent Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? 'parent@email.com' : 'parent@email.com'}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2">
            {loading ? <LoadingSpinner /> : <Search className="w-4 h-4" />}
            {isAr ? 'تتبع الطلب' : 'Track Application'}
          </Button>
        </form>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    {isAr ? 'الرقم المرجعي' : 'Reference'}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    {result.referenceNumber}
                  </p>
                </div>
                {getStatusBadge(result.status)}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? 'اسم الطالب' : 'Student'}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.studentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-slate-500">{isAr ? 'المرحلة الدراسية' : 'Grade Level'}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.gradeLevel}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                {isAr ? 'آخر تحديث:' : 'Last updated:'}{' '}
                {formatDate(result.updatedAt, lang)}
              </p>
            </div>

            {result.status !== 'REJECTED' && (
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  {isAr ? 'مراحل الطلب' : 'Application Progress'}
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {steps.map((step, idx) => {
                    const currentIdx = getStepIndex(result.status);
                    const done = idx <= currentIdx;
                    return (
                      <div key={step.key} className="flex-1 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <span className={`text-sm font-medium ${done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {isAr ? step.titleAr : step.titleEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
