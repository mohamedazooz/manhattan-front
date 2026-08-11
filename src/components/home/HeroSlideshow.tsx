import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { getBilingualText, mediaUrl } from '../../lib/utils';
import { useAppLanguage } from '../../i18n';

export interface HeroData {
  title?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaTextAr?: string;
  ctaLink?: string;
}

interface HeroSlideshowProps {
  cmsHero?: HeroData;
  cmsHeroes?: HeroData[];
}

export function HeroSlideshow({ cmsHero, cmsHeroes }: HeroSlideshowProps) {
  const { t } = useTranslation();
  const lang = useAppLanguage();
  const isRtl = lang === 'ar';

  const activeHeroes = cmsHeroes && cmsHeroes.length > 0 ? cmsHeroes : cmsHero ? [cmsHero] : [];

  const defaultSlides = [
    {
      id: 'slide-1',
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      image: mediaUrl('/photos/hero1.jpeg'),
      ctaText: t('nav.login'),
      ctaLink: '/login',
      secondaryCtaText: t('nav.careers'),
      secondaryCtaLink: '/careers',
    },
    {
      id: 'slide-2',
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      image: mediaUrl('/photos/hero2.jpeg'),
      ctaText: t('hero.discover'),
      ctaLink: '/about',
      secondaryCtaText: t('hero.programs'),
      secondaryCtaLink: '/academics',
    },
    {
      id: 'slide-3',
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      image: mediaUrl('/photos/hero3.jpeg'),
      ctaText: t('nav.login'),
      ctaLink: '/login',
      secondaryCtaText: t('nav.careers'),
      secondaryCtaLink: '/careers',
    },
    {
      id: 'slide-4',
      title: t('hero.slide4.title'),
      subtitle: t('hero.slide4.subtitle'),
      image: mediaUrl('/photos/hero4.jpeg'),
      ctaText: t('nav.contact'),
      ctaLink: '/contact',
      secondaryCtaText: t('hero.programs'),
      secondaryCtaLink: '/academics',
    },
  ];

  const slides = activeHeroes.length > 0
    ? activeHeroes.map((h, i) => {
        const title = getBilingualText(h, 'title', lang);
        const subtitle = getBilingualText(h, 'subtitle', lang);
        const ctaText = getBilingualText(h, 'ctaText', lang);
        return {
          id: `cms-slide-${i}`,
          title: title || t('hero.slide1.title'),
          subtitle: subtitle || t('hero.slide1.subtitle'),
          image: mediaUrl(h.imageUrl || `/photos/hero${(i % 4) + 1}.jpeg`),
          ctaText: ctaText || t('nav.login'),
          ctaLink: h.ctaLink || '/login',
          secondaryCtaText: t('nav.careers'),
          secondaryCtaLink: '/careers',
        };
      })
    : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (isRtl ? -1000 : 1000) : (isRtl ? 1000 : -1000),
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        scale: { duration: 0.8 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? (isRtl ? -1000 : 1000) : (isRtl ? 1000 : -1000),
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative min-h-[85vh] flex items-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Background Slideshow with AnimatePresence */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15, 26, 58, 0.85) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 26, 58, 0.9) 100%), url(${currentSlide.image})`,
          }}
        />
      </AnimatePresence>

      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

      {/* Ambient Light Orbs */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* Slide Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:py-28 w-full grid md:grid-cols-12 gap-8 items-center">
        <motion.div
          key={`content-${currentSlide.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-12 max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-medium border border-white/20 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
            <span>{t('app.name')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
            {currentSlide.title}
          </h1>

          <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-2xl font-light">
            {currentSlide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              to={currentSlide.ctaLink}
              showArrow
              variant="primary"
              className="py-3.5 px-8 text-base font-bold shadow-xl hover:scale-105 transition-transform"
            >
              {currentSlide.ctaText}
            </Button>
            {currentSlide.secondaryCtaText && (
              <Button
                to={currentSlide.secondaryCtaLink}
                showArrow
                variant="white"
                className="py-3.5 px-8 text-base font-bold shadow-xl hover:scale-105 transition-transform"
              >
                {currentSlide.secondaryCtaText}
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls: Arrows */}
      <button
        onClick={isRtl ? nextSlide : prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={isRtl ? prevSlide : nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md border border-white/10 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-amber-400'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
