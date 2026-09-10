import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEventOverrides, type EventOverrides } from './overrides.ts';
import type { EventView } from './event.ts';

const view = (over: Partial<EventView> = {}): EventView => ({
  id: 'e1',
  slug: 'uncommon-woman-2027',
  title: 'Uncommon Woman Conference 2027',
  description: 'Three days in March.',
  currency: 'GBP',
  dateLabel: '18–20 March 2027',
  startAtMs: Date.parse('2027-03-18T19:30:00Z'),
  endAtMs: Date.parse('2027-03-20T18:00:00Z'),
  heroImage: '/images/hero.webp',
  speakers: [{ id: 'p1', slug: 'ada-cole', name: 'Ada Cole', role: 'Host', image: null, bio: null }],
  days: [
    { id: 'o1', numeral: '18', weekday: 'Thursday', time: '7:30 PM', startAt: '2027-03-18T19:30:00Z', cancelled: false },
    { id: 'o2', numeral: '19', weekday: 'Friday', time: '10:00 AM', startAt: '2027-03-19T10:00:00Z', cancelled: false },
  ],
  tickets: [
    { id: 't1', name: 'Standard', description: null, priceMinor: 2500, price: '£25.00', remaining: 40, soldOut: false, onSale: true, requiresSeat: false },
    { id: 't2', name: 'VIP', description: 'Front rows', priceMinor: 6000, price: '£60.00', remaining: 5, soldOut: false, onSale: true, requiresSeat: false },
  ],
  venue: { name: 'Kings Hall', address: '12 Bridge St, Leeds, LS1 4DA', city: 'Leeds', directionsUrl: 'https://maps.example/old' },
  onSale: true,
  ...over,
});

const apply = (o: EventOverrides, e = view()) => applyEventOverrides(e, o, 'en-GB');

test('nothing connected stays nothing — overrides never synthesise an event', () => {
  assert.equal(applyEventOverrides(null, { title: 'REWIND 26' }, 'en-GB'), null);
});

test('an empty group leaves the event exactly as it was', () => {
  const e = view();
  assert.deepEqual(applyEventOverrides(e, {}, 'en-GB'), e);
  // No group at all is the same event object, untouched.
  assert.equal(applyEventOverrides(e, undefined, 'en-GB'), e);
});

test('blank inherits, filled wins', () => {
  const out = apply({ title: '  REWIND 26  ', description: '   ' })!;
  assert.equal(out.title, 'REWIND 26');
  assert.equal(out.description, 'Three days in March.');
});

test('overridden dates move the label and the countdown', () => {
  const out = apply({ startAt: '2026-10-09', endAt: '2026-10-10' })!;
  assert.equal(out.dateLabel, '9–10 October 2026');
  assert.equal(new Date(out.startAtMs!).getFullYear(), 2026);
  assert.ok(out.endAtMs! > out.startAtMs!);
});

test('a date-only override keeps its day whatever the server timezone is', () => {
  const out = apply({ startAt: '2026-10-09' })!;
  assert.match(out.dateLabel, /9 October 2026/);
  // Noon local, so no offset on earth can roll it to the 8th or the 10th.
  assert.equal(new Date(out.startAtMs!).getDate(), 9);
});

test('a start with no end is one day, not a range ending on the old date', () => {
  const out = apply({ startAt: '2026-10-09' })!;
  assert.equal(out.endAtMs, null);
  assert.equal(out.dateLabel, '9 October 2026');
});

test('a free-text label beats the formatted range', () => {
  const out = apply({ startAt: '2026-10-09', dateLabel: 'October 2026 · dates on release' })!;
  assert.equal(out.dateLabel, 'October 2026 · dates on release');
  // …but the real dates still drive the countdown underneath it.
  assert.equal(new Date(out.startAtMs!).getFullYear(), 2026);
});

test('a typed address re-derives directions rather than keeping the old pin', () => {
  const out = apply({ venue: { address: '1 New Road, London, N1 1AA' } })!;
  assert.equal(out.venue!.name, 'Kings Hall');
  assert.equal(out.venue!.address, '1 New Road, London, N1 1AA');
  assert.match(out.venue!.directionsUrl!, /New%20Road/);
});

test('a venue can be typed where the event has none', () => {
  const out = apply({ venue: { name: 'Central London — revealed to ticket holders' } }, view({ venue: null }))!;
  assert.equal(out.venue!.name, 'Central London — revealed to ticket holders');
  assert.equal(out.venue!.address, null);
});

test('untouched venue fields keep the record’s own map link', () => {
  const out = apply({ venue: { city: 'Leeds' } })!;
  assert.equal(out.venue!.directionsUrl, 'https://maps.example/old');
});

test('speaker rows replace the whole lineup, and collide safely', () => {
  const out = apply({
    speakers: [
      { name: 'Sam Smith', role: 'Main session' },
      { name: 'Sam Smith' },
      { name: '   ' },
    ],
  })!;
  assert.equal(out.speakers.length, 2);
  assert.deepEqual(out.speakers.map((s) => s.slug), ['sam-smith', 'sam-smith-2']);
  assert.equal(out.speakers[0].role, 'Main session');
});

test('day rows replace the event’s dates', () => {
  const out = apply({ days: [{ date: '2026-10-09', time: 'Doors 6:30 · starts 7:30' }] })!;
  assert.equal(out.days.length, 1);
  assert.equal(out.days[0].numeral, '9');
  assert.equal(out.days[0].weekday, 'Friday');
  assert.equal(out.days[0].time, 'Doors 6:30 · starts 7:30');
});

test('moving a single-date event moves its schedule column too', () => {
  const single = view({ days: [view().days[0]] });
  const out = applyEventOverrides(single, { startAt: '2026-10-09' }, 'en-GB')!;
  assert.equal(out.days[0].numeral, '9');
});

test('a multi-day event keeps its occurrences — people bought against those', () => {
  const out = apply({ startAt: '2026-10-09' })!;
  assert.deepEqual(out.days.map((d) => d.numeral), ['18', '19']);
});

test('tier rows rename positionally and never touch the price', () => {
  const out = apply({ tickets: [{ name: 'General admission' }, { description: 'Front two rows' }] })!;
  assert.deepEqual(out.tickets.map((t) => t.name), ['General admission', 'VIP']);
  assert.equal(out.tickets[1].description, 'Front two rows');
  assert.deepEqual(out.tickets.map((t) => t.priceMinor), [2500, 6000]);
  assert.deepEqual(out.tickets.map((t) => t.id), ['t1', 't2']);
});

test('extra tier rows are ignored rather than inventing a tier', () => {
  const out = apply({ tickets: [{}, {}, { name: 'Phantom' }] })!;
  assert.equal(out.tickets.length, 2);
  assert.equal(out.onSale, true);
});
