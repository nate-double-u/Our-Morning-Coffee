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

  function normalizeSiteLists(siteLists = {}) {
    const normalized = {};
    for (const key of validListKeys) {
      normalized[key] = Array.isArray(siteLists[key]) ? siteLists[key] : [];
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

    return [...new Set([
      ...normalized.everyday,
      ...normalized[categoryKey],
      ...normalized[dayKey]
    ])];
  }

  return {
    dayKeys,
    listLabelByKey,
    normalizeSiteLists,
    validListKeys,
    getCategoryKeyForDay,
    getDayKey,
    getSitesToOpen
  };
}));
