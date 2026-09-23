// User settings for Our Morning Coffee extension
// UMD pattern: CommonJS export for Node tests, global variable for browser

(function initSettings(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
    return;
  }
  root.OurMorningCoffeeSettings = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function createSettingsModule() {
  const openOrders = ['list', 'random'];
  const defaultSettings = Object.freeze({
    fillEmptyTab: true,
    openOrder: 'list'
  });

  function normalizeSettings(settings) {
    settings = settings ?? {};
    return {
      fillEmptyTab: typeof settings.fillEmptyTab === 'boolean'
        ? settings.fillEmptyTab
        : defaultSettings.fillEmptyTab,
      openOrder: openOrders.includes(settings.openOrder)
        ? settings.openOrder
        : defaultSettings.openOrder
    };
  }

  return {
    defaultSettings,
    openOrders,
    normalizeSettings
  };
}));
