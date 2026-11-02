'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { assets } from '@/lib/site-config';

/** One visible portrait bridges the two service chapters while scrolling. */
export function ServicePhotoTransition() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = ref.current;
    const section = stage?.closest<HTMLElement>('.services-editorial');
    if (!stage || !section || !('IntersectionObserver' in window)) return;
    const slots = Array.from(section.querySelectorAll<HTMLElement>('[data-service-photo-slot]'));
    const nextChapter = section.querySelector<HTMLElement>('.service-chapter-protect');
    if (slots.length !== 2 || !nextChapter) return;
    const pictures = [...slots.flatMap(slot => Array.from(slot.querySelectorAll('img'))), ...Array.from(stage.querySelectorAll('img'))];
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)');
    let visible = false;
    let frame = 0;
    let disposed = false;
    const restore = () => {
      delete section.dataset.photoJourney;
      stage.style.visibility = 'hidden';
    };
    const draw = () => {
      frame = 0;
      if (disposed) return;
      if (!visible || media.matches || document.hidden || !pictures.every(image => image.complete && image.naturalWidth > 0)) {
        restore();
        return;
      }
      // Collect geometry together, then write styles. There is no idle animation loop.
      const from = slots[0].getBoundingClientRect();
      const to = slots[1].getBoundingClientRect();
      const boundary = nextChapter.getBoundingClientRect().top;
      const height = innerHeight;
      if (!from.width || !to.width || !height) { restore(); return; }
      const progress = Math.max(0, Math.min(1, (height * .86 - boundary) / (height * .72)));
      const t = progress * progress * (3 - 2 * progress);
      const mix = (a: number, b: number) => a + (b - a) * t;
      const x = mix(from.left, to.left);
      const y = mix(from.top, to.top);
      const width = mix(from.width, to.width);
      const photoHeight = mix(from.height, to.height);
      section.dataset.photoJourney = 'active';
      stage.style.width = width + 'px';
      stage.style.height = photoHeight + 'px';
      stage.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      stage.style.visibility = y + photoHeight > 0 && y < height ? 'visible' : 'hidden';
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(draw);
    };
    const onScroll = () => { if (visible && !media.matches && !document.hidden) schedule(); };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) stage.querySelector('img')!.loading = 'eager';
      schedule();
    });
    observer.observe(section);
    const resize = new ResizeObserver(() => { if (visible) schedule(); });
    slots.forEach(slot => resize.observe(slot));
    pictures.forEach(image => image.addEventListener('load', schedule));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    media.addEventListener('change', schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      pictures.forEach(image => image.removeEventListener('load', schedule));
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      media.removeEventListener('change', schedule);
      restore();
    };
  }, []);
  return <div ref={ref} className="service-photo-traveller" aria-hidden="true"><img src={assets.servicePortrait} alt="" width={1365} height={2048} loading="lazy" decoding="async" draggable={false}/></div>;
}
