'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { assets } from '@/lib/site-config';
import { clamp, ease, travelPoint, sampleRoute, routePoint, photoFrame, journeyTiming, settleScroll, type Frame } from '@/lib/traveller';

export function Motion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector<HTMLElement>('.hero-signature');
      const photo = hero?.querySelector<HTMLElement>('.hero-photo-layer');
      const contents = document.querySelector<HTMLElement>('.index-scene');
      const target = contents?.querySelector<HTMLElement>('.journey-destination');
      const root = ref.current;
      if (!hero || !photo || !contents || !target || !root) return;
      const main = root.querySelector<HTMLElement>('.traveller-main')!;
      const images = Array.from(main.querySelectorAll('img'));
      const originals = [photo.querySelector('img')!, target.querySelector('img')!];
      const links = contents.querySelector<HTMLElement>('.index-grid')!;
      let source: Frame = { left: 0, top: 0, width: 1, height: 1 };
      let route = sampleRoute(p => ({ x: p, y: p }));
      let timing = journeyTiming(800, 1000, 800, false);
      let mobile = false, measuredWidth = 0, measuredHeight = 0;
      let sourceRadius = 28, targetRadius = 28;
      let renderedScroll = scrollY, animation = 0, previous = 0, resizeFrame = 0, disposed = false;

      function measure() {
        mobile = innerWidth <= 760;
        measuredWidth = innerWidth;
        measuredHeight = mobile ? hero!.offsetHeight : innerHeight;
        const r = photo!.getBoundingClientRect(), cr = contents!.getBoundingClientRect(), tr = target!.getBoundingClientRect();
        source = { left: r.left, top: r.top + scrollY, width: r.width, height: r.height };
        sourceRadius = parseFloat(getComputedStyle(photo!).borderTopLeftRadius) || 0;
        targetRadius = parseFloat(getComputedStyle(target!).borderTopLeftRadius) || 0;
        originals.forEach((image, i) => {
          const style = getComputedStyle(image);
          images[i].style.objectPosition = style.objectPosition;
          images[i].style.filter = style.filter;
        });
        const end = { x: tr.left + tr.width / 2, y: tr.top + scrollY + tr.height / 2 };
        route = sampleRoute(p => travelPoint(p, measuredWidth, cr.top + scrollY, cr.bottom + scrollY, end));
        timing = journeyTiming(hero!.offsetHeight, tr.top + scrollY, measuredHeight, mobile);
      }

      function restore() {
        root!.style.visibility = 'hidden';
        photo!.style.removeProperty('opacity');
        target!.style.removeProperty('opacity');
        links.style.removeProperty('--arrival');
      }

      function draw() {
        const actual = Math.max(0, scrollY), y = renderedScroll;
        const intro = document.documentElement.dataset.homeIntro;
        // A slow or failed image never becomes an empty animated frame.
        if ((intro && intro !== 'ready') || ![...originals, ...images].every(image => image.complete && image.naturalWidth > 0)) {
          restore(); return;
        }
        const idle = actual <= timing.start && y <= timing.start;
        const finished = y >= timing.expandEnd;
        root!.style.visibility = !idle && !finished ? 'visible' : 'hidden';
        photo!.style.opacity = idle ? '1' : '0';
        target!.style.opacity = idle || finished ? '1' : '0';
        links.style.setProperty('--arrival', String(idle || finished ? 1 : ease((y - timing.travelEnd) / (timing.expandEnd - timing.travelEnd))));
        if (idle || finished) return;
        const shrinking = y < timing.collapseEnd;
        const travelling = y >= timing.collapseEnd && y < timing.travelEnd;
        let frame;
        if (shrinking) {
          const p = clamp((y - timing.start) / (timing.collapseEnd - timing.start));
          const start = routePoint(route, 0);
          frame = photoFrame(source, { left: start.x - 7, top: start.y - 7, width: 14, height: 14 }, p, false, sourceRadius);
          frame.top -= actual;
          images[0].style.opacity = String(1 - ease((p - .7) / .3));
          images[1].style.opacity = '0';
        } else if (travelling) {
          const p = clamp((y - timing.collapseEnd) / (timing.travelEnd - timing.collapseEnd));
          const dot = routePoint(route, p * route.length);
          frame = { left: dot.x - 7, top: dot.y - actual - 7, width: 14, height: 14, radius: 7 };
          images[0].style.opacity = images[1].style.opacity = '0';
        } else {
          const tr = target!.getBoundingClientRect(), end = routePoint(route, route.length);
          const p = clamp((y - timing.travelEnd) / (timing.expandEnd - timing.travelEnd));
          frame = photoFrame({ left: end.x - 7, top: end.y - actual - 7, width: 14, height: 14 }, tr, p, true, targetRadius);
          images[0].style.opacity = '0';
          images[1].style.opacity = String(ease(p / .65));
        }
        gsap.set(main, { x: frame.left, y: frame.top, width: frame.width, height: frame.height, borderRadius: frame.radius });
      }

      function tick(now: number) {
        animation = 0;
        if (disposed) return;
        const actual = Math.max(0, scrollY);
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        const jumping = Math.abs(actual - renderedScroll) > measuredHeight * .65;
        renderedScroll = jumping || actual <= 2 || actual > timing.expandEnd + measuredHeight * .2
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
      observer.observe(hero); observer.observe(contents); observer.observe(target);
      [...originals, ...images].forEach(image => image.addEventListener('load', refresh));
      document.fonts.ready.then(refresh);
      addEventListener('scroll', wake, { passive: true });
      addEventListener('resize', resize);
      addEventListener('orientationchange', refresh);
      addEventListener('home-intro-ready', refresh);
      return () => {
        disposed = true;
        cancelAnimationFrame(animation); cancelAnimationFrame(resizeFrame); observer.disconnect();
        removeEventListener('scroll', wake); removeEventListener('resize', resize);
        removeEventListener('orientationchange', refresh); removeEventListener('home-intro-ready', refresh);
        [...originals, ...images].forEach(image => image.removeEventListener('load', refresh));
        restore();
      };
    });
    return () => media.revert();
  }, []);

  return <div ref={ref} className="portrait-traveller signature-traveller" aria-hidden="true"><div className="traveller-main"><img src={assets.heroPortrait} alt="" width="800" height="1200"/><img src={assets.contentsPortrait} alt="" width="800" height="1200"/></div></div>;
}
