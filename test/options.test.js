const test = require('node:test');
const assert = require('node:assert/strict');
const { loadOptionsPage } = require('./helpers/options-page');

const lists = {
  everyday: ['https://a.com', 'https://b.com', 'https://c.com'],
  monday: ['https://m.com']
};

test('options page renders the everyday list on load with the version in the footer', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  assert.deepEqual(page.siteUrls(), ['https://a.com', 'https://b.com', 'https://c.com']);
  assert.equal(page.document.getElementById('site-count').textContent, '3');
  assert.equal(page.document.getElementById('version-info').textContent, 'v0.0.0-test');
});

test('switching tabs renders that list and updates the heading', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  await page.switchTab('monday');

  assert.deepEqual(page.siteUrls(), ['https://m.com']);
  assert.equal(page.document.getElementById('current-day-title').textContent, 'Monday');
  assert.equal(page.document.querySelector('.tab-button.active').dataset.day, 'monday');
});

test('an empty list shows the empty state', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  await page.switchTab('friday');

  assert.equal(page.siteUrls().length, 0);
  assert.match(page.document.getElementById('sites-container').textContent, /No sites added yet/);
});

test('move buttons are disabled at the ends of the list', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  assert.equal(page.moveButtons(0).up.disabled, true);
  assert.equal(page.moveButtons(0).down.disabled, false);
  assert.equal(page.moveButtons(2).up.disabled, false);
  assert.equal(page.moveButtons(2).down.disabled, true);
});

test('moving a site down saves the new order and re-renders', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  page.moveButtons(0).down.click();
  await page.flush();

  assert.deepEqual(page.siteUrls(), ['https://b.com', 'https://a.com', 'https://c.com']);
  assert.deepEqual(page.data.siteLists.everyday, ['https://b.com', 'https://a.com', 'https://c.com']);
  assert.deepEqual(page.data.siteLists.monday, ['https://m.com']);
});

test('moving a site up saves the new order and re-renders', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  page.moveButtons(2).up.click();
  await page.flush();

  assert.deepEqual(page.siteUrls(), ['https://a.com', 'https://c.com', 'https://b.com']);
});

test('adding a site prepends https, saves, and clears the input', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });
  const input = page.document.getElementById('new-url');

  input.value = '  example.com  ';
  page.document.getElementById('add-url-btn').click();
  await page.flush();

  assert.deepEqual(page.siteUrls(), ['https://a.com', 'https://b.com', 'https://c.com', 'https://example.com']);
  assert.equal(input.value, '');
  assert.deepEqual(page.calls.alerts, []);
});

test('adding a duplicate site alerts and does not save', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  page.document.getElementById('new-url').value = 'https://a.com';
  page.document.getElementById('add-url-btn').click();
  await page.flush();

  assert.deepEqual(page.calls.alerts, ['This site is already in the list']);
  assert.deepEqual(page.calls.set, []);
});

test('deleting a site asks for confirmation and removes it', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  page.deleteButton(1).click();
  await page.flush();

  assert.equal(page.calls.confirms.length, 1);
  assert.deepEqual(page.siteUrls(), ['https://a.com', 'https://c.com']);
  assert.deepEqual(page.data.siteLists.everyday, ['https://a.com', 'https://c.com']);
});

test('declining the delete confirmation leaves the list alone', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });
  page.setConfirmAnswer(false);

  page.deleteButton(1).click();
  await page.flush();

  assert.deepEqual(page.siteUrls(), ['https://a.com', 'https://b.com', 'https://c.com']);
  assert.deepEqual(page.calls.set, []);
});

test('settings form reflects stored settings and saves on change', async () => {
  const page = await loadOptionsPage({
    stored: { siteLists: lists, settings: { fillEmptyTab: false, openOrder: 'random' } }
  });
  const checkbox = page.document.getElementById('fill-empty-tab');
  const select = page.document.getElementById('open-order');

  assert.equal(checkbox.checked, false);
  assert.equal(select.value, 'random');

  checkbox.checked = true;
  checkbox.dispatchEvent(new page.window.Event('change'));
  await page.flush();

  assert.deepEqual(page.data.settings, { fillEmptyTab: true, openOrder: 'random' });
});

test('settings form falls back to defaults when nothing is stored', async () => {
  const page = await loadOptionsPage({ stored: { siteLists: lists } });

  assert.equal(page.document.getElementById('fill-empty-tab').checked, true);
  assert.equal(page.document.getElementById('open-order').value, 'list');
  assert.deepEqual(page.calls.set, []);
});

