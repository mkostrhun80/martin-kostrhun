'use client';

import { useEffect, useId, useRef } from 'react';
import { gsap } from 'gsap';
import { clamp, ease, settleScroll, type Point } from '@/lib/traveller';

const range = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
type Scene = { element: HTMLElement; grid: HTMLElement; column: HTMLElement; dark: boolean };
type Popup = { kind: 'card' | 'photo' | 'text'; delay: number; played: boolean; animation?: gsap.core.Timeline };

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
      const ribbon = root.querySelector<SVGPathElement>('[data-section-ribbon]')!;
      const trace = root.querySelector<SVGPathElement>('[data-section-trace]')!;
      const glint = root.querySelector<SVGPathElement>('[data-section-glint]')!;
      const shadow = root.querySelector<SVGEllipseElement>('[data-section-shadow]')!;
      const dust = Array.from(root.querySelectorAll<SVGCircleElement>('[data-section-dust]'));
      const fragments = Array.from(root.querySelectorAll<SVGCircleElement>('[data-popup-fragment]'));
      const entries = new Map<HTMLElement, Popup>();
      const scenes: Scene[] = [];
      let disposed = false, frame = 0, previous = 0, renderedScroll = scrollY;
      let orbPosition: Point | null = null;
      let burst: { x: number; documentY: number; at: number; scene: Scene } | null = null;
      const mobile = () => innerWidth <= 760;

      function reveal(element: HTMLElement, kind: Popup['kind'], delay = 0) {
        // Observe the full, untransformed frame. Shrinking it beforehand would
        // postpone the trigger and disconnect the popup from the visible pearl.
        gsap.set(element, { opacity: 0 });
        entries.set(element, { kind, delay, played: false });
      }
      function finish(element: HTMLElement, popup: Popup) {
        popup.animation?.kill();
        popup.played = true;
        element.classList.remove('section-popup-target');
        element.style.removeProperty('--popup-seed-opacity');
        gsap.set(element, { clearProps: 'transform,transformOrigin,opacity,borderRadius' });
      }
      function originFor(element: HTMLElement): Point {
        if (burst && performance.now() - burst.at < 180) return { x: burst.x, y: burst.documentY - scrollY };
        if (orbPosition && orbPosition.y > 100 && orbPosition.y < innerHeight - 45) return orbPosition;
        const scene = scenes.find(item => item.element.contains(element));
        const rect = element.getBoundingClientRect();
        const gap = scene ? parseFloat(getComputedStyle(scene.grid).columnGap) || 60 : 60;
        return {
          x: scene && !mobile() ? scene.column.getBoundingClientRect().left - gap / 2 : Math.min(innerWidth - 38, rect.left + rect.width * .55),
          y: Math.max(115, Math.min(innerHeight - 65, rect.top + rect.height * .65)),
        };
      }
      function play(element: HTMLElement, popup: Popup, origin: Point, stagger: number) {
        if (popup.played) return;
        popup.played = true;
        const rect = element.getBoundingClientRect();
        const timeline = gsap.timeline({ onUpdate: wake, onComplete: () => finish(element, popup) });
        popup.animation = timeline;
        if (popup.kind === 'text') {
          timeline.fromTo(element, { opacity: 0, y: 42, scale: .48, rotation: -2, transformOrigin: '0% 80%' },
            { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.45, ease: 'back.out(1.15)' }, popup.delay);
          return;
        }
        const scene = scenes.find(item => item.element.contains(element));
        if (scene) burst = { x: origin.x, documentY: origin.y + scrollY, at: performance.now(), scene };
        const diameter = mobile() ? 34 : 58;
        const radius = getComputedStyle(element).borderRadius;
        const delay = .08 + stagger * .18;
        element.classList.add('section-popup-target');
        timeline.fromTo(element, {
          opacity: 1,
          x: origin.x - rect.left - rect.width / 2,
          y: origin.y - rect.top - rect.height / 2,
          scaleX: diameter / Math.max(1, rect.width),
          scaleY: diameter / Math.max(1, rect.height),
          rotation: 0, rotationX: 0, rotationY: 0,
          borderRadius: '50%', transformOrigin: '50% 50%', transformPerspective: 1200,
          '--popup-seed-opacity': 1,
        }, {
          x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: radius,
          duration: popup.kind === 'photo' ? 1.95 : 1.75, ease: 'back.out(1.25)',
        }, delay);
        timeline.to(element, { '--popup-seed-opacity': 0, duration: .68, ease: 'power2.out' }, delay + .22);
        timeline.to(element, { rotationX: popup.kind === 'photo' ? -15 : 34, rotationY: stagger % 2 ? -18 : 18,
          rotation: stagger % 2 ? 7 : -7, duration: .32, ease: 'power2.out' }, delay + .04);
        timeline.to(element, { rotationX: 0, rotationY: 0, rotation: 0, duration: 1.25, ease: 'back.out(1.1)' }, delay + .36);
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
        let stagger = 0;
        let origin: Point | null = null;
        changes.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const popup = entries.get(element)!;
          if (popup.kind !== 'text') origin ??= originFor(element);
          play(element, popup, origin ?? originFor(element), popup.kind === 'text' ? 0 : stagger++);
          observer.unobserve(entry.target);
        });
        wake();
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      entries.forEach((_, element) => observer.observe(element));
      const focus = (event: FocusEvent) => {
        if (!(event.target instanceof Node)) return;
        const target = event.target;
        entries.forEach((popup, element) => {
          if (element.contains(target)) { finish(element, popup); observer.unobserve(element); }
        });
      };

      function draw() {
        const height = innerHeight, width = innerWidth, actual = scrollY;
        const burstProgress = burst ? range(performance.now() - burst.at, 0, 1100) : 1;
        const candidates = scenes.map(scene => {
          const rect = scene.element.getBoundingClientRect();
          const visible = Math.max(0, Math.min(height, rect.bottom) - Math.max(90, rect.top));
          return { scene, rect, visible };
        }).sort((a, b) => b.visible - a.visible);
        const active = burst && burstProgress < .8 ? candidates.find(item => item.scene === burst!.scene) : candidates[0];
        if (!active || (active.visible < height * .4 && burstProgress >= 1)) { root!.style.visibility = 'hidden'; orbPosition = null; return; }
        const { scene, rect } = active;
        const progress = clamp((height - rect.top - actual + renderedScroll) / (height + rect.height));
        const presence = Math.max(ease(range(active.visible / height, .4, .75))
          * ease(range(progress, .04, .18)) * (1 - ease(range(progress, .82, .96))),
          1 - ease(range(burstProgress, .65, 1)));
        if (presence < .002) { root!.style.visibility = 'hidden'; return; }
        root!.style.visibility = 'visible';
        root!.style.opacity = String(presence);
        root!.dataset.surface = scene.dark ? 'dark' : 'light';
        const marginTop = Math.max(mobile() ? 78 : 94, rect.top);
        root!.style.clipPath = `inset(${Math.max(0, marginTop)}px 0 ${Math.max(0, height - rect.bottom)}px 0)`;
        const column = scene.column.getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(scene.grid).columnGap) || 60;
        const size = mobile() ? 30 : Math.max(34, Math.min(64, gap * .55));
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
        const emission = 1 - ease(range(burstProgress, .22, .8));
        if (burst && emission > 0) {
          current.x += (burst.x - current.x) * emission;
          current.y += (burst.documentY - actual - current.y) * emission;
        }
        orbPosition = { ...current };
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
        ball.style.opacity = String(1 - Math.sin(burstProgress * Math.PI) * .7);
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
        fragments.forEach((fragment, i) => {
          const angle = i * 2.399;
          const spread = ease(burstProgress) * (mobile() ? 66 : 120);
          fragment.setAttribute('cx', String((burst?.x ?? current.x) + Math.cos(angle) * spread));
          fragment.setAttribute('cy', String((burst ? burst.documentY - actual : current.y) + Math.sin(angle) * spread - burstProgress * 40));
          fragment.setAttribute('r', String((mobile() ? 6 : 11) * (1 - i % 3 * .2) * Math.sin(burstProgress * Math.PI)));
          fragment.style.opacity = String(1 - ease(range(burstProgress, .55, 1)));
        });
      }
      function tick(now: number) {
        frame = 0;
        if (disposed || document.hidden) return;
        const dt = previous ? Math.min(.05, (now - previous) / 1000) : 1 / 60;
        previous = now;
        renderedScroll = Math.abs(scrollY - renderedScroll) > innerHeight ? scrollY : settleScroll(renderedScroll, scrollY, dt * .55, mobile());
        draw();
        if (Math.abs(scrollY - renderedScroll) > .25 || (burst && now - burst.at < 1100)) frame = requestAnimationFrame(tick);
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
        entries.forEach((popup, element) => finish(element, popup));
        root!.style.visibility = 'hidden';
      };
    });
    return () => media.revert();
  }, []);

  return <div ref={ref} className="section-motion-layer" aria-hidden="true">
    <svg className="section-motion-canvas" focusable="false">
      <defs>
        <radialGradient id={`${id}-shell`} cx="29%" cy="23%" r="80%"><stop stopColor="#f0dfc4"/><stop offset=".43" stopColor="var(--light-brown)"/><stop offset=".82" stopColor="#907252"/><stop offset="1" stopColor="#70533f"/></radialGradient>
        <filter id={`${id}-soft-shadow`} x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <path data-section-ribbon className="section-ball-ribbon"/>
      <path data-section-trace className="section-ball-trace" fill="none" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
      <path data-section-glint className="section-ball-glint" fill="none" strokeWidth="3" strokeLinecap="round"/>
      <ellipse data-section-shadow fill="#0c1825" filter={`url(#${id}-soft-shadow)`}/>
      {Array.from({ length: 5 }, (_, i) => <circle key={i} data-section-dust className="section-ball-dust"/>)}
      {Array.from({ length: 9 }, (_, i) => <circle key={i} data-popup-fragment fill={`url(#${id}-shell)`}/>)}
      <g data-section-ball>
        <circle r="49" fill={`url(#${id}-shell)`}/>
      </g>
    </svg>
  </div>;
}
