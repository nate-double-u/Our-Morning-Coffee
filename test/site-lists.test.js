const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validListKeys,
  normalizeSiteLists,
  getCategoryKeyForDay,
  getDayKey,
  getSitesToOpen
} = require('../shared/site-lists');

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

test('normalizeSiteLists filters out non-string values', () => {
  const normalized = normalizeSiteLists({
    everyday: [123, null, 'https://valid.com', undefined, true]
  });
  assert.deepEqual(normalized.everyday, ['https://valid.com']);
});

test('normalizeSiteLists trims and filters empty strings', () => {
  const normalized = normalizeSiteLists({
    everyday: ['', 'https://valid.com', '   ', '  https://trimmed.com  ']
  });
  assert.deepEqual(normalized.everyday, ['https://valid.com', 'https://trimmed.com']);
});

test('normalizeSiteLists handles null input', () => {
  const normalized = normalizeSiteLists(null);
  assert.deepEqual(Object.keys(normalized), validListKeys);
  assert.deepEqual(normalized.everyday, []);
});

test('getCategoryKeyForDay maps weekends and weekdays correctly', () => {
  assert.equal(getCategoryKeyForDay(0), 'weekends');
  assert.equal(getCategoryKeyForDay(6), 'weekends');
  assert.equal(getCategoryKeyForDay(1), 'weekdays');
  assert.equal(getCategoryKeyForDay(5), 'weekdays');
});

test('getDayKey returns correct day name for each index', () => {
  assert.equal(getDayKey(0), 'sunday');
  assert.equal(getDayKey(1), 'monday');
  assert.equal(getDayKey(2), 'tuesday');
  assert.equal(getDayKey(3), 'wednesday');
  assert.equal(getDayKey(4), 'thursday');
  assert.equal(getDayKey(5), 'friday');
  assert.equal(getDayKey(6), 'saturday');
});

test('getDayKey returns undefined for out-of-range index', () => {
  assert.equal(getDayKey(7), undefined);
  assert.equal(getDayKey(-1), undefined);
  assert.equal(getDayKey(100), undefined);
});

test('getSitesToOpen still includes weekday category for out-of-range dayIndex', () => {
  const sites = getSitesToOpen(
    { everyday: ['https://a.com'], weekdays: ['https://b.com'], monday: ['https://c.com'] },
    99
  );
  // dayKey is undefined so day-specific list is skipped,
  // but getCategoryKeyForDay(99) returns 'weekdays'
  assert.deepEqual(sites, ['https://a.com', 'https://b.com']);
});

test('getSitesToOpen handles null siteLists', () => {
  assert.deepEqual(getSitesToOpen(null, 1), []);
  assert.deepEqual(getSitesToOpen(undefined, 1), []);
});

test('getSitesToOpen filters out non-string values from lists', () => {
  const sites = getSitesToOpen(
    { everyday: [123, null, 'https://valid.com'] },
    1
  );
  assert.deepEqual(sites, ['https://valid.com']);
});

test('getSitesToOpen deduplicates within a single list', () => {
  const sites = getSitesToOpen(
    { everyday: ['https://a.com', 'https://a.com', 'https://b.com'] },
    1
  );
  assert.deepEqual(sites, ['https://a.com', 'https://b.com']);
});

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
