import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePartners, canAutoplay, coverPose, partnerLoopSlots, wrapPartnerPhase } from '../lib/partner-motion.ts';
const geometry = Array.from({ length: 68 }, (_, n) => ({ center: 720 + n * 190, width: 190 }));
test('the circular window only visits visible covers and nearby neighbours', () => {
  for (const phase of [0, 500, 6000, 12000]) {
    const slots = partnerLoopSlots(phase, 68, 68, 1360, 190);
    assert.ok(slots.length < 17);
    assert.equal(new Set(slots.map(slot => slot.index)).size, slots.length);
    assert.ok(slots.every(slot => slot.index >= 0 && slot.index < 68));
    assert.ok(slots.some(slot => slot.offset <= -1360 / 2));
    assert.ok(slots.some(slot => slot.offset >= 1360 / 2));
  }
});
test('center keeps a natural cover shape and reduced motion removes spatial effects', () => {
  assert.deepEqual(coverPose(geometry[0], 0, 1440), { near: true, turn: -0, scale: 1, depth: 55, z: 100 });
  const reduced = coverPose(geometry[2], 0, 1440, true);
  assert.equal(reduced.turn, 0); assert.equal(reduced.scale, 1); assert.equal(reduced.depth, 0);
});
test('autoplay advances at 20 px/s, wraps without reversing, and bounds background-tab time', () => {
  let phase = 100;
  for (let i = 0; i < 240; i++) phase = advancePartners(phase, 1000, 1 / 240);
  assert.ok(Math.abs(phase - 120) < 1e-7);
  assert.ok(Math.abs(advancePartners(999.8, 1000, .05) - .8) < 1e-7);
  assert.equal(advancePartners(100, 1000, 100), 101);
  assert.equal(advancePartners(100, 1000, -1), 100);
  assert.equal(wrapPartnerPhase(-1, 1000), 999);
});
test('every pause condition independently stops automatic motion', () => {
  const running = { playing: true, reduced: false, visible: true, hidden: false };
  assert.equal(canAutoplay(running), true);
  for (const [key, value] of Object.entries(running)) assert.equal(canAutoplay({ ...running, [key]: !value }), false, key);
});
test('last-to-first seam keeps the same labels and positions on desktop and mobile', () => {
  for (const count of [5, 8, 23, 68]) for (const viewport of [320, 768, 1360]) {
    const step = viewport < 760 ? 130 : 190, pool = Math.ceil(24 / count) * count, epsilon = .00001;
    const before = partnerLoopSlots(count * step - epsilon, count, pool, viewport, step);
    const after = partnerLoopSlots(0, count, pool, viewport, step);
    for (const slot of after.filter(s => Math.abs(s.offset) < viewport / 2 + step)) {
      assert.ok(before.some(s => s.partner === slot.partner && Math.abs(s.offset - slot.offset - epsilon) < 1e-7), `seam changed a visible card (${count}, ${viewport})`);
    }
    assert.equal(new Set(after.map(s => s.index)).size, after.length, 'a DOM cell must not be assigned two positions');
    assert.ok(after.length <= 17, 'per-frame work must remain bounded by the viewport');
  }
});
