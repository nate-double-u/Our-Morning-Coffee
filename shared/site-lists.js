// Shared site-list logic for Our Morning Coffee extension
// UMD pattern: CommonJS export for Node tests, global variable for browser

(function initSiteLists(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
    return;
  }
  root.OurMorningCoffeeSiteLists = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function createSiteListsModule() {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const validListKeys = ['everyday', 'weekdays', 'weekends', ...dayKeys];
  const listLabelByKey = {
    everyday: 'Every Day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
  };

  function normalizeSiteLists(siteLists) {
    siteLists = siteLists ?? {};
    const normalized = {};
    for (const key of validListKeys) {
      normalized[key] = Array.isArray(siteLists[key])
        ? siteLists[key]
          .filter(item => typeof item === 'string')
          .map(item => item.trim())
          .filter(item => item.length > 0)
        : [];
    }
    return normalized;
  }

  function getCategoryKeyForDay(dayIndex) {
    return dayIndex === 0 || dayIndex === 6 ? 'weekends' : 'weekdays';
  }

  function getDayKey(dayIndex) {
    return dayKeys[dayIndex];
  }

  function getSitesToOpen(siteLists, dayIndex) {
    const normalized = normalizeSiteLists(siteLists);
    const dayKey = getDayKey(dayIndex);
    const categoryKey = getCategoryKeyForDay(dayIndex);
    const daySites = dayKey && normalized[dayKey] ? normalized[dayKey] : [];

    return [...new Set([
      ...normalized.everyday,
      ...normalized[categoryKey],
      ...daySites
    ])];
  }

  // Returns { siteLists, added }. Lists are normalized; the input is not mutated.
  function addSiteToList(siteLists, listKey, url) {
    const normalized = normalizeSiteLists(siteLists);
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!validListKeys.includes(listKey) || trimmed.length === 0 || normalized[listKey].includes(trimmed)) {
      return { siteLists: normalized, added: false };
    }
    normalized[listKey].push(trimmed);
    return { siteLists: normalized, added: true };
  }

  // Returns a new array in the requested open order. Unknown orders keep list order.
  function orderSites(sites, openOrder, random = Math.random) {
    const ordered = [...sites];
    if (openOrder !== 'random') {
      return ordered;
    }
    // Fisher-Yates shuffle
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }
    return ordered;
  }

  // Returns { siteLists, moved }. Swaps the site at index with its neighbour
  // delta places away. Lists are normalized; the input is not mutated.
  function moveSite(siteLists, listKey, index, delta) {
    const normalized = normalizeSiteLists(siteLists);
    if (!validListKeys.includes(listKey)) {
      return { siteLists: normalized, moved: false };
    }
    const list = normalized[listKey];
    const target = index + delta;
    if (delta === 0 || index < 0 || index >= list.length || target < 0 || target >= list.length) {
      return { siteLists: normalized, moved: false };
    }
    [list[index], list[target]] = [list[target], list[index]];
    return { siteLists: normalized, moved: true };
  }

  return {
    dayKeys,
    listLabelByKey,
    normalizeSiteLists,
    validListKeys,
    getCategoryKeyForDay,
    getDayKey,
    getSitesToOpen,
    addSiteToList,
    orderSites,
    moveSite
  };
}));
