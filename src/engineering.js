import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountAssemblyVideo } from './assembly-video.js';

gsap.registerPlugin(ScrollTrigger);

export function mountEngineering(section) {
  const disposeVideo = mountAssemblyVideo(section, section.querySelector('.engineering__stage'));
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const visual = section.querySelector('.engineering__visual');
    const label = section.querySelector('.engineering__label');
    const headline = section.querySelector('h2');
    const callouts = section.querySelectorAll('.engineering__callout');
    const engine = section.querySelector('.engineering__callout--engine');
    // Keep the existing editorial reveals over the shared pinned inspection space.
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65,
    } })
      .from(label, { opacity: 0, duration: .2 }, 0)
      .from(headline, { opacity: 0, y: 16, duration: .25 }, .2)
      .fromTo(visual, { scale: .92, opacity: 0 }, { scale: 1, opacity: 1, duration: .25 }, .2)
      .to(visual, { scale: 1.05, duration: .3 }, .45)
      .from(callouts, { opacity: 0, y: 8, duration: .09, stagger: .02 }, .75)
      .to([headline, ...callouts], { opacity: .55, duration: .1 }, .9)
      .to(engine, { opacity: 1, duration: .1 }, .9);
  });
  return () => {
    disposeVideo();
    media.revert();
  };
}
