import { stepSpring, type LensSpring } from './lens-physics';

const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
type Point = { x: number; y: number };

/** A compact, feathered cursor light reveals original colour and highlights type. */
export function attachHeroFlow(hero: HTMLElement, svg: SVGSVGElement) {
  const photo = hero.querySelector<HTMLElement>('.hero-photo-layer')!;
  const glow = svg.querySelector<SVGCircleElement>('[data-cursor-glow]')!;
  const clip = svg.querySelector<SVGRectElement>('[data-photo-clip]')!;
  const outside = svg.querySelector<SVGRectElement>('[data-outside-photo]')!;
  const image = svg.querySelector<SVGImageElement>('[data-color-photo]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let box = { x: 0, y: 0, w: 1, h: 1 }, width = 1, height = 1;
  let target: Point = { x: 0, y: 0 };
  let spring: LensSpring = { ...target, vx: 0, vy: 0 };
  let frame = 0, previous = 0, lastInteraction = 0;
  let visible = false, disposed = false, touching = false, active = false;
  const attr = (node: Element, values: Record<string, number>) => {
    for (const [key, value] of Object.entries(values)) node.setAttribute(key, value.toFixed(2));
  };
  function paint() {
    const radius = clamp(width * .09, 68, 120);
    attr(glow, { cx: spring.x, cy: spring.y, r: radius });
    // HTML copies share the originals' font/layout and scroll transforms.
    hero.style.setProperty('--cursor-glow-x', `${spring.x.toFixed(2)}px`);
    hero.style.setProperty('--cursor-glow-y', `${spring.y.toFixed(2)}px`);
    hero.style.setProperty('--cursor-glow-radius', `${radius.toFixed(2)}px`);
  }
  function reset() {
    target = { x: width * .58, y: height * .48 };
    spring = { ...target, vx: 0, vy: 0 }; paint();
  }
  function resize() {
    width = hero.clientWidth; height = hero.clientHeight;
    const style = getComputedStyle(photo);
    box = { x: parseFloat(style.left), y: parseFloat(style.top), w: parseFloat(style.width), h: parseFloat(style.height) };
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    attr(clip, { x: box.x, y: box.y, width: box.w, height: box.h, rx: radius, ry: radius });
    attr(outside, { x: box.x, y: box.y, width: box.w, height: box.h, rx: radius, ry: radius });
    const w = Math.max(box.w, box.h * 2 / 3), h = w * 1.5;
    attr(image, { x: box.x + (box.w - w) * .5, y: box.y + (box.h - h) * .75, width: w, height: h });
    reset();
  }
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const canRun = () => visible && !disposed && !document.hidden && !reduced.matches;
  function tick(now: number) {
    frame = 0;
    if (!canRun()) return;
    const dt = previous ? Math.min((now - previous) / 1000, .04) : 1 / 60;
    previous = now; spring = stepSpring(spring, target, dt); paint();
    if (now - lastInteraction < 1200 || Math.hypot(spring.vx, spring.vy) > 1) frame = requestAnimationFrame(tick);
    else previous = 0;
  }
  function wake() { if (!frame && canRun()) frame = requestAnimationFrame(tick); }
  function move(event: PointerEvent) {
    if (reduced.matches || (event.pointerType === 'touch' && !touching)) return;
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    hero.dataset.fluidActive = String(active);
    target = { x: clamp(x, 0, width), y: clamp(y, 0, height) };
    lastInteraction = performance.now(); hero.dataset.flowExplored = 'true'; wake();
  }
  function down(event: PointerEvent) { touching = event.pointerType === 'touch'; move(event); }
  function end(event: PointerEvent) { if (event.pointerType === 'touch') leave(); else touching = false; }
  function leave() { active = false; touching = false; hero.dataset.fluidActive = 'false'; }
  function preference() { stop(); reset(); hero.dataset.fluidActive = 'false'; }
  function visibility() { if (document.hidden) stop(); else { lastInteraction = performance.now(); wake(); } }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { lastInteraction = performance.now(); wake(); } else stop(); });
  const sizing = new ResizeObserver(resize);
  hero.dataset.fluidActive = 'false';
  resize(); observer.observe(hero); sizing.observe(hero); sizing.observe(photo);
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerdown', down, { passive: true });
  hero.addEventListener('pointerup', end, { passive: true });
  hero.addEventListener('pointercancel', end, { passive: true });
  hero.addEventListener('pointerleave', leave, { passive: true });
  reduced.addEventListener('change', preference);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    disposed = true; stop(); observer.disconnect(); sizing.disconnect();
    hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerdown', down);
    hero.removeEventListener('pointerup', end); hero.removeEventListener('pointercancel', end); hero.removeEventListener('pointerleave', leave);
    reduced.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility);
    delete hero.dataset.fluidActive; delete hero.dataset.flowExplored;
    for (const key of ['--cursor-glow-x', '--cursor-glow-y', '--cursor-glow-radius']) hero.style.removeProperty(key);
  };
}
