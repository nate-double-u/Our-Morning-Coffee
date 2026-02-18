// Background script for Our Morning Coffee extension

const siteListsModule = typeof OurMorningCoffeeSiteLists !== 'undefined'
  ? OurMorningCoffeeSiteLists
  : require('./shared/site-lists');
const { dayKeys, normalizeSiteLists, getSitesToOpen } = siteListsModule;

// Initialize storage with default empty lists if not present
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('siteLists');

  if (!result.siteLists) {
    await browser.storage.local.set({ siteLists: normalizeSiteLists() });
    return;
  }

  const normalized = normalizeSiteLists(result.siteLists);
  if (JSON.stringify(normalized) !== JSON.stringify(result.siteLists)) {
    await browser.storage.local.set({ siteLists: normalized });
  }
});

// Listen for keyboard shortcut
browser.commands.onCommand.addListener((command) => {
  if (command === 'open-morning-coffee') {
    openTodaysSites();
  }
});

// Function to open today's sites
async function openTodaysSites(dayIndex = new Date().getDay()) {
  const result = await browser.storage.local.get('siteLists');
  const sitesToOpen = getSitesToOpen(result.siteLists, dayIndex);
  const todayName = dayKeys[dayIndex];
  
  if (sitesToOpen.length === 0) {
    // Show a notification if no sites are configured
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/coffee-48.png'),
      title: 'Our Morning Coffee',
      message: 'No sites configured for today. Add some in the options page!'
    });
    return;
  }
  
  // Open each site in a new tab
  for (const url of sitesToOpen) {
    await browser.tabs.create({ url: url, active: false });
  }
  
  // Show success notification
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('icons/coffee-48.png'),
    title: 'Our Morning Coffee',
    message: `Opened ${sitesToOpen.length} site(s) for ${todayName}`
  });
}

// Export function for use in popup
if (typeof module !== 'undefined') {
  module.exports = { openTodaysSites };
}
