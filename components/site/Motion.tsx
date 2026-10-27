'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useRef } from 'react';
import { gsap } from 'gsap';
import { assets } from '@/lib/site-config';
import { bezier, clamp, ease, settleScroll, type Frame, type Point } from '@/lib/traveller';

const phase = (time: number, from: number, to: number) => clamp((time - from) / (to - from));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const pop = (p: number) => { const q = p - 1; return 1 + 2.3 * q ** 3 + 1.3 * q ** 2; };
const FILM_START = 1.55;
const FILM_END = 8.65;

/** A pinned scene: the film's loop, impact, letter assembly and card pop-ups. */
export function Motion() {
  const ref = useRef<HTMLDivElement>(null);
  const id = `journey-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const sequence = document.querySelector<HTMLElement>('.hero-about-sequence');
      const stage = sequence?.querySelector<HTMLElement>('.journey-stage');
      const hero = stage?.querySelector<HTMLElement>('.hero-signature');
      const photo = hero?.querySelector<HTMLElement>('.hero-photo-layer');
      const contents = stage?.querySelector<HTMLElement>('.index-scene');
      const copy = contents?.querySelector<HTMLElement>('.index-copy');
      const root = ref.current;
      if (!sequence || !stage || !hero || !photo || !contents || !copy || !root) return;
      const main = root.querySelector<HTMLElement>('.traveller-main')!;
      const image = main.querySelector('img')!;
      const original = photo.querySelector('img')!;
      const subtitle = contents.querySelector<HTMLElement>('.section-heading > p')!;
      const letters = Array.from(contents.querySelectorAll<HTMLElement>('[data-journey-letter]'));
      const cards = Array.from(contents.querySelectorAll<HTMLElement>('.index-grid > a'));
      const ribbon = root.querySelector<SVGPathElement>('[data-ribbon]')!;
      const filament = root.querySelector<SVGPathElement>('[data-filament]')!;
      const particles = Array.from(root.querySelectorAll<SVGCircleElement>('[data-particle]'));
      const fragments = Array.from(root.querySelectorAll<HTMLElement>('.journey-fragment'));
      const shadow = root.querySelector<HTMLElement>('.journey-ground-shadow')!;
      let source: Frame = { left: 0, top: 0, width: 1, height: 1 };
      let letterOrigins: Point[] = [];
      let width = 0, height = 0, top = 0, distance = 1, radius = 20;
      let mobile = false, enabled = false, disposed = false, hashHandled = false;
      let renderedScroll = scrollY, animation = 0, resizeFrame = 0, previous = 0;
      let destination: Point = { x: 0, y: 0 };

      function restore() {
        enabled = false;
        delete sequence!.dataset.referenceJourney;
        sequence!.style.removeProperty('--journey-scroll');
        sequence!.style.removeProperty('--journey-frame-height');
        delete contents!.dataset.journey;
        root!.style.visibility = 'hidden';
        photo!.style.removeProperty('opacity');
        hero!.style.removeProperty('--portrait-departure');
        hero!.style.removeProperty('--contour-presence');
        contents!.style.removeProperty('visibility');
        [copy!, subtitle, ...letters, ...cards].forEach(el => gsap.set(el, { clearProps: 'transform,opacity,visibility,pointerEvents' }));
      }
      function ready() {
        const intro = document.documentElement.dataset.homeIntro;
        return (!intro || intro === 'ready') && [original, image].every(img => img.complete && img.naturalWidth > 0);
      }
      function measure() {
        if (!ready()) { restore(); return; }
        mobile = innerWidth <= 760;
        sequence!.dataset.referenceJourney = 'active';
        sequence!.style.removeProperty('--journey-frame-height');
        // Reset before measuring so animated letters and cards do not inflate the scene.
        gsap.set([copy!, ...letters, ...cards], { x: 0, y: 0, z: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0 });
        width = stage!.clientWidth;
        height = stage!.clientHeight;
        const padding = getComputedStyle(contents!);
        const needed = copy!.offsetHeight + parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom);
        if (needed > height) {
          sequence!.style.setProperty('--journey-frame-height', `${Math.ceil(needed)}px`);
          height = stage!.clientHeight;
        }
        // Three times the original range; keep the CSS reservation in sync.
        distance = Math.max(1920, Math.min(3300, height * 3.3));
        sequence!.style.setProperty('--journey-scroll', `${distance}px`);
        top = sequence!.getBoundingClientRect().top + scrollY;
        const r = photo!.getBoundingClientRect(), sr = stage!.getBoundingClientRect();
        source = { left: r.left - sr.left, top: r.top - sr.top, width: r.width, height: r.height };
        radius = parseFloat(getComputedStyle(photo!).borderTopLeftRadius) || 20;
        image.style.objectPosition = getComputedStyle(original).objectPosition;
        image.style.filter = getComputedStyle(original).filter;
        // Measure the final positions before applying the scene and letter transforms.
        letterOrigins = letters.map(letter => {
          const lr = letter.getBoundingClientRect();
          return { x: lr.left - sr.left + lr.width / 2, y: lr.top - sr.top + lr.height / 2 };
        });
        const rail = document.querySelector<HTMLElement>('.scroll-trigger')?.getBoundingClientRect();
        destination = { x: rail ? rail.left + rail.width / 2 : width - 28, y: height * .52 };
        enabled = true;
      }
      function point(time: number): Point {
        const p = (x: number, y: number) => ({ x: width * x, y: height * y });
        if (time < 3.05) return p(.5, .5);
        if (time < 3.6) return bezier(phase(time, 3.05, 3.6), p(.5,.5), p(.49,.57), p(.42,.64), p(.44,.72));
        if (time < 4.05) return bezier(phase(time, 3.6, 4.05), p(.44,.72), p(.34,.8), p(.67,.46), p(.61,.44));
        if (time < 4.5) return bezier(phase(time, 4.05, 4.5), p(.61,.44), p(.46,.55), p(.3,.3), p(.43,.61));
        if (time < 5) return bezier(phase(time, 4.5, 5), p(.43,.61), p(.45,.65), p(.49,.75), p(.5,.77));
        if (time < 5.2) return p(.5,.77);
        if (time < 5.8) return bezier(phase(time, 5.2, 5.8), p(.5,.77), p(.55,.55), p(.7,.35), p(.8,.43));
        if (time < 6.75) return bezier(phase(time, 5.8, 6.75), p(.8,.43), p(.9,.37), p(.94,.55), p(.86,.63));
        if (time < 7.15) return bezier(phase(time, 6.75, 7.15), p(.86,.63), p(.84,.73), p(.7,.72), p(.74,.68));
        return bezier(ease(phase(time, 7.15, 8.15)), p(.74,.68), p(.8,.62), p(.98,.55), destination);
      }
      function drawTrail(time: number) {
        const presence = ease(phase(time, 3.1, 3.4)) * (1 - ease(phase(time, 4.95, 5.15)))
          + ease(phase(time, 5.25, 5.45)) * (1 - ease(phase(time, 6.2, 6.75))) * .45;
        const left: Point[] = [], right: Point[] = [], center: Point[] = [];
        for (let i = 0; i <= 36; i++) {
          const p = i / 36, t = Math.max(3.05, time - .55 * (1 - p));
          const a = point(t), b = point(t + .008);
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          const half = Math.sin(p * Math.PI) * (mobile ? 13 : 25) * presence;
          center.push(a);
          left.push({ x: a.x - Math.sin(angle) * half, y: a.y + Math.cos(angle) * half });
          right.push({ x: a.x + Math.sin(angle) * half, y: a.y - Math.cos(angle) * half });
        }
        const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        ribbon.setAttribute('d', `${path(left)} ${path(right.reverse()).replace(/^M/, 'L')} Z`);
        filament.setAttribute('d', path(center));
        ribbon.style.opacity = String(presence * .66);
        filament.style.opacity = String(presence * .24);
        particles.forEach((particle, i) => {
          const t = time - .1 * (i + 1), p = point(Math.max(3.05, t));
          const spread = Math.sin(i * 2.1 + time * 4) * height * .055 * presence;
          particle.setAttribute('cx', String(p.x + spread));
          particle.setAttribute('cy', String(p.y - Math.cos(i * 2.3) * height * .08 * presence));
          particle.setAttribute('r', String((mobile ? 5 : 8) * (1 - i * .1)));
          particle.style.opacity = String(t > 3.05 && time < 5.65 ? presence * .8 : 0);
        });
      }
      function drawScene(time: number) {
        const entry = phase(time, 4.94, 5.65), scene = pop(entry);
        contents!.style.visibility = time >= 4.94 ? 'visible' : 'hidden';
        contents!.dataset.journey = time >= 8.3 ? 'complete' : 'active';
        gsap.set(copy!, { opacity: ease(phase(time, 4.94, 5.25)), y: height * .13 * (1 - scene), scale: .68 + scene * .32, rotationX: 12 * (1 - scene), transformOrigin: '50% 70%' });
        letters.forEach((letter, i) => {
          const p = ease(phase(time, 4.96 + i * .012, 5.43 + i * .012));
          const origin = letterOrigins[i];
          gsap.set(letter, {
            opacity: ease(p * 3),
            x: (width * .49 - origin.x + Math.sin(i * 2.3) * width * .025) * (1 - p),
            y: (height * .75 - origin.y) * (1 - p),
            scale: .32 + p * .68,
            rotation: Math.sin(i * 1.7) * 24 * (1 - p),
          });
        });
        gsap.set(subtitle, { opacity: ease(phase(time, 5.42, 5.85)), y: 15 * (1 - ease(phase(time, 5.42, 5.85))) });
        cards.forEach((card, i) => {
          const start = 6.85 + i * .23;
          const p = phase(time, start, start + .68), bounce = pop(p), remaining = 1 - bounce;
          gsap.set(card, {
            visibility: p > 0 ? 'visible' : 'hidden', opacity: ease(p * 3),
            x: (i % 2 ? -1 : 1) * width * .055 * remaining,
            y: height * .24 * remaining, z: -320 * remaining,
            scale: .08 + bounce * .92,
            rotationX: 68 * remaining, rotationY: (i % 2 ? -42 : 42) * remaining,
            rotation: (i % 2 ? 16 : -13) * remaining,
            transformOrigin: '50% 80%', pointerEvents: p > .55 ? 'auto' : 'none',
          });
        });
      }
      function draw(time: number) {
        if (!enabled) return;
        hero!.style.setProperty('--portrait-departure', String(ease(phase(time, 2.05, 2.85))));
        hero!.style.setProperty('--contour-presence', String(1 - ease(phase(time, 2.3, 3))));
        drawScene(time);
        const idle = time <= FILM_START + .001, done = time >= 8.2;
        photo!.style.opacity = idle ? '1' : '0';
        root!.style.visibility = idle || done ? 'hidden' : 'visible';
        if (idle || done) return;
        const size = Math.min(mobile ? 68 : 98, height * .135);
        let frame: Frame, rounding = radius, orb = 0, scaleX = 1, scaleY = 1, rotation = 0;
        if (time < 2.7) {
          const grow = ease(phase(time, 1.55, 1.95));
          const shrink = ease(phase(time, 2, 2.7));
          const sw = source.width * (1 + grow * .16), sh = source.height * (1 + grow * .16);
          const w = mix(sw, size * .78, shrink), h = mix(sh, size * .78, shrink);
          const x = mix(source.left + source.width / 2, width * .5, shrink);
          const y = mix(source.top + source.height / 2, height * .5, shrink);
          frame = { left: x - w / 2, top: y - h / 2, width: w, height: h };
          rounding = mix(radius, Math.min(w,h) / 2, shrink);
          orb = ease(phase(time, 2.24, 2.65));
        } else {
          const p = point(time);
          const diameter = time < 5.2 ? mix(size * .78, size, ease(phase(time, 2.7, 3.05)))
            : time < 6.75 ? mix(size, size * .6, ease(phase(time, 5.2, 6.75)))
            : mix(size * .6, 12, ease(phase(time, 6.75, 8.15)));
          frame = { left: p.x - diameter / 2, top: p.y - diameter / 2, width: diameter, height: diameter };
          rounding = diameter / 2;
          orb = 1;
          const squash = Math.sin(phase(time, 4.98, 5.2) * Math.PI);
          scaleX = 1 + squash * .52; scaleY = 1 - squash * .38;
          rotation = squash * -8;
        }
        main.style.setProperty('--orb', String(orb));
        image.style.opacity = String(1 - orb);
        gsap.set(main, { x: frame.left, y: frame.top, width: frame.width, height: frame.height, borderRadius: rounding, scaleX, scaleY, rotation, opacity: 1 - ease(phase(time, 7.95, 8.2)) });
        drawTrail(time);
        const burst = phase(time, 5.04, 5.8);
        fragments.forEach((fragment, i) => {
          const angle = i * 2.399, spread = ease(burst) * height * (.13 + (i % 3) * .035);
          const diameter = (mobile ? 26 : 42) * (1 - (i % 4) * .16);
          gsap.set(fragment, { x: width * .5 + Math.cos(angle) * spread - diameter / 2,
            y: height * .77 + Math.sin(angle) * spread - burst * height * .12 - diameter / 2,
            width: diameter, height: diameter * (i % 2 ? .65 : 1.2), rotation: i * 38 + burst * 90,
            scale: Math.sin(burst * Math.PI), opacity: 1 - ease(phase(burst, .55, 1)) });
        });
        const ball = point(time);
        const proximity = ease(phase(time, 4.7, 5)) * (1 - ease(phase(time, 5.2, 5.45)))
          + ease(phase(time, 6.4, 6.75)) * (1 - ease(phase(time, 6.85, 7.1)));
        gsap.set(shadow, { x: ball.x - size * .6, y: time < 5.8 ? height * .77 + size * .46 : height * .63 + size * .3, width: size * 1.2, opacity: proximity * .28, scaleX: 1 + (1 - proximity) * .8 });
      }
      function tick(now: number) {
        animation = 0;
        if (disposed || document.hidden) return;
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        const actual = Math.max(0, scrollY);
        renderedScroll = actual <= top || actual >= top + distance
          ? actual : settleScroll(renderedScroll, actual, dt, mobile);
        draw(mix(FILM_START, FILM_END, clamp((renderedScroll - top) / distance)));
        if (Math.abs(actual - renderedScroll) > .25) animation = requestAnimationFrame(tick);
        else previous = 0;
      }
      const wake = () => { if (!disposed && !document.hidden && !animation) animation = requestAnimationFrame(tick); };
      const followHash = () => {
        if (enabled && location.hash === '#obsah') {
          hashHandled = true;
          scrollTo({ top: top + distance, behavior: 'instant' });
        }
        wake();
      };
      const refresh = () => {
        if (disposed || resizeFrame) return;
        resizeFrame = requestAnimationFrame(() => {
          resizeFrame = 0; measure(); renderedScroll = scrollY;
          if (enabled && !hashHandled && location.hash === '#obsah') followHash();
          draw(mix(FILM_START, FILM_END, clamp((scrollY - top) / distance)));
        });
      };
      const resize = () => { if (Math.abs(innerWidth - width) > 1 || (!mobile && Math.abs(innerHeight - height) > 80)) refresh(); };
      measure(); draw(mix(FILM_START, FILM_END, clamp((scrollY - top) / distance)));
      if (enabled && location.hash === '#obsah') followHash();
      const observer = new ResizeObserver(refresh); observer.observe(copy);
      [original, image].forEach(img => img.addEventListener('load', refresh));
      document.fonts.ready.then(refresh);
      addEventListener('scroll', wake, { passive: true }); addEventListener('resize', resize);
      addEventListener('orientationchange', refresh); addEventListener('home-intro-ready', refresh);
      addEventListener('hashchange', followHash); document.addEventListener('visibilitychange', wake);
      return () => {
        disposed = true; cancelAnimationFrame(animation); cancelAnimationFrame(resizeFrame); observer.disconnect();
        removeEventListener('scroll', wake); removeEventListener('resize', resize);
        removeEventListener('orientationchange', refresh); removeEventListener('home-intro-ready', refresh);
        removeEventListener('hashchange', followHash); document.removeEventListener('visibilitychange', wake);
        [original, image].forEach(img => img.removeEventListener('load', refresh));
        restore();
      };
    });
    return () => media.revert();
  }, []);
  return <div ref={ref} className="portrait-traveller signature-traveller reference-traveller" aria-hidden="true">
    <svg className="journey-trail" focusable="false"><defs>
      <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--sand)" stopOpacity=".08"/><stop offset=".55" stopColor="var(--light-brown)" stopOpacity=".55"/><stop offset="1" stopColor="var(--sand)"/></linearGradient>
      <radialGradient id={`${id}-pearl`} cx="30%" cy="24%" r="75%"><stop stopColor="#f0dfc4"/><stop offset=".5" stopColor="var(--light-brown)"/><stop offset="1" stopColor="#907252"/></radialGradient>
    </defs><path data-ribbon fill={`url(#${id}-ribbon)`}/><path data-filament fill="none" stroke="var(--light-brown)" strokeWidth="1.2"/>{Array.from({ length: 5 }, (_, i) => <circle key={i} data-particle fill={`url(#${id}-pearl)`}/>)}</svg>
    <div className="journey-ground-shadow"/>
    {Array.from({ length: 11 }, (_, i) => <div key={i} className={`journey-fragment${i % 3 === 0 ? ' journey-fragment-cream' : ''}`}/>)}
    <div className="traveller-main"><img src={assets.heroPortrait} alt="" width="800" height="1200"/></div>
  </div>;
}
