const test = require('node:test');
const assert = require('node:assert/strict');
const { validListKeys } = require('../shared/site-lists');
const { loadSiteLists, saveSiteLists, normalizeStoredSiteLists, loadSettings, saveSettings } = require('../shared/storage');
const { defaultSettings } = require('../shared/settings');

function installStorageMock(stored) {
  const calls = { set: [] };
  global.browser = {
    storage: {
      local: {
        async get(key) {
          return key in stored ? { [key]: stored[key] } : {};
        },
        async set(payload) {
          calls.set.push(payload);
        }
      }
    }
  };
  return calls;
}

test.afterEach(() => {
  delete global.browser;
});

test('loadSiteLists returns normalized lists from storage', async () => {
  installStorageMock({ siteLists: { everyday: [' https://a.com ', 42], monday: 'bad' } });

  const siteLists = await loadSiteLists();

  assert.deepEqual(Object.keys(siteLists), validListKeys);
  assert.deepEqual(siteLists.everyday, ['https://a.com']);
  assert.deepEqual(siteLists.monday, []);
});

test('loadSiteLists returns empty normalized lists when nothing is stored', async () => {
  installStorageMock({});

  const siteLists = await loadSiteLists();

  assert.deepEqual(Object.keys(siteLists), validListKeys);
  assert.ok(validListKeys.every(key => siteLists[key].length === 0));
});

// LOCKED: regression for storage contract (siteLists key, normalized shape)
test('saveSiteLists writes normalized lists under the siteLists key', async () => {
  const calls = installStorageMock({});

  await saveSiteLists({ everyday: ['https://a.com', ''], junk: ['x'] });

  assert.equal(calls.set.length, 1);
  assert.deepEqual(Object.keys(calls.set[0]), ['siteLists']);
  assert.deepEqual(calls.set[0].siteLists.everyday, ['https://a.com']);
  assert.equal(calls.set[0].siteLists.junk, undefined);
});

test('normalizeStoredSiteLists writes default lists when nothing is stored', async () => {
  const calls = installStorageMock({});

  await normalizeStoredSiteLists();

  assert.equal(calls.set.length, 1);
  assert.deepEqual(Object.keys(calls.set[0].siteLists), validListKeys);
  assert.ok(validListKeys.every(key => calls.set[0].siteLists[key].length === 0));
});

test('normalizeStoredSiteLists rewrites malformed stored lists', async () => {
  const calls = installStorageMock({ siteLists: { everyday: ['https://a.com'], monday: 'bad' } });

  await normalizeStoredSiteLists();

  assert.equal(calls.set.length, 1);
  assert.deepEqual(calls.set[0].siteLists.everyday, ['https://a.com']);
  assert.deepEqual(calls.set[0].siteLists.monday, []);
});

test('normalizeStoredSiteLists does not write when stored lists are already normalized', async () => {
  const { normalizeSiteLists } = require('../shared/site-lists');
  const calls = installStorageMock({ siteLists: normalizeSiteLists({ everyday: ['https://a.com'] }) });

  await normalizeStoredSiteLists();

  assert.equal(calls.set.length, 0);
});

test('loadSettings returns defaults when nothing is stored', async () => {
  installStorageMock({});

  assert.deepEqual(await loadSettings(), defaultSettings);
});

test('loadSettings normalizes stored settings', async () => {
  installStorageMock({ settings: { openOrder: 'random', fillEmptyTab: 'nope', junk: 1 } });

  assert.deepEqual(await loadSettings(), { fillEmptyTab: true, openOrder: 'random' });
});

// LOCKED: regression for storage contract (settings key, normalized shape)
test('saveSettings writes normalized settings under the settings key', async () => {
  const calls = installStorageMock({});

  await saveSettings({ openOrder: 'random', junk: 1 });

  assert.equal(calls.set.length, 1);
  assert.deepEqual(Object.keys(calls.set[0]), ['settings']);
  assert.deepEqual(calls.set[0].settings, { fillEmptyTab: true, openOrder: 'random' });
});

test('saveSettings does not touch siteLists', async () => {
  const calls = installStorageMock({ siteLists: { everyday: ['https://a.com'] } });

  await saveSettings({ openOrder: 'random' });

  assert.equal(calls.set.length, 1);
  assert.equal('siteLists' in calls.set[0], false);
});
