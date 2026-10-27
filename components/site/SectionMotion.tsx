'use client';

import { useEffect, useId, useRef } from 'react';
import { gsap } from 'gsap';
import { clamp, ease, settleScroll, type Point } from '@/lib/traveller';

const range = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
type Scene = { element: HTMLElement; grid: HTMLElement; column: HTMLElement; dark: boolean };

/** Motion-only enhancement: the original sections, text and layout stay intact. */
export function SectionMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const id = `section-ball-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const root = ref.current;
      const services = document.querySelector<HTMLElement>('#sluzby');
      const about = document.querySelector<HTMLElement>('#o-mne');
      if (!root || !services || !about) return;
      const ball = root.querySelector<SVGGElement>('[data-section-ball]')!;
      const panels = root.querySelector<SVGGElement>('[data-ball-panels]')!;
      const ribbon = root.querySelector<SVGPathElement>('[data-section-ribbon]')!;
      const trace = root.querySelector<SVGPathElement>('[data-section-trace]')!;
      const glint = root.querySelector<SVGPathElement>('[data-section-glint]')!;
      const shadow = root.querySelector<SVGEllipseElement>('[data-section-shadow]')!;
      const dust = Array.from(root.querySelectorAll<SVGCircleElement>('[data-section-dust]'));
      const entries = new Map<HTMLElement, gsap.core.Tween>();
      const scenes: Scene[] = [];
      let disposed = false, frame = 0, previous = 0, renderedScroll = scrollY;
      const mobile = () => innerWidth <= 760;

      function reveal(element: HTMLElement, kind: 'card' | 'photo' | 'text', delay = 0) {
        const photo = kind === 'photo', card = kind === 'card';
        const tween = gsap.fromTo(element, {
          opacity: 0, y: card ? 58 : photo ? 42 : 26,
          scale: card ? .88 : photo ? .94 : 1,
          rotationX: card ? 24 : 0, rotationY: photo ? -13 : card ? 8 : 0,
          rotation: photo ? -2.5 : card ? -2 : 0,
          transformPerspective: 1100, transformOrigin: '50% 85%',
        }, {
          opacity: 1, y: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0,
          duration: card ? 1.65 : photo ? 1.8 : 1.25, delay,
          ease: card ? 'back.out(1.05)' : 'power3.out', paused: true,
          clearProps: 'transform,transformOrigin,opacity',
        });
        entries.set(element, tween);
      }
      services.querySelectorAll<HTMLElement>('.services-intro > *').forEach((el, i) => reveal(el, 'text', i * .12));
      services.querySelectorAll<HTMLElement>('.service-chapter').forEach(chapter => {
        const column = chapter.querySelector<HTMLElement>('.service-chapter-items');
        if (column) scenes.push({ element: chapter, grid: chapter, column, dark: chapter.classList.contains('service-chapter-protect') });
        chapter.querySelectorAll<HTMLElement>('.service-chapter-heading h3').forEach(el => reveal(el, 'text'));
        chapter.querySelectorAll<HTMLElement>('.service-chapter-heading figure').forEach(el => reveal(el, 'photo', .12));
        chapter.querySelectorAll<HTMLElement>('.service-item').forEach(el => reveal(el, 'card', .1));
      });
      const aboutGrid = about.querySelector<HTMLElement>('.about-layout');
      const aboutColumn = about.querySelector<HTMLElement>('.about-copy');
      if (aboutGrid && aboutColumn) scenes.push({ element: about, grid: aboutGrid, column: aboutColumn, dark: false });
      about.querySelectorAll<HTMLElement>('.about-portrait').forEach(el => reveal(el, 'photo'));
      about.querySelectorAll<HTMLElement>('.motion-title-line').forEach((el, i) => reveal(el, 'text', i * .16));
      about.querySelectorAll<HTMLElement>('.about-copy > :not(h2)').forEach((el, i) => reveal(el, 'text', Math.min(i * .08, .32)));

      const observer = new IntersectionObserver(changes => {
        changes.forEach(entry => {
          if (!entry.isIntersecting) return;
          entries.get(entry.target as HTMLElement)?.play();
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -4% 0px', threshold: .03 });
      entries.forEach((_, element) => observer.observe(element));
      const focus = (event: FocusEvent) => {
        if (!(event.target instanceof Node)) return;
        const target = event.target;
        entries.forEach((tween, element) => {
          if (element.contains(target)) { tween.progress(1); observer.unobserve(element); }
        });
      };

      function draw() {
        const height = innerHeight, width = innerWidth, actual = scrollY;
        const candidates = scenes.map(scene => {
          const rect = scene.element.getBoundingClientRect();
          const visible = Math.max(0, Math.min(height, rect.bottom) - Math.max(90, rect.top));
          return { scene, rect, visible };
        }).sort((a, b) => b.visible - a.visible);
        const active = candidates[0];
        if (!active || active.visible < height * .4) { root!.style.visibility = 'hidden'; return; }
        const { scene, rect } = active;
        const progress = clamp((height - rect.top - actual + renderedScroll) / (height + rect.height));
        const presence = ease(range(active.visible / height, .4, .75))
          * ease(range(progress, .04, .18)) * (1 - ease(range(progress, .82, .96)));
        if (presence < .002) { root!.style.visibility = 'hidden'; return; }
        root!.style.visibility = 'visible';
        root!.style.opacity = String(presence);
        root!.dataset.surface = scene.dark ? 'dark' : 'light';
        const marginTop = Math.max(mobile() ? 78 : 94, rect.top);
        root!.style.clipPath = `inset(${Math.max(0, marginTop)}px 0 ${Math.max(0, height - rect.bottom)}px 0)`;
        const column = scene.column.getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(scene.grid).columnGap) || 60;
        const size = mobile() ? 19 : Math.max(24, Math.min(58, gap * .48));
        const left = mobile() ? width - 21 : column.left - gap + size / 2 + 5;
        const right = mobile() ? width - 13 : column.left - size / 2 - 5;
        const base = rect.top + actual - renderedScroll;
        const bounces = 6;
        function point(p: number): Point {
          const cycle = clamp(p) * bounces;
          const fraction = cycle - Math.floor(cycle);
          const triangle = Math.floor(cycle) % 2 ? 1 - fraction : fraction;
          return {
            x: left + Math.max(0, right - left) * triangle,
            y: base + 74 + clamp(p) * Math.max(1, rect.height - 148) - Math.sin(fraction * Math.PI) * (mobile() ? 12 : 30),
          };
        }
        const current = point(progress);
        const center: Point[] = [], outer: Point[] = [], inner: Point[] = [];
        const tail = Math.min(.3, progress);
        for (let i = 0; i <= 48; i++) {
          const p = i / 48, t = progress - tail * (1 - p);
          const a = point(t), b = point(Math.min(1, t + .001));
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          const half = Math.sin(p * Math.PI) * (mobile() ? 2.2 : 7);
          center.push(a);
          outer.push({ x: a.x - Math.sin(angle) * half, y: a.y + Math.cos(angle) * half });
          inner.push({ x: a.x + Math.sin(angle) * half, y: a.y - Math.cos(angle) * half });
        }
        const path = (points: Point[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        trace.setAttribute('d', path(center));
        ribbon.setAttribute('d', `${path(outer)} ${path(inner.reverse()).replace(/^M/, 'L')} Z`);
        const last = center.slice(-12);
        glint.setAttribute('d', path(last));
        const bounce = progress * bounces % 1;
        const impact = 1 - ease(range(Math.min(bounce, 1 - bounce), 0, .13));
        const scale = size / 100;
        ball.setAttribute('transform', `translate(${current.x},${current.y}) scale(${scale * (1 + impact * .1)},${scale * (1 - impact * .09)})`);
        panels.setAttribute('transform', `rotate(${progress * 1080},0,0)`);
        shadow.setAttribute('cx', String(current.x));
        shadow.setAttribute('cy', String(current.y + size * .65));
        shadow.setAttribute('rx', String(size * .55));
        shadow.setAttribute('ry', String(size * .085));
        shadow.style.opacity = String(.06 + impact * .12);
        dust.forEach((particle, i) => {
          const angle = Math.PI + i * Math.PI / 4;
          particle.setAttribute('cx', String(current.x + Math.cos(angle) * size * .7));
          particle.setAttribute('cy', String(current.y + size * .65 + Math.sin(angle) * size * .28));
          particle.setAttribute('r', String(mobile() ? 1 : 1.8));
          particle.style.opacity = String(impact * .65);
        });
      }
      function tick(now: number) {
        frame = 0;
        if (disposed || document.hidden) return;
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        renderedScroll = Math.abs(scrollY - renderedScroll) > innerHeight ? scrollY : settleScroll(renderedScroll, scrollY, dt * .55, mobile());
        draw();
        if (Math.abs(scrollY - renderedScroll) > .25) frame = requestAnimationFrame(tick);
        else previous = 0;
      }
      const wake = () => { if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(tick); };
      const visibility = () => { if (document.hidden) root!.style.visibility = 'hidden'; else wake(); };
      const resizeObserver = new ResizeObserver(wake);
      resizeObserver.observe(document.body);
      document.fonts.ready.then(wake);
      addEventListener('scroll', wake, { passive: true }); addEventListener('resize', wake);
      addEventListener('focusin', focus); document.addEventListener('visibilitychange', visibility);
      wake();
      return () => {
        disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
        removeEventListener('scroll', wake); removeEventListener('resize', wake);
        removeEventListener('focusin', focus); document.removeEventListener('visibilitychange', visibility);
        root!.style.visibility = 'hidden';
      };
    });
    return () => media.revert();
  }, []);

  return <div ref={ref} className="section-motion-layer" aria-hidden="true">
    <svg className="section-motion-canvas" focusable="false">
      <defs>
        <radialGradient id={`${id}-shell`} cx="30%" cy="24%" r="77%"><stop stopColor="#fffef8"/><stop offset=".54" stopColor="#e4e6e2"/><stop offset=".85" stopColor="#a5aeac"/><stop offset="1" stopColor="#485359"/></radialGradient>
        <radialGradient id={`${id}-shade`} cx="27%" cy="20%" r="80%"><stop stopColor="white" stopOpacity=".62"/><stop offset=".35" stopColor="white" stopOpacity="0"/><stop offset=".78" stopColor="#0c1825" stopOpacity=".1"/><stop offset="1" stopColor="#0c1825" stopOpacity=".64"/></radialGradient>
        <linearGradient id={`${id}-bronze`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6cfaa"/><stop offset="1" stopColor="#a37e53"/></linearGradient>
        <clipPath id={`${id}-clip`}><circle r="49"/></clipPath>
        <filter id={`${id}-soft-shadow`} x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <path data-section-ribbon className="section-ball-ribbon"/>
      <path data-section-trace className="section-ball-trace" fill="none" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
      <path data-section-glint className="section-ball-glint" fill="none" strokeWidth="3" strokeLinecap="round"/>
      <ellipse data-section-shadow fill="#0c1825" filter={`url(#${id}-soft-shadow)`}/>
      {Array.from({ length: 5 }, (_, i) => <circle key={i} data-section-dust className="section-ball-dust"/>)}
      <g data-section-ball>
        <circle r="49" fill={`url(#${id}-shell)`}/>
        <g clipPath={`url(#${id}-clip)`}>
          <g data-ball-panels stroke="#65706e" strokeWidth=".8" strokeLinejoin="round">
            <path d="M-7-25 18-18 24 7 3 24-20 8Z" fill="#14202a"/>
            <path d="M-42-42-17-51-7-25-26-15-49-21Z" fill="#14202a"/>
            <path d="M24-49 50-35 47-12 25-8 18-18Z" fill={`url(#${id}-bronze)`}/>
            <path d="M24 7 49 13 51 39 26 48 14 30Z" fill="#14202a"/>
            <path d="M3 24-4 51-31 48-36 26-20 8Z" fill="#14202a"/>
            <path d="M-49-4-34-1-30 17-50 31Z" fill={`url(#${id}-bronze)`}/>
            <path d="M-26-15-20 8M25-8 24 7M14 30 3 24M-36 26-30 17M-34-1-26-15M-17-51 7-42 24-49M7-42 18-18M47-12 54 0 49 13" fill="none"/>
          </g>
          <circle r="49" fill={`url(#${id}-shade)`}/>
          <ellipse cx="-15" cy="-27" rx="14" ry="6" fill="white" opacity=".24" transform="rotate(-28)"/>
        </g>
        <circle r="49" fill="none" stroke="white" strokeOpacity=".2"/>
      </g>
    </svg>
  </div>;
}
