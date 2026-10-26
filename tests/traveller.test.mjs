import test from 'node:test';
import assert from 'node:assert/strict';
import { travelPoint, photoFrame, journeyTiming, sampleRoute, routePoint, settleScroll } from '../lib/traveller.ts';

test('the short arc stays above the photo and out of the right-hand navigation', () => {
  for (const width of [360, 390, 768, 1280, 1440, 2560]) {
    const mobile = width <= 760, target = { x: width * (mobile ? .5 : .26), y: 1250 };
    const start = travelPoint(0, width, 900, 1700, target);
    assert.ok(start.y < 900);
    let previous = start;
    for (let i = 1; i <= 200; i++) {
      const p = i / 200, point = travelPoint(p, width, 900, 1700, target);
      assert.ok(point.x <= previous.x + 1e-8 && point.x >= target.x - 1e-8, 'no horizontal loops');
      assert.ok(point.y >= previous.y - 1e-8 && point.y <= target.y, 'no vertical loops');
      assert.ok(point.x >= 0 && point.x < width);
      const reverse = travelPoint(1 - (1 - p), width, 900, 1700, target);
      assert.ok(Math.abs(point.x - reverse.x) < 1e-8 && Math.abs(point.y - reverse.y) < 1e-8);
      previous = point;
    }
    assert.deepEqual(previous, target);
  }
});

test('source, 14 px dot and destination meet at exact reversible endpoints', () => {
  const source = { left: 936, top: 243, width: 389, height: 486 };
  const dot = { left: 400, top: 950, width: 14, height: 14 };
  const destination = { left: 72, top: 1020, width: 594, height: 594 };
  for (const [a, b, expanding] of [[source, dot, false], [dot, destination, true]]) {
    const first = photoFrame(a, b, 0, expanding, 28), last = photoFrame(a, b, 1, expanding, 28);
    for (const key of ['left', 'top', 'width', 'height']) {
      assert.equal(first[key], a[key]); assert.equal(last[key], b[key]);
    }
    assert.equal(expanding ? first.radius : last.radius, 7);
    assert.equal(expanding ? last.radius : first.radius, 28);
    for (let i = 0; i <= 100; i++) {
      const frame = photoFrame(a, b, i / 100, expanding);
      assert.ok(frame.width > 0 && frame.height > 0);
      assert.ok(frame.radius >= 0 && frame.radius <= Math.min(frame.width, frame.height) / 2);
    }
  }
});

test('distance sampling preserves both endpoints and has no discontinuities', () => {
  const target = { x: 330, y: 1250 };
  const route = sampleRoute(p => travelPoint(p, 1440, 900, 1800, target));
  assert.deepEqual(routePoint(route, -10), travelPoint(0, 1440, 900, 1800, target));
  assert.deepEqual(routePoint(route, route.length + 10), target);
  for (let d = 5; d <= route.length; d += 5) {
    const a = routePoint(route, d - 5), b = routePoint(route, d);
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) <= 5.001);
  }
});

test('arrival happens on the second screen below the fixed header, including short screens', () => {
  for (const [height, viewport, mobile] of [[680, 640, true], [844, 844, true], [680, 390, false], [900, 900, false], [1100, 1215, false]]) {
    const top = height + (mobile ? 96 : 120);
    const t = journeyTiming(height, top, viewport, mobile);
    assert.ok(t.start >= 16 && t.start < t.collapseEnd);
    assert.ok(t.collapseEnd < t.travelEnd && t.travelEnd < t.expandEnd);
    assert.ok(t.travelEnd - t.collapseEnd >= 100);
    assert.ok(t.expandEnd - t.travelEnd >= 180);
    assert.ok(top - t.expandEnd >= Math.min(89, viewport * .14) - .01);
    assert.ok(top - t.expandEnd <= 120);
    assert.ok(t.expandEnd < height + 150, 'the journey does not extend into services');
  }
});

test('scroll damping settles without overshoot in either direction at 60 and 120 Hz', () => {
  for (const mobile of [true, false]) {
    const values = [];
    for (const fps of [60, 120]) {
      let current = 0;
      for (let i = 0; i < fps; i++) {
        current = settleScroll(current, 700, 1 / fps, mobile);
        assert.ok(current >= 0 && current <= 700);
      }
      values.push(current);
      for (let i = 0; i < fps * 2; i++) { current = settleScroll(current, 0, 1 / fps, mobile); assert.ok(current >= 0); }
      assert.equal(current, 0);
    }
    assert.ok(Math.abs(values[0] - values[1]) < .001);
    assert.ok(values[0] > 699);
  }
});
