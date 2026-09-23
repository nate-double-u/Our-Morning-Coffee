const test = require('node:test');
const assert = require('node:assert/strict');
const { isEmptyTabUrl } = require('../shared/tabs');

test('isEmptyTabUrl recognizes Firefox empty-tab pages', () => {
  for (const url of ['about:newtab', 'about:blank', 'about:home', 'about:privatebrowsing']) {
    assert.equal(isEmptyTabUrl(url), true, url);
  }
});

test('isEmptyTabUrl treats an unknown url as not empty', () => {
  assert.equal(isEmptyTabUrl(''), false);
  assert.equal(isEmptyTabUrl(undefined), false);
  assert.equal(isEmptyTabUrl(null), false);
});

test('isEmptyTabUrl rejects real pages and other about: pages', () => {
  for (const url of [
    'https://example.com',
    'http://localhost:8282/',
    'about:preferences',
    'about:debugging',
    'about:addons',
    'moz-extension://abc/popup/popup.html?mode=tab',
    'file:///tmp/x.html'
  ]) {
    assert.equal(isEmptyTabUrl(url), false, url);
  }
});

test('isEmptyTabUrl rejects non-string input', () => {
  assert.equal(isEmptyTabUrl(42), false);
  assert.equal(isEmptyTabUrl({}), false);
});
