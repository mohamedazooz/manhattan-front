import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { educationApi } from '../../api';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { getBilingualText, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';
import { ArrowRight } from 'lucide-react';

export function AcademicsPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['education', lang],
    queryFn: () => educationApi.list(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title={t('academics.seoTitle')}
        description={t('academics.seoDesc')}
      />
      <PageHeader title={t('academics.pageTitle')} subtitle={t('academics.pageSubtitle')} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((p: any, idx: number) => {
          const title = getBilingualText(p, 'title', lang);
          const summary = getBilingualText(p, 'summary', lang);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link to={`/academics/${p.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    {p.coverImageUrl && (
                      <div className="overflow-hidden rounded-lg mb-4 h-48">
                        <img
                          src={mediaUrl(p.coverImageUrl)}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <span className="text-xs text-primary dark:text-blue-400 font-semibold bg-primary-light dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {p.level}
                    </span>
                    <h3 className="text-xl font-bold mt-3 mb-2 text-neutral-dark dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-neutral-medium dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-primary dark:text-blue-400">
                    <span>{t('academics.exploreProgram')}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {!programs.length && (
        <p className="text-neutral-medium dark:text-slate-400">{t('academics.noPrograms')}</p>
      )}
    </div>
  );
}
