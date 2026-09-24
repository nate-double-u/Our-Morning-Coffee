const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validListKeys,
  normalizeSiteLists,
  getCategoryKeyForDay,
  getDayKey,
  getSitesToOpen,
  addSiteToList,
  orderSites,
  moveSite
} = require('../shared/site-lists');

// LOCKED: regression for v1.1.0 baseline
test('normalizeSiteLists keeps known lists and drops invalid values', () => {
  const normalized = normalizeSiteLists({
    everyday: ['https://example.com'],
    monday: 'not-an-array',
    unknown: ['https://ignored.com']
  });

  assert.deepEqual(Object.keys(normalized), validListKeys);
  assert.deepEqual(normalized.everyday, ['https://example.com']);
  assert.deepEqual(normalized.monday, []);
  assert.equal(normalized.unknown, undefined);
});

// LOCKED: regression for v1.1.0 baseline
test('normalizeSiteLists filters out non-string values', () => {
  const normalized = normalizeSiteLists({
    everyday: [123, null, 'https://valid.com', undefined, true]
  });
  assert.deepEqual(normalized.everyday, ['https://valid.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('normalizeSiteLists trims and filters empty strings', () => {
  const normalized = normalizeSiteLists({
    everyday: ['', 'https://valid.com', '   ', '  https://trimmed.com  ']
  });
  assert.deepEqual(normalized.everyday, ['https://valid.com', 'https://trimmed.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('normalizeSiteLists handles null input', () => {
  const normalized = normalizeSiteLists(null);
  assert.deepEqual(Object.keys(normalized), validListKeys);
  assert.deepEqual(normalized.everyday, []);
});

// LOCKED: regression for v1.1.0 baseline
test('getCategoryKeyForDay maps weekends and weekdays correctly', () => {
  assert.equal(getCategoryKeyForDay(0), 'weekends');
  assert.equal(getCategoryKeyForDay(6), 'weekends');
  assert.equal(getCategoryKeyForDay(1), 'weekdays');
  assert.equal(getCategoryKeyForDay(5), 'weekdays');
});

// LOCKED: regression for v1.1.0 baseline
test('getDayKey returns correct day name for each index', () => {
  assert.equal(getDayKey(0), 'sunday');
  assert.equal(getDayKey(1), 'monday');
  assert.equal(getDayKey(2), 'tuesday');
  assert.equal(getDayKey(3), 'wednesday');
  assert.equal(getDayKey(4), 'thursday');
  assert.equal(getDayKey(5), 'friday');
  assert.equal(getDayKey(6), 'saturday');
});

// LOCKED: regression for v1.1.0 baseline
test('getDayKey returns undefined for out-of-range index', () => {
  assert.equal(getDayKey(7), undefined);
  assert.equal(getDayKey(-1), undefined);
  assert.equal(getDayKey(100), undefined);
});

// LOCKED: regression for v1.1.0 baseline
test('getSitesToOpen still includes weekday category for out-of-range dayIndex', () => {
  const sites = getSitesToOpen(
    { everyday: ['https://a.com'], weekdays: ['https://b.com'], monday: ['https://c.com'] },
    99
  );
  // dayKey is undefined so day-specific list is skipped,
  // but getCategoryKeyForDay(99) returns 'weekdays'
  assert.deepEqual(sites, ['https://a.com', 'https://b.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('getSitesToOpen handles null siteLists', () => {
  assert.deepEqual(getSitesToOpen(null, 1), []);
  assert.deepEqual(getSitesToOpen(undefined, 1), []);
});

// LOCKED: regression for v1.1.0 baseline
test('getSitesToOpen filters out non-string values from lists', () => {
  const sites = getSitesToOpen(
    { everyday: [123, null, 'https://valid.com'] },
    1
  );
  assert.deepEqual(sites, ['https://valid.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('getSitesToOpen deduplicates within a single list', () => {
  const sites = getSitesToOpen(
    { everyday: ['https://a.com', 'https://a.com', 'https://b.com'] },
    1
  );
  assert.deepEqual(sites, ['https://a.com', 'https://b.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('getSitesToOpen merges and de-duplicates everyday, category, and day lists', () => {
  const sites = getSitesToOpen(
    {
      everyday: ['https://a.com', 'https://shared.com'],
      weekdays: ['https://b.com', 'https://shared.com'],
      monday: ['https://c.com', 'https://shared.com']
    },
    1
  );

  assert.deepEqual(sites, [
    'https://a.com',
    'https://shared.com',
    'https://b.com',
    'https://c.com'
  ]);
});

test('addSiteToList appends the url to the named list and reports added', () => {
  const { siteLists, added } = addSiteToList({ monday: ['https://a.com'] }, 'monday', 'https://b.com');

  assert.equal(added, true);
  assert.deepEqual(siteLists.monday, ['https://a.com', 'https://b.com']);
});

test('addSiteToList rejects a url already in that list and leaves lists unchanged', () => {
  const { siteLists, added } = addSiteToList({ monday: ['https://a.com'] }, 'monday', 'https://a.com');

  assert.equal(added, false);
  assert.deepEqual(siteLists.monday, ['https://a.com']);
});

test('addSiteToList allows the same url in a different list', () => {
  const { siteLists, added } = addSiteToList({ monday: ['https://a.com'] }, 'everyday', 'https://a.com');

  assert.equal(added, true);
  assert.deepEqual(siteLists.everyday, ['https://a.com']);
  assert.deepEqual(siteLists.monday, ['https://a.com']);
});

test('addSiteToList returns normalized lists and does not mutate its input', () => {
  const input = { monday: ['https://a.com'], junk: ['x'] };
  const { siteLists } = addSiteToList(input, 'monday', 'https://b.com');

  assert.deepEqual(input, { monday: ['https://a.com'], junk: ['x'] });
  assert.deepEqual(Object.keys(siteLists), validListKeys);
  assert.equal(siteLists.junk, undefined);
});

test('addSiteToList handles missing lists and null input', () => {
  const fromNull = addSiteToList(null, 'friday', 'https://a.com');
  assert.equal(fromNull.added, true);
  assert.deepEqual(fromNull.siteLists.friday, ['https://a.com']);

  const fromEmpty = addSiteToList({}, 'friday', 'https://a.com');
  assert.equal(fromEmpty.added, true);
  assert.deepEqual(fromEmpty.siteLists.friday, ['https://a.com']);
});

test('addSiteToList rejects an unknown list key', () => {
  const { siteLists, added } = addSiteToList({}, 'someday', 'https://a.com');

  assert.equal(added, false);
  assert.equal(siteLists.someday, undefined);
});

test('addSiteToList trims the url and treats a padded duplicate as already present', () => {
  const padded = addSiteToList({ monday: ['https://a.com'] }, 'monday', '  https://a.com  ');
  assert.equal(padded.added, false);
  assert.deepEqual(padded.siteLists.monday, ['https://a.com']);

  const fresh = addSiteToList({}, 'monday', '  https://b.com ');
  assert.equal(fresh.added, true);
  assert.deepEqual(fresh.siteLists.monday, ['https://b.com']);
});

test('addSiteToList rejects empty and non-string urls', () => {
  for (const bad of ['', '   ', null, undefined, 42]) {
    const { siteLists, added } = addSiteToList({}, 'monday', bad);
    assert.equal(added, false, `expected ${JSON.stringify(bad)} to be rejected`);
    assert.deepEqual(siteLists.monday, []);
  }
});

test('orderSites with list order returns the sites unchanged, as a copy', () => {
  const sites = ['https://a.com', 'https://b.com', 'https://c.com'];

  const ordered = orderSites(sites, 'list');

  assert.deepEqual(ordered, sites);
  assert.notEqual(ordered, sites);
});

test('orderSites with random order shuffles using the supplied random source', () => {
  const sites = ['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com'];
  // Fisher-Yates from the end: each call picks the index to swap with.
  const picks = [0, 0, 0];
  const random = () => picks.shift();

  const ordered = orderSites(sites, 'random', random);

  assert.deepEqual(ordered, ['https://b.com', 'https://c.com', 'https://d.com', 'https://a.com']);
  assert.deepEqual(sites, ['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com']);
});

test('orderSites with random order keeps every site exactly once', () => {
  const sites = ['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com', 'https://e.com'];

  const ordered = orderSites(sites, 'random');

  assert.deepEqual([...ordered].sort(), [...sites].sort());
});

test('orderSites falls back to list order for an unknown order', () => {
  const sites = ['https://a.com', 'https://b.com'];

  assert.deepEqual(orderSites(sites, 'sideways'), sites);
  assert.deepEqual(orderSites(sites, undefined), sites);
});

test('orderSites handles empty and single-item lists', () => {
  assert.deepEqual(orderSites([], 'random'), []);
  assert.deepEqual(orderSites(['https://a.com'], 'random'), ['https://a.com']);
});

test('moveSite moves a site up one place and reports moved', () => {
  const input = { everyday: ['https://a.com', 'https://b.com', 'https://c.com'] };

  const { siteLists, moved } = moveSite(input, 'everyday', 2, -1);

  assert.equal(moved, true);
  assert.deepEqual(siteLists.everyday, ['https://a.com', 'https://c.com', 'https://b.com']);
});

test('moveSite moves a site down one place', () => {
  const input = { everyday: ['https://a.com', 'https://b.com', 'https://c.com'] };

  const { siteLists, moved } = moveSite(input, 'everyday', 0, 1);

  assert.equal(moved, true);
  assert.deepEqual(siteLists.everyday, ['https://b.com', 'https://a.com', 'https://c.com']);
});

test('moveSite refuses to move past either end and leaves the list unchanged', () => {
  const input = { everyday: ['https://a.com', 'https://b.com'] };

  const up = moveSite(input, 'everyday', 0, -1);
  const down = moveSite(input, 'everyday', 1, 1);

  assert.equal(up.moved, false);
  assert.equal(down.moved, false);
  assert.deepEqual(up.siteLists.everyday, ['https://a.com', 'https://b.com']);
  assert.deepEqual(down.siteLists.everyday, ['https://a.com', 'https://b.com']);
});

test('moveSite rejects an out-of-range index, unknown list key, and zero delta', () => {
  const input = { everyday: ['https://a.com', 'https://b.com'] };

  assert.equal(moveSite(input, 'everyday', 5, -1).moved, false);
  assert.equal(moveSite(input, 'everyday', -1, 1).moved, false);
  assert.equal(moveSite(input, 'someday', 0, 1).moved, false);
  assert.equal(moveSite(input, 'everyday', 0, 0).moved, false);
});

test('moveSite returns normalized lists and does not mutate its input', () => {
  const input = { everyday: ['https://a.com', 'https://b.com'], monday: 'bad-value' };

  const { siteLists } = moveSite(input, 'everyday', 0, 1);

  assert.deepEqual(input.everyday, ['https://a.com', 'https://b.com']);
  assert.deepEqual(siteLists.monday, []);
  assert.deepEqual(Object.keys(siteLists), validListKeys);
});
