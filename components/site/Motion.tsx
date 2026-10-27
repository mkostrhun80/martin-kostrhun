'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useRef } from 'react';
import { gsap } from 'gsap';
import { assets } from '@/lib/site-config';
import { bezier, clamp, ease, sampleRoute, routePoint, settleScroll, type Frame, type Point } from '@/lib/traveller';

/** The reference film becomes a reversible scroll journey, using the real portrait. */
export function Motion() {
  const ref = useRef<HTMLDivElement>(null);
  const id = `journey-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
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
      const image = main.querySelector('img')!;
      const original = photo.querySelector('img')!;
      const ribbon = root.querySelector<SVGPathElement>('[data-ribbon]')!;
      const filament = root.querySelector<SVGPathElement>('[data-filament]')!;
      const particles = Array.from(root.querySelectorAll<SVGCircleElement>('[data-particle]'));
      const cards = Array.from(contents.querySelectorAll<HTMLElement>('.index-grid > a'));
      let source: Frame = { left: 0, top: 0, width: 1, height: 1 };
      let route = sampleRoute(p => ({ x: p, y: p }));
      let start = 48, collapseEnd = 400, travelEnd = 720, finish = 900;
      let mobile = false, measuredWidth = 0, measuredHeight = 0, radius = 28;
      let renderedScroll = scrollY, animation = 0, previous = 0, resizeFrame = 0, disposed = false;

      function measure() {
        mobile = innerWidth <= 760;
        measuredWidth = innerWidth;
        measuredHeight = mobile ? hero!.offsetHeight : innerHeight;
        const header = document.querySelector<HTMLElement>('.site-header');
        const headerGap = Math.ceil((header?.getBoundingClientRect().bottom ?? (mobile ? 68 : 82)) + 16);
        contents!.style.setProperty('--scene-header-gap', `${headerGap}px`);
        const r = photo!.getBoundingClientRect();
        const cr = contents!.getBoundingClientRect();
        const tr = target!.getBoundingClientRect();
        source = { left: r.left, top: r.top + scrollY, width: r.width, height: r.height };
        radius = parseFloat(getComputedStyle(photo!).borderTopLeftRadius) || 28;
        const style = getComputedStyle(original);
        image.style.objectPosition = style.objectPosition;
        image.style.filter = style.filter;
        const from = { x: measuredWidth * .5, y: cr.top + scrollY - (mobile ? 90 : 110) };
        const to = { x: tr.left + tr.width / 2, y: tr.top + scrollY + tr.height / 2 };
        // Two continuous curves give the ball a broad sweep and a soft return.
        const middle = { x: measuredWidth * .46, y: from.y + (to.y - from.y) * .55 };
        const tangent = { x: measuredWidth * .17, y: (to.y - from.y) * .13 };
        route = sampleRoute(p => p < .56
          ? bezier(p / .56, from, { x: measuredWidth * .12, y: from.y + 30 }, { x: middle.x - tangent.x, y: middle.y - tangent.y }, middle)
          : bezier((p - .56) / .44, middle, { x: middle.x + tangent.x, y: middle.y + tangent.y }, { x: measuredWidth * .78, y: to.y - 50 }, to));
        start = mobile ? 64 : 48;
        // Finish as the section reaches the header, not after scrolling to a card.
        finish = Math.max(start + 1, cr.top + scrollY - headerGap);
        const span = finish - start;
        collapseEnd = start + span * .38;
        travelEnd = start + span * .82;
      }

      function hideTrail() {
        ribbon.style.opacity = filament.style.opacity = '0';
        particles.forEach(particle => { particle.style.opacity = '0'; });
      }
      function restore() {
        root!.style.visibility = 'hidden';
        photo!.style.removeProperty('opacity');
        hero!.style.removeProperty('--portrait-departure');
        delete contents!.dataset.journey;
        cards.forEach(card => {
          card.style.removeProperty('--card-arrival');
          card.style.removeProperty('pointer-events');
        });
        hideTrail();
      }
      function trail(distance: number, actual: number, presence: number) {
        const length = Math.min(distance, mobile ? 115 : 240);
        const points: Point[] = [], left: Point[] = [], right: Point[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20, d = distance - length * (1 - t);
          const p = routePoint(route, d), next = routePoint(route, Math.min(route.length, d + 2));
          const angle = Math.atan2(next.y - p.y, next.x - p.x);
          const width = Math.sin(t * Math.PI) * (mobile ? 7 : 15) * presence;
          points.push({ x: p.x, y: p.y - actual });
          left.push({ x: p.x - Math.sin(angle) * width, y: p.y - actual + Math.cos(angle) * width });
          right.push({ x: p.x + Math.sin(angle) * width, y: p.y - actual - Math.cos(angle) * width });
        }
        const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        ribbon.setAttribute('d', `${path(left)} ${path(right.reverse()).replace(/^M/, 'L')} Z`);
        filament.setAttribute('d', path(points));
        ribbon.style.opacity = String(presence * .6);
        filament.style.opacity = String(presence * .35);
        particles.forEach((particle, i) => {
          const behind = (i + 1) * (mobile ? 22 : 35);
          const p = routePoint(route, distance - behind);
          const next = routePoint(route, distance - behind + 3);
          const angle = Math.atan2(next.y - p.y, next.x - p.x);
          const offset = Math.sin(i * 2.4 + distance * .008) * (mobile ? 10 : 25) * presence;
          particle.setAttribute('cx', String(p.x - Math.sin(angle) * offset));
          particle.setAttribute('cy', String(p.y - actual + Math.cos(angle) * offset));
          particle.setAttribute('r', String((mobile ? 4.8 : 7.5) * (1 - i * .14)));
          particle.style.opacity = String(distance > behind ? presence * (.55 - i * .07) : 0);
        });
      }
      function draw() {
        const actual = Math.max(0, scrollY), y = renderedScroll;
        const intro = document.documentElement.dataset.homeIntro;
        if ((intro && intro !== 'ready') || ![original, image].every(img => img.complete && img.naturalWidth > 0)) {
          restore(); return;
        }
        const idle = y <= start && actual <= start, done = actual >= finish;
        contents!.dataset.journey = done ? 'complete' : 'active';
        const collapseSpan = collapseEnd - start;
        hero!.style.setProperty('--portrait-departure', String(ease((y - start - collapseSpan * .18) / Math.max(1, collapseSpan * .82))));
        const span = finish - start;
        const revealStart = start + span * .5;
        const stagger = span * .035;
        const revealDuration = Math.max(1, span * .43 - stagger * (cards.length - 1));
        cards.forEach((card, i) => {
          // Reveal follows the actual scroll so smoothing cannot delay the last card.
          const p = done ? 1 : ease((actual - revealStart - i * stagger) / revealDuration);
          card.style.setProperty('--card-arrival', String(p));
          card.style.pointerEvents = p > .2 ? 'auto' : 'none';
        });
        root!.style.visibility = !idle && !done ? 'visible' : 'hidden';
        photo!.style.opacity = idle ? '1' : '0';
        hideTrail();
        if (idle || done) return;
        const size = mobile ? 30 : 46;
        const from = routePoint(route, 0);
        let frame: Frame & { radius: number }, orb = 1, rotation = 0, opacity = 1;
        if (y < collapseEnd) {
          const p = clamp((y - start) / (collapseEnd - start));
          const t = ease((p - .2) / .8);
          const swell = 1 + .28 * ease(p / .2);
          const width = source.width * swell + (size - source.width * swell) * t;
          const height = source.height * swell + (size - source.height * swell) * t;
          const cx = source.left + source.width / 2 + (from.x - source.left - source.width / 2) * t;
          const cy = source.top + source.height / 2 + (from.y - source.top - source.height / 2) * t;
          frame = { left: cx - width / 2, top: cy - actual - height / 2, width, height, radius: radius + (Math.min(width, height) / 2 - radius) * ease(p / .78) };
          orb = ease((p - .45) / .45);
          image.style.opacity = String(1 - orb);
          rotation = Math.sin(p * Math.PI) * (mobile ? -3 : -7);
        } else if (y < travelEnd) {
          const p = clamp((y - collapseEnd) / (travelEnd - collapseEnd));
          const distance = p * route.length, point = routePoint(route, distance);
          frame = { left: point.x - size / 2, top: point.y - actual - size / 2, width: size, height: size, radius: size / 2 };
          image.style.opacity = '0';
          trail(distance, actual, ease(p / .12) * (1 - ease((p - .82) / .18)));
        } else {
          const tr = target!.getBoundingClientRect(), point = routePoint(route, route.length);
          const p = ease((y - travelEnd) / (finish - travelEnd));
          const diameter = size + (12 - size) * p;
          frame = { left: point.x - diameter / 2, top: tr.top + tr.height / 2 - diameter / 2, width: diameter, height: diameter, radius: diameter / 2 };
          image.style.opacity = '0';
          opacity = 1 - ease(p / .85);
        }
        main.style.setProperty('--orb', String(orb));
        gsap.set(main, { x: frame.left, y: frame.top, width: frame.width, height: frame.height, borderRadius: frame.radius, rotation, opacity });
      }
      function tick(now: number) {
        animation = 0;
        if (disposed || document.hidden) return;
        const actual = Math.max(0, scrollY);
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        renderedScroll = Math.abs(actual - renderedScroll) > measuredHeight * .65 || actual <= 2 || actual > finish + measuredHeight * .2
          ? actual : settleScroll(renderedScroll, actual, dt, mobile);
        draw();
        if (Math.abs(actual - renderedScroll) > .25) animation = requestAnimationFrame(tick);
        else previous = 0;
      }
      const wake = () => { if (!disposed && !document.hidden && !animation) animation = requestAnimationFrame(tick); };
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
      [original, image].forEach(img => img.addEventListener('load', refresh));
      document.fonts.ready.then(refresh);
      addEventListener('scroll', wake, { passive: true });
      addEventListener('resize', resize);
      addEventListener('orientationchange', refresh);
      addEventListener('home-intro-ready', refresh);
      document.addEventListener('visibilitychange', wake);
      return () => {
        disposed = true;
        cancelAnimationFrame(animation); cancelAnimationFrame(resizeFrame); observer.disconnect();
        removeEventListener('scroll', wake); removeEventListener('resize', resize);
        removeEventListener('orientationchange', refresh); removeEventListener('home-intro-ready', refresh);
        document.removeEventListener('visibilitychange', wake);
        [original, image].forEach(img => img.removeEventListener('load', refresh));
        restore();
        contents.style.removeProperty('--scene-header-gap');
      };
    });
    return () => media.revert();
  }, []);

  return <div ref={ref} className="portrait-traveller signature-traveller reference-traveller" aria-hidden="true">
    <svg className="journey-trail" focusable="false"><defs>
      <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--sand)" stopOpacity=".12"/><stop offset=".55" stopColor="var(--light-brown)" stopOpacity=".65"/><stop offset="1" stopColor="var(--sand)"/></linearGradient>
      <radialGradient id={`${id}-pearl`} cx="30%" cy="24%" r="75%"><stop stopColor="#f0dfc4"/><stop offset=".5" stopColor="var(--light-brown)"/><stop offset="1" stopColor="#907252"/></radialGradient>
    </defs><path data-ribbon fill={`url(#${id}-ribbon)`}/><path data-filament fill="none" stroke="var(--light-brown)" strokeWidth="1.2"/>{Array.from({ length: 5 }, (_, i) => <circle key={i} data-particle fill={`url(#${id}-pearl)`}/>)}</svg>
    <div className="traveller-main"><img src={assets.heroPortrait} alt="" width="800" height="1200"/></div>
  </div>;
}
