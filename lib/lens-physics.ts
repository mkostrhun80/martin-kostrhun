/** Small, time-based spring. No animation library or graphics runtime is needed. */
export type LensPoint = { x: number; y: number };
export type LensSpring = LensPoint & { vx: number; vy: number };
export const LENS_TRANSITION_MS = 800;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const ease = (t: number) => { const p = clamp(t, 0, 1); return p * p * (3 - 2 * p); };

export function stepSpring(current: LensSpring, target: LensPoint, elapsed: number): LensSpring {
  // Substeps keep the spring stable on both slow frames and high-refresh displays.
  const dt = clamp(elapsed, 0, 0.05);
  const steps = Math.max(1, Math.ceil(dt / 0.008));
  const h = dt / steps;
  const next = { ...current };
  for (let i = 0; i < steps; i++) {
    next.vx += ((target.x - next.x) * 145 - next.vx * 21) * h;
    next.vy += ((target.y - next.y) * 145 - next.vy * 21) * h;
    next.x += next.vx * h;
    next.y += next.vy * h;
  }
  return next;
}

export function initialLens(width: number, height: number) {
  const mobile = width <= 760;
  return { x: width * (mobile ? 0.66 : 0.68), y: height * (mobile ? 0.5 : 0.49), radius: mobile ? clamp(width * 0.225, 70, 125) : clamp(width * 0.115, 105, 185) };
}

export function lensTarget(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }, radius: number): LensPoint {
  const margin = radius * 0.6;
  return { x: clamp(clientX - rect.left, margin, rect.width - margin), y: clamp(clientY - rect.top, Math.min(190, rect.height * 0.22), rect.height - margin - 65) };
}

export function coveringRadius(point: LensPoint, width: number, height: number) {
  return Math.hypot(Math.max(point.x, width - point.x), Math.max(point.y, height - point.y)) + 4;
}

export function lensWord(point: LensPoint, width: number, height: number) {
  const x = point.x / width, y = point.y / height;
  if (x < 0.32) return 'PLÁN';
  if (x > 0.77) return 'BYDLENÍ';
  if (y > 0.63) return 'OCHRANA';
  if (y < 0.4) return 'INVESTICE';
  return 'FINANCE';
}

export function transitionFrame(progress: number) {
  const p = clamp(progress, 0, 1);
  return {
    expansion: ease(p / 0.72),
    opacity: 1 - ease((p - 0.68) / 0.32),
    wash: ease((p - 0.29) / 0.23) * (1 - ease((p - 0.62) / 0.38)) * 0.94,
    depth: Math.sin(Math.PI * p),
    rim: 1 - ease(p / 0.3),
  };
}
