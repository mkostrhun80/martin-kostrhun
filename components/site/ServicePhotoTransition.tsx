'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { assets } from '@/lib/site-config';
import { bezier, clamp, ease, photoFrame, settleScroll } from '@/lib/traveller';

/** The same collapse / dot / expansion sequence as the opening photo journey. */
export function ServicePhotoTransition() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = ref.current;
    const section = stage?.closest<HTMLElement>('.services-editorial');
    if (!stage || !section || !('IntersectionObserver' in window)) return;
    const slots = Array.from(section.querySelectorAll<HTMLElement>('[data-service-photo-slot]'));
    const nextChapter = section.querySelector<HTMLElement>('.service-chapter-protect');
    const sourcePhoto = slots[0]?.querySelector('img');
    const targetPhoto = slots[1]?.querySelector('img');
    const traveller = stage.querySelector('img');
    if (slots.length !== 2 || !nextChapter || !sourcePhoto || !targetPhoto || !traveller) return;
    const pictures = [sourcePhoto, targetPhoto, traveller];
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)');
    let visible = false;
    let animation = 0;
    let disposed = false;
    let previous = 0;
    let renderedScroll = scrollY;
    const restore = () => {
      delete section.dataset.photoJourney;
      stage.style.visibility = 'hidden';
    };
    const draw = () => {
      if (!pictures.every(image => image.complete && image.naturalWidth > 0)) { restore(); return; }
      // Read native image bounds, including the destination's subtle zoom-out.
      const from = sourcePhoto.getBoundingClientRect();
      const to = targetPhoto.getBoundingClientRect();
      const boundary = nextChapter.getBoundingClientRect().top + scrollY - renderedScroll;
      const height = innerHeight;
      if (!from.width || !to.width || !height) { restore(); return; }
      const progress = clamp((height * .94 - boundary) / (height * .94));
      if (progress <= 0 || progress >= 1) { restore(); return; }
      const size = 14;
      const start = { x: from.left + from.width * .56, y: from.top + Math.min(from.height * .8, height * .45) };
      const end = { x: to.left + to.width / 2, y: to.top + Math.min(to.height * .3, 180) };
      const startDot = { left: start.x - size / 2, top: start.y - size / 2, width: size, height: size };
      const endDot = { left: end.x - size / 2, top: end.y - size / 2, width: size, height: size };
      let frame;
      let opacity;
      if (progress < .34) {
        const p = progress / .34;
        frame = photoFrame(from, startDot, p, false, 22);
        opacity = 1 - ease((p - .7) / .3);
      } else if (progress < .64) {
        const p = (progress - .34) / .3;
        const arc = Math.min(height * .12, 120);
        const point = bezier(ease(p), start,
          { x: start.x + (end.x - start.x) * .35, y: start.y + arc },
          { x: end.x, y: end.y - arc }, end);
        frame = { left: point.x - size / 2, top: point.y - size / 2, width: size, height: size, radius: size / 2 };
        opacity = 0;
      } else {
        const p = (progress - .64) / .36;
        // Both endpoints are below the destination title, so expansion never covers it.
        frame = photoFrame(endDot, to, p, true, 22 * .88);
        opacity = ease(p / .65);
      }
      // All geometry is collected before writing styles.
      if (section.dataset.photoJourney !== 'active') section.dataset.photoJourney = 'active';
      stage.style.width = frame.width + 'px';
      stage.style.height = frame.height + 'px';
      stage.style.borderRadius = frame.radius + 'px';
      stage.style.transform = 'translate3d(' + frame.left + 'px,' + frame.top + 'px,0)';
      stage.style.visibility = frame.top + frame.height > 0 && frame.top < height ? 'visible' : 'hidden';
      traveller.style.opacity = String(opacity);
    };
    const tick = (now: number) => {
      animation = 0;
      if (disposed) return;
      const actual = Math.max(0, scrollY);
      if (!visible || media.matches || document.hidden) {
        renderedScroll = actual;
        previous = 0;
        restore();
        return;
      }
      const seconds = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
      previous = now;
      renderedScroll = Math.abs(actual - renderedScroll) > innerHeight * .8
        ? actual : settleScroll(renderedScroll, actual, seconds, false);
      draw();
      if (Math.abs(actual - renderedScroll) > .25) animation = requestAnimationFrame(tick);
      else previous = 0;
    };
    const wake = () => { if (!disposed && !animation) animation = requestAnimationFrame(tick); };
    const onScroll = () => { if (visible && !media.matches && !document.hidden) wake(); };
    const refresh = () => { renderedScroll = scrollY; previous = 0; wake(); };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) pictures.forEach(image => { image.loading = 'eager'; });
      refresh();
    });
    observer.observe(section);
    const resize = new ResizeObserver(() => { if (visible) refresh(); });
    slots.forEach(slot => resize.observe(slot));
    pictures.forEach(image => image.addEventListener('load', refresh));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', refresh);
    document.addEventListener('visibilitychange', refresh);
    media.addEventListener('change', refresh);
    document.fonts.ready.then(refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      observer.disconnect();
      resize.disconnect();
      pictures.forEach(image => image.removeEventListener('load', refresh));
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', refresh);
      document.removeEventListener('visibilitychange', refresh);
      media.removeEventListener('change', refresh);
      restore();
    };
  }, []);
  return <div ref={ref} className="service-photo-traveller" aria-hidden="true"><img src={assets.servicePortrait} alt="" width={1365} height={2048} loading="lazy" decoding="async" draggable={false}/></div>;
}
