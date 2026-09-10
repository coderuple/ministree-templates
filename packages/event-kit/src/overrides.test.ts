import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EventDetail } from '@ministree/template-sdk';
import { eventSource, resolveEventRecord, type EventDetails, type TicketNames } from './overrides.ts';
import { toEventView } from './event.ts';
import { resolveTicketing } from './ticketing.ts';

/* A raw record, as the public API sends it. Asserting through `toEventView`
   tests the path a page actually takes: resolve the record, then map it. */
const record = (over: Record<string, unknown> = {}) =>
  ({
    id: 'e1',
    slug: 'uncommon-woman-2027',
    title: 'Uncommon Woman Conference 2027',
    description: 'Three days in March.',
    currency: 'GBP',
    startAt: '2027-03-18T19:30:00Z',
    endAt: '2027-03-20T18:00:00Z',
    people: [{ id: 'p1', name: 'Ada Cole', title: 'Host' }],
    occurrences: [
      { id: 'o1', startAt: '2027-03-18T19:30:00Z', endAt: '2027-03-18T22:00:00Z', status: 'scheduled' },
      { id: 'o2', startAt: '2027-03-19T10:00:00Z', status: 'scheduled' },
    ],
    ticketTypes: [
      { id: 't1', name: 'Standard', price: '2500', capacity: 100, soldCount: 60 },
      { id: 't2', name: 'VIP', description: 'Front rows', price: '6000', capacity: 10, soldCount: 5 },
    ],
    locationJson: { venueName: 'Kings Hall', street: '12 Bridge St', city: 'Leeds', postalCode: 'LS1 4DA' },
    paymentMethods: ['card'],
    ...over,
  }) as unknown as EventDetail;

const tweak = (eventDetails: EventDetails = {}, eventTicketNames?: TicketNames) => ({
  eventSource: 'eventTweaked',
  eventDetails,
  eventTicketNames,
});
const manual = (eventDetails: EventDetails) => ({ eventSource: 'manual', eventDetails });
const view = (content: unknown, r: EventDetail | null = record()) => {
  const out = resolveEventRecord(r, content);
  return out ? toEventView(out, 'en-GB') : null;
};

/* ── Which answer ─────────────────────────────────────────────────────── */

test('"exactly as it is" ignores details saved under another answer', () => {
  const v = view({ eventSource: 'event', eventDetails: { title: 'REWIND 26' }, eventTicketNames: [{ name: 'X' }] })!;
  assert.equal(v.title, 'Uncommon Woman Conference 2027');
  assert.equal(v.tickets[0].name, 'Standard');
});

test('content saved before the choice existed reads as "exactly as it is"', () => {
  assert.equal(eventSource({}), 'event');
  assert.equal(eventSource(null), 'event');
  assert.equal(eventSource({ eventSource: 'nonsense' }), 'event');
  const r = record();
  assert.equal(resolveEventRecord(r, { eventDetails: { title: 'REWIND 26' } }), r);
});

/* ── An event, with some details changed ──────────────────────────────── */

test('changing details with nothing picked stays nothing', () => {
  assert.equal(resolveEventRecord(null, tweak({ title: 'REWIND 26' })), null);
});

test('an empty details group leaves the event as it was', () => {
  const r = record();
  assert.deepEqual(view(tweak({}), r), toEventView(r, 'en-GB'));
});

test('blank inherits, filled wins', () => {
  const v = view(tweak({ title: '  REWIND 26  ', description: '   ' }))!;
  assert.equal(v.title, 'REWIND 26');
  assert.equal(v.description, 'Three days in March.');
});

test('moved dates move the label and the countdown', () => {
  const v = view(tweak({ startAt: '2026-10-09', endAt: '2026-10-10' }))!;
  assert.equal(v.dateLabel, '9–10 October 2026');
  assert.equal(new Date(v.startAtMs!).getFullYear(), 2026);
  assert.ok(v.endAtMs! > v.startAtMs!);
});

test('a date-only start keeps its day whatever the server timezone is', () => {
  const v = view(tweak({ startAt: '2026-10-09' }))!;
  // Noon local, so no offset on earth can roll it to the 8th or the 10th.
  assert.equal(new Date(v.startAtMs!).getDate(), 9);
});

test('a start with no end is one day, not a range ending on the old date', () => {
  const v = view(tweak({ startAt: '2026-10-09' }))!;
  assert.equal(v.endAtMs, null);
  assert.equal(v.dateLabel, '9 October 2026');
});

test('a typed label is printed in place of the range, and the real dates still count down', () => {
  const v = view(tweak({ startAt: '2026-10-09', dateLabel: 'October 2026 · dates on release' }))!;
  assert.equal(v.dateLabel, 'October 2026 · dates on release');
  assert.equal(new Date(v.startAtMs!).getFullYear(), 2026);
});

test('a date typed with no time shows no time — not the noon it was pinned to', () => {
  const oneNight = record({ occurrences: [] });
  const v = view(tweak({ startAt: '2026-10-09' }), oneNight)!;
  assert.equal(v.days.length, 1);
  assert.equal(v.days[0].numeral, '9');
  assert.equal(v.days[0].time, '');
});

