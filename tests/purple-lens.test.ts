import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attachPurpleLens, type LensPhase } from '../lib/purple-lens-controller';
import { coveringRadius, initialLens, stepSpring, transitionFrame } from '../lib/lens-physics';

/** Test the actual DOM controller with deterministic browser event/clock adapters.
 * This complements the real-browser mouse, keyboard, scroll and layout checks.
 */
function environment({ width = 1440, height = 960, reduced = false } = {}) {
  let scroll = 0, now = 0, id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const media = Object.assign(new EventTarget(), { matches: reduced });
  const doc = Object.assign(new EventTarget(), { hidden: false, activeElement: null as unknown, body: {} });
  const win = new EventTarget();
  const values = new Map<string, string>();
  const cta = { focus: () => { doc.activeElement = cta; } };
  const hero = Object.assign(new EventTarget(), {
    clientWidth: width, clientHeight: height,
    dataset: { lensPhase: 'exploring', lensExplored: '' },
    style: { setProperty: (key: string, value: string) => values.set(key, value) },
    getBoundingClientRect: () => ({ width, height, top: -scroll, left: 0, bottom: height - scroll, right: width }),
    closest: () => null,
    querySelector: () => cta,
  });
  const button = Object.assign(new EventTarget(), { closest: () => button });
  const label = { textContent: '' };
  let intersection: (entries: { isIntersecting: boolean }[]) => void = () => {};
  const globals: Record<string, unknown> = {
    matchMedia: () => media, window: win, document: doc,
    requestAnimationFrame: (fn: FrameRequestCallback) => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: (key: number) => frames.delete(key),
    IntersectionObserver: class { constructor(fn: typeof intersection) { intersection = fn; } observe() { intersection([{ isIntersecting: true }]); } disconnect() {} },
    ResizeObserver: class { constructor(private fn: () => void) {} observe() { this.fn(); } disconnect() {} },
  };
  const saved = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const phases: LensPhase[] = [];
  const detach = attachPurpleLens(hero as unknown as HTMLElement, button as unknown as HTMLButtonElement, label as HTMLElement, phase => phases.push(phase));
  const point = () => ({ x: parseFloat(values.get('--lens-x')!), y: parseFloat(values.get('--lens-y')!) });
  function advance(count = 1, fps = 60) {
    for (let i = 0; i < count; i++) { now += 1000 / fps; const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(now); }
  }
  function pointer(type: string, x: number, y: number, pointerType = 'mouse', pointerId = 1) {
    const event = Object.assign(new Event(type, { cancelable: true }), { clientX: x, clientY: y, pointerType, pointerId, button: 0 });
    hero.dispatchEvent(event); return event;
  }
  function click(detail = 1) { button.dispatchEvent(Object.assign(new Event('click'), { detail })); }
  return { hero, button, label, doc, values, phases, point, frames, advance, pointer, click,
    scroll(y: number) { scroll = y; const event = new Event('scroll', { cancelable: true }); win.dispatchEvent(event); return event; },
    visibility(onScreen: boolean) { intersection([{ isIntersecting: onScreen }]); },
    motion(reduce: boolean) { media.matches = reduce; media.dispatchEvent(new Event('change')); },
    cleanup() { detach(); for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); } },
    detach,
  };
}

test('spring follows with inertia and then stops requesting frames', () => {
  const e = environment();
  try {
    e.advance(3); assert.equal(e.frames.size, 0);
    const before = e.point(); e.pointer('pointermove', 350, 400); e.advance();
    assert.ok(e.point().x < before.x && e.point().x > 350, 'not attached 1:1 to the cursor');
    assert.equal(e.hero.dataset.lensExplored, 'true');
    e.advance(180); assert.ok(Math.abs(e.point().x - 350) < .1); assert.equal(e.frames.size, 0);
    assert.equal(e.label.textContent, 'PLÁN');
  } finally { e.cleanup(); }
});

test('spring is stable and time-based at 30, 60 and 120 Hz', () => {
  const positions = [30, 60, 120].map(fps => {
    let p = { x: 0, y: 0, vx: 0, vy: 0 };
    for (let i = 0; i < fps * 2; i++) p = stepSpring(p, { x: 900, y: 650 }, 1 / fps);
    assert.ok(Number.isFinite(p.x) && Math.abs(p.x - 900) < .1); return p.x;
  });
  assert.ok(Math.max(...positions) - Math.min(...positions) < .05);
});

