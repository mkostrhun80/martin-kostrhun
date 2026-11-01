export function wrapPartnerPhase(value: number, length: number) {
  return length > 0 ? ((value % length) + length) % length : 0;
}

export function advancePartners(phase: number, length: number, elapsed: number) {
  return wrapPartnerPhase(phase + 18 * Math.max(0, Math.min(elapsed, .05)), length);
}

export function partnerRibbonLayout(viewport: number) {
  const width = Math.min(216, Math.max(1, viewport) * .58);
  const step = width + 16;
  return { width, height: width / 2, step, perRow: Math.min(11, 2 * Math.ceil(viewport / (2 * step)) + 3) };
}

/** A fixed, viewport-sized pool; partner count never increases per-frame work. */
export function partnerRibbonSlots(phase: number, count: number, viewport: number) {
  if (count < 1) return [];
  const { step, height, perRow } = partnerRibbonLayout(viewport);
  const base = Math.floor(phase / step), fraction = phase / step - base;
  return Array.from({ length: perRow * 2 }, (_, slot) => {
    const row = Math.floor(slot / perRow), column = slot % perRow;
    return {
      partner: wrapPartnerPhase((row ? -base : base) + column + (row ? Math.floor(count / 2) : 0), count),
      x: (column - (perRow - 1) / 2) * step - fraction * step * (row ? -1 : 1) + (row ? step * .2 : 0),
      y: (row ? -1 : 1) * (height + 16) / 2,
      row,
    };
  });
}

export type PartnerPause = { playing: boolean; reduced: boolean; visible: boolean; hidden: boolean };
export function canAutoplay(state: PartnerPause) {
  return state.playing && !state.reduced && state.visible && !state.hidden;
}