// Storage reads block while `held` is true; release() lets them through in the
// order given, so a test can decide which pending load finishes first.
function makeHeldReads() {
  const pending = [];
  let held = false;
  return {
    hooks: {
      beforeGet() {
        if (!held) return;
        return new Promise((resolve) => pending.push(resolve));
      }
    },
    hold() { held = true; },
    pendingCount() { return pending.length; },
    release(index = 0) {
      const [resolve] = pending.splice(index, 1);
      resolve();
    },
    releaseAll() {
      held = false;
      while (pending.length) pending.shift()();
    }
  };
}

test('all move buttons are disabled while a move is in flight', async () => {
  const reads = makeHeldReads();
  const page = await loadOptionsPage({ stored: { siteLists: lists }, hooks: reads.hooks });

  reads.hold();
  page.moveButtons(0).down.click();
  await page.flush();

  const buttons = [...page.document.querySelectorAll('.move-btn')];
  assert.equal(buttons.length, 6);
  assert.ok(buttons.every((button) => button.disabled));

  reads.releaseAll();
  await page.flush();
  assert.deepEqual(page.siteUrls(), ['https://b.com', 'https://a.com', 'https://c.com']);
  assert.equal(page.moveButtons(0).down.disabled, false);
});

test('a stale list load that finishes after a tab switch does not overwrite the newer tab', async () => {
  const stored = { siteLists: { ...lists, weekends: ['https://w.com'] } };
  const reads = makeHeldReads();
  const page = await loadOptionsPage({ stored, hooks: reads.hooks });

  reads.hold();
  page.document.querySelector('.tab-button[data-day="monday"]').click();
  page.document.querySelector('.tab-button[data-day="weekends"]').click();
  await page.flush();
  assert.equal(reads.pendingCount(), 2);

  reads.release(1); // weekends load finishes first
  await page.flush();
  reads.release(0); // then the stale monday load
  await page.flush();

  assert.equal(page.document.getElementById('current-day-title').textContent, 'Weekends');
  assert.deepEqual(page.siteUrls(), ['https://w.com']);
});

// LOCKED: regression for #37 review (serialize list mutations)
test('a delete that overlaps an in-flight move does not lose the move', async () => {
  const reads = makeHeldReads();
  const page = await loadOptionsPage({ stored: { siteLists: lists }, hooks: reads.hooks });

  reads.hold();
  page.moveButtons(0).down.click(); // a down: expect b, a, c
  await page.flush();
  page.deleteButton(2).click(); // delete c
  await page.flush();

  reads.releaseAll();
  await page.flush();

  assert.deepEqual(page.data.siteLists.everyday, ['https://b.com', 'https://a.com']);
  assert.deepEqual(page.siteUrls(), ['https://b.com', 'https://a.com']);
});

// LOCKED: regression for #38 review (queued delete used a stale row index)
test('a delete queued behind a move removes the clicked site, not whatever lands at its index', async () => {
  const reads = makeHeldReads();
  const page = await loadOptionsPage({ stored: { siteLists: lists }, hooks: reads.hooks });

  reads.hold();
  page.moveButtons(0).down.click(); // a down: b, a, c
  await page.flush();
  page.deleteButton(0).click(); // row 0 still shows a
  await page.flush();

  reads.releaseAll();
  await page.flush();

  assert.deepEqual(page.data.siteLists.everyday, ['https://b.com', 'https://c.com']);
  assert.deepEqual(page.siteUrls(), ['https://b.com', 'https://c.com']);
});

// LOCKED: regression for #38 review (queued move used a stale row index)
test('a move queued behind a delete moves the clicked site, not whatever lands at its index', async () => {
  const reads = makeHeldReads();
  const page = await loadOptionsPage({ stored: { siteLists: lists }, hooks: reads.hooks });

  reads.hold();
  page.deleteButton(0).click(); // delete a: b, c
  await page.flush();
  page.moveButtons(1).down.click(); // row 1 still shows b
  await page.flush();

  reads.releaseAll();
  await page.flush();

  assert.deepEqual(page.data.siteLists.everyday, ['https://c.com', 'https://b.com']);
  assert.deepEqual(page.siteUrls(), ['https://c.com', 'https://b.com']);
});
