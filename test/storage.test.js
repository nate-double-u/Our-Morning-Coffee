const test = require('node:test');
const assert = require('node:assert/strict');
const { validListKeys } = require('../shared/site-lists');
const { loadSiteLists, saveSiteLists } = require('../shared/storage');

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
