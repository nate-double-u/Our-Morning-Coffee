// Loads options/options.html and its scripts into a jsdom window with a
// fake `browser` API, so the options page can be exercised end to end.

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..', '..');
const scripts = [
  'shared/site-lists.js',
  'shared/settings.js',
  'shared/storage.js',
  'options/options.js'
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

// Let queued promise callbacks and timers run so async handlers settle.
async function flush(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

// `stored` seeds browser.storage.local. `hooks.beforeGet` / `hooks.beforeSet`
// are awaited before each storage call, which lets a test hold one operation
// open while another runs.
async function loadOptionsPage({ stored = {}, hooks = {} } = {}) {
  const html = read('options/options.html');
  const dom = new JSDOM(html, {
    url: 'moz-extension://test/options/options.html',
    runScripts: 'outside-only'
  });
  const { window } = dom;
  const data = structuredClone(stored);
  const calls = { set: [], alerts: [], confirms: [] };
  let confirmAnswer = true;

  window.browser = {
    storage: {
      local: {
        async get(key) {
          if (hooks.beforeGet) await hooks.beforeGet();
          return key in data ? { [key]: structuredClone(data[key]) } : {};
        },
        async set(payload) {
          if (hooks.beforeSet) await hooks.beforeSet();
          Object.assign(data, structuredClone(payload));
          calls.set.push(structuredClone(payload));
        }
      }
    },
    runtime: {
      getManifest() {
        return { version: '0.0.0-test' };
      }
    }
  };
  window.alert = (message) => calls.alerts.push(message);
  window.confirm = (message) => {
    calls.confirms.push(message);
    return confirmAnswer;
  };

  // jsdom dispatches DOMContentLoaded asynchronously after construction, so
  // evaluating the scripts now registers their listeners in time.
  for (const file of scripts) {
    window.eval(read(file));
  }
  await flush();

  const { document } = window;
  return {
    window,
    document,
    data,
    calls,
    flush,
    setConfirmAnswer(answer) {
      confirmAnswer = answer;
    },
    siteUrls() {
      return [...document.querySelectorAll('#sites-container .site-url a')].map((a) => a.textContent);
    },
    moveButtons(rowIndex) {
      const row = document.querySelectorAll('#sites-container li')[rowIndex];
      const [up, down] = row.querySelectorAll('.move-btn');
      return { up, down };
    },
    deleteButton(rowIndex) {
      return document.querySelectorAll('#sites-container li')[rowIndex].querySelector('.delete-btn');
    },
    async switchTab(day) {
      document.querySelector(`.tab-button[data-day="${day}"]`).click();
      await flush();
    }
  };
}

module.exports = { loadOptionsPage, flush };
