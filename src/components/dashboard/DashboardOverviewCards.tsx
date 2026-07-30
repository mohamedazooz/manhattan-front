import type { DashboardStats } from '../../types';
import { Users, Briefcase, Mail, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  stats: DashboardStats;
}

export function DashboardOverviewCards({ stats }: Props) {
  const { t } = useTranslation();

  const essentialCards = [
    {
      id: 'admissions',
      title: t('admin.cards.admissionsTotal', 'Total Admission Applications'),
      value: stats.admissions?.total ?? 0,
      subText: t('admin.cards.admissionsSub', { count: stats.admissions?.submitted ?? 0, defaultValue: '{{count}} applications awaiting review' }),
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      route: '/admin/admissions',
    },
    {
      id: 'jobs',
      title: t('admin.cards.jobsTotal', 'Job Applications & Postings'),
      value: stats.jobs?.totalApplications ?? 0,
      subText: t('admin.cards.jobsSub', { count: stats.jobs?.open ?? 0, defaultValue: '{{count}} open teacher positions' }),
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      gradient: 'from-indigo-500/10 to-purple-500/5',
      route: '/admin/careers',
    },
    {
      id: 'inquiries',
      title: t('admin.cards.inquiriesTotal', 'Inquiries & Messages'),
      value: stats.inquiries?.new ?? 0,
      subText: t('admin.cards.inquiriesSub', { count: stats.inquiries?.replied ?? 0, defaultValue: '{{count}} replied to' }),
      icon: Mail,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      gradient: 'from-blue-500/10 to-cyan-500/5',
      route: '/admin/inquiries',
    },
    {
      id: 'content',
      title: t('admin.cards.contentTotal', 'Published Articles & News'),
      value: stats.blog?.published ?? 0,
      subText: t('admin.cards.contentSub', { count: stats.blog?.draft ?? 0, defaultValue: '{{count}} drafts in progress' }),
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      gradient: 'from-purple-500/10 to-pink-500/5',
      route: '/admin/blog',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {essentialCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            to={card.route}
            className={`group relative p-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br ${card.gradient} bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl border ${card.color} transition-transform group-hover:scale-110 duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-slate-400 group-hover:text-slate-700 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-bold text-slate-700">
                {card.title}
              </div>
              <div className="text-[11px] font-medium text-slate-500 pt-0.5">
                {card.subText}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
