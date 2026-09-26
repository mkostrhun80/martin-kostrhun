import { clamp, coveringRadius, initialLens, lensTarget, lensWord, LENS_TRANSITION_MS, stepSpring, transitionFrame, type LensPoint, type LensSpring } from './lens-physics';

export type LensPhase = 'exploring' | 'expanding' | 'settled' | 'reduced';
type Phase = LensPhase;

/** DOM animation controller. React only receives phase changes, never animation frames. */
export function attachPurpleLens(hero: HTMLElement, button: HTMLButtonElement, label: HTMLElement | null, onPhaseChange: (phase: LensPhase) => void) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let currentPhase: Phase = 'exploring';
  let frame = 0, lastTime = 0, transitionStart = 0;
  let width = hero.clientWidth, height = hero.clientHeight;
  let origin = initialLens(width, height);
  let spring: LensSpring = { ...origin, vx: 0, vy: 0 };
  let target: LensPoint = { ...origin };
  let radius = origin.radius;
  let transitionRadius = radius;
  let pageVisible = !document.hidden;
  let onScreen = true;
  let touchId: number | null = null;
  let pointerStart: LensPoint | null = null;
  let dragged = false;
  let interacted = false;
  let focusAfter = false;
  let word = '';

  const set = (name: string, value: string) => hero.style.setProperty(name, value);
  const changePhase = (next: Phase) => { currentPhase = next; hero.dataset.lensPhase = next; onPhaseChange(next); };
  const cancelFrame = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const markExplored = () => { if (!interacted) { interacted = true; hero.dataset.lensExplored = 'true'; } };

  function paint(rx = radius, ry = radius) {
    set('--lens-x', `${spring.x.toFixed(2)}px`);
    set('--lens-y', `${spring.y.toFixed(2)}px`);
    set('--lens-rx', `${rx.toFixed(2)}px`);
    set('--lens-ry', `${ry.toFixed(2)}px`);
    const nextWord = lensWord(spring, width, height);
    if (label && word !== nextWord) { label.textContent = nextWord; word = nextWord; }
    // Optical offset is capped; the content stays registered with the base photograph.
    const fine = width > 760 && !media.matches;
    set('--lens-offset-x', `${fine ? clamp(spring.vx * -0.005, -5, 5).toFixed(2) : 0}px`);
    set('--lens-offset-y', `${fine ? clamp(spring.vy * -0.005, -4, 4).toFixed(2) : 0}px`);
    set('--hero-parallax-x', `${fine ? ((spring.x / width - 0.5) * 5).toFixed(2) : 0}px`);
    set('--hero-parallax-y', `${fine ? ((spring.y / height - 0.5) * 4).toFixed(2) : 0}px`);
  }

  function finish() {
    cancelFrame();
    set('--portal-depth', '0');
    set('--portal-opacity', '0');
    set('--portal-wash', '0');
    set('--hero-parallax-x', '0px');
    set('--hero-parallax-y', '0px');
    changePhase(media.matches ? 'reduced' : 'settled');
    if (focusAfter && (document.activeElement === button || document.activeElement === document.body)) {
      // Preserve keyboard position when the optional lens control disappears.
      hero.querySelector<HTMLAnchorElement>('.hero-note a')?.focus({ preventScroll: true });
    }
    focusAfter = false;
  }

  function tick(now: number) {
    frame = 0;
    if (!pageVisible || !onScreen || media.matches) return;
    if (currentPhase === 'expanding') {
      if (!transitionStart) transitionStart = now;
      const p = clamp((now - transitionStart) / LENS_TRANSITION_MS, 0, 1);
      const motion = transitionFrame(p);
      const r = radius + (transitionRadius - radius) * motion.expansion;
      paint(r, r);
      set('--portal-opacity', motion.opacity.toFixed(4));
      set('--portal-wash', motion.wash.toFixed(4));
      set('--portal-depth', motion.depth.toFixed(4));
      set('--lens-rim-opacity', motion.rim.toFixed(4));
      if (p >= 1) { finish(); return; }
      frame = requestAnimationFrame(tick);
      return;
    }
    if (currentPhase !== 'exploring') return;
    const dt = lastTime ? (now - lastTime) / 1000 : 1 / 60;
    lastTime = now;
    spring = stepSpring(spring, target, dt);
    const stretch = width > 760 ? clamp((Math.abs(spring.vx) - Math.abs(spring.vy)) / 17000, -0.035, 0.035) : 0;
    paint(radius * (1 + stretch), radius * (1 - stretch));
    const atRest = Math.hypot(target.x - spring.x, target.y - spring.y) < 0.08 && Math.hypot(spring.vx, spring.vy) < 0.35;
    if (atRest) { spring = { ...target, vx: 0, vy: 0 }; paint(); lastTime = 0; return; }
    frame = requestAnimationFrame(tick);
  }

  function wake() { if (!frame && currentPhase === 'exploring' && onScreen && pageVisible && !media.matches) frame = requestAnimationFrame(tick); }
  function expand() {
    if (currentPhase !== 'exploring' || media.matches || !onScreen) return;
    focusAfter = document.activeElement === button;
    markExplored();
    cancelFrame();
    transitionStart = 0;
    spring.vx = 0; spring.vy = 0;
    transitionRadius = coveringRadius(spring, width, height);
    changePhase('expanding');
    frame = requestAnimationFrame(tick);
  }
  function pointerMove(event: PointerEvent) {
    if (currentPhase !== 'exploring' || media.matches) return;
    if (event.pointerType === 'touch' && touchId !== event.pointerId) return;
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) dragged = true;
    markExplored();
    target = lensTarget(event.clientX, event.clientY, hero.getBoundingClientRect(), radius);
    wake();
  }
  function pointerDown(event: PointerEvent) {
    if (currentPhase !== 'exploring' || media.matches || event.button !== 0) return;
    dragged = false;
    pointerStart = { x: event.clientX, y: event.clientY };
    if (event.pointerType === 'touch') {
      if ((event.target as Element).closest('a') || ((event.target as Element).closest('button') && !(event.target as Element).closest('.lens-hit'))) return;
      touchId = event.pointerId;
      markExplored();
      target = lensTarget(event.clientX, event.clientY, hero.getBoundingClientRect(), radius);
      wake();
    }
  }
  function pointerEnd() { touchId = null; pointerStart = null; }
  function pointerLeave(event: PointerEvent) {
    if (event.pointerType === 'touch' || currentPhase !== 'exploring' || media.matches) return;
    target = { x: origin.x, y: origin.y }; wake();
  }
  function click(event: MouseEvent) {
    if (dragged && event.detail !== 0) { dragged = false; return; }
    expand();
  }
  function focus() {
    if (currentPhase !== 'exploring' || media.matches) return;
    // Stop the moving hit target while the user is navigating by keyboard.
    target = { x: spring.x, y: spring.y }; markExplored();
  }
  function scroll() {
    if (currentPhase === 'exploring' && hero.getBoundingClientRect().top < -8) expand();
  }
  function resize() {
    width = hero.clientWidth; height = hero.clientHeight;
    origin = initialLens(width, height); radius = origin.radius;
    if (currentPhase === 'expanding') { finish(); return; }
    spring = { ...origin, vx: 0, vy: 0 }; target = { ...origin }; paint();
  }
  function preferenceChanged() {
    cancelFrame();
    if (media.matches) {
      changePhase('reduced');
      set('--portal-depth', '0'); set('--portal-opacity', '1'); set('--portal-wash', '0'); set('--lens-rim-opacity', '1');
      resize();
    } else {
      changePhase('exploring');
      set('--portal-opacity', '1'); set('--lens-rim-opacity', '1');
      resize();
      if (hero.getBoundingClientRect().top < -8) finish();
    }
  }
  function visibilityChanged() {
    pageVisible = !document.hidden;
    if (!pageVisible) { if (currentPhase === 'expanding') finish(); else cancelFrame(); }
    else wake();
  }

  paint();
  if (media.matches) changePhase('reduced');
  else if (hero.getBoundingClientRect().top < -8) finish();
  const intersection = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (!onScreen) { if (currentPhase === 'expanding') finish(); else cancelFrame(); }
    else wake();
  });
  intersection.observe(hero);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(hero);
  hero.addEventListener('pointermove', pointerMove, { passive: true });
  hero.addEventListener('pointerdown', pointerDown, { passive: true });
  hero.addEventListener('pointerup', pointerEnd, { passive: true });
  hero.addEventListener('pointercancel', pointerEnd, { passive: true });
  hero.addEventListener('pointerleave', pointerLeave, { passive: true });
  button.addEventListener('click', click);
  button.addEventListener('focus', focus);
  window.addEventListener('scroll', scroll, { passive: true });
  document.addEventListener('visibilitychange', visibilityChanged);
  media.addEventListener('change', preferenceChanged);
  return () => {
    cancelFrame(); intersection.disconnect(); sizeObserver.disconnect();
    hero.removeEventListener('pointermove', pointerMove); hero.removeEventListener('pointerdown', pointerDown);
    hero.removeEventListener('pointerup', pointerEnd); hero.removeEventListener('pointercancel', pointerEnd);
    hero.removeEventListener('pointerleave', pointerLeave);
    button.removeEventListener('click', click); button.removeEventListener('focus', focus);
    window.removeEventListener('scroll', scroll); document.removeEventListener('visibilitychange', visibilityChanged);
    media.removeEventListener('change', preferenceChanged);
  };
}
