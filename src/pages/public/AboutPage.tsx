import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { aboutApi } from '../../api';
import { LoadingSpinner, PageHeader } from '../../components/ui/Badge';
import { getBilingualText, mediaUrl } from '../../lib/utils';
import DOMPurify from 'dompurify';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

export function AboutPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['about', lang],
    queryFn: () => aboutApi.get(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const sections = data?.sections || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <SeoHead
        title={t('about.pageTitle')}
        description={t('about.seoDesc')}
      />
      <PageHeader title={t('about.pageTitle')} subtitle={t('about.pageSubtitle')} />

      {sections.length === 0 && data?.legacyHistory && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-neutral-medium dark:text-slate-300 leading-relaxed text-lg"
        >
          {data.legacyHistory}
        </motion.p>
      )}

      <div className="space-y-16">
        {sections.map((section: any, idx: number) => {
          const title = getBilingualText(section, 'title', lang);
          const content = getBilingualText(section, 'content', lang);

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`grid md:grid-cols-2 gap-10 items-center ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark dark:text-blue-400">
                  {title}
                </h2>
                <div
                  className="prose-content text-neutral-medium dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
              </div>
              {section.imageUrl && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-2xl shadow-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={mediaUrl(section.imageUrl)}
                    alt={title}
                    className="rounded-2xl w-full object-cover max-h-96 shadow-md"
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
