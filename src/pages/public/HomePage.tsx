import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, Shield, Star, Users } from 'lucide-react';
import { landingApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { FeatureCard } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';

const trustIcons = [
  { key: 'bilingual', icon: BookOpen },
  { key: 'classrooms', icon: GraduationCap },
  { key: 'safe', icon: Shield },
  { key: 'teachers', icon: Users },
  { key: 'future', icon: Star },
];

export function HomePage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['landing', lang],
    queryFn: () => landingApi.get(lang).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const hero = data?.hero;
  const sections = data?.sections || [];
  const cards = sections.filter((s) => s.key.includes('card'));
  const aboutSection = sections.find((s) => s.key === 'about-preview');

  const heroImage = hero?.imageUrl ? mediaUrl(hero.imageUrl) : null;
  const primaryCtaText = hero?.ctaText || t('nav.enroll');
  const primaryCtaLink = hero?.ctaLink || '/admissions';

  return (
    <>
      <SeoHead
        title={hero?.title || 'Home'}
        description={hero?.subtitle || 'Welcome to Manhattan Language School. Empowering Minds, Building Futures.'}
        ogImage={heroImage || undefined}
      />
      <section
        className="relative min-h-[70vh] flex items-center bg-primary-dark text-white"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(rgba(20, 30, 60, 0.82), rgba(20, 30, 60, 0.82)), url(${heroImage})`
            : 'linear-gradient(135deg, #24366f 0%, #1a2854 50%, #0f1a3a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 w-full">
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight mb-4">
            {hero?.title || 'Welcome to Manhattan Language School'}
          </h1>
          <p className="text-lg text-white/90 max-w-xl mb-8">
            {hero?.subtitle || 'Empowering Minds, Building Futures.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button to={primaryCtaLink} showArrow variant="primary">
              {primaryCtaText}
            </Button>
            <Button to="/academics" showArrow variant="outline" className="border-white text-white hover:bg-white/10">
              {t('hero.programs')}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white border-b py-6">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-5 gap-6">
          {trustIcons.map(({ key, icon: Icon }) => (
            <div key={key} className="flex flex-col items-center text-center gap-2">
              <Icon className="h-8 w-8 text-primary" />
              <span className="text-xs font-medium text-neutral-dark">{t(`trust.${key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      {aboutSection && (
        <section className="py-16 bg-neutral-light">
          <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-dark mb-4">{aboutSection.title}</h2>
              <p className="text-neutral-medium leading-relaxed">{aboutSection.content}</p>
              <div className="mt-6">
                <Button to="/about" variant="secondary" showArrow>
                  {t('common.readMore')}
                </Button>
              </div>
            </div>
            {aboutSection.imageUrl && (
              <img
                src={mediaUrl(aboutSection.imageUrl)}
                alt={aboutSection.title}
                className="rounded-lg shadow-lg w-full object-cover max-h-80"
              />
            )}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-8">
          {(cards.length ? cards : [
            { key: 'academics', title: 'Academics', content: 'Explore our programs.', sortOrder: 1 },
            { key: 'student-life', title: 'Student Life', content: 'Activities and events.', sortOrder: 2 },
            { key: 'achievements', title: 'Achievements', content: 'Celebrating excellence.', sortOrder: 3 },
          ]).map((card, i) => (
            <FeatureCard
              key={card.key}
              title={card.title}
              description={card.content}
              icon={<GraduationCap className="h-7 w-7" />}
              link={card.key.includes('academic') ? '/academics' : card.key.includes('student') ? '/student-life' : '/about'}
              linkLabel={t('common.readMore')}
              accent={(['primary', 'accent', 'gold'] as const)[i % 3]}
            />
          ))}
        </div>
      </section>

      <section className="bg-accent py-16 text-white text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold mb-4">{t('nav.enroll')}</h2>
          <p className="mb-8 text-white/90">Join Manhattan Language School today and give your child the best start.</p>
          <Button to="/admissions" variant="outline" className="border-white text-white hover:bg-white/10" showArrow>
            {t('nav.admissions')}
          </Button>
        </div>
      </section>
    </>
  );
}
