import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function mountPerformance(section) {
  const video = section.querySelector('video');
  const media = gsap.matchMedia();
  video.muted = true;

  media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
    const label = section.querySelector('.performance__label');
    const title = section.querySelector('.performance__title');
    const metrics = section.querySelectorAll('.performance__metric');
    const content = section.querySelector('.performance__content');
    const exit = section.querySelector('.performance__exit');
    video.pause();

    if (conditions.reduced) {
      // The poster comes from this same clip; no playback or seeking is needed.
      video.removeAttribute('src');
      video.load();
      gsap.set([label, title, ...metrics, content], { opacity: 1, y: 0 });
      section.classList.add('is-ready');
      return;
    }

    let duration = 0;
    let targetTime = 0;
    let disposed = false;
    let ticking = false;
    const playhead = { progress: 0 };
    const stopTick = () => { gsap.ticker.remove(seek); ticking = false; };
    const seek = () => {
      if (disposed || document.hidden) { stopTick(); return; }
      if (!duration || video.readyState < 2 || video.seeking) return;
      // Coalesce decoder work: at most one outstanding seek, only for a new frame.
      const time = Math.min(targetTime, Math.max(0, duration - 0.001));
      if (Math.abs(video.currentTime - time) < 1 / 60) { stopTick(); return; }
      video.currentTime = time;
    };
    const wake = () => {
      if (!ticking && duration && !document.hidden) { ticking = true; gsap.ticker.add(seek); }
    };
    const metadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        duration = video.duration;
        targetTime = playhead.progress * duration;
        wake();
      }
    };
    const visibility = () => { if (document.hidden) stopTick(); else wake(); };
    video.addEventListener('loadedmetadata', metadata);
    video.addEventListener('loadeddata', wake);
    document.addEventListener('visibilitychange', visibility);
    video.src = video.dataset.src;
    video.load();

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true },
    });
    // One normalized timeline controls both the paused video and the editorial reveals.
    timeline.to(playhead, { progress: 1, duration: 1, onUpdate: () => {
      targetTime = playhead.progress * duration;
      wake();
    } }, 0)
      .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.15)
      .fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' }, 0.3)
      .fromTo(metrics, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.12, stagger: 0.06, ease: 'power3.out' }, 0.5)
      .fromTo(content, { opacity: 1 }, { opacity: 0, duration: 0.08 }, 0.92)
      .fromTo(exit, { opacity: 0 }, { opacity: 0.06, duration: 0.08 }, 0.92);
    section.classList.add('is-ready');

    return () => {
      disposed = true;
      stopTick();
      video.pause();
      video.removeEventListener('loadedmetadata', metadata);
      video.removeEventListener('loadeddata', wake);
      document.removeEventListener('visibilitychange', visibility);
    };
  });

  return () => media.revert();
}
