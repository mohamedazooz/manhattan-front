import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { seoApi } from '../../api';
import type { SeoConfig } from '../../types';
import { useTranslation } from 'react-i18next';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  article?: boolean;
  publishedTime?: string;
  authorName?: string;
  jsonLd?: Record<string, unknown>;
}

export const SeoHead: FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  article,
  publishedTime,
  authorName,
  jsonLd,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const isAr = lang.startsWith('ar');

  const [globalConfig, setGlobalConfig] = useState<SeoConfig | null>(null);

  useEffect(() => {
    seoApi
      .getGlobal()
      .then((res) => setGlobalConfig(res.data))
      .catch(() => {
        // Fallback if backend API is offline
      });
  }, []);

  const siteDefaultTitle = isAr
    ? globalConfig?.siteTitleAr || globalConfig?.siteTitle || 'مدرسة منهاتن للغات'
    : globalConfig?.siteTitle || 'Manhattan Language School';

  const finalTitle = title ? `${title} | ${siteDefaultTitle}` : siteDefaultTitle;

  const finalDescription =
    description ||
    (isAr
      ? globalConfig?.siteDescriptionAr || globalConfig?.siteDescription
      : globalConfig?.siteDescription) ||
    'Manhattan Language School provides world-class education, empowering minds and building futures.';

  const finalKeywords =
    keywords ||
    (isAr
      ? globalConfig?.defaultKeywords || 'مدرسة منهاتن للغات, تعليم دولي, مدارس القاهرة'
      : 'Manhattan Language School, Cairo language schools, KG Primary Preparatory Language School');

  const finalOgImage =
    ogImage ||
    globalConfig?.defaultOgImage ||
    `${window.location.origin}/logo.png`;

  const currentUrl = canonicalUrl || window.location.href;

  useEffect(() => {
    document.title = finalTitle;
  }, [finalTitle]);

  const defaultSchoolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: 'Manhattan Language School',
    alternateName: 'مدرسة منهاتن للغات',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    description: finalDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
  };

  const activeJsonLd = jsonLd || defaultSchoolJsonLd;

  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content={siteDefaultTitle} />
      <meta property="og:title" content={title || siteDefaultTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:image" content={finalOgImage} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      {globalConfig?.twitterHandle && (
        <meta name="twitter:site" content={globalConfig.twitterHandle} />
      )}
      <meta name="twitter:title" content={title || siteDefaultTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Article specific metadata */}
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && authorName && (
        <meta property="article:author" content={authorName} />
      )}

      {/* Verification tags */}
      {globalConfig?.googleSearchConsoleTag && (
        <meta name="google-site-verification" content={globalConfig.googleSearchConsoleTag} />
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(activeJsonLd)}
      </script>
    </>
  );
};
