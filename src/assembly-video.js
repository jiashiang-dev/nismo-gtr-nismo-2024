import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// The clips stay paused; a single animation frame loop follows each scroll playhead.
export function mountAssemblyVideo(section, stage) {
  const video = stage.querySelector('video');
  const media = gsap.matchMedia();
  video.muted = true;
  video.defaultMuted = true;
  video.pause();

  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
    compact: '(max-width: 900px), (max-height: 650px)',
  }, ({ conditions }) => {
    const playhead = { progress: 0 };
    const framesPerSecond = 24; // Both supplied assembly clips are 24 fps.
    const frameTime = 1000 / framesPerSecond;
    let duration = 0;
    let lastFrame = 0;
    let targetTime = 0;
    let easedTime = video.currentTime;
    let requestedFrame = Math.floor(video.currentTime * framesPerSecond);
    let lastFrameAt = 0;
    let lastSeekAt = -Infinity;
    let frame = 0;
    let disposed = false;
    let tween;

    const frameAt = (time) => Math.min(lastFrame, Math.max(0, Math.floor(time * framesPerSecond + .001)));

    const tick = (now) => {
      frame = 0;
      if (disposed || document.hidden || !duration || video.readyState < 2 || video.seeking) return;

      const elapsed = Math.min(now - (lastFrameAt || now - 16.7), 64);
      lastFrameAt = now;
      const remaining = targetTime - easedTime;

      // Catch up quickly after a fast scroll without issuing hard jumps or stale seeks.
      const response = Math.abs(remaining) > .6 ? 10 : 55;
      easedTime += remaining * (1 - Math.exp(-elapsed / response));
      if (frameAt(targetTime) === frameAt(easedTime)) easedTime = targetTime;

      const nextFrame = frameAt(easedTime);
      if (nextFrame !== requestedFrame && now - lastSeekAt >= frameTime) {
        lastSeekAt = now;
        requestedFrame = nextFrame;
        // Seek just inside the frame to avoid floating-point boundary ambiguity.
        video.currentTime = Math.min(nextFrame / framesPerSecond + .0005, duration - .001);
      }

      if (video.seeking) return; // A seeked event wakes the loop for the newest target.
      if (frameAt(targetTime) !== frameAt(easedTime) || frameAt(targetTime) !== requestedFrame) {
        frame = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (!frame && !disposed && !document.hidden && duration && video.readyState >= 2) {
        frame = requestAnimationFrame(tick);
      }
    };

    const setProgress = (progress) => {
      if (!duration) return;
      // The final encoded frame starts before the container's reported duration.
      targetTime = Math.min(progress * duration, lastFrame / framesPerSecond);
      wake();
    };
    const metadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        duration = video.duration;
        lastFrame = Math.max(0, Math.floor((duration - .001) * framesPerSecond));
        requestedFrame = frameAt(video.currentTime);
        setProgress(conditions.reduced ? 1 : playhead.progress);
      }
    };
    const seeked = () => {
      // Seeking may take longer than a scroll update, especially in reverse.
      // Resume only if the decoded frame is no longer the requested one.
      if (frameAt(targetTime) !== requestedFrame) wake();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        easedTime = video.currentTime;
        wake();
      }
    };
    const stayPaused = () => video.pause();

    video.addEventListener('loadedmetadata', metadata);
    video.addEventListener('loadeddata', wake);
    video.addEventListener('canplay', wake);
    video.addEventListener('seeked', seeked);
    video.addEventListener('play', stayPaused);
    document.addEventListener('visibilitychange', visibility);

    if (!conditions.reduced) {
      tween = gsap.to(playhead, {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => setProgress(playhead.progress),
        scrollTrigger: {
          id: `${section.id}-assembly`,
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * (conditions.compact ? 1.5 : 2.2)}`,
          pin: stage,
          pinSpacing: true,
          scrub: .12,
          invalidateOnRefresh: true,
          onRefresh: () => setProgress(playhead.progress),
        },
      });
    }
    metadata();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      video.pause();
      video.removeEventListener('loadedmetadata', metadata);
      video.removeEventListener('loadeddata', wake);
      video.removeEventListener('canplay', wake);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('play', stayPaused);
      document.removeEventListener('visibilitychange', visibility);
    };
  });

  return () => media.revert();
}
