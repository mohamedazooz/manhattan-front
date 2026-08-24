import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  Building,
} from 'lucide-react';
import { careersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';
import { logger } from '../../lib/logger';

interface TrackResult {
  referenceNumber: string;
  fullName: string;
  status: string;
  createdAt: string;
  jobTitle: string;
  jobTitleAr?: string;
  jobLocation: string;
  interviewDate?: string | null;
  interviewLocation?: string | null;
  documentsCount: number;
  statusHistory: Array<{
    status: string;
    date: string;
    note?: string | null;
  }>;
}

export function JobTrackPage() {
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const [refNumber, setRefNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await careersApi.trackApplication(refNumber.trim(), phone.trim());
      setResult(res.data);
    } catch (err: any) {
      logger.error('Track application error:', err);
      const msg = err?.response?.data?.message;
      setError(
        msg || (isAr ? 'لم يتم العثور على طلب بهذا الرقم المرجعي أو رقم الهاتف غير مطابق' : 'No application found with provided reference number or phone mismatch')
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { labelAr: string; labelEn: string; color: string }> = {
      DRAFT: { labelAr: 'مسودة', labelEn: 'Draft', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
      SUBMITTED: { labelAr: 'تم استلام الطلب', labelEn: 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
      REVIEWING: { labelAr: 'قيد المراجعة والتقييم', labelEn: 'Under Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
      SHORTLISTED: { labelAr: 'مرشح للمقابلة الشخصية', labelEn: 'Shortlisted for Interview', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' },
      ACCEPTED: { labelAr: 'تم القبول والتعيين', labelEn: 'Accepted', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' },
      REJECTED: { labelAr: 'غير مقبول حالياً', labelEn: 'Not Selected', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800' },
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
    { key: 'REVIEWING', titleAr: 'قيد المراجعة', titleEn: 'Under Review' },
    { key: 'SHORTLISTED', titleAr: 'ترشيح للمقابلة', titleEn: 'Interview' },
    { key: 'ACCEPTED', titleAr: 'القبول والتعيين', titleEn: 'Accepted' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 0;
      case 'REVIEWING': return 1;
      case 'SHORTLISTED': return 2;
      case 'ACCEPTED': return 3;
      case 'REJECTED': return 1;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            {isAr ? 'نظام تتبع طلبات التوظيف MLS' : 'MLS Career Application Tracking'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white tracking-tight mb-3">
            {isAr ? 'تتبع حالة طلب التوظيف' : 'Track Your Application Status'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            {isAr
              ? 'أدخل الرقم المرجعي للطلب ورقم الهاتف المسجل لمتابعة التحديثات ومواعيد المقابلة الشخصية'
              : 'Enter your application reference number and phone to view status updates and interview schedule'}
          </p>
        </div>

        {/* Search Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-10 shadow-md border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الرقم المرجعي (Ref Number)' : 'Reference Number'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: MLS-JOB-2026-0012' : 'e.g. MLS-JOB-2026-0012'}
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'رقم الهاتف المسجل' : 'Registered Phone Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'أدخل رقم الهاتف للتأكيد' : 'Enter phone number for verification'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:outline-hidden"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {isAr ? 'استعلام عن حالة الطلب' : 'Track Application'}
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Container */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Application Details Card */}
            <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono text-gold font-bold mb-1">
                    {result.referenceNumber}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isAr ? result.jobTitleAr || result.jobTitle : result.jobTitle}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {result.jobLocation}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(result.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(result.status)}</div>
              </div>

              {/* Progress Stepper */}
              <div className="py-8">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
                  {isAr ? 'مراحل متابعة الطلب:' : 'Application Progress:'}
                </div>

                <div className="grid grid-cols-4 gap-2 relative">
                  {steps.map((st, idx) => {
                    const activeIdx = getStepIndex(result.status);
                    const isPassed = idx <= activeIdx && result.status !== 'REJECTED';
                    const isCurrent = idx === activeIdx;

                    return (
                      <div key={st.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            isPassed
                              ? 'bg-primary text-white ring-4 ring-primary/20 dark:ring-gold/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-5 h-5 text-gold" /> : idx + 1}
                        </div>
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-primary dark:text-gold font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {isAr ? st.titleAr : st.titleEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interview Notification Banner if Shortlisted */}
              {result.status === 'SHORTLISTED' && (
                <div className="p-5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-700 dark:text-purple-300">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    {isAr ? 'تهانينا! تم تحديد موعد المقابلة الشخصية (Interview):' : 'Interview Scheduled Details:'}
                  </div>
                  <div className="text-xs space-y-1 pl-7 rtl:pl-0 rtl:pr-7">
                    <div>
                      <strong>{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</strong>{' '}
                      {result.interviewDate
                        ? new Date(result.interviewDate).toLocaleString(isAr ? 'ar-EG' : 'en-US')
                        : isAr ? 'سيتم تأكيده عبر هاتف HR' : 'To be confirmed by HR'}
                    </div>
                    <div>
                      <strong>{isAr ? 'المكان:' : 'Location:'}</strong>{' '}
                      {result.interviewLocation || 'مدرسة مانهاتن للغات، مدينة الشيخ زايد - Administration Office'}
                    </div>
                  </div>
                </div>
              )}

              {/* Status History Timeline */}
              {result.statusHistory && result.statusHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                    {isAr ? 'سجل انتقالات الحالة:' : 'Status History Log:'}
                  </div>
                  <div className="space-y-3">
                    {result.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {h.status}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(h.date).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                          </div>
                          {h.note && (
                            <div className="mt-1 text-slate-600 dark:text-slate-400 italic">
                              "{h.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
