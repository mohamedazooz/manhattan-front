import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  GraduationCap,
  Shield,
  Star,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';
import { landingApi, blogApi, galleryApi, educationApi, requirementsApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Badge';
import { mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';
import { SeoHead } from '../../components/common/SeoHead';
import { Link } from 'react-router-dom';

const trustIcons = [
  { key: 'bilingual', icon: BookOpen, count: '100% Dual Curriculum' },
  { key: 'classrooms', icon: GraduationCap, count: 'Smart Classrooms' },
  { key: 'safe', icon: Shield, count: 'Safe Campus' },
  { key: 'teachers', icon: Users, count: 'Top Educators' },
  { key: 'future', icon: Star, count: 'Future Leaders' },
];

export function HomePage() {
  const { t } = useTranslation();
  const lang = useAppLanguage();

  const { data: landingData, isLoading: isLandingLoading } = useQuery({
    queryKey: ['landing', lang],
    queryFn: () => landingApi.get(lang).then((r) => r.data),
  });

  const { data: latestPosts = [] } = useQuery({
    queryKey: ['latest-posts', lang],
    queryFn: () => blogApi.list(lang).then((r) => r.data.slice(0, 3)),
  });

  const { data: galleryImages = [] } = useQuery({
    queryKey: ['home-gallery', lang],
    queryFn: () => galleryApi.list(lang).then((r) => (Array.isArray(r.data) ? r.data.slice(0, 6) : [])),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['home-programs', lang],
    queryFn: () => educationApi.list(lang).then((r) => r.data.slice(0, 4)),
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['home-requirements'],
    queryFn: () => requirementsApi.list(false).then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  const [selectedGrade, setSelectedGrade] = useState<string>('');

  if (isLandingLoading) return <LoadingSpinner />;

  const hero = landingData?.hero;
  const sections = landingData?.sections || [];
  const aboutSection = sections.find((s) => s.key === 'about-preview');

  const heroImage = hero?.imageUrl
    ? mediaUrl(hero.imageUrl)
    : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop';
  const primaryCtaText = hero?.ctaText || t('nav.enroll');
  const primaryCtaLink = hero?.ctaLink || '/admissions';

  const currentReq = requirements.find((r: { gradeLevel: string }) => r.gradeLevel === selectedGrade);

  return (
    <>
      <SeoHead
        title={hero?.title || 'Home'}
        description={hero?.subtitle || 'Welcome to Manhattan Language School. Empowering Minds, Building Futures.'}
        ogImage={heroImage || undefined}
      />

      {/* Hero Section with Motion & Dynamic Background */}
      <section
        className="relative min-h-[85vh] flex items-center bg-primary-dark text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 26, 58, 0.88) 0%, rgba(36, 54, 111, 0.82) 50%, rgba(15, 26, 58, 0.92) 100%), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-transparent to-transparent opacity-80" />

        {/* Floating Ambient Light Orbs */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 w-full grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-gold animate-spin" />
              <span>{t('app.name')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
              {hero?.title || 'Empowering Minds, Building Futures'}
            </h1>

            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl font-light">
              {hero?.subtitle ||
                'Welcome to Manhattan Language School. Excellence in bilingual education, modern facilities, and dedicated mentorship for every student.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button to={primaryCtaLink} showArrow variant="primary" className="py-3.5 px-8 text-base shadow-xl hover:scale-105 transition-transform">
                {primaryCtaText}
              </Button>
              <Button
                to="/academics"
                showArrow
                variant="outline"
                className="py-3.5 px-8 text-base border-white/40 text-white hover:bg-white/15 backdrop-blur-sm shadow-lg"
              >
                {t('hero.programs')}
              </Button>
            </div>
          </div>

          {/* Floating Glassmorphic Stats Card */}
          <div className="md:col-span-5 flex justify-center md:justify-end animate-float">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-6 text-white shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold/20 text-gold rounded-xl border border-gold/30">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading">25+ Years</h3>
                  <p className="text-xs text-white/80">Educational Excellence</p>
                </div>
              </div>

              <hr className="border-white/10" />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="block text-2xl font-bold text-white">1,500+</span>
                  <span className="text-[11px] text-white/70">Enrolled Students</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="block text-2xl font-bold text-gold">99%</span>
                  <span className="text-[11px] text-white/70">Success Rate</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 bg-white/10 px-3 py-2 rounded-lg">
                <span>Recognized Curriculum</span>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Trust Bar */}
      <section className="bg-white border-b py-8 shadow-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-5 gap-6">
          {trustIcons.map(({ key, icon: Icon, count }) => (
            <div
              key={key}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-primary-light/50 transition-colors group cursor-pointer"
            >
              <div className="p-3 bg-primary-light text-primary rounded-xl group-hover:scale-110 transition-transform mb-2">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-neutral-dark">{t(`trust.${key}`)}</span>
              <span className="text-[11px] text-neutral-medium">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview Section */}
      {aboutSection && (
        <section className="py-20 bg-neutral-light/60">
          <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
                About Manhattan
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark leading-snug">
                {aboutSection.title}
              </h2>
              <p className="text-neutral-medium leading-relaxed text-base sm:text-lg">
                {aboutSection.content}
              </p>
              <div>
                <Button to="/about" variant="secondary" showArrow className="px-6 py-3 shadow-sm">
                  {t('common.readMore')}
                </Button>
              </div>
            </div>

            {aboutSection.imageUrl && (
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                <img
                  src={mediaUrl(aboutSection.imageUrl)}
                  alt={aboutSection.title}
                  className="relative rounded-2xl shadow-xl w-full object-cover max-h-96"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Educational Programs Showcase */}
      {programs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1 rounded-full">
                Academic Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark">Educational Programs</h2>
              <p className="text-neutral-medium">Tailored educational stages designed to build confidence, knowledge, and leadership.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programs.map((prog) => (
                <div key={prog.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-md">
                      {prog.level}
                    </span>
                    <h3 className="text-xl font-bold text-neutral-dark mt-3">{prog.title}</h3>
                    <p className="text-sm text-neutral-medium line-clamp-3 mt-2">{prog.summary || prog.content}</p>
                  </div>
                  <Link
                    to={`/academics/${prog.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark group"
                  >
                    <span>Explore Stage</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Admission Requirements Checker Widget */}
      {requirements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-primary-dark to-primary text-white">
          <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full">
                Admissions Eligibility
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">Check Admission Requirements by Grade</h2>
              <p className="text-white/80">Select your child's targeted grade level to instantly view age criteria and required application documents.</p>
            </div>

            <div className="lg:col-span-7 bg-white text-neutral-dark p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-dark">Select Grade Level</label>
                <select
                  className="w-full border rounded-xl p-3 text-sm bg-neutral-light border-gray-300 font-medium focus:ring-2 focus:ring-primary"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">-- Choose Grade Level --</option>
                  {requirements.map((r: { id: string; gradeLevel: string; title: string }) => (
                    <option key={r.id} value={r.gradeLevel}>
                      {r.gradeLevel} — {r.title}
                    </option>
                  ))}
                </select>
              </div>

              {currentReq ? (
                <div className="p-4 bg-primary-light/40 rounded-xl space-y-3 border border-primary/20 animate-fade-in">
                  <h4 className="font-bold text-primary-dark">{currentReq.title}</h4>
                  {currentReq.description && <p className="text-xs text-neutral-medium">{currentReq.description}</p>}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-neutral-dark">
                    {currentReq.minAge && <div>Min Age: <span className="text-primary">{currentReq.minAge} yrs</span></div>}
                    {currentReq.maxAge && <div>Max Age: <span className="text-primary">{currentReq.maxAge} yrs</span></div>}
                  </div>
                  {currentReq.requiredDocumentTypes?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-neutral-dark mb-1">Required Documents:</p>
                      <div className="flex flex-wrap gap-1">
                        {currentReq.requiredDocumentTypes.map((doc: string) => (
                          <span key={doc} className="text-[11px] bg-white border border-gray-200 text-neutral-dark px-2 py-0.5 rounded shadow-xs font-mono">
                            📄 {doc.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button to="/admissions" variant="primary" showArrow className="w-full justify-center">
                      Apply Online Now
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-medium italic">Please select a grade level above to view requirements.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog & News Feed Preview */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-neutral-light">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
                  News & Events
                </span>
                <h2 className="text-3xl font-bold text-primary-dark mt-2">Latest News & Blog Posts</h2>
              </div>
              <Button to="/news" variant="outline" showArrow>
                View All News
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <div key={post.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
                  {post.coverImageUrl && (
                    <img
                      src={mediaUrl(post.coverImageUrl)}
                      alt={post.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-medium mb-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.category && (
                          <span className="bg-primary-light text-primary font-medium px-2 py-0.5 rounded text-[10px]">
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-neutral-dark line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-neutral-medium line-clamp-3 mt-2">{post.content}</p>
                    </div>

                    <Link
                      to={`/news/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-2"
                    >
                      Read Full Article <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Showcase */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1 rounded-full">
                  Campus Life
                </span>
                <h2 className="text-3xl font-bold text-primary-dark mt-2">School Photo Gallery</h2>
              </div>
              <Button to="/student-life" variant="outline" showArrow>
                View Full Gallery
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {galleryImages.map((img: { id: string; title: string; imageUrl: string; category?: string }) => (
                <div key={img.id} className="relative group overflow-hidden rounded-xl h-44 shadow-md bg-neutral-dark">
                  <img
                    src={mediaUrl(img.imageUrl)}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                    <span className="text-xs font-semibold truncate">{img.title}</span>
                    {img.category && <span className="text-[10px] text-white/70">{img.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Bar */}
      <section className="bg-primary-dark py-16 text-white text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/40 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-3xl px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">{t('nav.enroll')}</h2>
          <p className="text-white/90 text-lg leading-relaxed">
            Join Manhattan Language School today and give your child the best foundation for future success.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button to="/admissions" variant="primary" className="py-3 px-8 text-base shadow-xl" showArrow>
              {t('nav.admissions')}
            </Button>
            <Button to="/contact" variant="outline" className="py-3 px-8 text-base border-white text-white hover:bg-white/10">
              {t('nav.contact')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

