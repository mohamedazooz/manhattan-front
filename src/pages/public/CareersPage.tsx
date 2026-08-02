import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronRight,
  Upload,
  GraduationCap,
  Users,
  X,
} from 'lucide-react';
import { careersApi } from '../../api';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAppLanguage } from '../../i18n';
import type { Job } from '../../types';

import { getBilingualText } from '../../lib/utils';

export function CareersPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Application form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    yearsExperience: '',
    curriculumExperience: '',
    subjectsTaught: '',
    highestQualification: '',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', lang],
    queryFn: () => careersApi.list(lang).then((r) => r.data),
  });

  const filteredJobs = jobs.filter((job: Job) => {
    const title = getBilingualText(job, 'title', lang).toLowerCase();
    const location = getBilingualText(job, 'location', lang).toLowerCase();
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || job.employmentType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      if (form.yearsExperience) formData.append('yearsExperience', form.yearsExperience);
      if (form.curriculumExperience) formData.append('curriculumExperience', form.curriculumExperience);
      if (form.subjectsTaught) formData.append('subjectsTaught', form.subjectsTaught);
      if (form.highestQualification) formData.append('highestQualification', form.highestQualification);
      if (form.coverLetter) formData.append('coverLetter', form.coverLetter);

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await careersApi.apply(applyingJob.id, formData);
      setApplySuccess(true);
      setTimeout(() => {
        setApplyingJob(null);
        setApplySuccess(false);
        setForm({
          fullName: '',
          email: '',
          phone: '',
          yearsExperience: '',
          curriculumExperience: '',
          subjectsTaught: '',
          highestQualification: '',
          coverLetter: '',
        });
        setResumeFile(null);
      }, 2500);
    } catch (err: any) {
      console.error('Failed to submit application', err);
      const apiMsg = err?.response?.data?.message;
      const errorText = Array.isArray(apiMsg) ? apiMsg.join(', ') : apiMsg;
      alert(errorText || t('careers.errorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            {t('careers.heroBadge')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight max-w-3xl leading-tight mb-6">
            {t('careers.heroTitle')}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
            {t('careers.heroSubtitle')}
          </p>

          {/* Quick Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Award className="w-6 h-6 text-gold shrink-0" />
              <div>
                <div className="font-semibold text-sm">{t('careers.packageTitle')}</div>
                <div className="text-xs text-slate-400">{t('careers.packageDesc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <GraduationCap className="w-6 h-6 text-gold shrink-0" />
              <div>
                <div className="font-semibold text-sm">{t('careers.standardTitle')}</div>
                <div className="text-xs text-slate-400">{t('careers.standardDesc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Users className="w-6 h-6 text-gold shrink-0" />
              <div>
                <div className="font-semibold text-sm">{t('careers.cultureTitle')}</div>
                <div className="text-xs text-slate-400">{t('careers.cultureDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Search & Filter Bar */}
        <div className="glass-card rounded-2xl p-6 mb-10 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-medium dark:text-slate-400" />
              <input
                type="text"
                placeholder={t('careers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-neutral-dark dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-gold"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {[
                { key: 'ALL', label: t('careers.allTypes') },
                { key: 'FULL_TIME', label: t('careers.fullTime') },
                { key: 'PART_TIME', label: t('careers.partTime') },
                { key: 'CONTRACT', label: t('careers.contract') },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedType === type.key
                      ? 'bg-primary text-white shadow-md dark:bg-gold dark:text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job: Job) => {
              const jobTitle = getBilingualText(job, 'title', lang);
              const jobDesc = getBilingualText(job, 'description', lang);
              const jobLoc = getBilingualText(job, 'location', lang);

              return (
                <div
                  key={job.id}
                  className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group bg-white dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                          {job.employmentType.replace('_', ' ')}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-gold transition-colors">
                          {jobTitle}
                        </h3>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 leading-relaxed">
                      {jobDesc}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary dark:text-gold" />
                        <span>{jobLoc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary dark:text-gold" />
                        <span>{t('careers.recentlyPosted')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Link
                      to={`/careers/${job.id}`}
                      className="text-sm font-semibold text-primary dark:text-gold hover:underline flex items-center gap-1"
                    >
                      {t('careers.viewDetails')}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {job.status === 'OPEN' && (
                      <Button
                        onClick={() => setApplyingJob(job)}
                        className="py-2 px-5 text-sm shadow-md"
                      >
                        {t('careers.applyNow')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="w-12 h-12 text-slate-400" />}
            title={t('careers.noPositions')}
            description={t('careers.noPositionsDesc')}
          />
        )}
      </div>

      {/* Quick Application Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-primary dark:text-gold uppercase tracking-wider">
                  {t('careers.applicationTitle')}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {getBilingualText(applyingJob, 'title', lang)}
                </h2>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {applySuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('careers.applicationSuccess')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {t('careers.applicationSuccessDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.fullNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.experienceLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.yearsExperience}
                      onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.qualificationLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('careers.qualificationPlaceholder')}
                      value={form.highestQualification}
                      onChange={(e) => setForm({ ...form, highestQualification: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('careers.subjectsLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('careers.subjectsPlaceholder')}
                      value={form.subjectsTaught}
                      onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('careers.coverLetterLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={form.coverLetter}
                    onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* CV Upload Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>{t('careers.uploadCvLabel')} <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">PDF, DOC, DOCX, PNG, JPG (الحجم الأقصى 5MB)</span>
                  </label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                    resumeFile
                      ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50/60 dark:bg-slate-800/60'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                      required
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    
                    {resumeFile ? (
                      <div className="flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            📄
                          </div>
                          <div className="text-right">
                            <div className="font-bold truncate max-w-xs">{resumeFile.name}</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB · {resumeFile.name.split('.').pop()?.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setResumeFile(null);
                          }}
                          className="relative z-20 text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:underline text-xs"
                        >
                          تغيير الملف
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                        <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-0.5">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {t('careers.uploadCvPlaceholder')}
                        </span>
                        <span className="text-[11px] text-slate-400">اضغط هنا لاختيار ملف السيرة الذاتية</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setApplyingJob(null)}>
                    {t('careers.cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} showArrow>
                    {submitting ? t('careers.submitting') : t('careers.submitApplication')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
