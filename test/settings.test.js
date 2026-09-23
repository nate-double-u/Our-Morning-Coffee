const test = require('node:test');
const assert = require('node:assert/strict');
const { defaultSettings, normalizeSettings, openOrders } = require('../shared/settings');

test('defaultSettings fills the empty tab and opens in list order', () => {
  assert.deepEqual(defaultSettings, { fillEmptyTab: true, openOrder: 'list' });
});

test('openOrders lists the supported orderings', () => {
  assert.deepEqual(openOrders, ['list', 'random']);
});

test('normalizeSettings returns defaults for missing or null input', () => {
  assert.deepEqual(normalizeSettings(), defaultSettings);
  assert.deepEqual(normalizeSettings(null), defaultSettings);
  assert.deepEqual(normalizeSettings({}), defaultSettings);
});

test('normalizeSettings keeps valid values', () => {
  assert.deepEqual(
    normalizeSettings({ fillEmptyTab: false, openOrder: 'random' }),
    { fillEmptyTab: false, openOrder: 'random' }
  );
});

test('normalizeSettings replaces wrong types and unknown values with defaults', () => {
  assert.deepEqual(
    normalizeSettings({ fillEmptyTab: 'yes', openOrder: 'alphabetical' }),
    defaultSettings
  );
});

test('normalizeSettings drops unknown keys and does not mutate input', () => {
  const input = { openOrder: 'random', extra: 1 };
  const normalized = normalizeSettings(input);
  assert.deepEqual(Object.keys(normalized), ['fillEmptyTab', 'openOrder']);
  assert.deepEqual(input, { openOrder: 'random', extra: 1 });
});

test('normalizeSettings returns a fresh object each call', () => {
  const a = normalizeSettings();
  const b = normalizeSettings();
  assert.notEqual(a, b);
  a.openOrder = 'random';
  assert.equal(defaultSettings.openOrder, 'list');
});
