"use client";

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GTREngineer {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePosition: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

const profiles: GTREngineer[] = [
  { name: 'Kazutoshi Mizuno', title: 'Chief Engineer — Original R35 GT-R', description: 'Led the original R35 GT-R development program, shaping its multi-performance approach and engineering direction.', imageUrl: '/images/people/kazutoshi-mizuno.jpg', imagePosition: '50% 0%', imageAlt: 'Kazutoshi Mizuno speaking at an event.', imageWidth: 399, imageHeight: 501 },
  { name: 'Hiroshi Tamura', title: 'Chief Product Specialist — GT-R NISMO', description: 'Guided the GT-R and GT-R NISMO through later development, focusing on the balance of performance and driver engagement.', imageUrl: '/images/people/hiroshi-tamura.jpg', imagePosition: '82% 35%', imageAlt: 'Hiroshi Tamura beside an open GT-R engine bay.', imageWidth: 1200, imageHeight: 675 },
  { name: 'Shiro Nakamura', title: 'Design Leadership — R35 GT-R', description: 'Led Nissan design during the R35 era, overseeing the design organization behind the GT-R and its distinctive visual identity.', imageUrl: '/images/people/shiro-nakamura.jpg', imagePosition: '50% 19%', imageAlt: 'Portrait of Shiro Nakamura.', imageWidth: 1365, imageHeight: 2048 },
  { name: 'Hiroshi Hasegawa', title: 'Product Chief Designer — R35 GT-R', description: 'Developed the 2001 GT-R Concept and 2005 GT-R Proto, then worked on the production R35 design.', imageUrl: '/images/people/hiroshi-hasegawa.jpg', imagePosition: '50% 20%', imageAlt: 'Portrait of Hiroshi Hasegawa.', imageWidth: 583, imageHeight: 432 },
];

export interface TestimonialCarouselProps { className?: string; }

export function TestimonialCarousel({ className }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const current = profiles[currentIndex];
  const duration = reducedMotion ? 0 : 0.4;
  const handleNext = () => setCurrentIndex((index) => (index + 1) % profiles.length);
  const handlePrevious = () => setCurrentIndex((index) => (index - 1 + profiles.length) % profiles.length);

  useEffect(() => {
    profiles.slice(1).forEach(({ imageUrl }) => {
      const image = new window.Image();
      image.src = imageUrl;
    });
  }, []);

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: TouchEvent) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) handleNext();
      else handlePrevious();
    }
  };

  const portrait = (
    <AnimatePresence mode="wait">
      <motion.div key={current.imageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration, ease: 'easeInOut' }} className="profile-card-portrait h-full w-full">
        <img
          src={current.imageUrl}
          alt={current.imageAlt}
          width={current.imageWidth}
          height={current.imageHeight}
          loading="eager"
          decoding="async"
          draggable={false}
          style={{ objectPosition: current.imagePosition }}
          className={cn('profile-card-photo', current.name === 'Hiroshi Hasegawa' && 'profile-card-photo--hasegawa')}
        />
      </motion.div>
    </AnimatePresence>
  );

  const card = (
    <AnimatePresence mode="wait">
      <motion.div key={current.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration, ease: 'easeInOut' }} aria-live="polite">
        <div className="mb-6">
          <h3 className="profile-card-name mb-2 text-[#f2f2f2]">{current.name}</h3>
          <p className="profile-card-role text-[#a0a0a0]">{current.title}</p>
        </div>
        <p className="profile-card-description mb-8 text-[#f2f2f2]">{current.description}</p>
        <span className="profile-card-rule" aria-hidden="true" />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className={cn('profile-card-swipe mx-auto w-full max-w-5xl px-4', className)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative hidden items-center md:flex">
        <div className="h-[470px] w-[470px] flex-shrink-0 overflow-hidden bg-[#151515]">{portrait}</div>
        <article className="profile-card-panel relative z-10 -ml-20 max-w-xl flex-1 bg-[#151515] shadow-2xl">{card}</article>
      </div>

      <div className="mx-auto max-w-sm md:hidden">
        <div className="aspect-square w-full overflow-hidden bg-[#151515]">{portrait}</div>
        <article className="profile-card-panel relative z-10 -mt-8 mx-4 bg-[#151515]">{card}</article>
      </div>

      <div className="profile-card-navigation mt-8 flex items-center justify-center gap-6" role="group" aria-label="GT-R people carousel controls">
        <span className="profile-card-slide-number">0{currentIndex + 1} / 04</span>
        <button type="button" onClick={handlePrevious} aria-label="Previous profile" className="profile-card-control flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-solid border-white/25 bg-transparent text-[#f2f2f2]"><ChevronLeft aria-hidden="true" className="h-6 w-6" /></button>
        <div className="flex gap-2" aria-label="Choose a profile">
          {profiles.map((profile, index) => <button key={profile.name} type="button" onClick={() => setCurrentIndex(index)} aria-label={`Show ${profile.name}`} aria-current={index === currentIndex ? 'true' : undefined} className={cn('h-3 w-3 cursor-pointer rounded-full border-0 p-0 transition-colors', index === currentIndex ? 'bg-[#e60012]' : 'bg-[#666] hover:bg-[#aaa]')} />)}
        </div>
        <button type="button" onClick={handleNext} aria-label="Next profile" className="profile-card-control flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-solid border-white/25 bg-transparent text-[#f2f2f2]"><ChevronRight aria-hidden="true" className="h-6 w-6" /></button>
      </div>
    </div>
  );
}
