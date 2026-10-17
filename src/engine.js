import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountAssemblyVideo } from './assembly-video.js';

gsap.registerPlugin(ScrollTrigger);

export function mountEngine(section) {
  const disposeVideo = mountAssemblyVideo(section, section.querySelector('.engine__stage'));
  const media = gsap.matchMedia();
  media.add({ reduced: '(prefers-reduced-motion: reduce)', compact: '(max-width: 900px), (max-height: 650px)' }, ({ conditions }) => {
    const label = section.querySelector('.engine__label');
    const visual = section.querySelector('.engine__visual');
    const heading = section.querySelector('.engine__heading');
    const specs = section.querySelectorAll('.engine__specs > div');
    const callouts = section.querySelectorAll('.engine__callout');

    if (conditions.reduced || conditions.compact) {
      // Natural document flow keeps every detail reachable on narrow/short screens.
      gsap.from([label, heading, visual, ...specs, ...callouts], {
        opacity: 0, duration: .8, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });
      return;
    }

    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65,
    } })
      .from(label, { opacity: 0, duration: .15 }, 0)
      .fromTo(visual, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .2 }, .15)
      .from(heading, { opacity: 0, y: 30, duration: .15 }, .35)
      .from(specs, { opacity: 0, y: 12, duration: .12, stagger: .035 }, .5)
      .from(callouts, { opacity: 0, y: 10, duration: .1, stagger: .05 }, .6)
      .to(visual, { scale: 1.04, duration: .25 }, .5)
      // The final quarter holds the intact composition, then quietens its annotations.
      .to([heading, ...specs, ...callouts], { opacity: .45, duration: .1 }, .9);
  });
  return () => {
    disposeVideo();
    media.revert();
  };
}
