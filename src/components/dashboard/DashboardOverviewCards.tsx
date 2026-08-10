import type { DashboardStats } from '../../types';
import { Users, Briefcase, Mail, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';

interface Props {
  stats: DashboardStats;
}

export function DashboardOverviewCards({ stats }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  const allCards = [
    {
      id: 'admissions',
      permission: 'VIEW_ALL_ADMISSIONS',
      title: t('admin.cards.admissionsTotal', 'Admission pipeline'),
      value: (stats.admissions?.submitted ?? 0) + (stats.admissions?.underReview ?? 0),
      subText: t('admin.cards.admissionsSub', {
        count: stats.admissions?.total ?? 0,
        defaultValue: '{{count}} total applications on record',
      }),
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      route: '/admin/admissions',
      highlight: (stats.admissions?.submitted ?? 0) + (stats.admissions?.underReview ?? 0) > 0,
    },
    {
      id: 'jobs',
      permission: 'MANAGE_JOBS',
      title: t('admin.cards.jobsTotal', 'Hiring pipeline'),
      value: (stats.jobs?.byStatus?.SUBMITTED ?? 0) + (stats.jobs?.byStatus?.REVIEWING ?? 0),
      subText: t('admin.cards.jobsSub', {
        count: stats.jobs?.open ?? 0,
        defaultValue: '{{count}} open positions',
      }),
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
      gradient: 'from-indigo-500/10 to-purple-500/5',
      route: '/admin/careers',
      highlight:
        (stats.jobs?.byStatus?.SUBMITTED ?? 0) + (stats.jobs?.byStatus?.REVIEWING ?? 0) > 0,
    },
    {
      id: 'inquiries',
      permission: 'VIEW_DASHBOARD',
      title: t('admin.cards.inquiriesTotal', 'New inquiries'),
      value: stats.inquiries?.new ?? 0,
      subText: t('admin.cards.inquiriesSub', {
        count: stats.inquiries?.replied ?? 0,
        defaultValue: '{{count}} already replied',
      }),
      icon: Mail,
      color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
      gradient: 'from-blue-500/10 to-cyan-500/5',
      route: '/admin/inquiries',
      highlight: (stats.inquiries?.new ?? 0) > 0,
    },
    {
      id: 'content',
      permission: 'UPDATE_BLOG',
      title: t('admin.cards.contentTotal', 'Content drafts'),
      value: stats.content?.totalDrafts ?? stats.blog?.draft ?? 0,
      subText: t('admin.cards.contentSub', {
        count: stats.blog?.published ?? 0,
        defaultValue: '{{count}} articles published',
      }),
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
      gradient: 'from-purple-500/10 to-pink-500/5',
      route: '/admin/blog',
      highlight: (stats.content?.totalDrafts ?? 0) > 0,
    },
  ];

  const cards = allCards.filter((card) => hasPermission(card.permission));

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
        {t('admin.ops.kpiTitle', 'Key metrics')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              to={card.route}
              className={`group relative p-5 rounded-2xl border bg-gradient-to-br ${card.gradient} bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                card.highlight
                  ? 'border-amber-300/80 ring-1 ring-amber-200/60 dark:border-amber-800'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl border ${card.color} transition-transform group-hover:scale-105 duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
                  {card.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{card.title}</div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                  {card.subText}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
