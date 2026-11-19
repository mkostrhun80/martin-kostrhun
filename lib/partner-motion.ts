import type { Partner, PartnerCategory } from '@/lib/partners';

export function filterPartners(list: readonly Partner[], category: PartnerCategory | 'Všichni'): Partner[] {
  return category === 'Všichni' ? [...list] : list.filter(item => item.category === category);
}

export function splitPartnerRows<T>(items: readonly T[]): [T[], T[]] {
  const first: T[] = [];
  const second: T[] = [];
  items.forEach((item, index) => {
    if (index % 2 === 0) first.push(item);
    else second.push(item);
  });
  return [first, second];
}

export type MarqueePlayState = {
  playing: boolean;
  reduced: boolean;
  inView: boolean;
};

export function isMarqueePaused(state: MarqueePlayState): boolean {
  return !state.playing || state.reduced || !state.inView;
}
