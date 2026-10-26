import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { homeIntroBootstrap } from '../lib/home-intro.ts';

function bootstrap({ hash = '', scroll = 0, reduced = false, played = false, storageBlocked = false } = {}) {
  const dataset = {}, timers = [];
  runInNewContext(homeIntroBootstrap, {
    location: { hash }, scrollY: scroll,
    matchMedia: () => ({ matches: reduced }),
    sessionStorage: { getItem() { if (storageBlocked) throw Error('SecurityError'); return played ? '1' : null; } },
    document: { documentElement: { dataset } },
    window: { setTimeout: fn => timers.push(fn) },
  });
  return { dataset, timers };
}

test('first entry starts the signature and a hydration failure releases the page', () => {
  const { dataset, timers } = bootstrap();
  assert.equal(dataset.homeIntro, 'pending');
  assert.equal(timers.length, 1);
  timers[0]();
  assert.equal(dataset.homeIntro, 'ready');
});

test('deep links, restored scroll, reduced motion and repeat visits show content immediately', () => {
  for (const options of [{ hash: '#obsah' }, { hash: '#kontakt' }, { scroll: 120 }, { reduced: true }, { played: true }]) {
    const { dataset, timers } = bootstrap(options);
    assert.equal(dataset.homeIntro, undefined);
    assert.equal(timers.length, 0);
  }
});

test('blocked session storage cannot break the homepage', () => {
  const { dataset, timers } = bootstrap({ storageBlocked: true });
  assert.equal(dataset.homeIntro, 'pending');
  timers[0]();
  assert.equal(dataset.homeIntro, 'ready');
});
