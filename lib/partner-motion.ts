export type PartnerGeometry = { center: number; width: number };
export function coverPose(item: PartnerGeometry, scrollLeft: number, viewport: number, reduced = false) {
  const offset = item.center - scrollLeft - viewport / 2;
  // Include two neighbouring covers before the viewport edge to avoid visible pop-in.
  const near = Math.abs(offset) <= viewport / 2 + item.width * 2.5;
  const relative = reduced ? 0 : Math.max(-1, Math.min(1, offset / (item.width * 1.45)));
  const proximity = 1 - Math.abs(relative);
  return { near, turn: reduced ? 0 : -relative * 55, scale: reduced ? 1 : .82 + proximity * .18, depth: reduced ? 0 : proximity * 55, z: Math.round(proximity * 100) };
}
export function nearbyRange(geometry: PartnerGeometry[], left: number, viewport: number): [number, number] {
  if (!geometry.length) return [0, -1];
  const step = geometry.length > 1 ? geometry[1].center - geometry[0].center : geometry[0].width;
  // Cards have equal flex widths; this bounds per-frame work regardless of list length.
  const first = geometry[0].center;
  const pad = geometry[0].width * 2.5;
  return [Math.max(0, Math.floor((left - pad - first) / step)), Math.min(geometry.length - 1, Math.ceil((left + viewport + pad - first) / step))];
}
export function advancePartners(left: number, direction: number, max: number, elapsed: number) {
  const next = Math.max(0, Math.min(Math.max(0, max), left + direction * 20 * Math.min(elapsed, .05)));
  return { left: next, direction: next >= max ? -1 : next <= 0 ? 1 : direction };
}
export type PartnerPause = { playing: boolean; reduced: boolean; visible: boolean; hidden: boolean; hovered: boolean; focused: boolean; manual: boolean };
export function canAutoplay(state: PartnerPause) {
  return state.playing && !state.reduced && state.visible && !state.hidden && !state.hovered && !state.focused && !state.manual;
}
