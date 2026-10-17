import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TestimonialCarousel } from '@/components/ui/profile-card-testimonial-carousel';
import './testimonials-tailwind.css';

export function mountEditorialCarousel(element: Element | null) {
  if (!element) return () => {};
  const root = createRoot(element);
  // Commit the layout before the existing pinned ScrollTriggers measure the page.
  flushSync(() => root.render(<TestimonialCarousel />));
  return () => root.unmount();
}
