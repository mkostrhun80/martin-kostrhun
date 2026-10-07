const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
const profiles = [
  { radius: 1, spring: 360, damping: 32, x: 0, y: 0 },
  { radius: .76, spring: 210, damping: 25, x: -.72, y: -.52 },
  { radius: .63, spring: 140, damping: 22, x: .82, y: .48 },
  { radius: .52, spring: 95, damping: 18, x: -.95, y: .66 },
  { radius: .43, spring: 75, damping: 16, x: .44, y: -.95 },
];

/** Five independent springs feed an alpha-threshold SVG metaball mask. */
export function attachHeroFlow(hero: HTMLElement, svg: SVGSVGElement) {
  const photo = hero.querySelector<HTMLElement>('.hero-photo-layer')!;
  const nodes = [...svg.querySelectorAll<SVGEllipseElement>('[data-metaball]')];
  const clip = svg.querySelector<SVGRectElement>('[data-photo-clip]')!;
  const outside = svg.querySelector<SVGRectElement>('[data-outside-photo]')!;
  const image = svg.querySelector<SVGImageElement>('[data-color-photo]')!;
  const nameCopies = [...svg.querySelectorAll<SVGTextElement>('[data-fluid-name]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let box = { x: 0, y: 0, w: 1, h: 1 }, radius = 60;
  let target = { x: 0, y: 0 }, last = { x: 0, y: 0, time: 0 };
  const balls = profiles.map(p => ({ ...p, cx: 0, cy: 0, vx: 0, vy: 0 }));
  let cursorSpeed = 0, angle = 0, frame = 0, previous = 0, time = 0;
  let visible = false, disposed = false, touching = false, active = false, initialized = false;
  let lastInteraction = 0;
  const attr = (node: Element, values: Record<string, number>) => {
    for (const [key, value] of Object.entries(values)) node.setAttribute(key, value.toFixed(2));
  };
  function paint() {
    balls.forEach((ball, i) => {
      const speed = clamp(Math.hypot(ball.vx, ball.vy) / 1300, 0, 1);
      const r = radius * ball.radius;
      attr(nodes[i], { cx: ball.cx, cy: ball.cy,
        rx: r * (1 + speed * .55 + .06 * Math.sin(time * 1.1 + i * 1.8)),
        ry: r * (1 - speed * .22 + .08 * Math.cos(time * .8 + i * 2.3)) });
      nodes[i].setAttribute('transform', `rotate(${angle * 180 / Math.PI + i * 19} ${ball.cx} ${ball.cy})`);
    });
  }
  function reset() {
    target = { x: box.x + box.w * .58, y: box.y + box.h * .43 };
    balls.forEach(ball => { ball.cx = target.x + ball.x * radius; ball.cy = target.y + ball.y * radius; ball.vx = ball.vy = 0; });
    cursorSpeed = 0; last.time = 0; paint();
  }
  function alignNames() {
    const origin = hero.getBoundingClientRect();
    nameCopies.forEach(copy => {
      const source = hero.querySelector<HTMLElement>(copy.dataset.fluidName === 'back' ? '.hero-artwork > .hero-name-back' : '.hero-artwork > .hero-name-front')!;
      const style = getComputedStyle(source);
      const bounds = source.getBoundingClientRect();
      copy.style.fontFamily = style.fontFamily;
      copy.style.fontSize = style.fontSize;
      copy.style.fontWeight = style.fontWeight;
      copy.style.letterSpacing = style.letterSpacing;
      copy.setAttribute('x', '0');
      copy.setAttribute('y', '0');
      copy.removeAttribute('textLength');
      const ink = copy.getBBox();
      attr(copy, { x: bounds.left - origin.left - ink.x, y: bounds.top - origin.top - ink.y });
      copy.setAttribute('textLength', bounds.width.toFixed(2));
      copy.setAttribute('lengthAdjust', 'spacing');
    });
  }
  function resize() {
    // Layout offsets exclude the portrait's introductory translate animation.
    const style = getComputedStyle(photo);
    box = { x: parseFloat(style.left), y: parseFloat(style.top), w: parseFloat(style.width), h: parseFloat(style.height) };
    radius = clamp(box.w * .145, 36, 86);
    attr(clip, { x: box.x, y: box.y, width: box.w, height: box.h });
    attr(outside, { x: box.x, y: box.y, width: box.w, height: box.h });
    // Match CSS cover at object-position 50% 75%, including its exact crop.
    const w = Math.max(box.w, box.h * 2 / 3), h = w * 1.5;
    attr(image, { x: box.x + (box.w - w) * .5, y: box.y + (box.h - h) * .75, width: w, height: h });
    alignNames();
    if (!initialized || !active) reset();
    initialized = true;
  }
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const canRun = () => visible && !disposed && !document.hidden && !reduced.matches;
  function tick(now: number) {
    frame = 0;
    if (!canRun()) return;
    const dt = previous ? Math.min((now - previous) / 1000, .04) : 1 / 60;
    previous = now; time += dt;
    cursorSpeed *= Math.exp(-dt * 7);
    const spread = 1 + clamp(cursorSpeed / 1500, 0, 1) * 2.2;
    const count = Math.ceil(dt / .006), step = dt / count;
    for (let n = 0; n < count; n++) balls.forEach(ball => {
      const tx = target.x + ball.x * radius * spread;
      const ty = target.y + ball.y * radius * spread;
      ball.vx += ((tx - ball.cx) * ball.spring - ball.vx * ball.damping) * step;
      ball.vy += ((ty - ball.cy) * ball.spring - ball.vy * ball.damping) * step;
      ball.cx += ball.vx * step; ball.cy += ball.vy * step;
    });
    paint();
    // Stop completely at rest; wake on input. No perpetual background render loop.
    if (now - lastInteraction < 900 || balls.some(b => Math.abs(b.vx) + Math.abs(b.vy) > 1)) frame = requestAnimationFrame(tick);
    else previous = 0;
  }
  function wake() { if (!frame && canRun()) frame = requestAnimationFrame(tick); }
  function move(event: PointerEvent) {
    if (reduced.matches || (event.pointerType === 'touch' && !touching)) return;
    const rect = hero.getBoundingClientRect(), now = performance.now();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    hero.dataset.fluidActive = String(active);
    if (last.time) {
      const dt = Math.max((now - last.time) / 1000, .008);
      cursorSpeed = Math.min(3500, Math.hypot(x - last.x, y - last.y) / dt);
      angle = Math.atan2(y - last.y, x - last.x);
    }
    target = { x: clamp(x, 0, rect.width), y: clamp(y, 0, rect.height) };
    last = { x, y, time: now }; lastInteraction = now;
    hero.dataset.flowExplored = 'true'; wake();
  }
  function down(event: PointerEvent) { touching = event.pointerType === 'touch'; move(event); }
  function end() { touching = false; }
  function leave() { active = false; touching = false; hero.dataset.fluidActive = 'false'; last.time = 0; lastInteraction = performance.now(); wake(); }
  function preference() { stop(); reset(); hero.dataset.fluidActive = 'false'; }
  function visibility() { if (document.hidden) stop(); else { lastInteraction = performance.now(); wake(); } }
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { lastInteraction = performance.now(); wake(); } else stop(); });
  const sizing = new ResizeObserver(resize);
  resize(); observer.observe(hero); sizing.observe(hero); sizing.observe(photo);
  hero.addEventListener('pointermove', move, { passive: true });
  hero.addEventListener('pointerdown', down, { passive: true });
  hero.addEventListener('pointerup', end, { passive: true });
  hero.addEventListener('pointercancel', end, { passive: true });
  hero.addEventListener('pointerleave', leave, { passive: true });
  reduced.addEventListener('change', preference); coarse.addEventListener('change', preference);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    disposed = true; stop(); observer.disconnect(); sizing.disconnect();
    hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerdown', down);
    hero.removeEventListener('pointerup', end); hero.removeEventListener('pointercancel', end); hero.removeEventListener('pointerleave', leave);
    reduced.removeEventListener('change', preference); coarse.removeEventListener('change', preference);
    document.removeEventListener('visibilitychange', visibility);
    delete hero.dataset.fluidActive; delete hero.dataset.flowExplored;
  };
}
