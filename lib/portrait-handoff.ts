type Rect = { left: number; top: number; width: number; height: number };
type Corner = { x: number; y: number; size: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// Zero velocity and acceleration at either end of each motion segment.
const smooth = (value: number) => {
  const t = clamp(value);
  return clamp(t * t * t * (t * (t * 6 - 15) + 10));
};

/** Both legs share the edge circle as their endpoint, so opening cannot teleport. */
export function portraitHandoff(progress: number, from: Rect, to: Rect, corner: Corner) {
  const p = clamp(progress);
  if (p < .46) {
    const t = smooth(p / .46);
    return { x: mix(from.left, corner.x, t), y: mix(from.top, corner.y, t),
      width: mix(from.width, corner.size, t), height: mix(from.height, corner.size, t),
      roundness: t, reveal: 0, phase: 'shrinking' };
  }
  if (p < .56) {
    return { x: corner.x, y: corner.y, width: corner.size, height: corner.size,
      roundness: 1, reveal: 0, phase: 'corner' };
  }
  const t = smooth((p - .56) / .44);
  return { x: mix(corner.x, to.left, t), y: mix(corner.y, to.top, t),
    width: mix(corner.size, to.width, t), height: mix(corner.size, to.height, t),
    roundness: 1 - t, reveal: t, phase: 'opening' };
}
