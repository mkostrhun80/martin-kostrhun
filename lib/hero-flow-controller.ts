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
  const nameCopies = [...svg.querySelectorAll<SVGTextElement>('[data-fluid-name]')];
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
    attr(glow, { cx: spring.x, cy: spring.y, r: clamp(width * .055, 42, 72) });
  }
  function reset() {
    target = { x: width * .58, y: height * .48 };
    spring = { ...target, vx: 0, vy: 0 }; paint();
  }
  function alignNames() {
    const origin = hero.getBoundingClientRect();
    nameCopies.forEach(copy => {
      const source = hero.querySelector<HTMLElement>(copy.dataset.fluidName === 'back' ? '.hero-artwork > .hero-name-back' : '.hero-artwork > .hero-name-front')!;
      const style = getComputedStyle(source);
      // A text range includes font ascenders/descenders, unlike the compressed
      // CSS line box used by the large display names.
      const range = document.createRange();
      range.selectNodeContents(source);
      const bounds = range.getBoundingClientRect();
      copy.style.fontFamily = style.fontFamily; copy.style.fontSize = style.fontSize;
      copy.style.fontWeight = style.fontWeight; copy.style.letterSpacing = style.letterSpacing;
      copy.setAttribute('x', '0'); copy.setAttribute('y', '0'); copy.removeAttribute('textLength');
      const ink = copy.getBBox();
      attr(copy, { x: bounds.left - origin.left - ink.x, y: bounds.top - origin.top - ink.y });
      copy.setAttribute('textLength', bounds.width.toFixed(2)); copy.setAttribute('lengthAdjust', 'spacing');
    });
  }
  function resize() {
    width = hero.clientWidth; height = hero.clientHeight;
    const style = getComputedStyle(photo);
    box = { x: parseFloat(style.left), y: parseFloat(style.top), w: parseFloat(style.width), h: parseFloat(style.height) };
    attr(clip, { x: box.x, y: box.y, width: box.w, height: box.h });
    attr(outside, { x: box.x, y: box.y, width: box.w, height: box.h });
    const w = Math.max(box.w, box.h * 2 / 3), h = w * 1.5;
    attr(image, { x: box.x + (box.w - w) * .5, y: box.y + (box.h - h) * .75, width: w, height: h });
    alignNames(); reset();
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
  // Font loading can change both the mask text and its alignment.
  document.fonts.ready.then(() => { if (!disposed) alignNames(); });
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
  };
}