test('touch drag uses pointer id, keeps native scrolling, and does not accidentally activate', () => {
  const e = environment({ width: 390, height: 844 });
  try {
    e.advance(3); const initial = e.point();
    e.pointer('pointermove', 90, 330, 'touch', 9); e.advance(3); assert.deepEqual(e.point(), initial);
    const down = e.pointer('pointerdown', 250, 420, 'touch', 7);
    const move = e.pointer('pointermove', 140, 420, 'touch', 7);
    assert.equal(down.defaultPrevented, false); assert.equal(move.defaultPrevented, false);
    e.advance(120); assert.ok(Math.abs(e.point().x - 140) < .1);
    e.pointer('pointerup', 140, 420, 'touch', 7); e.click();
    assert.equal(e.hero.dataset.lensPhase, 'exploring');
    e.pointer('pointerdown', 140, 420, 'touch', 8); e.pointer('pointerup', 140, 420, 'touch', 8); e.click();
    assert.equal(e.hero.dataset.lensPhase, 'expanding');
    e.advance(51); assert.equal(e.hero.dataset.lensPhase, 'settled'); assert.equal(e.frames.size, 0);
  } finally { e.cleanup(); }
});

test('native scroll initiates one transition, with no scroll cancellation or forced progress', () => {
  const e = environment();
  try {
    const event = e.scroll(24); assert.equal(event.defaultPrevented, false);
    assert.equal(e.hero.dataset.lensPhase, 'expanding');
    e.advance(20); assert.ok(parseFloat(e.values.get('--lens-rx')!) > initialLens(1440, 960).radius);
    assert.ok(parseFloat(e.values.get('--portal-wash')!) > 0);
    e.advance(31); assert.equal(e.hero.dataset.lensPhase, 'settled');
    e.scroll(200); e.scroll(0); assert.equal(e.frames.size, 0);
  } finally { e.cleanup(); }
});

test('keyboard activation finishes in 800ms and preserves useful focus', () => {
  const e = environment();
  try {
    e.doc.activeElement = e.button; e.click(0); e.advance(51);
    assert.equal(e.hero.dataset.lensPhase, 'settled'); assert.notEqual(e.doc.activeElement, e.button);
    assert.equal(e.values.get('--portal-opacity'), '0');
  } finally { e.cleanup(); }
});

test('reduced motion is static on initial load and responds to preference changes', () => {
  const e = environment({ reduced: true });
  try {
    const initial = e.point(); e.pointer('pointermove', 150, 600); e.click(); e.advance(120);
    assert.equal(e.hero.dataset.lensPhase, 'reduced'); assert.deepEqual(e.point(), initial); assert.equal(e.frames.size, 0);
    e.motion(false); assert.equal(e.hero.dataset.lensPhase, 'exploring'); e.click(); e.advance(15);
    e.motion(true); assert.equal(e.hero.dataset.lensPhase, 'reduced'); assert.equal(e.frames.size, 0);
    assert.equal(e.values.get('--portal-depth'), '0'); assert.equal(e.values.get('--portal-opacity'), '1');
  } finally { e.cleanup(); }
});

test('offscreen and detached controllers do not keep animating', () => {
  const e = environment();
  try {
    e.click(); e.advance(10); e.visibility(false);
    assert.equal(e.frames.size, 0); assert.equal(e.hero.dataset.lensPhase, 'settled');
    e.visibility(true); assert.equal(e.frames.size, 0);
    e.detach(); e.pointer('pointermove', 100, 300); e.scroll(50); assert.equal(e.frames.size, 0);
  } finally { e.cleanup(); }
});

test('expanded mask covers every hero corner and ends without residual transforms', () => {
  for (const [width, height] of [[320,740],[390,844],[768,1024],[1440,960]]) {
    const origin = initialLens(width,height), radius = coveringRadius(origin,width,height);
    for (const [x,y] of [[0,0],[width,0],[0,height],[width,height]]) assert.ok(radius >= Math.hypot(x-origin.x,y-origin.y));
  }
  assert.equal(transitionFrame(1).opacity,0); assert.ok(transitionFrame(1).depth < 1e-10);
});
