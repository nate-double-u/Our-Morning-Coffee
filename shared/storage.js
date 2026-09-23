// Storage access for Our Morning Coffee
// UMD pattern: CommonJS export for Node tests, global variable for browser.
// Every value is normalized on the way in and out of storage.

(function initStorage(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./site-lists'), require('./settings'), root);
    return;
  }
  root.OurMorningCoffeeStorage = factory(root.OurMorningCoffeeSiteLists, root.OurMorningCoffeeSettings, root);
}(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageModule(siteListsModule, settingsModule, root) {
  const { normalizeSiteLists } = siteListsModule;
  const { normalizeSettings } = settingsModule;

  // Build load/save/normalizeStored for one storage key
  function makeStoredValue(key, normalize) {
    async function load() {
      const result = await root.browser.storage.local.get(key);
      return normalize(result[key]);
    }

    async function save(value) {
      await root.browser.storage.local.set({ [key]: normalize(value) });
    }

    // Runs on install and update. Writes only if stored data is missing or malformed.
    async function normalizeStored() {
      const result = await root.browser.storage.local.get(key);
      const normalized = normalize(result[key]);
      if (JSON.stringify(normalized) !== JSON.stringify(result[key])) {
        await save(normalized);
      }
    }

    return { load, save, normalizeStored };
  }

  const siteLists = makeStoredValue('siteLists', normalizeSiteLists);
  const settings = makeStoredValue('settings', normalizeSettings);

  // Settings are additive: defaults apply on read, so no install-time write is needed.
  return {
    loadSiteLists: siteLists.load,
    saveSiteLists: siteLists.save,
    normalizeStoredSiteLists: siteLists.normalizeStored,
    loadSettings: settings.load,
    saveSettings: settings.save
  };
}));