test('a multi-date event keeps its occurrences when only the start moves', () => {
  const v = view(tweak({ startAt: '2026-10-09' }))!;
  assert.deepEqual(v.days.map((d) => d.id), ['o1', 'o2']);
});

test('day rows replace the dates, with their times exactly as typed', () => {
  const v = view(tweak({ days: [{ date: '2026-10-09', time: 'Doors 6:30 · starts 7:30' }, { date: '2026-10-10' }] }))!;
  assert.equal(v.days.length, 2);
  assert.equal(v.days[0].weekday, 'Friday');
  assert.equal(v.days[0].time, 'Doors 6:30 · starts 7:30');
  assert.equal(v.days[1].time, '');
});

test('a typed full address is printed as typed, without the old city and postcode', () => {
  const v = view(tweak({ venue: { address: '1 New Road, London N1 1AA' } }))!;
  assert.equal(v.venue!.name, 'Kings Hall');
  assert.equal(v.venue!.address, '1 New Road, London N1 1AA');
  assert.match(v.venue!.directionsUrl!, /New%20Road/);
});

test('a typed map link beats the one built from the address', () => {
  const v = view(tweak({ venue: { directionsUrl: 'https://maps.example/side-door' } }))!;
  assert.equal(v.venue!.directionsUrl, 'https://maps.example/side-door');
});

test('a venue can be typed where the event has none', () => {
  const v = view(tweak({ venue: { name: 'Central London — revealed to ticket holders' } }), record({ locationJson: null }))!;
  assert.equal(v.venue!.name, 'Central London — revealed to ticket holders');
  assert.equal(v.venue!.address, null);
});

test('speaker rows replace the whole lineup, and collide safely', () => {
  const v = view(tweak({ speakers: [{ name: 'Sam Smith', role: 'Main session' }, { name: 'Sam Smith' }, { name: '   ' }] }))!;
  assert.equal(v.speakers.length, 2);
  assert.deepEqual(v.speakers.map((s) => s.slug), ['sam-smith', 'sam-smith-2']);
  assert.equal(v.speakers[0].role, 'Main session');
});

test('ticket rows rename positionally and never touch the price', () => {
  const v = view(tweak({}, [{ name: 'General admission' }, { description: 'Front two rows' }]))!;
  assert.deepEqual(v.tickets.map((t) => t.name), ['General admission', 'VIP']);
  assert.equal(v.tickets[1].description, 'Front two rows');
  assert.deepEqual(v.tickets.map((t) => t.priceMinor), [2500, 6000]);
  assert.deepEqual(v.tickets.map((t) => t.id), ['t1', 't2']);
});

test('extra ticket rows are ignored rather than inventing a tier', () => {
  const v = view(tweak({}, [{}, {}, { name: 'Phantom' }]))!;
  assert.equal(v.tickets.length, 2);
});

/* ── I'll type them myself ────────────────────────────────────────────── */

test('typed by hand: the site is built from what was typed', () => {
  const v = view(
    manual({
      title: 'REWIND 26',
      startAt: '2026-10-09',
      endAt: '2026-10-10',
      venue: { name: 'The Old Foundry', city: 'Manchester' },
      speakers: [{ name: 'Caleb Osei', role: 'Main session' }],
    }),
    null,
  )!;
  assert.equal(v.title, 'REWIND 26');
  assert.equal(v.dateLabel, '9–10 October 2026');
  assert.equal(v.venue!.name, 'The Old Foundry');
  assert.equal(v.venue!.city, 'Manchester');
  assert.equal(v.speakers[0].name, 'Caleb Osei');
  assert.equal(v.days[0].numeral, '9');
  assert.equal(v.days[0].time, '');
});

test('typed by hand ignores an event the hidden picker still holds', () => {
  const v = view(manual({ title: 'REWIND 26' }))!;
  assert.equal(v.title, 'REWIND 26');
  assert.equal(v.id, '');
  assert.equal(v.tickets.length, 0);
  assert.equal(v.speakers.length, 0);
});

test('typed by hand needs a name before it replaces the demo', () => {
  assert.equal(resolveEventRecord(null, manual({ startAt: '2026-10-09', venue: { name: 'Somewhere' } })), null);
});

test('typed by hand can never reach the on-site checkout', () => {
  const v = view(manual({ title: 'REWIND 26' }), null)!;
  const opts = {
    tickets: v.tickets,
    eventSlug: v.slug,
    eventPageBase: 'https://grace.church/events',
    paymentMethods: v.paymentMethods,
  };
  const onSite = resolveTicketing({ mode: 'onSite' }, opts);
  assert.notEqual(onSite.mode, 'onSite');
  assert.equal(onSite.href, null);
  const elsewhere = resolveTicketing(
    { mode: 'external', sellerName: 'Eventbrite', sellerUrl: 'https://eventbrite.example/rewind' },
    opts,
  );
  assert.equal(elsewhere.href, 'https://eventbrite.example/rewind');
});
