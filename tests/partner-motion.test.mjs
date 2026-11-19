import test from 'node:test';
import assert from 'node:assert/strict';
import { advancePartners, canAutoplay, partnerRibbonLayout, partnerRibbonSlots, wrapPartnerPhase } from '../lib/partner-motion.ts';

test('both rows cover desktop and mobile without gaps at any point in the loop', () => {
  for (const viewport of [280, 320, 390, 768, 1360]) for (const count of [5, 8, 23, 68]) {
    const { width, step } = partnerRibbonLayout(viewport);
    for (let frame = 0; frame < 80; frame++) {
      const slots = partnerRibbonSlots((count - .5 + frame / 80) * step, count, viewport);
      assert.ok(slots.length <= 24, 'GPU pool is bounded independently of partner count');
      for (const row of [0, 1]) {
        const ordered = slots.filter(slot => slot.row === row).sort((a, b) => a.x - b.x);
        assert.ok(ordered[0].x - width / 2 < -viewport / 2);
        assert.ok(ordered.at(-1).x + width / 2 > viewport / 2);
        for (let i = 1; i < ordered.length; i++) assert.ok(Math.abs(ordered[i].x - ordered[i - 1].x - width - 16) < 1e-7);
      }
    }
  }
});

test('the loop seam preserves visible partners and positions in both directions', () => {
  for (const viewport of [320, 768, 1360]) for (const count of [5, 68]) {
    const { step, width } = partnerRibbonLayout(viewport), epsilon = .00001;
    const before = partnerRibbonSlots(count * step - epsilon, count, viewport), after = partnerRibbonSlots(0, count, viewport);
    for (const slot of after.filter(slot => Math.abs(slot.x) < viewport / 2 + width / 2)) {
      assert.ok(before.some(previous => previous.row === slot.row && previous.partner === slot.partner && Math.abs(previous.x - slot.x - (slot.row ? -epsilon : epsilon)) < 1e-7));
    }
  }
});

test('motion has a fixed speed and clamps time after leaving the browser tab', () => {
  let phase = 100;
  for (let i = 0; i < 240; i++) phase = advancePartners(phase, 1000, 1 / 240);
  assert.ok(Math.abs(phase - 118) < 1e-7);
  assert.ok(Math.abs(advancePartners(999.8, 1000, .05) - .7) < 1e-7);
  assert.ok(Math.abs(advancePartners(100, 1000, 100) - 100.9) < 1e-7);
  assert.equal(advancePartners(100, 1000, -1), 100);
  assert.equal(wrapPartnerPhase(-1, 1000), 999);
});

test('each pause condition independently stops automatic motion', () => {
  const running = { playing: true, reduced: false, visible: true, hidden: false };
  assert.equal(canAutoplay(running), true);
  for (const [key, value] of Object.entries(running)) assert.equal(canAutoplay({ ...running, [key]: !value }), false, key);
  assert.deepEqual(partnerRibbonSlots(0, 0, 1360), []);
});
