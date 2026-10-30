export type PartnerGeometry = { center: number; width: number };
export function partnerCardStep(cardWidth: number) { return cardWidth + 44; }
export function coverPose(item: PartnerGeometry, scrollLeft: number, viewport: number, reduced = false) {
  const offset = item.center - scrollLeft - viewport / 2;
  // Include two neighbouring covers before the viewport edge to avoid visible pop-in.
  const near = Math.abs(offset) <= viewport / 2 + item.width * 2.5;
  const relative = reduced ? 0 : Math.max(-1, Math.min(1, offset / (item.width * 1.45)));
  const proximity = 1 - Math.abs(relative);
  return { near, turn: reduced ? 0 : -relative * 22, scale: reduced ? 1 : .92 + proximity * .08, depth: reduced ? 0 : proximity * 28, z: Math.round(proximity * 100) };
}
export function wrapPartnerPhase(value: number, length: number) {
  return length > 0 ? ((value % length) + length) % length : 0;
}
export function advancePartners(phase: number, length: number, elapsed: number) {
  return wrapPartnerPhase(phase + 20 * Math.max(0, Math.min(elapsed, .05)), length);
}
/** A bounded window on a circular track; cells outside it have no compositor layers. */
export function partnerLoopSlots(phase: number, count: number, poolSize: number, viewport: number, step: number) {
  if (count < 1 || poolSize < 1 || step <= 0) return [];
  const center = Math.floor(phase / step);
  const radius = Math.min(Math.ceil(viewport / (2 * step) + 3), Math.floor((poolSize - 1) / 2));
  return Array.from({ length: radius * 2 + 1 }, (_, n) => {
    const slot = center + n - radius;
    return { index: wrapPartnerPhase(slot, poolSize), partner: wrapPartnerPhase(slot, count), offset: slot * step - phase };
  });
}
export type PartnerPause = { playing: boolean; reduced: boolean; visible: boolean; hidden: boolean };
export function canAutoplay(state: PartnerPause) {
  return state.playing && !state.reduced && state.visible && !state.hidden;
}
