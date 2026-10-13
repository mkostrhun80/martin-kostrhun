'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { syncHeroPhotoType } from '@/lib/hero-photo-type';
import { assets } from '@/lib/site-config';
import { clamp, ease, travelPoint, sampleRoute, routePoint, photoFrame, journeyTiming, settleScroll } from '@/lib/traveller';

export function Motion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const photo = document.querySelector<HTMLElement>('.hero > .hero-artwork > .hero-photo-layer');
      const contents = document.querySelector<HTMLElement>('#obsah');
      const target = document.querySelector<HTMLElement>('.journey-destination');
      const root = ref.current;
      if (!hero || !photo || !contents || !target || !root) return;
      const scene = hero.closest<HTMLElement>('.hero-about-sequence')!;
      const main = root.querySelector<HTMLElement>('.traveller-main')!;
      const images = main.querySelectorAll('img');
      const tails = Array.from(root.querySelectorAll<HTMLElement>('.traveller-tail'));
      let source = { left: 0, top: 0, width: 0, height: 0 };
      let route = sampleRoute(p => ({ x: p, y: p }));
      let timing = journeyTiming(800, 2000, 800, false);
      let mobile = false, measuredWidth = 0, measuredHeight = 0;
      let sourceRadius = 28, targetRadius = 28;
      let renderedScroll = scrollY, animation = 0, previous = 0, resizeFrame = 0, disposed = false;

      function measure() {
        if (!hero || !photo || !contents || !target) return;
        mobile = innerWidth <= 760;
        measuredWidth = innerWidth;
        // Mobile browser chrome changes innerHeight while scrolling. Use the stable
        // hero (100svh), and only rebuild geometry for actual layout changes.
        measuredHeight = mobile ? hero.offsetHeight : innerHeight;
        const r = photo.getBoundingClientRect(), cr = contents.getBoundingClientRect();
        source = { left: r.left, top: r.top + scrollY, width: r.width, height: r.height };
        sourceRadius = parseFloat(getComputedStyle(photo).borderTopLeftRadius) || 28;
        targetRadius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 28;
        [photo.querySelector('img')!, target.querySelector('img')!].forEach((image, i) => {
          const style = getComputedStyle(image);
          images[i].style.objectPosition = style.objectPosition;
          images[i].style.filter = style.filter;
        });
        const parent = target.parentElement!;
        const position = parent.style.position;
        parent.style.position = 'static';
        const tr = target.getBoundingClientRect();
        const endPoint = { x: tr.left + tr.width / 2, y: tr.top + scrollY + tr.height / 2 };
        parent.style.position = position;
        route = sampleRoute(p => travelPoint(p, measuredWidth, cr.top + scrollY, cr.bottom + scrollY, endPoint));
        timing = journeyTiming(hero.offsetHeight, tr.top + scrollY, measuredHeight, mobile);
      }

      function draw() {
        if (!hero || !photo || !target || !root) return;
        const actual = Math.max(0, scrollY), y = renderedScroll;
        const idle = actual <= timing.start && y <= timing.start;
        const finished = y >= timing.expandEnd;
        scene.dataset.handoff = idle ? 'idle' : 'moving';
        root.style.visibility = !idle && !finished ? 'visible' : 'hidden';
        photo.style.opacity = idle ? '1' : '0';
        target.style.opacity = finished || idle ? '1' : '0';
        if (idle) { syncHeroPhotoType(hero, photo.getBoundingClientRect(), sourceRadius); return; }
        if (finished) return;
        const shrinking = y < timing.collapseEnd;
        const travelling = y >= timing.collapseEnd && y < timing.travelEnd;
        const distance = clamp((y - timing.collapseEnd) / (timing.travelEnd - timing.collapseEnd)) * route.length;
        const dot = routePoint(route, distance);
        let frame;
        if (shrinking) {
          const p = clamp((y - timing.start) / (timing.collapseEnd - timing.start));
          const start = routePoint(route, 0);
          frame = photoFrame(source, { left: start.x - 7, top: start.y - 7, width: 14, height: 14 }, p, false, sourceRadius);
          frame.top -= actual;
          images[0].style.opacity = String(1 - ease((p - .65) / .35));
          images[1].style.opacity = '0';
        } else if (travelling) {
          frame = { left: dot.x - 7, top: dot.y - actual - 7, width: 14, height: 14, radius: 7 };
          images[0].style.opacity = images[1].style.opacity = '0';
        } else {
          const tr = target.getBoundingClientRect(), end = routePoint(route, route.length);
          const p = clamp((y - timing.travelEnd) / (timing.expandEnd - timing.travelEnd));
          frame = photoFrame({ left: end.x - 7, top: end.y - actual - 7, width: 14, height: 14 }, tr, p, true, targetRadius);
          images[0].style.opacity = '0';
          images[1].style.opacity = String(ease(p * 1.4));
        }
        syncHeroPhotoType(hero, shrinking ? frame : { left: 0, top: -100, width: 0, height: 0 }, frame.radius);
        gsap.set(main, { x: frame.left, y: frame.top, width: frame.width, height: frame.height, borderRadius: frame.radius });
        tails.forEach((tail, i) => {
          const pos = routePoint(route, Math.max(0, distance - [18, 32, 43, 52][i]));
          const size = 9 - i * 1.8;
          gsap.set(tail, { x: pos.x - size / 2, y: pos.y - actual - size / 2, width: size, height: size,
            opacity: travelling ? (.38 - i * .075) * clamp(distance / 65) * clamp((route.length - distance) / 70) : 0 });
        });
      }

      function tick(now: number) {
        animation = 0;
        const actual = Math.max(0, scrollY);
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        // Anchor jumps should immediately restore the destination/source; damping
        // is confined to the visible journey and never holds the photo offscreen.
        renderedScroll = actual <= 2 || actual > timing.expandEnd + measuredHeight * .3
          ? actual : settleScroll(renderedScroll, actual, dt, mobile);
        draw();
        if (Math.abs(actual - renderedScroll) > .25) animation = requestAnimationFrame(tick);
        else previous = 0;
      }
      const wake = () => { if (!disposed && !animation) animation = requestAnimationFrame(tick); };
      const refresh = () => {
        if (disposed || resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; measure(); renderedScroll = scrollY; draw(); });
      };
      const resize = () => {
        if (Math.abs(innerWidth - measuredWidth) > 1 || (!mobile && Math.abs(innerHeight - measuredHeight) > 80)) refresh();
      };
      measure(); draw();
      const observer = new ResizeObserver(refresh);
      observer.observe(contents); observer.observe(target);
      document.fonts.ready.then(refresh);
      addEventListener('scroll', wake, { passive: true });
      addEventListener('resize', resize);
      addEventListener('orientationchange', refresh);
      return () => {
        disposed = true; cancelAnimationFrame(animation); cancelAnimationFrame(resizeFrame); observer.disconnect();
        removeEventListener('scroll', wake); removeEventListener('resize', resize); removeEventListener('orientationchange', refresh);
        photo.style.removeProperty('opacity'); target.style.removeProperty('opacity'); root.style.visibility = 'hidden';
        delete scene.dataset.handoff; syncHeroPhotoType(hero, photo.getBoundingClientRect(), sourceRadius);
      };
    });
    return () => media.revert();
  }, []);
  return <div ref={ref} className="portrait-traveller" aria-hidden="true"><div className="traveller-main"><img src={assets.heroPortrait} alt=""/><img className="journey-arrival" src={assets.editorialPortrait01} alt=""/></div>{[0,1,2,3].map(i => <i key={i} className="traveller-tail"/>)}</div>;
}
