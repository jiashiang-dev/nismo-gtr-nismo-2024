import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function mountDetails(section) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    section.querySelectorAll('[data-detail-reveal]').forEach(figure => {
      gsap.from(figure, {
        opacity: 0, y: 25, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: figure, start: 'top 90%', once: true },
      });
    });
  });
  return () => media.revert();
}
