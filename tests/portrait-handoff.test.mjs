import assert from 'node:assert/strict';
import { test } from 'node:test';
import { portraitHandoff } from '../lib/portrait-handoff.ts';

const from = { left: 538, top: 85, width: 504, height: 630 };
const to = { left: 64, top: 110, width: 484, height: 726 };
const corner = { x: 32, y: 308, size: 104 };
const pose = p => portraitHandoff(p, from, to, corner);
const geometry = ['x', 'y', 'width', 'height', 'roundness', 'reveal'];

test('the two legs meet the circle without a position, size or opacity jump', () => {
  for (const boundary of [.46, .56]) {
    const before = pose(boundary - 1e-5), after = pose(boundary + 1e-5);
    for (const key of geometry) assert.ok(Math.abs(before[key] - after[key]) < .001, `${key} jumps at ${boundary}`);
  }
  assert.equal(pose(.56).x, corner.x);
  assert.equal(pose(.56).y, corner.y);
});

test('the moving overlay matches both real photographs at the handover', () => {
  for (const [p, rect] of [[0, from], [1, to]]) {
    const frame = pose(p);
    for (const [key, rectKey] of [['x', 'left'], ['y', 'top'], ['width', 'width'], ['height', 'height']]) {
      assert.ok(Math.abs(frame[key] - rect[rectKey]) < 1e-8);
    }
    assert.ok(Math.abs(frame.roundness) < 1e-8);
    assert.ok(Math.abs(frame.reveal - p) < 1e-8);
  }
});

test('opening travels from the edge while growing, with no overshoot', () => {
  let previous = pose(.56);
  for (let i = 1; i <= 100; i++) {
    const frame = pose(.56 + .44 * i / 100);
    assert.ok(frame.width >= previous.width && frame.height >= previous.height);
    assert.ok(frame.x >= corner.x && frame.x <= to.left + 1e-8);
    assert.ok(frame.y <= corner.y && frame.y >= to.top - 1e-8);
    assert.ok(frame.reveal >= previous.reveal && frame.reveal <= 1);
    previous = frame;
  }
});

test('reverse scrolling on mobile collapses to the edge before restoring the hero', () => {
  const origin = { left: 70, top: 394, width: 300, height: 375 };
  const destination = { left: 22, top: 101, width: 346, height: 519 };
  const edge = { x: 18, y: 384, size: 76 };
  let previous = portraitHandoff(1, origin, destination, edge);
  for (const p of [.9, .75, .6, .56]) {
    const frame = portraitHandoff(p, origin, destination, edge);
    assert.ok(frame.width <= previous.width && frame.height <= previous.height);
    assert.ok(frame.reveal <= previous.reveal);
    previous = frame;
  }
  assert.equal(previous.x, edge.x); assert.equal(previous.y, edge.y);
  assert.equal(previous.width, edge.size); assert.equal(previous.height, edge.size);
  const restored = portraitHandoff(0, origin, destination, edge);
  assert.equal(restored.x, origin.left); assert.equal(restored.y, origin.top);
  assert.equal(restored.width, origin.width); assert.equal(restored.height, origin.height);
});
