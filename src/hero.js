import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function mountHero(hero) {
  const media = gsap.matchMedia();
  const image = hero.querySelector('.hero__artwork');
  let disposed = false;

  image.decode().catch(() => {}).then(() => {
    if (disposed) return;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(hero.querySelector('.site-header'), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3)
        .fromTo(hero.querySelector('.hero__info'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.55);

      // Only UI fades on scroll. The photo and vehicle never move or scale.
      gsap.fromTo([
        ...hero.querySelectorAll('.site-header > *'),
        hero.querySelector('.hero__info-scroll'),
      ], { opacity: 1 }, {
        opacity: 0.15,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    });
    hero.classList.add('is-ready');
  });

  return () => {
    disposed = true;
    media.revert();
  };
}
