import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toMinorUnits,
  formatPrice,
  formatDateRange,
  scrollProgress,
  stageOpacity,
} from './format.ts';

/* The money path. Prices arrive as Decimal-serialised STRINGS of minor units,
   which is what flame's `typeof price !== "number"` guard silently drops. */
test('prices survive arriving as strings', () => {
  assert.equal(toMinorUnits('2500'), 2500);
  assert.equal(toMinorUnits(2500), 2500);
  assert.equal(toMinorUnits('0'), 0);
  assert.equal(toMinorUnits(null), null);
  assert.equal(toMinorUnits(undefined), null);
  assert.equal(toMinorUnits('not a price'), null);
  // The regression the whole file exists for: a string price must not vanish.
  assert.notEqual(formatPrice('2500', 'GBP', 'en-GB'), null);
  assert.equal(formatPrice('2500', 'GBP', 'en-GB'), '£25.00');
  assert.equal(formatPrice(2500, 'GBP', 'en-GB'), '£25.00');
});

test('free is a word, not a zero', () => {
  assert.equal(formatPrice('0', 'GBP', 'en-GB'), 'Free');
  assert.equal(formatPrice(0, 'USD', 'en-US'), 'Free');
});

test('a basket of string prices adds up instead of concatenating', () => {
  const tiers = [{ price: '2500', qty: 2 }, { price: '1000', qty: 1 }];
  const total = tiers.reduce((sum, t) => sum + (toMinorUnits(t.price) ?? 0) * t.qty, 0);
  assert.equal(total, 6000);
  assert.equal(formatPrice(total, 'GBP', 'en-GB'), '£60.00');
});

test('date ranges collapse what the two dates share', () => {
  const en = 'en-GB';
  // The conference this template family was built for.
  assert.equal(formatDateRange('2027-03-18T19:30:00Z', '2027-03-20T18:00:00Z', en), '18–20 March 2027');
  // One day.
  assert.equal(formatDateRange('2027-03-18T19:30:00Z', '2027-03-18T22:00:00Z', en), '18 March 2027');
  assert.equal(formatDateRange('2027-03-18T19:30:00Z', null, en), '18 March 2027');
  // Crossing a month keeps both months.
  assert.equal(formatDateRange('2027-02-28T19:30:00Z', '2027-03-02T18:00:00Z', en), '28 February – 2 March 2027');
  assert.equal(formatDateRange(null, null, en), '');
});

test('scroll progress clamps at both ends', () => {
  const vh = 800;
  // pin: a 3200px section is 2400px of travel once 800 is on screen.
  assert.equal(scrollProgress('pin', { top: 0, height: 3200 }, vh), 0);
  assert.equal(scrollProgress('pin', { top: -1200, height: 3200 }, vh), 0.5);
  assert.equal(scrollProgress('pin', { top: -2400, height: 3200 }, vh), 1);
  // Past the end, and above the start, stay clamped — no negative transforms.
  assert.equal(scrollProgress('pin', { top: -9999, height: 3200 }, vh), 1);
  assert.equal(scrollProgress('pin', { top: 9999, height: 3200 }, vh), 0);
  // cover: 0 when the top edge is at the bottom of the screen, 1 when gone.
  assert.equal(scrollProgress('cover', { top: vh, height: 400 }, vh), 0);
  assert.equal(scrollProgress('cover', { top: -400, height: 400 }, vh), 1);
  // A zero-height pinned section must not divide by zero.
  assert.ok(Number.isFinite(scrollProgress('pin', { top: 0, height: 0 }, vh)));
});

test('exactly one stage is legible at a time', () => {
  const seg = [[0, 0.32], [0.34, 0.64], [0.66, 1]] as const;
  const legible = (p: number) => [0, 1, 2].filter((i) => stageOpacity(p, i, seg) > 0.5);
  assert.deepEqual(legible(0.1), [0]);
  assert.deepEqual(legible(0.5), [1]);
  assert.deepEqual(legible(0.9), [2]);
  // The section ends on the last stage rather than fading to nothing.
  assert.equal(stageOpacity(1, 2, seg), 1);
  // The first stage is already arriving as the section pins — the prototype
  // starts it mid-ramp at 0.4 and lands it within the first 3% of the scroll,
  // so the word is never absent, just settling.
  assert.ok(stageOpacity(0, 0, seg) > 0.35);
  assert.equal(stageOpacity(0.03, 0, seg), 1);
  // Nothing is ever fully legible in two places at once.
  for (const p of [0.33, 0.65]) {
    assert.ok([0, 1, 2].filter((i) => stageOpacity(p, i, seg) > 0.5).length <= 1);
  }
});
