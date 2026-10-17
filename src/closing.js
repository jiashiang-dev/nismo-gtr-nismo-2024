export function mountClosing(section) {
  if (!section) return () => {};

  const backToTop = section.querySelector('.closing__back-to-top');

  const scrollToTop = (event) => {
    const hero = document.querySelector('#hero');
    if (!hero) return;
    event.preventDefault();
    hero.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  backToTop?.addEventListener('click', scrollToTop);

  return () => {
    backToTop?.removeEventListener('click', scrollToTop);
  };
}
