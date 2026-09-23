const test = require('node:test');
const assert = require('node:assert/strict');

function makeBrowserMock({ getResult }) {
  const mock = {
    _installedListener: null,
    _commandListener: null,
    _messageListener: null,
    calls: {
      set: [],
      tabsCreate: [],
      notifications: []
    },
    runtime: {
      onInstalled: {
        addListener(listener) {
          mock._installedListener = listener;
        }
      },
      onMessage: {
        addListener(listener) {
          mock._messageListener = listener;
        }
      },
      getURL(path) {
        return `moz-extension://${path}`;
      }
    },
    commands: {
      onCommand: {
        addListener(listener) {
          mock._commandListener = listener;
        }
      }
    },
    storage: {
      local: {
        async get() {
          return getResult;
        },
        async set(payload) {
          mock.calls.set.push(payload);
        }
      }
    },
    tabs: {
      async create(payload) {
        mock.calls.tabsCreate.push(payload);
      }
    },
    notifications: {
      create(payload) {
        mock.calls.notifications.push(payload);
      }
    }
  };

  return mock;
}

function loadBackgroundWithBrowser(browserMock) {
  global.browser = browserMock;
  delete require.cache[require.resolve('../background/background')];
  return require('../background/background');
}

test.afterEach(() => {
  delete global.browser;
  delete require.cache[require.resolve('../background/background')];
});

// LOCKED: regression for v1.1.0 baseline
test('openTodaysSites opens combined deduplicated weekday sites and sends success notification', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com', 'https://shared.com'],
        weekdays: ['https://b.com', 'https://shared.com'],
        monday: ['https://c.com']
      }
    }
  });
  const { openTodaysSites } = loadBackgroundWithBrowser(browserMock);

  await openTodaysSites(1);

  assert.deepEqual(browserMock.calls.tabsCreate, [
    { url: 'https://a.com', active: false },
    { url: 'https://shared.com', active: false },
    { url: 'https://b.com', active: false },
    { url: 'https://c.com', active: false }
  ]);
  assert.equal(browserMock.calls.notifications.length, 1);
  assert.match(browserMock.calls.notifications[0].message, /Opened 4 site\(s\) for monday/);
});

// LOCKED: regression for v1.1.0 baseline
test('openTodaysSites shows empty-state notification when there are no sites for the day', async () => {
  const browserMock = makeBrowserMock({ getResult: { siteLists: {} } });
  const { openTodaysSites } = loadBackgroundWithBrowser(browserMock);

  await openTodaysSites(2);

  assert.deepEqual(browserMock.calls.tabsCreate, []);
  assert.equal(browserMock.calls.notifications.length, 1);
  assert.match(
    browserMock.calls.notifications[0].message,
    /No sites configured for today/
  );
});

// LOCKED: regression for v1.1.0 baseline
test('onInstalled initializes storage when siteLists is missing', async () => {
  const browserMock = makeBrowserMock({ getResult: {} });
  loadBackgroundWithBrowser(browserMock);

  await browserMock._installedListener();

  assert.equal(browserMock.calls.set.length, 1);
  assert.deepEqual(
    Object.keys(browserMock.calls.set[0].siteLists),
    ['everyday', 'weekdays', 'weekends', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  );
});

// LOCKED: regression for v1.1.0 baseline
test('onInstalled normalizes malformed stored data', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com'],
        monday: 'bad-value'
      }
    }
  });
  loadBackgroundWithBrowser(browserMock);

  await browserMock._installedListener();

  assert.equal(browserMock.calls.set.length, 1);
  assert.deepEqual(browserMock.calls.set[0].siteLists.monday, []);
  assert.deepEqual(browserMock.calls.set[0].siteLists.everyday, ['https://a.com']);
});

// LOCKED: regression for v1.1.0 baseline
test('onCommand listener calls openTodaysSites for open-morning-coffee command', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com']
      }
    }
  });
  loadBackgroundWithBrowser(browserMock);

  await browserMock._commandListener('open-morning-coffee');

  assert.equal(browserMock.calls.tabsCreate.length, 1);
  assert.deepEqual(browserMock.calls.tabsCreate[0], { url: 'https://a.com', active: false });
});

// LOCKED: regression for v1.1.0 baseline
test('onCommand listener ignores unknown commands', async () => {
  const browserMock = makeBrowserMock({ getResult: { siteLists: {} } });
  loadBackgroundWithBrowser(browserMock);

  await browserMock._commandListener('some-other-command');

  assert.deepEqual(browserMock.calls.tabsCreate, []);
  assert.deepEqual(browserMock.calls.notifications, []);
});

test('openTodaysSites returns the number of sites opened and skips notification when notify is false', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com', 'https://b.com']
      }
    }
  });
  const { openTodaysSites } = loadBackgroundWithBrowser(browserMock);

  const opened = await openTodaysSites(1, { notify: false });

  assert.equal(opened, 2);
  assert.equal(browserMock.calls.tabsCreate.length, 2);
  assert.deepEqual(browserMock.calls.notifications, []);
});

test('openTodaysSites returns 0 when there are no sites for the day', async () => {
  const browserMock = makeBrowserMock({ getResult: { siteLists: {} } });
  const { openTodaysSites } = loadBackgroundWithBrowser(browserMock);

  const opened = await openTodaysSites(2, { notify: false });

  assert.equal(opened, 0);
  assert.deepEqual(browserMock.calls.tabsCreate, []);
  assert.deepEqual(browserMock.calls.notifications, []);
});

test('onMessage listener opens today\'s sites for open-todays-sites and honors notify: false', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com']
      }
    }
  });
  loadBackgroundWithBrowser(browserMock);

  const opened = await browserMock._messageListener({ type: 'open-todays-sites', notify: false });

  assert.equal(opened, 1);
  assert.deepEqual(browserMock.calls.tabsCreate, [{ url: 'https://a.com', active: false }]);
  assert.deepEqual(browserMock.calls.notifications, []);
});

test('onMessage listener notifies by default when notify is omitted', async () => {
  const browserMock = makeBrowserMock({
    getResult: {
      siteLists: {
        everyday: ['https://a.com']
      }
    }
  });
  loadBackgroundWithBrowser(browserMock);

  await browserMock._messageListener({ type: 'open-todays-sites' });

  assert.equal(browserMock.calls.notifications.length, 1);
});

test('onMessage listener ignores unrelated messages', async () => {
  const browserMock = makeBrowserMock({ getResult: { siteLists: { everyday: ['https://a.com'] } } });
  loadBackgroundWithBrowser(browserMock);

  const result = await browserMock._messageListener({ type: 'something-else' });

  assert.equal(result, undefined);
  assert.deepEqual(browserMock.calls.tabsCreate, []);
  assert.deepEqual(browserMock.calls.notifications, []);
});
