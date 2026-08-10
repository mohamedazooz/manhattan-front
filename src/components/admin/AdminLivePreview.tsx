import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Image as ImageIcon, FileText, Newspaper, GraduationCap, Compass } from 'lucide-react';
import {
  landingApi,
  blogApi,
  educationApi,
  galleryApi,
  formDocumentsApi,
  aboutApi,
  pagesApi,
  cmsApi,
} from '../../api';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import type { AdminPageGuideKey } from '../../lib/adminPageGuides';

interface Props {
  guideKey: AdminPageGuideKey;
}

export function AdminLivePreview({ guideKey }: Props) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isAr = lang === 'ar';

  const { data: heroes = [] } = useQuery({
    queryKey: ['admin-preview-heroes'],
    queryFn: () => landingApi.heroes().then((r) => r.data),
    enabled: guideKey === 'hero',
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['admin-preview-sections'],
    queryFn: () => landingApi.sections().then((r) => r.data),
    enabled: guideKey === 'sections',
  });

  const { data: cmsConfig = {} } = useQuery({
    queryKey: ['admin-preview-student-life'],
    queryFn: () => cmsApi.getConfig().then((r) => r.data),
    enabled: guideKey === 'studentLife',
  });

  const { data: aboutItems = [] } = useQuery({
    queryKey: ['admin-preview-about'],
    queryFn: () => aboutApi.admin().then((r) => r.data),
    enabled: guideKey === 'about',
  });

  const { data: staticPages = [] } = useQuery({
    queryKey: ['admin-preview-pages'],
    queryFn: () => pagesApi.admin().then((r) => r.data),
    enabled: guideKey === 'pages',
  });

  const { data: formDocs = [] } = useQuery({
    queryKey: ['admin-preview-form-docs'],
    queryFn: () => formDocumentsApi.admin().then((r) => r.data),
    enabled: guideKey === 'formDocuments',
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['admin-preview-education', lang],
    queryFn: () => educationApi.list(lang).then((r) => r.data),
    enabled: guideKey === 'education',
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['admin-preview-gallery', lang],
    queryFn: () => galleryApi.list(lang).then((r) => r.data),
    enabled: guideKey === 'gallery',
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-preview-blog', lang],
    queryFn: () => blogApi.list(lang).then((r) => r.data),
    enabled: guideKey === 'blog',
  });

  const empty = (
    <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
      {t('admin.pageGuide.noPreviewData')}
    </p>
  );

  if (guideKey === 'hero') {
    const active = heroes.find((h: { isActive?: boolean }) => h.isActive) || heroes[0];
    if (!active) return empty;
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
        {active.imageUrl && (
          <img src={mediaUrl(active.imageUrl)} alt="" className="w-full h-24 object-cover" />
        )}
        <div className="p-3 space-y-1">
          <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {isAr && active.titleAr ? active.titleAr : active.title}
          </p>
          {(active.subtitle || active.subtitleAr) && (
            <p className="text-xs text-slate-500 line-clamp-2">
              {isAr && active.subtitleAr ? active.subtitleAr : active.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (guideKey === 'sections') {
    if (!sections.length) return empty;
    return (
      <ul className="space-y-1.5 max-h-40 overflow-y-auto">
        {sections.slice(0, 8).map((s: { id: string; key: string; title: string; titleAr?: string; status?: string }) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700"
          >
            <span className="font-medium truncate">
              {isAr && s.titleAr ? s.titleAr : s.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">{s.key}</span>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                s.status === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {s.status === 'PUBLISHED' ? (isAr ? 'منشور' : 'Live') : (isAr ? 'مسودة' : 'Draft')}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (guideKey === 'studentLife') {
    try {
      const raw = (cmsConfig as Record<string, string>).student_life_config;
      if (!raw) return empty;
      const cfg = JSON.parse(raw) as {
        heroTitleAr?: string;
        heroTitleEn?: string;
        clubs?: Array<{ titleAr?: string; titleEn?: string }>;
      };
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
            <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="font-bold text-slate-800 dark:text-slate-100">
              {isAr ? cfg.heroTitleAr : cfg.heroTitleEn}
            </p>
          </div>
          {cfg.clubs?.slice(0, 3).map((club, i) => (
            <p key={i} className="text-slate-600 dark:text-slate-300 px-2">
              • {isAr ? club.titleAr : club.titleEn}
            </p>
          ))}
        </div>
      );
    } catch {
      return empty;
    }
  }

  if (guideKey === 'about') {
    const item = aboutItems[0] as { title?: string; titleAr?: string } | undefined;
    if (!item) return empty;
    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-semibold">
        {isAr && item.titleAr ? item.titleAr : item.title}
      </div>
    );
  }

  if (guideKey === 'pages') {
    const page = staticPages[0] as { slug?: string; title?: string; titleAr?: string } | undefined;
    if (!page) return empty;
    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
        <p className="text-sm font-semibold">{isAr && page.titleAr ? page.titleAr : page.title}</p>
        <p className="text-xs font-mono text-primary">/page/{page.slug}</p>
      </div>
    );
  }

  if (guideKey === 'formDocuments') {
    if (!formDocs.length) return empty;
    return (
      <ul className="space-y-1">
        {(formDocs as Array<{ titleAr?: string; titleEn?: string }>).slice(0, 3).map((doc, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            {isAr && doc.titleAr ? doc.titleAr : doc.titleEn}
          </li>
        ))}
      </ul>
    );
  }

  if (guideKey === 'education') {
    const prog = programs[0] as { title?: string; titleAr?: string; level?: string } | undefined;
    if (!prog) return empty;
    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold">{isAr && prog.titleAr ? prog.titleAr : prog.title}</p>
          {prog.level && <p className="text-xs text-slate-500">{prog.level}</p>}
        </div>
      </div>
    );
  }

  if (guideKey === 'gallery') {
    const imgs = (galleryImages as Array<{ imageUrl?: string; title?: string }>).slice(0, 4);
    if (!imgs.length) return empty;
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {imgs.map((img, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            {img.imageUrl ? (
              <img src={mediaUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (guideKey === 'blog') {
    const post = posts[0] as { title?: string; slug?: string } | undefined;
    if (!post) return empty;
    return (
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
        <Newspaper className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold line-clamp-2">{post.title}</p>
          <a
            href={`/news/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1"
          >
            /news/{post.slug}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
