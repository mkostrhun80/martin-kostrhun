import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePartners, canAutoplay, coverPose, nearbyRange } from '../lib/partner-motion.ts';
const geometry = Array.from({ length: 68 }, (_, n) => ({ center: 720 + n * 190, width: 190 }));
test('effect range is bounded to the viewport and neighbours at either end of 68 covers', () => {
  for (const left of [0, 500, 6000, 12000]) {
    const [first, last] = nearbyRange(geometry, left, 1440);
    assert.ok(first >= 0 && last < 68);
    assert.ok(last - first < 16, `${first}–${last} should not visit all covers`);
    for (let i = 0; i < geometry.length; i++) if (i < first || i > last) assert.equal(coverPose(geometry[i], left, 1440).near, false);
  }
});
test('center keeps a natural cover shape and reduced motion removes spatial effects', () => {
  assert.deepEqual(coverPose(geometry[0], 0, 1440), { near: true, turn: -0, scale: 1, depth: 55, z: 100 });
  const reduced = coverPose(geometry[2], 0, 1440, true);
  assert.equal(reduced.turn, 0); assert.equal(reduced.scale, 1); assert.equal(reduced.depth, 0);
});
test('autoplay is 20 px/s, bounces at both ends, and never jumps after a hidden tab', () => {
  let left = 100, direction = 1;
  for (let i = 0; i < 60; i++) ({ left, direction } = advancePartners(left, direction, 1000, 1 / 60));
  assert.ok(Math.abs(left - 120) < 1e-8);
  assert.deepEqual(advancePartners(999.8, 1, 1000, .05), { left: 1000, direction: -1 });
  assert.deepEqual(advancePartners(.1, -1, 1000, .05), { left: 0, direction: 1 });
  assert.equal(advancePartners(100, 1, 1000, 100).left, 101);
});
test('every pause condition independently stops automatic motion', () => {
  const running = { playing: true, reduced: false, visible: true, hidden: false, hovered: false, focused: false, manual: false };
  assert.equal(canAutoplay(running), true);
  for (const [key, value] of Object.entries(running)) assert.equal(canAutoplay({ ...running, [key]: !value }), false, key);
});
