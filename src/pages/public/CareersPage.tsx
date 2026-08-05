import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Award,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Users,
} from 'lucide-react';
import { careersApi } from '../../api';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { StatusBadge, LoadingSpinner } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAppLanguage } from '../../i18n';
import type { Job } from '../../types';
import { useAuth } from '../../lib/auth';
import { getBilingualText } from '../../lib/utils';

export function CareersPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  function getApplyPath(jobId: string) {
    return `/portal/applicant/apply/${jobId}`;
  }

  function handleApplyJob(jobId: string) {
    const applyPath = getApplyPath(jobId);
    if (!user || role === 'PARENT') {
      navigate(`/register/applicant?redirect=${encodeURIComponent(applyPath)}`);
      return;
    }
    navigate(applyPath);
  }

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,39,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              {t('careers.heroBadge')}
            </div>

            <Link
              to="/careers/track"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-gold/30 border border-gold/40 text-gold font-bold text-xs transition-all backdrop-blur-xs shadow-xs"
            >
              <Search className="w-4 h-4 text-gold" />
              {lang === 'ar' ? 'تتبع حالة طلبك' : 'Track Application Status'}
            </Link>
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
                        onClick={() => handleApplyJob(job.id)}
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
    </div>
  );
}
