const test = require('node:test');
const assert = require('node:assert/strict');

function makeBrowserMock({ getResult }) {
  const mock = {
    _installedListener: null,
    _commandListener: null,
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
  delete require.cache[require.resolve('../background')];
  return require('../background');
}

test.afterEach(() => {
  delete global.browser;
  delete require.cache[require.resolve('../background')];
});

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
