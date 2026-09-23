// Tab helpers for Our Morning Coffee extension
// UMD pattern: CommonJS export for Node tests, global variable for browser

(function initTabs(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
    return;
  }
  root.OurMorningCoffeeTabs = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function createTabsModule() {
  const emptyTabUrls = ['about:newtab', 'about:blank', 'about:home', 'about:privatebrowsing'];

  // True only for a tab that shows nothing the user would miss if we navigated
  // it away. An unknown url is not treated as empty.
  function isEmptyTabUrl(url) {
    return typeof url === 'string' && emptyTabUrls.includes(url);
  }

  return {
    emptyTabUrls,
    isEmptyTabUrl
  };
}));
