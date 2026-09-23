// Background script for Our Morning Coffee extension

const siteListsModule = typeof OurMorningCoffeeSiteLists !== 'undefined'
  ? OurMorningCoffeeSiteLists
  : require('../shared/site-lists');
const storageModule = typeof OurMorningCoffeeStorage !== 'undefined'
  ? OurMorningCoffeeStorage
  : require('../shared/storage');
const { dayKeys, normalizeSiteLists, getSitesToOpen } = siteListsModule;
const { loadSiteLists, saveSiteLists } = storageModule;

// Initialize storage with default empty lists if not present
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('siteLists');

  if (!result.siteLists) {
    await saveSiteLists();
    return;
  }

  const normalized = normalizeSiteLists(result.siteLists);
  if (JSON.stringify(normalized) !== JSON.stringify(result.siteLists)) {
    await saveSiteLists(normalized);
  }
});

// Listen for keyboard shortcut
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'open-morning-coffee') {
    await openTodaysSites();
  }
});

// Listen for requests from the popup
browser.runtime.onMessage.addListener((message) => {
  if (message && message.type === 'open-todays-sites') {
    return openTodaysSites(undefined, { notify: message.notify !== false });
  }
});

function notify(message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('icons/coffee-48.png'),
    title: 'Our Morning Coffee',
    message
  });
}

// Open today's sites in background tabs. Returns the number of sites opened.
async function openTodaysSites(dayIndex = new Date().getDay(), { notify: shouldNotify = true } = {}) {
  const siteLists = await loadSiteLists();
  const sitesToOpen = getSitesToOpen(siteLists, dayIndex);
  const todayName = dayKeys[dayIndex];
  
  if (sitesToOpen.length === 0) {
    if (shouldNotify) {
      notify('No sites configured for today. Add some in the options page!');
    }
    return 0;
  }
  
  // Open each site in a new tab
  for (const url of sitesToOpen) {
    await browser.tabs.create({ url: url, active: false });
  }
  
  if (shouldNotify) {
    notify(`Opened ${sitesToOpen.length} site(s) for ${todayName}`);
  }
  return sitesToOpen.length;
}

if (typeof module !== 'undefined') {
  module.exports = { openTodaysSites };
}
