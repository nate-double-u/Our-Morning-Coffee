const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validListKeys,
  normalizeSiteLists,
  getCategoryKeyForDay,
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

test('getCategoryKeyForDay maps weekends and weekdays correctly', () => {
  assert.equal(getCategoryKeyForDay(0), 'weekends');
  assert.equal(getCategoryKeyForDay(6), 'weekends');
  assert.equal(getCategoryKeyForDay(1), 'weekdays');
  assert.equal(getCategoryKeyForDay(5), 'weekdays');
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
