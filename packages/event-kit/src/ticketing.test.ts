import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTicketing, eventPageBaseFrom } from './ticketing.ts';
import type { TicketTier } from './event.ts';

const tier = (over: Partial<TicketTier> = {}): TicketTier => ({
  id: 't1',
  name: 'Standard',
  description: null,
  priceMinor: 2500,
  price: '£25.00',
  remaining: 40,
  soldOut: false,
  onSale: true,
  requiresSeat: false,
  ...over,
});

const opts = (over: Partial<Parameters<typeof resolveTicketing>[1]> = {}) => ({
  tickets: [tier()],
  eventSlug: 'uncommon-woman-2027',
  eventPageBase: 'https://grace.church/events',
  ...over,
});

test('the default is the on-site checkout', () => {
  const out = resolveTicketing(undefined, opts());
  assert.equal(out.mode, 'onSite');
  assert.equal(out.href, '/tickets');
  assert.equal(out.fellBack, false);
});

test('the event page is built from the base and the slug', () => {
  const out = resolveTicketing({ mode: 'eventPage' }, opts());
  assert.equal(out.href, 'https://grace.church/events/uncommon-woman-2027');
});

test('a typed event-page address wins over the derived one', () => {
  const out = resolveTicketing(
    { mode: 'eventPage', eventPageUrl: 'https://grace.church/uwc' },
    opts(),
  );
  assert.equal(out.href, 'https://grace.church/uwc');
});

test('the event-page buttons hide when there is no page to point at', () => {
  const out = resolveTicketing({ mode: 'eventPage' }, opts({ eventPageBase: null }));
  assert.equal(out.href, null);
});

test('somewhere else lists both outlets, primary first', () => {
  const out = resolveTicketing(
    {
      mode: 'external',
      sellerName: 'Eventbrite',
      sellerUrl: 'https://eventbrite.com/e/1',
      secondSellerName: 'Box office',
      secondSellerUrl: 'https://venue.example/tickets',
    },
    opts(),
  );
  assert.equal(out.href, 'https://eventbrite.com/e/1');
  assert.deepEqual(out.outlets.map((o) => o.label), ['Eventbrite', 'Box office']);
});

test('an outlet with no address is dropped, not rendered empty', () => {
  const out = resolveTicketing(
    { mode: 'external', sellerName: 'Eventbrite', sellerUrl: 'https://eventbrite.com/e/1', secondSellerName: 'VIP' },
    opts(),
  );
  assert.equal(out.outlets.length, 1);
});

test('an unnamed outlet still gets a button someone can read', () => {
  const out = resolveTicketing({ mode: 'external', sellerUrl: 'https://eventbrite.com/e/1' }, opts());
  assert.equal(out.outlets[0].label, 'Buy tickets');
});

test('a seated tier sends everyone to the event page, on-site or not', () => {
  const out = resolveTicketing({ mode: 'onSite' }, opts({ tickets: [tier(), tier({ id: 't2', requiresSeat: true })] }));
  assert.equal(out.mode, 'eventPage');
  assert.equal(out.fellBack, true);
  assert.equal(out.href, 'https://grace.church/events/uncommon-woman-2027');
});

test('no payment provider means no on-site checkout', () => {
  const out = resolveTicketing({ mode: 'onSite' }, opts({ paymentMethods: [] }));
  assert.equal(out.mode, 'eventPage');
  assert.equal(out.fellBack, true);
});

test('an older API sending no payment list is not read as "none"', () => {
  const out = resolveTicketing({ mode: 'onSite' }, opts({ paymentMethods: undefined }));
  assert.equal(out.mode, 'onSite');
  assert.equal(out.fellBack, false);
});

test('a seated tier does not override a church that chose somewhere else', () => {
  const out = resolveTicketing(
    { mode: 'external', sellerName: 'Eventbrite', sellerUrl: 'https://eventbrite.com/e/1' },
    opts({ tickets: [tier({ requiresSeat: true })] }),
  );
  assert.equal(out.mode, 'external');
  assert.equal(out.fellBack, false);
  assert.equal(out.href, 'https://eventbrite.com/e/1');
});

test('a church website becomes an event-page base, scheme or not', () => {
  assert.equal(eventPageBaseFrom('grace.church'), 'https://grace.church/events');
  assert.equal(eventPageBaseFrom('https://grace.church/'), 'https://grace.church/events');
  assert.equal(eventPageBaseFrom(null), null);
  assert.equal(eventPageBaseFrom('  '), null);
});
