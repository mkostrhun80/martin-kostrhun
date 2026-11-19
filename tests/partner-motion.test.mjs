import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPartners, isMarqueePaused, splitPartnerRows } from '../lib/partner-motion.ts';
import { partners, partnerCategories } from '../lib/partners.ts';

test('category filter returns all partners or subsets cleanly', () => {
  assert.equal(filterPartners(partners, 'Všichni').length, partners.length);
  for (const cat of partnerCategories) {
    const subset = filterPartners(partners, cat);
    assert.ok(subset.length > 0, cat);
    assert.ok(subset.every(p => p.category === cat));
  }
});

test('two-row splitting balances items evenly across both marquee tracks', () => {
  const [rowA, rowB] = splitPartnerRows(partners);
  assert.equal(rowA.length + rowB.length, partners.length);
  assert.ok(Math.abs(rowA.length - rowB.length) <= 1);
  assert.ok(partners.some(p => p.logoLight), 'light-on-dark logo contrast handling has matching partners');
});

test('pause conditions stop marquee motion when user pauses, reduced motion is active, or off-screen', () => {
  assert.equal(isMarqueePaused({ playing: true, reduced: false, inView: true }), false);
  assert.equal(isMarqueePaused({ playing: false, reduced: false, inView: true }), true);
  assert.equal(isMarqueePaused({ playing: true, reduced: true, inView: true }), true);
  assert.equal(isMarqueePaused({ playing: true, reduced: false, inView: false }), true);
});
