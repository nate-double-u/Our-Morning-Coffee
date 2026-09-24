const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('browser_action has a light and a dark toolbar icon', () => {
  const { theme_icons: themeIcons } = manifest.browser_action;

  assert.ok(Array.isArray(themeIcons) && themeIcons.length > 0);
  for (const { light, dark, size } of themeIcons) {
    assert.ok(fs.existsSync(path.join(root, light)), `${light} exists`);
    assert.ok(fs.existsSync(path.join(root, dark)), `${dark} exists`);
    assert.ok(Number.isInteger(size) && size > 0);
  }
});

// Firefox keys a string default_icon as size 19 and each theme_icons entry by
// its size, then picks the nearest size per display density. Keeping the
// sizes aligned means every density resolves to a themed icon.
test('theme_icons sizes match default_icon sizes', () => {
  const { default_icon: defaultIcon, theme_icons: themeIcons } = manifest.browser_action;

  assert.equal(typeof defaultIcon, 'object');
  for (const { size } of themeIcons) {
    assert.ok(String(size) in defaultIcon, `default_icon has size ${size}`);
  }
});
