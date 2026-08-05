import { useTranslation } from 'react-i18next';
import { ExternalLink, Info } from 'lucide-react';
import { ADMIN_PAGE_GUIDES, type AdminPageGuideKey } from '../../lib/adminPageGuides';
import { AdminLivePreview } from './AdminLivePreview';

interface Props {
  guideKey: AdminPageGuideKey;
  /** Hide built-in live preview (e.g. when page has custom preview) */
  hidePreview?: boolean;
  children?: React.ReactNode;
}

export function AdminPageGuide({ guideKey, hidePreview, children }: Props) {
  const { t } = useTranslation();
  const config = ADMIN_PAGE_GUIDES[guideKey];

  const sectionLabel = t(`admin.pageGuides.${guideKey}.section`);
  const description = t(`admin.pageGuides.${guideKey}.description`);

  return (
    <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                {t('admin.pageGuide.affectsSection')}: {sectionLabel}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{description}</p>
          </div>
        </div>
        <a
          href={config.publicPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-primary border border-primary/30 hover:bg-primary/5 transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t('admin.pageGuide.viewOnSite')}
        </a>
      </div>

      {!hidePreview && guideKey !== 'jobRequirements' && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {t('admin.pageGuide.livePreview')}
          </p>
          <AdminLivePreview guideKey={guideKey} />
        </div>
      )}

      {children}
    </div>
  );
}
