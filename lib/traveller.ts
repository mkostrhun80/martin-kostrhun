export type Point = { x: number; y: number };
export type Frame = { left: number; top: number; width: number; height: number };
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function bezier(t: number, a: Point, b: Point, c: Point, d: Point): Point {
  const p = clamp(t), q = 1 - p;
  return { x: q ** 3 * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p ** 3 * d.x,
    y: q ** 3 * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p ** 3 * d.y };
}

/** One quiet arc through the gap above the next photograph, never the links. */
export function travelPoint(progress: number, width: number, indexTop: number, indexBottom: number, target: Point): Point {
  const mobile = width <= 760;
  const start = { x: width * (mobile ? .58 : .62), y: indexTop - (mobile ? 90 : 120) };
  const distance = Math.max(0, Math.min(indexBottom, target.y) - start.y);
  return bezier(progress, start,
    { x: start.x, y: start.y + distance * .38 },
    { x: target.x + Math.min(width * .08, 100), y: target.y - distance * .2 }, target);
}

/** Exact, reversible endpoints; object-fit crops the photos without stretching. */
export function photoFrame(a: Frame, b: Frame, progress: number, expanding = false, photoRadius = 28) {
  const t = ease(progress), width = a.width + (b.width - a.width) * t, height = a.height + (b.height - a.height) * t;
  const half = Math.min(width, height) / 2;
  return { left: a.left + (b.left - a.left) * t, top: a.top + (b.top - a.top) * t, width, height,
    radius: Math.min(half, expanding ? 7 + (photoRadius - 7) * t : photoRadius + (half - photoRadius) * t) };
}

export function sampleRoute(fn: (p: number) => Point) {
  const points = [{ ...fn(0), distance: 0 }];
  let length = 0;
  for (let i = 1; i <= 200; i++) {
    const point = fn(i / 200), last = points[i - 1];
    length += Math.hypot(point.x - last.x, point.y - last.y);
    points.push({ ...point, distance: length });
  }
  return { points, length };
}

export function routePoint(route: ReturnType<typeof sampleRoute>, distance: number): Point {
  const d = Math.max(0, Math.min(route.length, distance));
  let lo = 0, hi = route.points.length - 1;
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (route.points[mid].distance < d) lo = mid + 1; else hi = mid; }
  const b = route.points[lo], a = route.points[Math.max(0, lo - 1)], t = (d - a.distance) / (b.distance - a.distance || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Arrival ends with the second photograph below the fixed navigation. */
export function journeyTiming(heroHeight: number, targetTop: number, viewportHeight: number, mobile: boolean) {
  const start = mobile ? 32 : 16;
  const collapseEnd = Math.max(start + 160, heroHeight * (mobile ? .34 : .36));
  const travelEnd = Math.max(collapseEnd + 100, heroHeight * (mobile ? .55 : .61));
  const expandEnd = Math.max(travelEnd + 180, targetTop - Math.min(120, viewportHeight * .14));
  return { start, collapseEnd, travelEnd, expandEnd };
}

export function settleScroll(current: number, target: number, seconds: number, mobile: boolean) {
  if (Math.abs(target - current) < .25) return target;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, seconds) / (mobile ? .09 : .07)));
}
