// Background script for Our Morning Coffee extension

const siteListsModule = typeof OurMorningCoffeeSiteLists !== 'undefined'
  ? OurMorningCoffeeSiteLists
  : require('../shared/site-lists');
const storageModule = typeof OurMorningCoffeeStorage !== 'undefined'
  ? OurMorningCoffeeStorage
  : require('../shared/storage');
const tabsModule = typeof OurMorningCoffeeTabs !== 'undefined'
  ? OurMorningCoffeeTabs
  : require('../shared/tabs');
const { dayKeys, getSitesToOpen } = siteListsModule;
const { loadSiteLists, loadSettings, normalizeStoredSiteLists } = storageModule;
const { isEmptyTabUrl } = tabsModule;

// Keep stored data normalized across installs and updates
browser.runtime.onInstalled.addListener(async () => {
  await normalizeStoredSiteLists();
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

// The active tab in the current window, if it is showing an empty page.
async function findActiveEmptyTab() {
  const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
  return activeTab && isEmptyTabUrl(activeTab.url) ? activeTab : null;
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
  
  const settings = await loadSettings();
  const emptyTab = settings.fillEmptyTab ? await findActiveEmptyTab() : null;
  const [first, ...rest] = sitesToOpen;
  const newTabUrls = emptyTab ? rest : sitesToOpen;

  if (emptyTab) {
    await browser.tabs.update(emptyTab.id, { url: first });
  }
  for (const url of newTabUrls) {
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
