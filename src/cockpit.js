import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function mountCockpit(section) {
  const views = [...section.querySelectorAll('.cockpit__view')];
  const media = gsap.matchMedia();
  const pendingLoads = new Set();
  let disposed = false;

  const prepareView = async (image) => {
    if (!image.complete) {
      await new Promise((resolve) => {
        const finish = () => {
          image.removeEventListener('load', finish);
          image.removeEventListener('error', finish);
          pendingLoads.delete(finish);
          resolve();
        };
        pendingLoads.add(finish);
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
      });
    }

    if (disposed || !image.naturalWidth) return false;
    try {
      await image.decode();
    } catch {
      // A loaded image remains usable if the browser cannot pre-decode it.
    }
    return image.naturalWidth > 0;
  };

  // Keep the front view visible while every angle is loaded and decoded.
  // Seeking directly into the section then never reveals an undecoded image.
  Promise.all(views.map(prepareView)).then((ready) => {
    if (disposed) return;
    if (views.length !== 4 || ready.some((loaded) => !loaded)) {
      section.classList.add('cockpit--static');
      return;
    }

    media.add({
      desktop: '(min-width: 901px) and (min-height: 601px)',
      compact: '(max-width: 900px), (max-height: 600px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      if (conditions.reduced) return;

      const stage = section.querySelector('.cockpit__stage');
      const heading = section.querySelector('.cockpit__headline');
      const label = section.querySelector('.cockpit__label');
      const shift = conditions.compact ? 0 : .35;
      const restingScale = conditions.compact ? 1 : .992;

      gsap.set(views, { autoAlpha: 0, xPercent: 0, scale: 1 });
      gsap.set(views[0], { autoAlpha: 1 });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'cockpit-interior-sequence',
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * (conditions.compact ? 3 : 4.2)}`,
          pin: stage,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // The existing title clears early so each interior can be inspected.
      timeline.to([heading, label], { autoAlpha: 0, duration: .07 }, .035);

      [.21, .48, .75].forEach((start, index) => {
        timeline
          .to(views[index], {
            autoAlpha: 0,
            xPercent: -shift,
            scale: restingScale,
            duration: .08,
            ease: 'power1.inOut',
          }, start)
          .fromTo(views[index + 1], {
            autoAlpha: 0,
            xPercent: shift,
            scale: restingScale,
          }, {
            autoAlpha: 1,
            xPercent: 0,
            scale: 1,
            duration: .08,
            ease: 'power1.inOut',
            immediateRender: false,
          }, start);
      });

      // Reserve a real inspection hold for the passenger-side final view.
      timeline.to({}, { duration: .17 }, .83);
    });

    ScrollTrigger.refresh();
  });

  return () => {
    disposed = true;
    pendingLoads.forEach((finish) => finish());
    media.revert();
    section.classList.remove('cockpit--static');
  };
}
