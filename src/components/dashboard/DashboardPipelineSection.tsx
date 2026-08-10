import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitBranch, ArrowRight } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { useAuth } from '../../lib/auth';
import { buildAdmissionPipeline, buildJobsPipeline } from '../../lib/dashboardOps';

interface Props {
  stats: DashboardStats;
}

function PipelineBar({
  label,
  count,
  total,
  color,
  href,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  href?: string;
}) {
  const width = total > 0 ? Math.max((count / total) * 100, count > 0 ? 8 : 0) : 0;
  const content = (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span className="tabular-nums text-slate-900 dark:text-slate-100">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={cnBar(color)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link to={href} className="block rounded-lg p-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {content}
    </Link>
  );
}

function cnBar(color: string) {
  return `h-full rounded-full transition-all duration-500 ${color}`;
}

export function DashboardPipelineSection({ stats }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  const showAdmissions = hasPermission('VIEW_ALL_ADMISSIONS');
  const showJobs = hasPermission('MANAGE_JOBS');

  if (!showAdmissions && !showJobs) return null;

  const admissionStages = buildAdmissionPipeline(stats, t);
  const jobStages = buildJobsPipeline(stats, t);
  const admissionsTotal = stats.admissions?.total ?? 0;
  const jobsTotal = stats.jobs?.totalApplications ?? 0;
  const contentDrafts = stats.content?.totalDrafts ?? 0;

  const bottleneckAdmission = admissionStages.find((s) => s.key === 'SUBMITTED' || s.key === 'UNDER_REVIEW');
  const bottleneckJobs = jobStages.find((s) => s.key === 'SUBMITTED' || s.key === 'REVIEWING');

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('admin.ops.pipelineTitle', 'Processing pipelines')}
        </h2>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        {t('admin.ops.pipelineSubtitle', 'Where work is waiting — focus on the left side of each pipeline first.')}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {showAdmissions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {t('admin.admissions')}
              </h3>
              <Link to="/admin/admissions" className="text-xs text-primary hover:underline flex items-center gap-1">
                {t('admin.manageAll')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {admissionStages.map((stage) => (
                <PipelineBar
                  key={stage.key}
                  label={stage.label}
                  count={stage.count}
                  total={admissionsTotal}
                  color={stage.color}
                  href={stage.href}
                />
              ))}
            </div>
            {bottleneckAdmission && bottleneckAdmission.count > 0 && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                {t('admin.ops.bottleneckAdmissions', '{{count}} applications in intake/review', {
                  count: (stats.admissions?.submitted ?? 0) + (stats.admissions?.underReview ?? 0),
                })}
              </p>
            )}
          </div>
        )}

        {showJobs && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {t('admin.careers')}
              </h3>
              <Link to="/admin/careers" className="text-xs text-primary hover:underline flex items-center gap-1">
                {t('admin.manageAll')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {jobStages.map((stage) => (
                <PipelineBar
                  key={stage.key}
                  label={stage.label}
                  count={stage.count}
                  total={jobsTotal}
                  color={stage.color}
                  href={stage.href}
                />
              ))}
            </div>
            {bottleneckJobs && bottleneckJobs.count > 0 && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
                {t('admin.ops.bottleneckJobs', '{{count}} applications awaiting HR review', {
                  count: (stats.jobs?.byStatus?.SUBMITTED ?? 0) + (stats.jobs?.byStatus?.REVIEWING ?? 0),
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {hasPermission('UPDATE_BLOG') && contentDrafts > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">
            {t('admin.ops.contentBacklog', '{{count}} unpublished content drafts across modules', {
              count: contentDrafts,
            })}
          </span>
          <Link to="/admin/blog" className="text-primary hover:underline text-xs font-medium">
            {t('admin.ops.reviewContent', 'Review content')}
          </Link>
        </div>
      )}
    </section>
  );
}
