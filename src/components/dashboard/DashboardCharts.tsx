import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { DashboardStats } from '../../types';
import {
  Users,
  Briefcase,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
} from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

export function DashboardCharts({ stats }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'admissions' | 'jobs' | 'content'>('all');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // 1. Admissions data extraction
  const admAccepted = stats.admissions?.accepted ?? 0;
  const admUnderReview = stats.admissions?.underReview ?? 0;
  const admSubmitted = stats.admissions?.submitted ?? 0;
  const admRejected = stats.admissions?.rejected ?? 0;
  const admDraft = stats.admissions?.draft ?? 0;
  const totalAdmissions = stats.admissions?.total ?? (admAccepted + admUnderReview + admSubmitted + admRejected + admDraft);

  const admissionSegments = [
    { key: 'ACCEPTED', label: t('status.ACCEPTED', 'ACCEPTED'), count: admAccepted, color: '#10b981', icon: CheckCircle2 },
    { key: 'UNDER_REVIEW', label: t('status.UNDER_REVIEW', 'UNDER_REVIEW'), count: admUnderReview, color: '#f59e0b', icon: Clock },
    { key: 'SUBMITTED', label: t('status.SUBMITTED', 'SUBMITTED'), count: admSubmitted, color: '#3b82f6', icon: FileCheck },
    { key: 'REJECTED', label: t('status.REJECTED', 'REJECTED'), count: admRejected, color: '#f43f5e', icon: XCircle },
    { key: 'DRAFT', label: t('status.DRAFT', 'DRAFT'), count: admDraft, color: '#94a3b8', icon: AlertCircle },
  ];

  // 2. Job Applications data extraction from Database
  const jobsByStatus: Record<string, number> = (stats.jobs?.byStatus as Record<string, number>) || {};
  const totalJobApps = stats.jobs?.totalApplications ?? 0;

  const jobStages = [
    { key: 'SUBMITTED', label: t('status.SUBMITTED', 'Submitted Applications'), count: jobsByStatus['SUBMITTED'] ?? (jobsByStatus['DRAFT'] ?? 0), color: 'bg-blue-500' },
    { key: 'REVIEWING', label: t('status.REVIEWING', 'Under Review & Evaluation'), count: jobsByStatus['REVIEWING'] ?? 0, color: 'bg-amber-500' },
    { key: 'SHORTLISTED', label: t('status.SHORTLISTED', 'Shortlisted'), count: jobsByStatus['SHORTLISTED'] ?? 0, color: 'bg-indigo-500' },
    { key: 'ACCEPTED', label: t('status.ACCEPTED', 'Accepted Candidates'), count: jobsByStatus['ACCEPTED'] ?? 0, color: 'bg-emerald-500' },
    { key: 'REJECTED', label: t('status.REJECTED', 'Rejected'), count: jobsByStatus['REJECTED'] ?? 0, color: 'bg-rose-400' },
  ];

  const maxJobCount = Math.max(...jobStages.map((s) => s.count), 1);

  // 3. Content Modules Publishing Status
  const contentModules = [
    { name: t('admin.blog', 'Articles & News'), published: stats.blog?.published || 0, draft: stats.blog?.draft || 0, icon: FileText, color: 'from-blue-600 to-cyan-500' },
    { name: t('admin.navGallery', 'Photo Gallery'), published: stats.gallery?.published || 0, draft: stats.gallery?.draft || 0, icon: Layers, color: 'from-purple-600 to-pink-500' },
    { name: t('admin.navEducation', 'Academic Programs'), published: stats.education?.published || 0, draft: stats.education?.draft || 0, icon: Sparkles, color: 'from-emerald-600 to-teal-500' },
    { name: t('admin.pages', 'Static Pages'), published: stats.pages?.published || 0, draft: stats.pages?.draft || 0, icon: PieChartIcon, color: 'from-amber-600 to-orange-500' },
    { name: t('admin.about', 'About Us Sections'), published: stats.aboutUs?.published || 0, draft: stats.aboutUs?.draft || 0, icon: Users, color: 'from-indigo-600 to-blue-500' },
  ];

  // SVG Donut calculation helper
  let cumulativePercent = 0;
  const donutSlices = admissionSegments.map((seg) => {
    const percent = totalAdmissions > 0 ? (seg.count / totalAdmissions) * 100 : 20;
    const startAngle = (cumulativePercent * 360) / 100;
    cumulativePercent += percent;

    return {
      ...seg,
      percent,
      startAngle,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('admin.charts.title', 'Interactive Charts & Statistics')}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('admin.charts.subtitle', 'Live dynamic analytics for student admissions, career applications, and website content status.')}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          {[
            { id: 'all', label: t('admin.charts.all', 'All'), icon: BarChart3 },
            { id: 'admissions', label: t('admin.charts.admissions', 'Admissions'), icon: Users },
            { id: 'jobs', label: t('admin.charts.jobs', 'Careers'), icon: Briefcase },
            { id: 'content', label: t('admin.charts.content', 'Content'), icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary shadow-xs font-bold scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Admissions Distribution Donut Chart */}
        {(activeTab === 'all' || activeTab === 'admissions') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t('admin.charts.admDistribution', 'Student Admissions Distribution')}</h3>
                  <p className="text-xs text-slate-400">{t('admin.charts.totalApps', { count: totalAdmissions, defaultValue: 'Total submitted applications: {{count}} students' })}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                {t('admin.charts.live', 'Live Updated')}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 items-center my-2">
              {/* Donut Graphic */}
              <div className="relative flex justify-center items-center py-2">
                <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                  {donutSlices.map((slice) => {
                    const radius = 38;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDasharray = `${(slice.percent * circumference) / 100} ${circumference}`;
                    const strokeDashoffset = -((cumulativePercent - slice.percent) * circumference) / 100;
                    const isHovered = hoveredSegment === slice.key;

                    return (
                      <circle
                        key={slice.key}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 16 : 12}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer hover:opacity-90"
                        onMouseEnter={() => setHoveredSegment(slice.key)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      />
                    );
                  })}
                </svg>
                {/* Center Badge */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-800">{totalAdmissions}</span>
                  <span className="text-[11px] font-semibold text-slate-400">{t('admin.charts.totalStudents', 'Total Students')}</span>
                </div>
              </div>

              {/* Legend & Details */}
              <div className="space-y-2.5">
                {donutSlices.map((seg) => {
                  const Icon = seg.icon;
                  const isHovered = hoveredSegment === seg.key;
                  return (
                    <div
                      key={seg.key}
                      onMouseEnter={() => setHoveredSegment(seg.key)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isHovered
                          ? 'bg-slate-50 border-slate-300 scale-[1.02] shadow-2xs'
                          : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: seg.color }}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">{seg.label}</span>
                          <span className="text-[10px] text-slate-400">{t('admin.charts.pctTotal', { pct: seg.percent.toFixed(1), defaultValue: '{{pct}}% of total' })}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border shadow-2xs">
                        {seg.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chart 2: Job Applications Pipeline Bar Chart */}
        {(activeTab === 'all' || activeTab === 'jobs') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t('admin.charts.jobStages', 'Teacher Job Screening Pipeline')}</h3>
                  <p className="text-xs text-slate-400">{t('admin.charts.totalApplicants', { count: totalJobApps, defaultValue: 'Total job applicants: {{count}} applicants' })}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-200">
                {t('admin.navCareers', 'Careers')}
              </span>
            </div>

            <div className="space-y-4 my-2">
              {jobStages.map((stage) => {
                const percentage = maxJobCount > 0 ? (stage.count / maxJobCount) * 100 : 0;
                return (
                  <div key={stage.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{stage.label}</span>
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t('admin.charts.applicationsCount', { count: stage.count, defaultValue: '{{count}} applications' })}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 3)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${stage.color} shadow-xs`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {t('admin.charts.openPositions', { count: stats.jobs?.open || 0, defaultValue: 'Open positions available: {{count}}' })}
              </span>
              <span>{t('admin.charts.closedPositions', { count: stats.jobs?.closed || 0, defaultValue: 'Closed positions: {{count}}' })}</span>
            </div>
          </motion.div>
        )}

        {/* Chart 3: Content Modules Publishing Comparison */}
        {(activeTab === 'all' || activeTab === 'content') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs ${
              activeTab === 'all' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t('admin.charts.contentStatus', 'Website Content Publishing Status')}</h3>
                  <p className="text-xs text-slate-400">{t('admin.charts.publishedVsDraft', 'Comparison of published items vs drafts per section')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {t('admin.charts.published', 'Published')}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> {t('admin.charts.draft', 'Draft')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentModules.map((mod) => {
                const Icon = mod.icon;
                const total = mod.published + mod.draft;
                const publishedPercent = total > 0 ? (mod.published / total) * 100 : 100;

                return (
                  <div key={mod.name} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg text-white bg-gradient-to-r ${mod.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{mod.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-700 bg-white px-2 py-0.5 rounded border">
                        {t('admin.charts.totalCount', { count: total, defaultValue: 'Total {{count}}' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-700">{mod.published} {t('admin.charts.published', 'Published')}</span>
                      <span className="text-amber-600">{mod.draft} {t('admin.charts.draft', 'Draft')}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-amber-200/80 h-3 rounded-full overflow-hidden flex shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${publishedPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-emerald-500 h-full rounded-r-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
