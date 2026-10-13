import test from 'node:test';
import assert from 'node:assert/strict';
import { travelPoint } from '../lib/traveller.ts';
test('travelling dot ends at heading and follows same path in reverse at desktop and mobile widths', () => { for (const width of [375, 768, 1280, 1440]) {
    const target = { x: width * .05 + 7, y: 1150 };
    const start = travelPoint(0, width, 720, 1000, target);
    const end = travelPoint(1, width, 720, 1000, target);
    assert.deepEqual(end, target);
    assert.ok(start.x > width * .8);
    for (let i = 0; i <= 100; i++) {
        const p = i / 100, frame = travelPoint(p, width, 720, 1000, target);
        assert.ok(Number.isFinite(frame.x) && Number.isFinite(frame.y));
        assert.ok(frame.x >= 0 && frame.x <= width);
        const reverse = travelPoint(1 - (1 - p), width, 720, 1000, target);
        assert.ok(Math.abs(frame.x - reverse.x) < 1e-8 && Math.abs(frame.y - reverse.y) < 1e-8);
    }
} });
test('mobile route takes the left gutter after crossing above the contents', () => {
    const target = { x: 27, y: 1150 };
    for (const p of [.4, .6, .8]) {
        const point = travelPoint(p, 375, 720, 1000, target);
        assert.ok(Math.abs(point.x - 12) < 1e-8);
        assert.ok(point.y >= 746 && point.y <= 976);
    }
});
