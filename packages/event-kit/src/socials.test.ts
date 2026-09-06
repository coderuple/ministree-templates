import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSocials, handleFrom } from './socials.ts';

test('the Customizer list wins outright over the profile', () => {
  const out = resolveSocials(
    [{ label: 'TikTok', href: 'https://tiktok.com/@uwc' }],
    { instagram: 'https://instagram.com/church' },
  );
  assert.deepEqual(out.map((s) => s.label), ['TikTok']);
});

test('the profile fills in when the list is empty', () => {
  const out = resolveSocials([], {
    instagram: 'https://instagram.com/church',
    youtube: 'https://youtube.com/@church',
    facebook: null,
    x: undefined,
  });
  assert.deepEqual(out.map((s) => s.label), ['Instagram', 'YouTube']);
});

test('a pasted bare domain becomes a working link', () => {
  const [row] = resolveSocials([{ label: 'Instagram', href: 'instagram.com/uwc' }], null);
  assert.equal(row.href, 'https://instagram.com/uwc');
});

test('rows that cannot make a link are dropped, not shipped broken', () => {
  const out = resolveSocials(
    [
      { label: 'Instagram', href: '@uwc' },   // a handle names no platform
      { label: '', href: 'https://x.com/uwc' },
      { label: 'Nowhere', href: '  ' },
      { label: 'Good', href: 'https://x.com/uwc' },
    ],
    null,
  );
  assert.deepEqual(out.map((s) => s.label), ['Good']);
});

test('mailto and tel survive untouched', () => {
  const out = resolveSocials(
    [{ label: 'Email', href: 'mailto:hello@uwc.org' }, { label: 'Call', href: 'tel:+447700900000' }],
    null,
  );
  assert.deepEqual(out.map((s) => s.href), ['mailto:hello@uwc.org', 'tel:+447700900000']);
});

test('the same destination twice is a mistake', () => {
  const out = resolveSocials(
    [{ label: 'IG', href: 'https://instagram.com/uwc' }, { label: 'Instagram', href: 'https://Instagram.com/uwc' }],
    null,
  );
  assert.equal(out.length, 1);
});

test('handles are read off the URL for designs that print them', () => {
  assert.equal(handleFrom('https://instagram.com/uncommonwomanconf'), '@uncommonwomanconf');
  assert.equal(handleFrom('https://youtube.com/@esthersministry'), '@esthersministry');
  assert.equal(handleFrom('https://facebook.com/'), 'facebook.com');
});
