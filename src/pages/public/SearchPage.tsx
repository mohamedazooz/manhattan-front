import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogApi, educationApi, pagesApi } from '../../api';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/Badge';
import { useAppLanguage } from '../../i18n';

export function SearchPage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const [q, setQ] = useState('');

  const { data: posts = [] } = useQuery({ queryKey: ['posts', lang], queryFn: () => blogApi.list(lang).then((r) => r.data) });
  const { data: programs = [] } = useQuery({ queryKey: ['education', lang], queryFn: () => educationApi.list(lang).then((r) => r.data) });
  const { data: pages = [] } = useQuery({ queryKey: ['pages', lang], queryFn: () => pagesApi.list(lang).then((r) => r.data) });

  const query = q.toLowerCase().trim();
  const results = query
    ? [
        ...posts.filter((p) => p.title.toLowerCase().includes(query)).map((p) => ({ type: t('search.typeNews'), title: p.title, link: `/news/${p.slug}` })),
        ...programs.filter((p) => p.title.toLowerCase().includes(query)).map((p) => ({ type: t('search.typeProgram'), title: p.title, link: `/academics/${p.slug}` })),
        ...pages.filter((p) => p.title.toLowerCase().includes(query)).map((p) => ({ type: t('search.typePage'), title: p.title, link: `/parents/${p.slug === 'academic-calendar' ? 'calendar' : p.slug === 'school-policies' ? 'policies' : 'forms'}` })),
      ]
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={t('nav.search')} />
      <Input
        placeholder={t('search.placeholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-8"
      />
      {query && (
        <ul className="space-y-3">
          {results.map((r, i) => (
            <li key={i}>
              <Link to={r.link} className="block rounded border p-4 hover:bg-neutral-light">
                <span className="text-xs text-primary font-medium">{r.type}</span>
                <div className="font-medium">{r.title}</div>
              </Link>
            </li>
          ))}
          {!results.length && <p className="text-neutral-medium">{t('common.noResults')}</p>}
        </ul>
      )}
    </div>
  );
}
