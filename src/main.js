import './style.css';
import { mountHero } from './hero.js';
import './performance.css';
import { mountPerformance } from './performance.js';
import './legacy.css';
import './engineering.css';
import { mountEngineering } from './engineering.js';
import './engine.css';
import { mountEngine } from './engine.js';
import './details.css';
import { mountDetails } from './details.js';
import './cockpit.css';
import { mountCockpit } from './cockpit.js';
import './editorial-carousel.css';
import './closing.css';
import { mountClosing } from './closing.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const disposeHero = mountHero(document.querySelector('.hero'));
const disposePerformance = mountPerformance(document.querySelector('.performance'));
const disposeEngineering = mountEngineering(document.querySelector('.engineering'));
const disposeEngine = mountEngine(document.querySelector('.engine'));
const disposeDetails = mountDetails(document.querySelector('.details'));
const disposeCockpit = mountCockpit(document.querySelector('.cockpit'));
const disposeClosing = mountClosing(document.querySelector('.closing'));

const editorialSection = document.querySelector('.editorial-carousel');
const editorialRoot = document.querySelector('#editorial-carousel-root');
let disposeEditorialCarousel = () => {};
let editorialObserver;
let editorialLoading = false;
let editorialCancelled = false;

const loadEditorialCarousel = async () => {
  if (editorialLoading || editorialCancelled || !editorialRoot) return;
  editorialLoading = true;
  editorialObserver?.disconnect();
  const previousHeight = editorialSection?.offsetHeight ?? 0;

  try {
    const { mountEditorialCarousel } = await import('./testimonial-island.tsx');
    if (editorialCancelled) return;
    disposeEditorialCarousel = mountEditorialCarousel(editorialRoot);
    if (editorialSection && Math.abs(editorialSection.offsetHeight - previousHeight) > 1) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  } catch (error) {
    console.error('Could not load the GT-R editorial carousel.', error);
  }
};

if (editorialSection && 'IntersectionObserver' in window) {
  editorialObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) loadEditorialCarousel();
  }, { rootMargin: '1200px 0px' });
  editorialObserver.observe(editorialSection);
}

const editorialIdle = 'requestIdleCallback' in window
  ? window.requestIdleCallback(loadEditorialCarousel, { timeout: 3000 })
  : window.setTimeout(loadEditorialCarousel, 1500);

if (import.meta.hot) import.meta.hot.dispose(disposeHero);
if (import.meta.hot) import.meta.hot.dispose(disposePerformance);
if (import.meta.hot) import.meta.hot.dispose(disposeEngineering);
if (import.meta.hot) import.meta.hot.dispose(disposeEngine);
if (import.meta.hot) import.meta.hot.dispose(disposeDetails);
if (import.meta.hot) import.meta.hot.dispose(disposeCockpit);
if (import.meta.hot) import.meta.hot.dispose(() => {
  editorialCancelled = true;
  editorialObserver?.disconnect();
  if ('cancelIdleCallback' in window) window.cancelIdleCallback(editorialIdle);
  else clearTimeout(editorialIdle);
  disposeEditorialCarousel();
});
if (import.meta.hot) import.meta.hot.dispose(disposeClosing);
