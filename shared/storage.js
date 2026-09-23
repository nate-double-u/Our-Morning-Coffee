// Storage access for Our Morning Coffee site lists
// UMD pattern: CommonJS export for Node tests, global variable for browser.
// Lists are always normalized on the way in and out of storage.

(function initStorage(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./site-lists'), root);
    return;
  }
  root.OurMorningCoffeeStorage = factory(root.OurMorningCoffeeSiteLists, root);
}(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageModule(siteListsModule, root) {
  const { normalizeSiteLists } = siteListsModule;

  async function loadSiteLists() {
    const result = await root.browser.storage.local.get('siteLists');
    return normalizeSiteLists(result.siteLists);
  }

  async function saveSiteLists(siteLists) {
    await root.browser.storage.local.set({ siteLists: normalizeSiteLists(siteLists) });
  }

  // Runs on install and update. Writes only if stored data is missing or malformed.
  async function normalizeStoredSiteLists() {
    const result = await root.browser.storage.local.get('siteLists');
    const normalized = normalizeSiteLists(result.siteLists);
    if (JSON.stringify(normalized) !== JSON.stringify(result.siteLists)) {
      await saveSiteLists(normalized);
    }
  }

  return {
    loadSiteLists,
    saveSiteLists,
    normalizeStoredSiteLists
  };
}));
